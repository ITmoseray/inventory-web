import re
import os
import textwrap
from typing import List, Tuple, Any, Optional, Dict, Generator

file_path = "db/config.py"

# --- New method content to be inserted/replaced ---

new_get_connection_method_full = textwrap.dedent("""
    def get_connection(self) -> Generator[Any, None, None]: # New context manager for connections
        \"\"\"Provides a database connection within a context manager.
        The connection is automatically closed after exiting the context.
        \"\"\"
        if not self._initialized:
            self._initialize_engine()
        conn = self.engine.connect()
        try:
            yield conn
        finally:
            conn.close()
""")

new_test_connection_body = textwrap.dedent("""
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                conn.execute(text("SELECT 1"))
                logger.info("Database connection successful")
                return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
""")

new_fetch_one_body = textwrap.dedent("""
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                result = conn.execute(text(query), params or {})
                row = result.fetchone()
                return dict(row._mapping) if row else None
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
""")

new_fetch_all_body = textwrap.dedent("""
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                result = conn.execute(text(query), params or {})
                return [dict(row._mapping) for row in result]
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
""")

new_execute_method_full = textwrap.dedent("""
    def execute(self, query: str, params: Optional[Dict[str, Any]] = None, connection=None) -> Any: # Changed return type to Any
        \"\"\"Execute a command (INSERT, UPDATE, DELETE) and return the result object.\"\"\"
        target_conn = connection # Use passed connection if available
        needs_commit = False
        if not target_conn: # If no connection passed, get a new one and manage its transaction
            target_conn = self.engine.connect()
            needs_commit = True # Mark for local transaction management
        try:
            result = target_conn.execute(text(query), params or {}) # Store result
            if needs_commit:
                target_conn.commit() # Commit only if we opened the connection locally
            return result # Always return result
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            if needs_commit:
                target_conn.rollback() # Rollback if we managed the transaction locally
            raise # Re-raise the exception
        finally:
            if needs_commit and target_conn: # Close the connection if opened locally
                target_conn.close()
""")

new_insert_and_return_id_body = textwrap.dedent("""
        try:
            result = self.execute(query, params, connection) # Use new execute, passing connection
            new_id = result.scalar_one_or_none() 
            # Commit is handled by execute if no connection is passed, or by external transaction
            return new_id
        except Exception as e:
            logger.error(f"Insert and return ID failed: {e}")
            raise
""")


# Helper function to find method body for replacement
def get_method_body_range(lines: List[str], method_name: str, class_indent: int) -> Tuple[int, int]:
    """Finds the start and end line indices of a method's body within lines."""
    method_def_line = -1
    for i, line in enumerate(lines):
        if re.match(rf"^\s*{' ' * class_indent}def {method_name}\(self.*?\):", line):
            method_def_line = i
            break
    
    if method_def_line == -1:
        return -1, -1 # Method not found

    # Determine method body's indentation level
    method_indent = len(re.match(r"^\s*", lines[method_def_line]).group(0))
    body_indent = method_indent + 4 # Standard Python indentation

    body_start = -1
    # Find the actual start of the body (first non-empty line after def, at correct indent)
    for i in range(method_def_line + 1, len(lines)):
        if lines[i].strip():
            current_line_indent = len(re.match(r"^\s*", lines[i]).group(0))
            if current_line_indent >= body_indent:
                body_start = i
                break
    
    if body_start == -1: # Method body might be empty or malformed
        return method_def_line + 1, method_def_line + 1

    body_end = -1
    # Find the end of the body (first line with less indentation, or end of file)
    for i in range(body_start, len(lines)):
        if not lines[i].strip(): # Skip empty lines
            continue
        current_line_indent = len(re.match(r"^\s*", lines[i]).group(0))
        if current_line_indent < body_indent:
            body_end = i -1
            break
    else: # Reached end of file
        body_end = len(lines) -1

    return body_start, body_end


try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    modified_lines = []
    
    # Imports modification: Add Generator
    for i, line in enumerate(lines):
        if "from typing import Optional, Dict, Any, List" in line and "Generator" not in line:
            lines[i] = line.replace("List", "List, Generator")
            break
    
    in_database_manager_class = False
    database_manager_indent = 0
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if "class DatabaseManager:" in line:
            in_database_manager_class = True
            database_manager_indent = len(re.match(r"^\s*", line).group(0))
            modified_lines.append(line)
            i += 1
            continue

        if not in_database_manager_class:
            modified_lines.append(line)
            i += 1
            continue
        
        # We are inside DatabaseManager class
        
        # --- Add get_connection method ---
        if "def get_session(self):" in line:
            modified_lines.append(line) # Keep the get_session definition
            start_body, end_body = get_method_body_range(lines, "get_session", database_manager_indent)
            if start_body != -1:
                # Append get_connection right after the get_session method's body
                modified_lines.extend(lines[start_body : end_body + 1]) # Keep original body
                modified_lines.append(new_get_connection_method_full) # Insert new method
                i = end_body + 1
            else: # Fallback if get_method_body_range fails
                i += 1
            continue # Continue to next line after handling get_session and inserting get_connection


        # --- Modify test_connection ---
        if "def test_connection(self):" in line:
            modified_lines.append(line) # Keep the def line
            start_body, end_body = get_method_body_range(lines, "test_connection", database_manager_indent)
            if start_body != -1:
                modified_lines.append(new_test_connection_body)
                i = end_body + 1 # Skip original body lines
            else:
                i += 1
            continue

        # --- Modify fetch_one ---
        if "def fetch_one(self, query: str," in line:
            modified_lines.append(line) # Keep the def line
            start_body, end_body = get_method_body_range(lines, "fetch_one", database_manager_indent)
            if start_body != -1:
                modified_lines.append(new_fetch_one_body)
                i = end_body + 1 # Skip original body lines
            else:
                i += 1
            continue

        # --- Modify fetch_all ---
        if "def fetch_all(self, query: str," in line:
            modified_lines.append(line) # Keep the def line
            start_body, end_body = get_method_body_range(lines, "fetch_all", database_manager_indent)
            if start_body != -1:
                modified_lines.append(new_fetch_all_body)
                i = end_body + 1 # Skip original body lines
            else:
                i += 1
            continue

        # --- Modify execute ---
        # The pattern for execute needs to change from `-> None` to `-> Any`
        if re.match(r"^\s*def execute\(self, query: str, params: Optional\[Dict\[str, Any\]\] = None\) -> None:", line):
            start_body, end_body = get_method_body_range(lines, "execute", database_manager_indent)
            if start_body != -1:
                # Explicitly write the new signature and then the body
                modified_lines.append("    def execute(self, query: str, params: Optional[Dict[str, Any]] = None, connection=None) -> Any: # Changed return type to Any\n")
                modified_lines.append(new_execute_method_full)
                i = end_body + 1 # Skip original body lines
            else:
                i += 1
            continue

        # --- Modify insert_and_return_id ---
        if re.match(r"^\s*def insert_and_return_id\(self, query: str, params: Optional\[Dict\[str, Any\]\] = None\) -> Optional\[Any\]:", line):
            start_body, end_body = get_method_body_range(lines, "insert_and_return_id", database_manager_indent)
            if start_body != -1:
                # Explicitly write the new signature and then the body
                modified_lines.append("    def insert_and_return_id(self, query: str, params: Optional[Dict[str, Any]] = None, connection=None) -> Optional[Any]:\n")
                modified_lines.append(new_insert_and_return_id_body)
                i = end_body + 1 # Skip original body lines
            else:
                i += 1
            continue
        
        # If no modification, just append the line
        modified_lines.append(line)
        i += 1
    
    # Final cleanup of extra newlines if textwrap added them
    final_content = "".join(modified_lines)
    # Remove any occurrence of multiple blank lines, keeping only one
    final_content = re.sub(r'\n\n+', '\n\n', final_content)


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print(f"Successfully modified {file_path}")

except Exception as e:
    print(f"Error processing {file_path}: {e}")