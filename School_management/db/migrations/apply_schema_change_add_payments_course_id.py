from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def apply_payments_course_id_migration(conn):
    logger.info("Applying migration: Add course_id to payments table...")
    
    try:
        # 1. Add course_id column if it doesn't exist
        conn.execute(text("""
            ALTER TABLE payments
            ADD COLUMN IF NOT EXISTS course_id INTEGER;
        """))
        logger.info("Checked/added 'course_id' column to 'payments' table.")

        # 2. Add foreign key constraint if it doesn't exist
        # Check if the foreign key constraint already exists to avoid errors on re-run
        fk_exists = conn.execute(text("""
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_schema = current_schema()
              AND table_name = 'payments'
              AND constraint_type = 'FOREIGN KEY'
              AND constraint_name = 'payments_course_id_fkey';
        """)).fetchone()

        if not fk_exists:
            conn.execute(text("""
                ALTER TABLE payments
                ADD CONSTRAINT payments_course_id_fkey
                FOREIGN KEY (course_id) REFERENCES courses(id);
            """))
            logger.info("Added foreign key constraint 'payments_course_id_fkey' to 'payments' table.")
        else:
            logger.info("Foreign key constraint 'payments_course_id_fkey' already exists on 'payments' table.")

        # 3. (Optional, and requires data consistency) Set course_id to NOT NULL
        # This step should only be run if you are certain all existing payments have a valid course_id
        # For now, we'll keep it nullable to avoid breaking existing data.
        # If the user wants to enforce NOT NULL, they must ensure data integrity first.
        # conn.execute(text("ALTER TABLE payments ALTER COLUMN course_id SET NOT NULL;"))
        # logger.info("Set 'course_id' column in 'payments' table to NOT NULL (if uncommented).")

        # 4. Add an index for faster lookups by course_id
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
        """))
        logger.info("Checked/added index 'idx_payments_course_id' on 'payments' table.")
        
        conn.commit()
        logger.info("Migration 'Add course_id to payments table' applied successfully.")

    except Exception as e:
        logger.error(f"Error applying payments_course_id migration: {e}")
        # Re-raise the exception to signal failure
        raise