from db.database import get_db_manager
from datetime import datetime
from typing import Optional

def log_activity(user_id: Optional[int], action: str, details: Optional[str] = None, ip_address: Optional[str] = None, tenant_id: Optional[int] = None):
    """
    Logs a user activity to the activity_logs table.
    """
    try:
        db = get_db_manager()
        query = """
        INSERT INTO activity_logs (user_id, tenant_id, action, details, ip_address, created_at)
        VALUES (:user_id, :tenant_id, :action, :details, :ip_address, :created_at)
        """
        db.execute(query, {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "action": action,
            "details": details,
            "ip_address": ip_address,
            "created_at": datetime.now()
        })
    except Exception as e:
        # We don't want activity logging to crash the main application logic
        print(f"Error logging activity: {e}")

def get_recent_activities(limit: int = 50, tenant_id: Optional[int] = None):
    """
    Retrieves recent activities from the activity_logs table.
    """
    try:
        db = get_db_manager()
        params = {"limit": limit}
        query = """
        SELECT al.*, u.username 
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        """
        
        if tenant_id:
            query += " WHERE al.tenant_id = :tenant_id"
            params["tenant_id"] = tenant_id
            
        query += " ORDER BY al.created_at DESC LIMIT :limit"
        
        return db.fetch_all(query, params)
    except Exception as e:
        print(f"Error fetching recent activities: {e}")
        return []
