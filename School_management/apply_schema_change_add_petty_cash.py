from db.database import DatabaseManager
import mysql.connector

def apply_schema_change():
    """
    Applies the schema change to create the petty_cash table.
    """
    db_manager = DatabaseManager()
    connection = None
    try:
        connection = db_manager.get_connection()
        cursor = connection.cursor()

        # Check if the table already exists
        cursor.execute("SHOW TABLES LIKE 'petty_cash'")
        result = cursor.fetchone()
        if not result:
            print("Creating 'petty_cash' table...")
            # Create the table
            cursor.execute("""
                CREATE TABLE petty_cash (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    transaction_date DATE NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    transaction_type ENUM('Income', 'Expense') NOT NULL,
                    authorized_by VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print("'petty_cash' table created successfully.")
        else:
            print("'petty_cash' table already exists.")

    except mysql.connector.Error as err:
        print(f"Failed to apply schema change: {err}")
    finally:
        if connection:
            connection.close() # Return connection to pool

if __name__ == "__main__":
    apply_schema_change()