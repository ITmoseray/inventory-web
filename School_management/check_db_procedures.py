import mysql.connector
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

def check_stored_procedures():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        cursor.execute("SHOW PROCEDURE STATUS WHERE Db = %s;", (DB_NAME,))
        procedures = cursor.fetchall()

        if procedures:
            print(f"Found stored procedures in '{DB_NAME}':")
            for proc in procedures:
                print(f"  - {proc[1]}") # Procedure Name is at index 1
        else:
            print(f"No stored procedures found in '{DB_NAME}'.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    check_stored_procedures()
