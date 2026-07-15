from db.database import get_db_manager
from sqlalchemy import text

def check_registrations_table():
    db = get_db_manager()
    try:
        print("Checking 'registrations' table columns...")
        query = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'registrations'")
        with db.engine.connect() as conn:
            result = conn.execute(query)
            columns = [row[0] for row in result]
            print(f"Columns in 'registrations': {columns}")
            
            # Check for specific problematic columns
            required_cols = ['tenant_id', 'created_at', 'registration_date', 'app_code']
            for col in required_cols:
                if col in columns:
                    print(f"✅ {col} exists.")
                else:
                    print(f"❌ {col} is MISSING!")
    except Exception as e:
        print(f"Error checking table: {e}")

if __name__ == "__main__":
    check_registrations_table()
