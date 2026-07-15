from db.database import get_db_manager
import logging

logger = logging.getLogger(__name__)

def apply_migration():
    db_manager = get_db_manager()
    try:
        print("Ensuring ON DELETE SET NULL constraint for students.lecturer_id...")
        # Drop existing FK if it doesn't have ON DELETE SET NULL
        # Then re-add with ON DELETE SET NULL
        
        # For students table
        drop_fk_student_query = """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_lecturer_id_fkey') THEN
                ALTER TABLE students DROP CONSTRAINT students_lecturer_id_fkey;
            END IF;
        END
        $$;
        """
        add_fk_student_query = """
        ALTER TABLE students
        ADD CONSTRAINT students_lecturer_id_fkey
        FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL;
        """
        
        # For courses table
        drop_fk_course_query = """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_lecturer_id_fkey') THEN
                ALTER TABLE courses DROP CONSTRAINT courses_lecturer_id_fkey;
            END IF;
        END
        $$;
        """
        add_fk_course_query = """
        ALTER TABLE courses
        ADD CONSTRAINT courses_lecturer_id_fkey
        FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL;
        """

        db_manager.execute(drop_fk_student_query)
        db_manager.execute(add_fk_student_query)
        print("Ensured ON DELETE SET NULL for students.lecturer_id.")

        # Check if lecturer_id column exists in courses table
        check_column_exists_query = """
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = CURRENT_SCHEMA()
            AND table_name = 'courses' 
            AND column_name = 'lecturer_id'
        );
        """
        column_exists = db_manager.fetch_one(check_column_exists_query)['exists']

        if not column_exists:
            print("Column 'lecturer_id' does not exist in 'courses' table. Adding it.")
            add_column_query = """
            ALTER TABLE courses ADD COLUMN lecturer_id VARCHAR(20);
            """
            db_manager.execute(add_column_query)
            print("Successfully added 'lecturer_id' column to 'courses' table.")
        else:
            print("Column 'lecturer_id' already exists in 'courses' table. Skipping addition.")

        db_manager.execute(drop_fk_course_query)
        db_manager.execute(add_fk_course_query)
        print("Ensured ON DELETE SET NULL for courses.lecturer_id.")

        print("Migration for ON DELETE SET NULL constraints applied.")
    except Exception as e:
        logger.error(f"Error applying ON DELETE SET NULL migration: {e}")
        print(f"Error applying ON DELETE SET NULL migration: {e}")
        raise

if __name__ == "__main__":
    apply_migration()
    print("Migration script 'apply_schema_change_fk_on_delete_set_null.py' executed.")
