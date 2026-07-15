from db.database import get_db_manager
import logging
import psycopg2.errors

logger = logging.getLogger(__name__)

def apply_migration():
    db_manager = get_db_manager()
    try:
        # Check if student_courses table already exists
        table_check_query = """
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = CURRENT_SCHEMA()
                AND    table_name   = 'student_courses'
            );
        """
        table_exists = db_manager.fetch_one(table_check_query)['exists']

        if not table_exists:
            print("Creating 'student_courses' table...")
            create_table_query = """
            CREATE TABLE student_courses (
                student_id VARCHAR(20) NOT NULL,
                course_code VARCHAR(50) NOT NULL,
                PRIMARY KEY (student_id, course_code),
                FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
                FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE
            );
            """
            db_manager.execute(create_table_query)
            print("Successfully created 'student_courses' table.")
        else:
            print("'student_courses' table already exists. Skipping creation.")

    except psycopg2.errors.UndefinedTable as e:
        logger.error(f"UndefinedTable error during migration: {e}. Ensure 'students' and 'courses' tables exist first.")
        print(f"Error applying migration: {e}. Make sure 'students' and 'courses' tables exist.")
        raise
    except Exception as e:
        logger.error(f"Error applying migration: {e}")
        print(f"Error applying migration: {e}")
        raise

if __name__ == "__main__":
    apply_migration()
    print("Migration script 'apply_schema_add_student_courses_table.py' executed.")
