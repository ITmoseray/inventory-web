from db.database import get_db_manager
from sqlalchemy import text

def count_registrations():
    db = get_db_manager()
    try:
        with db.engine.connect() as conn:
            # Total count
            res = conn.execute(text("SELECT COUNT(*) FROM registrations")).fetchone()
            print(f"Total registrations: {res[0]}")
            
            # Count by tenant
            res = conn.execute(text("SELECT tenant_id, COUNT(*) FROM registrations GROUP BY tenant_id")).fetchall()
            print(f"Registrations by tenant: {res}")
            
            # Count by status
            res = conn.execute(text("SELECT status, COUNT(*) FROM registrations GROUP BY status")).fetchall()
            print(f"Registrations by status: {res}")
            
            # Sample of latest
            res = conn.execute(text("SELECT id, full_name, tenant_id, created_at FROM registrations ORDER BY created_at DESC LIMIT 5")).fetchall()
            print("Latest 5 registrations:")
            for row in res:
                print(row)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    count_registrations()
