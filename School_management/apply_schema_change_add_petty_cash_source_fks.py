from db.database import get_db_manager
import logging

logger = logging.getLogger(__name__)

def apply_migration():
    db_manager = get_db_manager()
    try:
        print("Checking for missing 'source_payment_id' and 'source_form_payment_id' columns in 'petty_cash' table...")

        # Add source_payment_id
        check_sp_query = """
        SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'petty_cash' AND column_name = 'source_payment_id');
        """
        sp_exists = db_manager.fetch_one(check_sp_query)['exists']
        if not sp_exists:
            print("Column 'source_payment_id' does not exist in 'petty_cash'. Adding it.")
            db_manager.execute("ALTER TABLE petty_cash ADD COLUMN source_payment_id INT")
            db_manager.execute("ALTER TABLE petty_cash ADD CONSTRAINT fk_source_payment FOREIGN KEY (source_payment_id) REFERENCES payments(id) ON DELETE SET NULL")
            print("Successfully added 'source_payment_id' column and FK to 'petty_cash'.")
        else:
            print("Column 'source_payment_id' already exists in 'petty_cash'. Skipping.")

        # Add source_form_payment_id
        check_sfp_query = """
        SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'petty_cash' AND column_name = 'source_form_payment_id');
        """
        sfp_exists = db_manager.fetch_one(check_sfp_query)['exists']
        if not sfp_exists:
            print("Column 'source_form_payment_id' does not exist in 'petty_cash'. Adding it.")
            db_manager.execute("ALTER TABLE petty_cash ADD COLUMN source_form_payment_id INT")
            db_manager.execute("ALTER TABLE petty_cash ADD CONSTRAINT fk_source_form_payment FOREIGN KEY (source_form_payment_id) REFERENCES form_payments(id) ON DELETE SET NULL")
            print("Successfully added 'source_form_payment_id' column and FK to 'petty_cash'.")
        else:
            print("Column 'source_form_payment_id' already exists in 'petty_cash'. Skipping.")

        print("Migration for petty_cash source FKs applied.")

    except Exception as e:
        logger.error(f"Error applying petty_cash source FKs migration: {e}")
        print(f"Error applying petty_cash source FKs migration: {e}")
        raise

if __name__ == "__main__":
    apply_migration()
    print("Migration script 'apply_schema_change_add_petty_cash_source_fks.py' executed.")
