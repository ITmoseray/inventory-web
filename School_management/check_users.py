from db.database import get_db_manager
import json

def list_users():
    db = get_db_manager()
    try:
        users = db.fetch_all("SELECT id, username, role, is_approved, is_super_admin, tenant_id FROM users")
        print(json.dumps(users, indent=2))
    except Exception as e:
        print(f"Error fetching users: {e}")

if __name__ == "__main__":
    list_users()
