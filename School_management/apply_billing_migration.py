import os
from sqlalchemy import create_engine, text
import logging
from db.init_db import get_database_url, get_engine_kwargs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_billing_migration():
    """Applies the billing and subscription system schema changes."""
    sql_file = os.path.join("db", "migrations", "apply_billing_subscription_system.sql")
    
    if not os.path.exists(sql_file):
        logger.error(f"Migration file not found: {sql_file}")
        return

    try:
        engine = create_engine(get_database_url(), **get_engine_kwargs())
        
        with open(sql_file, "r") as f:
            sql_commands = f.read()

        with engine.connect() as conn:
            # SQLAlchemy doesn't execute multiple statements in one text() call easily with some drivers
            # so we split by semicolon (carefully) or just execute the whole block if the driver supports it.
            # Postgre/Psycopg2 usually handles it.
            conn.execute(text(sql_commands))
            conn.commit()
            logger.info("Billing and Subscription migration applied successfully.")
            
    except Exception as e:
        logger.error(f"Failed to apply billing migration: {e}")
        raise

if __name__ == "__main__":
    apply_billing_migration()
