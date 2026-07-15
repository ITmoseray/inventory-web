import re
import os
import textwrap
from typing import List, Tuple, Any, Optional, Dict, Generator

file_path = "db/student_queries.py"

# --- New method content to be inserted/replaced ---

new_delete_student_permanently_full = textwrap.dedent("""
def delete_student_permanently(student_id: str) -> bool: # Added return type hint
    \"\"\"
    Permanently deletes a student record and all associated records in dependent tables.
    Manages a single atomic transaction.
    \"\"\"
    db_manager = get_db_manager()
    with db_manager.get_connection() as conn: # Use the new get_connection context manager
        trans = conn.begin() # Start a transaction
        try:
            _log_debug(f"Attempting atomic permanent deletion for student ID: {student_id}")

            # 1. Delete dependent records FIRST, using the student_id (VARCHAR) directly
            # All these execute calls are now part of the same transaction
            db_manager.execute("DELETE FROM payments WHERE student_id = :student_id", {"student_id": student_id}, connection=conn)
            db_manager.execute("DELETE FROM form_payments WHERE student_id = :student_id", {"student_id": student_id}, connection=conn)
            db_manager.execute("DELETE FROM attendance WHERE student_id = :student_id", {"student_id": student_id}, connection=conn)
            db_manager.execute("DELETE FROM student_courses WHERE student_id = :student_id", {"student_id": student_id}, connection=conn)
            _log_debug(f"Dependent records deletion attempted for {student_id}")

            # 2. Now delete the student from the main students table
            result = db_manager.execute("DELETE FROM students WHERE student_id = :student_id", {"student_id": student_id}, connection=conn)
            _log_debug(f"Main student record deletion attempted for {student_id}")
            
            # Check if the main student record was actually deleted
            if result.rowcount == 0:
                _log_debug(f"Student with ID '{student_id}' not found for main deletion (rowcount 0). Rolling back.")
                trans.rollback()
                return False

            trans.commit() # Commit the transaction if all operations succeed
            _log_debug(f"Student '{student_id}' successfully permanently deleted.")
            return True

        except Exception as e:
            _log_debug(f"Database error during atomic permanent deletion for student {student_id}: {e}")
            trans.rollback() # Rollback the transaction on any error
            raise # Re-raise to be caught by web_app.py's try-except
        finally:
            conn.close() # Always close the connection
""")

def get_method_def_line(lines: List[str], method_name: str) -> int:
    """Finds the line index of a method's definition."""
    for i, line in enumerate(lines):
        if re.match(rf"^\s*def {method_name}\(student_id: str\):", line): # Specific pattern for delete_student
            return i
    return -1


def get_method_body_end_line(lines: List[str], start_line: int, method_indent: int) -> int:
    """Finds the end line index of a method's body."""
    body_indent = method_indent + 4 # Standard Python indentation
    
    # Find the end of the body (first line with less indentation, or end of file)
    for i in range(start_line, len(lines)):
        if not lines[i].strip(): # Skip empty lines
            continue
        current_line_indent = len(re.match(r"^\s*", lines[i]).group(0))
        if current_line_indent < body_indent:
            return i - 1 # Previous line was the last part of the body
    return len(lines) - 1 # Reached end of file


try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    modified_lines = []
    
    # 1. Add Any to typing import
    typing_import_found = False
    for i, line in enumerate(lines):
        if "from typing import List" in line:
            if "Any" not in line:
                lines[i] = line.replace("List", "List, Any")
            typing_import_found = True
            break
    if not typing_import_found:
        # Fallback if the specific line isn't found, try to add it at a reasonable place
        # This is less robust but handles missing exact line
        for i, line in enumerate(lines):
            if "from typing import" in line and "Any" not in line:
                lines[i] = line.strip() + ", Any\n" # Add to an existing typing import
                break
        else: # If no typing import at all, add a new one after logging
            for i, line in enumerate(lines):
                if "import logging" in line:
                    lines.insert(i + 1, "from typing import List, Any\n")
                    break

    # 2. Rename delete_student and replace its body
    # This requires finding the 'def delete_student' line and replacing its block
    
    method_def_line_idx = get_method_def_line(lines, "delete_student")

    if method_def_line_idx != -1:
        method_indent = len(re.match(r"^\s*", lines[method_def_line_idx]).group(0))
        method_body_end_idx = get_method_body_end_line(lines, method_def_line_idx + 1, method_indent)

        # Add lines before the method
        modified_lines.extend(lines[:method_def_line_idx])
        
        # Add the new method's content
        modified_lines.extend(new_delete_student_permanently_full.splitlines(True))
        
        # Add lines after the old method's body
        modified_lines.extend(lines[method_body_end_idx + 1:])
    else:
        # If method not found, no changes to this part
        modified_lines = lines


    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(modified_lines)
    print(f"Successfully modified {file_path}")

except Exception as e:
    print(f"Error processing {file_path}: {e}")