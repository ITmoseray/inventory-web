from db.database import get_db_manager
from db.tenant_queries import update_tenant_status
import logging

logger = logging.getLogger(__name__)

def force_activate_tenant(tenant_id):
    """Force enables a school instantly."""
    return update_tenant_status(tenant_id, 'active')

def force_suspend_tenant(tenant_id):
    """Force disables a school instantly."""
    return update_tenant_status(tenant_id, 'suspended')

def get_system_health():
    """Returns basic system health metrics."""
    try:
        db = get_db_manager()
        # Check DB connection
        db.execute("SELECT 1")
        
        # Get counts
        total_schools = db.fetch_one("SELECT COUNT(*) FROM tenants")['count']
        active_subscriptions = db.fetch_one("SELECT COUNT(*) FROM subscriptions WHERE status = 'active'")['count']
        recent_errors = db.fetch_one("SELECT COUNT(*) FROM activity_logs WHERE action LIKE '%Error%' AND created_at > NOW() - INTERVAL '1 day'")['count']
        
        return {
            "status": "Healthy",
            "total_schools": total_schools,
            "active_subscriptions": active_subscriptions,
            "recent_errors_24h": recent_errors
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "Unhealthy", "error": str(e)}

def update_tenant_features(tenant_id, features_dict):
    """
    Updates the feature flags for a tenant (stored in the subscription).
    Example features_dict: {'ai': True, 'sms': False, 'api': True}
    """
    try:
        import json
        query = "UPDATE subscriptions SET features = :f WHERE tenant_id = :tid"
        return get_db_manager().execute(query, {"f": json.dumps(features_dict), "tid": tenant_id})
    except Exception as e:
        logger.error(f"Error updating features for tenant {tenant_id}: {e}")
        return False

def broadcast_system_notification(message, sender_id):
    """
    Feature 7: Sends a notification to ALL school administrators.
    """
    try:
        db = get_db_manager()
        # Find all admin users
        admins = db.fetch_all("SELECT id, tenant_id FROM users WHERE role = 'admin' AND is_approved = TRUE")
        
        for admin in admins:
            # Using existing notification logic if available, otherwise logging it
            from db.activity_queries import log_activity
            log_activity(
                user_id=sender_id,
                tenant_id=admin['tenant_id'],
                action="SYSTEM_BROADCAST",
                details=f"Global Notice: {message}"
            )
        return True
    except Exception as e:
        logger.error(f"Broadcast failed: {e}")
        return False

def get_tenant_resource_usage():
    """
    Compares student/user counts against plan limits for all tenants.
    """
    try:
        query = """
            SELECT 
                t.id, t.name,
                COUNT(DISTINCT s.id) as current_students,
                p.max_students,
                COUNT(DISTINCT u.id) as current_users,
                p.max_users,
                p.name as plan_name
            FROM tenants t
            LEFT JOIN students s ON t.id = s.tenant_id
            LEFT JOIN users u ON t.id = u.tenant_id
            JOIN subscriptions sub ON t.id = sub.tenant_id
            JOIN billing_plans p ON sub.plan_id = p.id
            GROUP BY t.id, t.name, p.max_students, p.max_users, p.name
        """
        return get_db_manager().fetch_all(query)
    except Exception as e:
        logger.error(f"Error fetching resource usage: {e}")
        return []

def set_global_maintenance(enabled: bool, message: str = ""):
    """Toggles global maintenance mode across all schools."""
    try:
        db = get_db_manager()
        db.execute("DELETE FROM system_settings WHERE key = 'MAINTENANCE_MODE'")
        db.execute("INSERT INTO system_settings (key, value) VALUES ('MAINTENANCE_MODE', :v)", {"v": "true" if enabled else "false"})
        db.execute("DELETE FROM system_settings WHERE key = 'MAINTENANCE_MESSAGE'")
        db.execute("INSERT INTO system_settings (key, value) VALUES ('MAINTENANCE_MESSAGE', :m)", {"m": message})
        return True
    except Exception as e:
        logger.error(f"Failed to toggle maintenance: {e}")
        return False

def get_global_maintenance():
    """Checks if the system is in maintenance mode."""
    try:
        db = get_db_manager()
        res = db.fetch_one("SELECT value FROM system_settings WHERE key = 'MAINTENANCE_MODE'")
        msg = db.fetch_one("SELECT value FROM system_settings WHERE key = 'MAINTENANCE_MESSAGE'")
        return (res['value'] == 'true' if res else False, msg['value'] if msg else "System is undergoing upgrades.")
    except:
        return False, ""

def update_billing_plan(plan_id, price_m, price_y, students, users, features_json):
    """Edits a billing plan's commercial terms."""
    try:
        query = """
            UPDATE billing_plans 
            SET price_monthly = :pm, price_yearly = :py, max_students = :ms, max_users = :mu, features = :f
            WHERE id = :id
        """
        return get_db_manager().execute(query, {
            "pm": price_m, "py": price_y, "ms": students, "mu": users, "f": features_json, "id": plan_id
        })
    except Exception as e:
        logger.error(f"Failed to update plan {plan_id}: {e}")
        return False

def get_tenant_performance_leaderboard():
    """Returns top performing schools based on student count and revenue."""
    try:
        query = """
            SELECT 
                t.id, t.name, t.subdomain, t.status,
                COUNT(DISTINCT s.id) as student_count,
                SUM(p.amount) as total_revenue
            FROM tenants t
            LEFT JOIN students s ON t.id = s.tenant_id
            LEFT JOIN payments p ON s.id = p.student_id AND p.status = 'Paid'
            GROUP BY t.id, t.name, t.subdomain, t.status
            ORDER BY total_revenue DESC
            LIMIT 10
        """
        return get_db_manager().fetch_all(query)
    except Exception as e:
        logger.error(f"Error fetching tenant leaderboard: {e}")
        return []

def impersonate_school_admin(super_admin_user, target_tenant_id):
    """
    Validates if a super admin can 'switch' to a school admin context.
    Returns the target admin user's details if allowed.
    """
    from auth.permissions import is_super_admin
    if not is_super_admin(super_admin_user):
        return None
    
    try:
        # Find the first admin of the target school
        query = "SELECT * FROM users WHERE tenant_id = :tid AND role = 'admin' AND is_approved = TRUE LIMIT 1"
        return get_db_manager().fetch_one(query, {"tid": target_tenant_id})
    except Exception as e:
        logger.error(f"Impersonation failed for tenant {target_tenant_id}: {e}")
        return None
