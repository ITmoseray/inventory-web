from sqlalchemy import text

def apply_payment_type_migration(conn):
    """
    Safely add the payment_type column to form_payments and populate existing rows.
    """
    # Add column if it does not exist
    conn.execute(text("""
    ALTER TABLE form_payments
    ADD COLUMN IF NOT EXISTS payment_type TEXT;
    """))

    # Set a default for existing rows
    conn.execute(text("""
    UPDATE form_payments
    SET payment_type = 'UNKNOWN'
    WHERE payment_type IS NULL;
    """))

    # Make the column NOT NULL with default
    conn.execute(text("""
    ALTER TABLE form_payments
    ALTER COLUMN payment_type SET DEFAULT 'UNKNOWN',
    ALTER COLUMN payment_type SET NOT NULL;
    """))