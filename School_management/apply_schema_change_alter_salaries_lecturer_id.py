from db.database import get_db_manager
import logging

logger = logging.getLogger(__name__)

def apply_migration():
    db_manager = get_db_manager()
    try:
        print("Starting migration to alter 'salaries.lecturer_id' from VARCHAR to INT and update FK.")

        # Step 1: Check if 'salaries.lecturer_id' is already INT
        check_type_query = """
        SELECT data_type FROM information_schema.columns 
        WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'salaries' AND column_name = 'lecturer_id';
        """
        current_type_result = db_manager.fetch_one(check_type_query)
        
        if current_type_result and current_type_result['data_type'] == 'integer':
            print("'salaries.lecturer_id' is already INT. Skipping column type alteration.")
            # Ensure FK is correct
            ensure_fk_salaries_query = """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'salaries_lecturer_id_fkey') THEN
                    ALTER TABLE salaries DROP CONSTRAINT salaries_lecturer_id_fkey;
                END IF;
                -- Check if lecturer_id column exists before adding FK
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'salaries' AND column_name = 'lecturer_id') THEN
                    ALTER TABLE salaries
                    ADD CONSTRAINT salaries_lecturer_id_fkey
                    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE;
                END IF;
            END
            $$;
            """
            db_manager.execute(ensure_fk_salaries_query)
            print("Ensured FK for salaries.lecturer_id to lecturers.id.")
            return

        # Step 2: Add a new INT column
        print("Adding temporary 'lecturer_id_int' column to 'salaries' table.")
        db_manager.execute("ALTER TABLE salaries ADD COLUMN lecturer_id_int INT;")

        # Step 3: Populate the new INT column
        print("Populating 'lecturer_id_int' column with mapped values from 'lecturers.id'.")
        db_manager.execute("""
            UPDATE salaries
            SET lecturer_id_int = l.id
            FROM lecturers l
            WHERE salaries.lecturer_id = l.lecturer_id;
        """)

        # Step 4: Drop the old FK constraint if it exists
        print("Dropping old foreign key constraint on 'salaries.lecturer_id'.")
        drop_old_fk_query = """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'salaries_lecturer_id_fkey') THEN
                ALTER TABLE salaries DROP CONSTRAINT salaries_lecturer_id_fkey;
            END IF;
        END
        $$;
        """
        db_manager.execute(drop_old_fk_query)

        # Step 5: Drop the old VARCHAR column
        print("Dropping old 'lecturer_id' (VARCHAR) column from 'salaries' table.")
        db_manager.execute("ALTER TABLE salaries DROP COLUMN lecturer_id;")

        # Step 6: Rename the new INT column to 'lecturer_id'
        print("Renaming 'lecturer_id_int' to 'lecturer_id'.")
        db_manager.execute("ALTER TABLE salaries RENAME COLUMN lecturer_id_int TO lecturer_id;")
        
        # Step 7: Add NOT NULL constraint (if needed, assuming current data is clean)
        print("Adding NOT NULL constraint to new 'salaries.lecturer_id' column.")
        db_manager.execute("ALTER TABLE salaries ALTER COLUMN lecturer_id SET NOT NULL;")

        # Step 8: Add the new foreign key constraint
        print("Adding new foreign key constraint on 'salaries.lecturer_id' referencing 'lecturers.id'.")
        db_manager.execute("""
            ALTER TABLE salaries
            ADD CONSTRAINT salaries_lecturer_id_fkey
            FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE;
        """)

        print("Migration for 'salaries.lecturer_id' from VARCHAR to INT completed successfully.")
    except Exception as e:
        logger.error(f"Error applying salaries.lecturer_id migration: {e}")
        print(f"Error applying salaries.lecturer_id migration: {e}")
        # db_manager.conn.rollback() # Ensure rollback if using explicit connection
        raise

if __name__ == "__main__":
    apply_migration()
    print("Migration script 'apply_schema_change_alter_salaries_lecturer_id.py' executed.")
