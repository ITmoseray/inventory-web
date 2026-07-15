import re
import os

file_path = "db/config.py"

new_get_connection_method = """
    def get_connection(self) -> Generator[Any, None, None]: # New context manager for connections
        """Provides a database connection within a context manager.
        The connection is automatically closed after exiting the context.
        """
        if not self._initialized:
            self._initialize_engine()
        conn = self.engine.connect()
        try:
            yield conn
        finally:
            conn.close()
"""

new_test_connection_content = """
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                conn.execute(text("SELECT 1"))
                logger.info("Database connection successful")
                return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
"""

new_fetch_one_content = """
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                result = conn.execute(text(query), params or {})
                row = result.fetchone()
                return dict(row._mapping) if row else None
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
"""

new_fetch_all_content = """
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                result = conn.execute(text(query), params or {})
                return [dict(row._mapping) for row in result]
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
"""

new_execute_method = """
    def execute(self, query: str, params: Optional[Dict[str, Any]] = None, connection=None) -> Any: # Changed return type to Any
        """Execute a command (INSERT, UPDATE, DELETE) and return the result object."""
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
"""

new_insert_and_return_id_content = """
        try:
            result = self.execute(query, params, connection) # Use new execute, passing connection
            new_id = result.scalar_one_or_none() 
            # Commit is handled by execute if no connection is passed, or by external transaction
            return new_id
        except Exception as e:
            logger.error(f"Insert and return ID failed: {e}")
            raise
"""

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add get_connection method after get_session
    content = re.sub(
        r'(def get_session\(self\):
(?:    .*
)*?    db_session\.close\(\))',
        r'\1' + new_get_connection_method,
        content,
        flags=re.DOTALL
    )

    # 2. Modify test_connection
    content = re.sub(
        r'def test_connection\(self\):
(?:    .*
)*?    return False',
        r'def test_connection(self):' + new_test_connection_content,
        content,
        flags=re.DOTALL
    )

    # 3. Modify fetch_one
    content = re.sub(
        r'def fetch_one\(self, query: str, params: Optional\[Dict\[str, Any\]\] = None\) -> Optional\[Dict\[str, Any\]\]:
(?:    .*
)*?    raise',
        r'def fetch_one(self, query: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:' + new_fetch_one_content,
        content,
        flags=re.DOTALL
    )

    # 4. Modify fetch_all
    content = re.sub(
        r'def fetch_all\(self, query: str, params: Optional\[Dict\[str, Any\]\] = None\) -> List\[Dict\[str, Any\]\]:
(?:    .*
)*?    raise',
        r'def fetch_all(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:' + new_fetch_all_content,
        content,
        flags=re.DOTALL
    )

    # 5. Modify execute
    content = re.sub(
        r'def execute\(self, query: str, params: Optional\[Dict\[str, Any\]\] = None\) -> None:
(?:    .*
)*?    raise',
        r'def execute(self, query: str, params: Optional[Dict[str, Any]] = None, connection=None) -> Any:' + new_execute_method,
        content,
        flags=re.DOTALL
    )

    # 6. Modify insert_and_return_id
    content = re.sub(
        r'def insert_and_return_id\(self, query: str, params: Optional\[Dict\[str, Any\]\] = None\) -> Optional\[Any\]:
(?:    .*
)*?    raise',
        r'def insert_and_return_id(self, query: str, params: Optional[Dict[str, Any]] = None, connection=None) -> Optional[Any]:' + new_insert_and_return_id_content,
        content,
        flags=re.DOTALL
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully modified {file_path}")

except Exception as e:
    print(f"Error processing {file_path}: {e}")
