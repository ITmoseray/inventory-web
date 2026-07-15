from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def add_password_hash_column(conn): # Accept conn as argument
    try:
        # Add column if it doesn't exist
        logger.info("Checking for 'password_hash' column in 'students' table...")
        conn.execute(text("""
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS password_hash TEXT;
        """))
        logger.info("Successfully ensured 'password_hash' column exists.")

        # Optional: Set a default password for existing students
        # (replace with a proper hashed password if needed)
        logger.info("Updating existing students with default password_hash where NULL...")
        conn.execute(text("""
            UPDATE students
            SET password_hash = 'default_password_hash'
            WHERE password_hash IS NULL;
        """))
        logger.info("Existing students updated with default password_hash.")
        
        # In SQLAlchemy 2.0, commit is usually handled at the connection level or session level
        # if the engine was created with future=True and we are using with engine.begin() or engine.connect()
        # but here we are using a connection passed from init_db.py
        
        logger.info("✅ 'password_hash' column migration completed successfully.")
    except Exception as e:
        logger.error(f"❌ Error adding password_hash column: {e}")
        # Rollback should be handled by the caller or here if we manage the transaction
        raise # Re-raise the exception to signal failure

if __name__ == "__main__":
    from db.config import DatabaseManager
    logging.basicConfig(level=logging.INFO)
    try:
        db_manager = DatabaseManager()
        with db_manager.get_connection() as conn:
            add_password_hash_column(conn)
            conn.commit()
    except Exception as e:
        logger.error(f"Standalone migration failed: {e}")
