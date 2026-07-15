from db.database import get_db_manager
import logging

logger = logging.getLogger(__name__)

def apply_migration():
    db_manager = get_db_manager()
    try:
        print("Starting migration to drop and recreate 'student_courses' and 'enrollments' tables.")
        print("WARNING: This will delete all existing data in these tables.")

        # Drop dependent foreign key constraints first if they exist
        # This is a bit complex as constraint names can vary. Safer to try-catch or query pg_constraint.
        # For simplicity in this script, we'll try to drop if they exist.

        # --- Drop student_courses table and its foreign keys ---
        print("Attempting to drop 'student_courses' table if it exists.")
        db_manager.execute("""
            DROP TABLE IF EXISTS student_courses CASCADE;
        """)
        print("'student_courses' table dropped if it existed.")

        # --- Drop enrollments table and its foreign keys ---
        print("Attempting to drop 'enrollments' table if it exists.")
        db_manager.execute("""
            DROP TABLE IF EXISTS enrollments CASCADE;
        """)
        print("'enrollments' table dropped if it existed.")

        # --- Create the new student_courses table (as per schema.sql) ---
        print("Creating new 'student_courses' table with updated schema.")
        db_manager.execute("""
            CREATE TABLE student_courses (
                id SERIAL PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                enrollment_date DATE DEFAULT CURRENT_DATE,
                completion_date DATE,
                status VARCHAR(20) CHECK (status IN ('Active', 'Completed', 'Dropped')) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, course_id),
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );
        """)
        print("New 'student_courses' table created successfully.")

        print("Migration for 'student_courses' and 'enrollments' tables completed.")

    except Exception as e:
        logger.error(f"Error applying student_courses migration: {e}")
        print(f"Error applying student_courses migration: {e}")
        raise

if __name__ == "__main__":
    apply_migration()
    print("Migration script 'apply_schema_change_migrate_student_courses.py' executed.")
