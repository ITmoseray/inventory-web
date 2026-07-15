import os
from sqlalchemy import create_engine, text
import logging
from db.init_db import get_database_url, get_engine_kwargs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_upgrade():
    sql_file = os.path.join("db", "migrations", "upgrade_backup_level4.sql")
    try:
        engine = create_engine(get_database_url(), **get_engine_kwargs())
        with open(sql_file, "r") as f:
            sql = f.read()
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
            logger.info("Level 4 Architecture Upgrade Applied Successfully.")
    except Exception as e:
        logger.error(f"Upgrade failed: {e}")

if __name__ == "__main__":
    apply_upgrade()
