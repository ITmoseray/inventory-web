from db.database import get_db_manager
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def get_billing_plans():
    """Returns all available subscription plans."""
    try:
        return get_db_manager().fetch_all("SELECT * FROM billing_plans ORDER BY price_monthly ASC")
    except Exception as e:
        logger.error(f"Error fetching billing plans: {e}")
        return []

def get_tenant_subscription(tenant_id):
    """Returns the subscription details for a specific tenant."""
    try:
        query = """
            SELECT s.*, p.name as plan_name, p.features, p.max_students, p.max_users 
            FROM subscriptions s
            JOIN billing_plans p ON s.plan_id = p.id
            WHERE s.tenant_id = :tid
        """
        return get_db_manager().fetch_one(query, {"tid": tenant_id})
    except Exception as e:
        logger.error(f"Error fetching subscription for tenant {tenant_id}: {e}")
        return None

def create_initial_subscription(tenant_id, plan_name='Basic', billing_cycle='monthly'):
    """Sets up an initial subscription for a new school (e.g., a trial or basic plan)."""
    try:
        plan = get_db_manager().fetch_one("SELECT id FROM billing_plans WHERE name = :name", {"name": plan_name})
        if not plan:
            logger.error(f"Plan {plan_name} not found.")
            return False
        
        next_billing = datetime.now() + (timedelta(days=30) if billing_cycle == 'monthly' else timedelta(days=365))
        
        query = """
            INSERT INTO subscriptions (tenant_id, plan_id, billing_cycle, next_billing_date, status)
            VALUES (:tid, :pid, :cycle, :next_date, 'active')
            ON CONFLICT (tenant_id) DO UPDATE SET 
                plan_id = EXCLUDED.plan_id,
                next_billing_date = EXCLUDED.next_billing_date,
                status = 'active'
        """
        return get_db_manager().execute(query, {
            "tid": tenant_id,
            "pid": plan['id'],
            "cycle": billing_cycle,
            "next_date": next_billing
        })
    except Exception as e:
        logger.error(f"Error creating subscription for tenant {tenant_id}: {e}")
        return False

def check_subscription_status(tenant_id):
    """Checks if a tenant's subscription is active and not expired."""
    sub = get_tenant_subscription(tenant_id)
    if not sub:
        return False, "No subscription found"
    
    if sub['status'] != 'active':
        return False, f"Subscription is {sub['status']}"
    
    if sub['next_billing_date'] < datetime.now():
        # Auto-suspend if expired (or you could implement a grace period here)
        update_subscription_status(tenant_id, 'expired')
        return False, "Subscription expired"
    
    return True, "Active"

def update_subscription_status(tenant_id, status):
    """Updates the status of a subscription."""
    try:
        return get_db_manager().execute(
            "UPDATE subscriptions SET status = :status WHERE tenant_id = :id",
            {"status": status, "id": tenant_id}
        )
    except Exception as e:
        logger.error(f"Error updating subscription status for tenant {tenant_id}: {e}")
        return False

def generate_invoice(tenant_id, amount, status='unpaid'):
    """Generates a new invoice for a tenant."""
    try:
        sub = get_tenant_subscription(tenant_id)
        invoice_num = f"INV-{datetime.now().strftime('%Y%m%d')}-{tenant_id:04d}"
        due_date = datetime.now() + timedelta(days=7)
        
        query = """
            INSERT INTO invoices (tenant_id, subscription_id, amount, status, due_date, invoice_number)
            VALUES (:tid, :sid, :amt, :status, :due, :num)
            RETURNING id
        """
        return get_db_manager().insert_and_return_id(query, {
            "tid": tenant_id,
            "sid": sub['id'] if sub else None,
            "amt": amount,
            "status": status,
            "due": due_date,
            "num": invoice_num
        })
    except Exception as e:
        logger.error(f"Error generating invoice for tenant {tenant_id}: {e}")
        return None
