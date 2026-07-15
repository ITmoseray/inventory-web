from db.database import DatabaseManager

def apply_petty_cash_fks():
    db = DatabaseManager()
    
    alter_statements = [
        """
        ALTER TABLE petty_cash
        ADD COLUMN source_payment_id INT NULL,
        ADD COLUMN source_form_payment_id INT NULL;
        """,
        """
        ALTER TABLE petty_cash
        ADD CONSTRAINT fk_source_payment
        FOREIGN KEY (source_payment_id) REFERENCES payments(id)
        ON DELETE SET NULL;
        """,
        """
        ALTER TABLE petty_cash
        ADD CONSTRAINT fk_source_form_payment
        FOREIGN KEY (source_form_payment_id) REFERENCES form_payments(id)
        ON DELETE SET NULL;
        """
    ]

    try:
        for statement in alter_statements:
            print(f"Executing: {statement.strip()}")
            db.execute(statement)
        print("Successfully applied schema changes to petty_cash table.")
        return True
    except Exception as e:
        print(f"Error applying petty_cash FK schema changes: {e}")
        return False

if __name__ == '__main__':
    if apply_petty_cash_fks():
        print("Petty cash FK schema changes applied successfully.")
    else:
        print("Failed to apply petty cash FK schema changes.")
