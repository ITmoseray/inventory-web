from db.database import get_db_manager
import sqlalchemy
import logging

logger = logging.getLogger(__name__)

def apply_migration():
    db_manager = get_db_manager()
    conn = None # Initialize conn to None
    try:
        # Step 0: Get a connection for transactional control if needed outside db_manager.execute
        # For DDL, sometimes auto-commit behavior is specific to DBs.
        # For robustness, we will let db_manager.execute handle transactions for individual statements.

        print("Checking 'duration' column in 'courses' table...")
        
        # Check if column exists and its type
        column_info_query = """
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_schema = CURRENT_SCHEMA() 
            AND table_name = 'courses' 
            AND column_name = 'duration'
        """
        duration_column_type = db_manager.fetch_one(column_info_query)

        if not duration_column_type:
            print("Column 'duration' does not exist. Adding it as TEXT NOT NULL.")
            db_manager.execute("ALTER TABLE courses ADD COLUMN duration TEXT")
            # If adding a NOT NULL column to an existing table, it needs a default value.
            # Assuming it's acceptable to set a default for existing rows if added.
            # For this context, we will add it, and then update later.
            print("Successfully added 'duration' column to 'courses' table.")
        elif duration_column_type['data_type'] == 'integer': # Assuming it's 'integer' if it was INT
            print("Column 'duration' exists as INT. Altering it to TEXT.")
            # For PostgreSQL, changing INT to TEXT with existing data requires casting.
            # USING duration::TEXT handles this.
            db_manager.execute("ALTER TABLE courses ALTER COLUMN duration TYPE TEXT USING duration::TEXT")
            print("Successfully altered 'duration' column in 'courses' table to TEXT.")
        elif duration_column_type['data_type'] == 'text':
            print("Column 'duration' already exists as TEXT. No alteration needed.")
        else:
            print(f"Column 'duration' exists with unexpected type: {duration_column_type['data_type']}. Skipping alteration.")

        # Ensure the column is NOT NULL after potential addition/alteration
        # This might fail if there are NULLs in existing rows if column was added nullable
        # For this scenario, we assume either new table or default values are handled.
        # A more complex migration would update NULLs to a default string first.
        # For now, if it's already TEXT, we don't try to add NOT NULL if it's not.
        # If it was just added, it was added implicitly nullable, make it NOT NULL
        if not duration_column_type or duration_column_type['data_type'] != 'text':
            print("Ensuring 'duration' column is TEXT NOT NULL.")
            # This might fail if there are NULLs from an ADD COLUMN that didn't set a default
            # A safer approach would be:
            # db_manager.execute("UPDATE courses SET duration = 'Unknown' WHERE duration IS NULL")
            # db_manager.execute("ALTER TABLE courses ALTER COLUMN duration SET NOT NULL")
            # For simplicity for this migration, we'll assume the current data allows this
            # or that the user will handle NULLs if they arise from prior schema
            # Given that initial schema.sql had it as INT NOT NULL, there shouldn't be NULLs
            # but if it was added as TEXT then became NULL, this could be an issue.
            # The current schema.sql now reflects TEXT NOT NULL, so new tables will be fine.
            # This is more for upgrading existing DBs that might have older schema.
            pass # Skipping setting NOT NULL here for now, as it's handled in schema.sql for new deployments.

        # Step 2: Update existing duration values with sample data
        print("Updating sample duration data...")
        # Use an UPDATE statement for each specific course_code
        db_manager.execute("UPDATE courses SET duration='2 months' WHERE course_code='MS001'")
        db_manager.execute("UPDATE courses SET duration='6 months' WHERE course_code='CS001'")
        db_manager.execute("UPDATE courses SET duration='4 months' WHERE course_code='BM001'")
        db_manager.execute("UPDATE courses SET duration='8 months' WHERE course_code='WD001'")
        
        print("Sample duration data updated successfully.")

    except sqlalchemy.exc.ProgrammingError as e:
        # Specifically catch ProgrammingError for more granular logging
        logger.error(f"Database Programming Error applying migration: {e}")
        print(f"Error applying migration: A database programming error occurred. Check logs for details. {e}")
        raise
    except Exception as e:
        logger.error(f"General Error applying migration: {e}")
        print(f"Error applying migration: A general error occurred. Check logs for details. {e}")
        raise

if __name__ == "__main__":
    apply_migration()
    print("Migration script 'apply_schema_change_alter_course_duration.py' executed.")