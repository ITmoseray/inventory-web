from db.database import DatabaseManager
import mysql.connector

def apply_schema_change():
    """
    Applies the schema change to add the payment_method column to the form_payments table.
    """
    db_manager = DatabaseManager()
    connection = None
    try:
        connection = db_manager.get_connection()
        cursor = connection.cursor()

        # Check if the column already exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'form_payments'
            AND COLUMN_NAME = 'payment_method'
        """)
        if cursor.fetchone()[0] == 0:
            print("Adding 'payment_method' column to 'form_payments' table...")
            # Add the column
            cursor.execute("""
                ALTER TABLE form_payments
                ADD COLUMN payment_method VARCHAR(50)
            """)
            print("'payment_method' column added successfully.")
        else:
            print("'payment_method' column already exists in 'form_payments' table.")

    except mysql.connector.Error as err:
        print(f"Failed to apply schema change: {err}")
    finally:
        if connection:
            connection.close() # Return connection to pool

if __name__ == "__main__":
    apply_schema_change()