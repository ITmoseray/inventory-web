from db.database import get_db_manager
import logging

logger = logging.getLogger(__name__)

def get_all_tenants():
    """Returns all active schools/tenants."""
    try:
        return get_db_manager().fetch_all("SELECT * FROM tenants WHERE status = 'active' ORDER BY name")
    except Exception as e:
        logger.error(f"Error fetching tenants: {e}")
        return []

def get_tenant_by_id(tenant_id):
    """Returns a specific school by ID."""
    try:
        return get_db_manager().fetch_one("SELECT * FROM tenants WHERE id = :id", {"id": tenant_id})
    except Exception as e:
        logger.error(f"Error fetching tenant {tenant_id}: {e}")
        return None

def get_tenant_by_subdomain(subdomain):
    """Returns a specific school by its unique subdomain."""
    try:
        return get_db_manager().fetch_one("SELECT * FROM tenants WHERE subdomain = :s", {"s": subdomain.lower()})
    except Exception as e:
        logger.error(f"Error fetching tenant by subdomain {subdomain}: {e}")
        return None

def create_tenant(name, subdomain, contact_email=None, logo_url=None, phone=None, address=None, website=None, motto=None, primary_color='#0d6efd', secondary_color='#6c757d'):
    """Registers a new school in the system."""
    try:
        query = """
            INSERT INTO tenants (name, subdomain, contact_email, logo_url, phone, address, website, motto, primary_color, secondary_color) 
            VALUES (:name, :subdomain, :email, :logo_url, :phone, :address, :website, :motto, :primary_color, :secondary_color) 
            RETURNING id
        """
        return get_db_manager().insert_and_return_id(query, {
            "name": name, 
            "subdomain": subdomain.lower(), 
            "email": contact_email,
            "logo_url": logo_url,
            "phone": phone,
            "address": address,
            "website": website,
            "motto": motto,
            "primary_color": primary_color,
            "secondary_color": secondary_color
        })
    except Exception as e:
        logger.error(f"Error creating tenant: {e}")
        return None

def get_global_stats():
    """Returns aggregated statistics across all tenants."""
    try:
        db = get_db_manager()
        total_tenants = db.fetch_one("SELECT COUNT(*) as count FROM tenants")['count']
        total_students = db.fetch_one("SELECT COUNT(*) as count FROM students")['count']
        total_users = db.fetch_one("SELECT COUNT(*) as count FROM users")['count']
        total_payments = db.fetch_one("SELECT SUM(amount) as total FROM payments WHERE status = 'Paid'")['total'] or 0
        
        return {
            "total_tenants": total_tenants,
            "total_students": total_students,
            "total_users": total_users,
            "total_revenue": float(total_payments)
        }
    except Exception as e:
        logger.error(f"Error fetching global stats: {e}")
        return {"total_tenants": 0, "total_students": 0, "total_users": 0, "total_revenue": 0}

def update_tenant_status(tenant_id, status):
    """Activates or suspends a tenant."""
    try:
        return get_db_manager().execute(
            "UPDATE tenants SET status = :status WHERE id = :id",
            {"status": status, "id": tenant_id}
        )
    except Exception as e:
        logger.error(f"Error updating tenant status: {e}")
        return False

def reset_tenant_admin_password(tenant_id, new_password_hash):
    """Resets the password for the primary admin of a specific tenant."""
    try:
        # Find the admin user for this tenant
        return get_db_manager().execute(
            "UPDATE users SET password = :p WHERE tenant_id = :tid AND role = 'admin'",
            {"p": new_password_hash, "tid": tenant_id}
        )
    except Exception as e:
        logger.error(f"Error resetting tenant admin password: {e}")
        return False

def delete_tenant(tenant_id):
    """
    Deletes a school and all associated data across the entire system.
    """
    try:
        db = get_db_manager()
        params = {"tid": tenant_id}
        
        # 1. Simple tenant-dependent tables
        tenant_dependents = [
            "activity_logs", "notifications", "security_alerts", 
            "system_settings", "subscriptions", "registrations", 
            "invoices"
        ]
        for table in tenant_dependents:
            try:
                db.execute(f"DELETE FROM {table} WHERE tenant_id = :tid", params)
            except: pass # Column might not exist in all versions

        # 2. Student-dependent tables
        student_dependents = [
            "attendance", "grades", "payments", "form_payments", 
            "student_courses", "tailor_shop_payments", "assignment_submissions"
        ]
        for table in student_dependents:
            db.execute(f"DELETE FROM {table} WHERE student_id IN (SELECT id FROM students WHERE tenant_id = :tid)", params)

        # 3. Course-dependent tables
        course_dependents = [
            "course_materials", "course_timetables", "assignments"
        ]
        for table in course_dependents:
            db.execute(f"DELETE FROM {table} WHERE course_id IN (SELECT id FROM courses WHERE tenant_id = :tid)", params)

        # 4. Lecturers (linked via users)
        db.execute("DELETE FROM lecturers WHERE user_id IN (SELECT id FROM users WHERE tenant_id = :tid)", params)
        
        # 5. Core modules
        db.execute("DELETE FROM students WHERE tenant_id = :tid", params)
        db.execute("DELETE FROM courses WHERE tenant_id = :tid", params)
        db.execute("DELETE FROM users WHERE tenant_id = :tid", params)
        
        # 6. Finally delete the tenant record
        return db.execute("DELETE FROM tenants WHERE id = :tid", params)
    except Exception as e:
        logger.error(f"Error deleting tenant {tenant_id}: {e}")
        return False
