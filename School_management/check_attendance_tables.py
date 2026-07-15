from db.config import get_db_manager # Corrected import path
import os # Import os module
import logging # Import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# This script expects DATABASE_URL to be set as an environment variable
# e.g., $env:DATABASE_URL="postgresql://user:password@host:port/database"

def list_attendance_tables():
    # Get the DatabaseManager instance
    db_manager = get_db_manager()
    
    query = """
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_name ILIKE '%attendance%';
    """
    
    try:
        # Use fetch_all as defined in db/config.py
        results = db_manager.fetch_all(query)
        if results:
            logger.info("Attendance tables found:")
            for row in results:
                # Assuming row is a dictionary-like object from SQLAlchemy's RowMapping
                logger.info(f"- {row['table_schema']}.{row['table_name']}")
        else:
            logger.info("No attendance tables found.")
    except Exception as e:
        logger.error(f"Error querying database: {e}")

if __name__ == "__main__":
    # Ensure DATABASE_URL is set before running
    if "DATABASE_URL" not in os.environ:
        logger.error("DATABASE_URL environment variable is not set. Please set it before running this script.")
        exit(1)
    list_attendance_tables()
