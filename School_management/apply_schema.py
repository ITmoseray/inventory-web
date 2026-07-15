from db.database import DatabaseManager
from config import DB_NAME
import os

schema_file_path = "schema.sql"

def apply_schema_changes():
    try:
        with open(schema_file_path, 'r') as f:
            sql_script = f.read()
        
        db_manager = DatabaseManager()
        db_manager.execute_sql_script(sql_script)
        print("Database schema updated successfully.")
    except Exception as e:
        print(f"Error applying schema changes: {e}")

if __name__ == "__main__":
    apply_schema_changes()
