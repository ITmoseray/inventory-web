import os
from db.database import DatabaseManager

import os
from db.database import DatabaseManager

def setup_database():
    database_url = os.getenv("DATABASE_URL")
    local_db = os.getenv("LOCAL_DB", "false").lower() == "true"

    if database_url is None:
        print("DATABASE_URL environment variable is not set.")
        database_url = input("Please enter your DATABASE_URL (e.g., postgresql://user:password@host:port/dbname): ")
        os.environ["DATABASE_URL"] = database_url

    if "localhost" in database_url.lower() and not local_db:
        print("It appears you are using a local database but LOCAL_DB is not set to 'true'.")
        set_local = input("Would you like to set LOCAL_DB='true' to disable SSL for local development? (y/n): ").lower()
        if set_local == 'y':
            os.environ["LOCAL_DB"] = "true"
        
    print(f"DEBUG: DATABASE_URL is: {os.environ.get('DATABASE_URL')}") # DEBUG LINE
    print(f"DEBUG: LOCAL_DB is: {os.environ.get('LOCAL_DB')}") # DEBUG LINE
    print("Initializing database...")
    try:
        db_manager = DatabaseManager()
        db_manager.initialize_database_from_schema()
        print("Database initialization successful.")
    except RuntimeError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during database setup: {e}")

if __name__ == "__main__":
    setup_database()
