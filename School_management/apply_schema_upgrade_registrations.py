from db.database import get_db_manager
from sqlalchemy import text

def upgrade_registrations_table():
    db = get_db_manager()
    try:
        print("Upgrading 'registrations' table...")
        
        # Add app_code
        db.execute("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS app_code VARCHAR(50) UNIQUE")
        
        # Add payment_method
        db.execute("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)")
        
        # Add sender_name
        db.execute("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS sender_name VARCHAR(100)")
        
        # Add sender_phone
        db.execute("ALTER TABLE registrations ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(20)")
        
        print("Successfully upgraded 'registrations' table schema.")
    except Exception as e:
        print(f"Failed to upgrade registrations table: {e}")

if __name__ == "__main__":
    upgrade_registrations_table()
