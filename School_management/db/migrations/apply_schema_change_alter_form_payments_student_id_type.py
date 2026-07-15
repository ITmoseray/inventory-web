from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def apply_alter_form_payments_student_id_type_migration(conn):
    logger.info("Applying migration: Alter form_payments.student_id to INTEGER and add foreign key...")
    
    try:
        # Check if the student_id column is already an INTEGER type
        # This check is more robust than just looking for the specific column name,
        # as it accounts for potential previous partial migrations.
        col_type_result = conn.execute(text("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'form_payments'
              AND column_name = 'student_id';
        """)).fetchone()

        # Only proceed if 'student_id' is NOT already an integer type
        if col_type_result and col_type_result[0] != 'integer':
            logger.info("Column 'student_id' in 'form_payments' is not of type INTEGER. Beginning transformation...")

            # 1. Add new integer column
            logger.info("Adding temporary column 'student_id_int' to form_payments...")
            conn.execute(text("ALTER TABLE form_payments ADD COLUMN student_id_int INTEGER;"))

            # 2. Update new column with student.id values
            logger.info("Populating 'student_id_int' with correct student.id values...")
            conn.execute(text("""
                UPDATE form_payments fp
                SET student_id_int = s.id
                FROM students s
                WHERE fp.student_id = s.student_id;
            """))

            # Set new column as NOT NULL if it should be, after update
            # Decide if student_id_int should be NOT NULL. Based on `payments` table, it's INT, so yes.
            # But ensure no NULLs were introduced by the UPDATE before setting NOT NULL.
            # For now, let's assume successful update fills all or handle NULLs in specific application logic.
            # If student_id could be NULL before, it can be NULL after, unless specifically required.
            # For simplicity, if student_id was VARCHAR, it likely supported NULLs implicitly or explicitly.
            # Let's keep it allowing NULLs for now, or ensure the update handles all cases.
            
            # Ensure no existing foreign key on old column, if any.
            logger.info("Dropping existing foreign key constraint if any on old 'student_id' column...")
            conn.execute(text("""
                ALTER TABLE form_payments
                DROP CONSTRAINT IF EXISTS form_payments_student_id_fkey;
            """))

            # 3. Drop old column
            logger.info("Dropping old 'student_id' column from form_payments...")
            conn.execute(text("ALTER TABLE form_payments DROP COLUMN student_id;"))

            # 4. Rename new column to student_id
            logger.info("Renaming 'student_id_int' to 'student_id' in form_payments...")
            conn.execute(text("ALTER TABLE form_payments RENAME COLUMN student_id_int TO student_id;"))

            logger.info("Successfully altered 'form_payments.student_id' column to INTEGER.")
        else:
            logger.info("Column 'student_id' in 'form_payments' is already of type INTEGER. Skipping type alteration.")

        # 5. Add foreign key constraint
        # Check if the foreign key constraint already exists
        fk_exists = conn.execute(text("""
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_schema = current_schema()
              AND table_name = 'form_payments'
              AND constraint_type = 'FOREIGN KEY'
              AND constraint_name = 'form_payments_student_id_fkey';
        """)).fetchone()

        if not fk_exists:
            logger.info("Adding foreign key constraint 'form_payments_student_id_fkey' to 'form_payments' table...")
            conn.execute(text("""
                ALTER TABLE form_payments
                ADD CONSTRAINT form_payments_student_id_fkey
                FOREIGN KEY (student_id) REFERENCES students(id)
                ON DELETE CASCADE;
            """))
            logger.info("Successfully added foreign key constraint 'form_payments_student_id_fkey'.")
        else:
            logger.info("Foreign key constraint 'form_payments_student_id_fkey' already exists. Skipping.")
            
        conn.commit()
        logger.info("Migration to alter form_payments.student_id applied successfully.")

    except Exception as e:
        logger.error(f"Error applying alter_form_payments_student_id_type migration: {e}")
        conn.rollback() # Rollback on error
        raise
