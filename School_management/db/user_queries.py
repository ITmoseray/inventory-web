from db.database import get_db_manager # Use the global get_db_manager function
from sqlalchemy import text

def approve_user(user_id: int):
    """
    Approves a user by setting their is_approved status to TRUE in the database.
    """
    try:
        with get_db_manager().engine.connect() as conn:
            conn.execute(
                text("UPDATE users SET is_approved = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id"),
                {"user_id": user_id}
            )
            conn.commit()
    except Exception as e:
        print(f"Error approving user: {e}")
        raise

def disapprove_user(user_id: int):
    """
    Disapproves a user by setting their is_approved status to FALSE in the database.
    """
    try:
        with get_db_manager().engine.connect() as conn:
            conn.execute(
                text("UPDATE users SET is_approved = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id"),
                {"user_id": user_id}
            )
            conn.commit()
    except Exception as e:
        print(f"Error disapproving user: {e}")
        raise

def delete_user(user_id: int):
    """
    Deletes a user record from the database.
    """
    try:
        with get_db_manager().engine.connect() as conn:
            conn.execute(
                text("DELETE FROM users WHERE id = :user_id"),
                {"user_id": user_id}
            )
            conn.commit()
    except Exception as e:
        print(f"Error deleting user: {e}")
        raise

def get_pending_users(tenant_id=None):
    """
    Retrieves a list of users who are not yet approved, filtered by tenant_id if provided.
    """
    try:
        db = get_db_manager()
        query = "SELECT id, username, role, tenant_id FROM users WHERE is_approved = FALSE"
        params = {}
        
        if tenant_id:
            query += " AND tenant_id = :tid"
            params["tid"] = tenant_id
            
        result = db.fetch_all(query, params)
        return result
    except Exception as e:
        print(f"Error fetching pending users: {e}")
        return []
