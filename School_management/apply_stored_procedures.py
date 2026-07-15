from db.database import DatabaseManager
import os

def apply_procedure_from_file(file_path):
    """
    Reads a SQL file containing a PostgreSQL function and executes it.
    """
    try:
        with open(file_path, 'r') as f:
            sql_script = f.read()

        if not sql_script.strip():
            print(f"File '{os.path.basename(file_path)}' is empty. Skipping.")
            return
            
        db = DatabaseManager()
        # The execute method now handles connection and cursor management
        db.execute(sql_script)
        
        print(f"Function from '{os.path.basename(file_path)}' applied successfully.")
    except Exception as e:
        print(f"An unexpected error occurred applying function from '{os.path.basename(file_path)}': {e}")
        raise

def apply_all_stored_procedures():
    """
    Applies all SQL functions found in the 'stored_procedures' directory.
    """
    procedures_dir = 'stored_procedures'
    if not os.path.exists(procedures_dir):
        print(f"Stored procedures directory '{procedures_dir}' not found.")
        return

    sql_files = [f for f in os.listdir(procedures_dir) if f.endswith('.sql')]
    if not sql_files:
        print(f"No SQL files found in '{procedures_dir}'.")
        return

    print(f"Applying {len(sql_files)} functions from '{procedures_dir}'...")
    for sql_file in sorted(sql_files):
        file_path = os.path.join(procedures_dir, sql_file)
        apply_procedure_from_file(file_path)
    print("All functions applied.")

if __name__ == "__main__":
    apply_all_stored_procedures()