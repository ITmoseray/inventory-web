from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def apply_alter_payments_student_id_type_migration(conn):
    logger.info("Applying migration: Alter payments.student_id to INTEGER and add foreign key...")
    
    try:
        # Check if the column type is already INTEGER
        col_type_result = conn.execute(text("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'payments'
              AND column_name = 'student_id';
        """)).fetchone()

        # If the column type is not integer, alter it
        if col_type_result and col_type_result[0] != 'integer':
            logger.info("Column 'student_id' in 'payments' is not of type INTEGER. Altering column type...")
            # Using a two-step alter for safety, dropping FK if it exists on the wrong type
            conn.execute(text("""
                ALTER TABLE payments
                DROP CONSTRAINT IF EXISTS payments_student_id_fkey;
            """))
            conn.execute(text("""
                ALTER TABLE payments
                ALTER COLUMN student_id TYPE INTEGER
                USING student_id::integer;
            """))
            logger.info("Successfully altered 'student_id' column to INTEGER.")
        else:
            logger.info("Column 'student_id' in 'payments' is already of type INTEGER or does not exist.")

        # Check if a foreign key constraint on payments.student_id referencing students.id already exists
        fk_exists = conn.execute(text("""
            SELECT
                con.conname AS constraint_name
            FROM
                pg_constraint con
            INNER JOIN
                pg_class rel ON rel.oid = con.conrelid
            INNER JOIN
                pg_namespace nsp ON nsp.oid = rel.relnamespace
            WHERE
                nsp.nspname = current_schema() AND
                rel.relname = 'payments' AND
                con.contype = 'f' AND
                EXISTS (
                    SELECT 1
                    FROM pg_attribute att
                    WHERE att.attrelid = rel.oid AND att.attnum = ANY(con.conkey) AND att.attname = 'student_id'
                ) AND
                EXISTS (
                    SELECT 1
                    FROM pg_class frel WHERE frel.oid = con.confrelid AND frel.relname = 'students'
                );
        """)).fetchone()

        if not fk_exists:
            logger.info("Adding foreign key constraint 'payments_student_id_fkey' to 'payments' table...")
            conn.execute(text("""
                ALTER TABLE payments
                ADD CONSTRAINT payments_student_id_fkey
                FOREIGN KEY (student_id) REFERENCES students(id)
                ON DELETE CASCADE;
            """))
            logger.info("Successfully added foreign key constraint.")
        else:
            logger.info("Foreign key constraint 'payments_student_id_fkey' already exists.")
            
        conn.commit()
        logger.info("Migration to alter payments.student_id applied successfully.")

    except Exception as e:
        logger.error(f"Error applying alter_payments_student_id_type migration: {e}")
        conn.rollback() # Rollback on error
        raise
