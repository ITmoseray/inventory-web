import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse
import logging
from typing import Optional, Dict, Any, List, Generator
import contextlib

# Import Base from models.py
from db.models import Base

logger = logging.getLogger(__name__)

def get_database_url():
    """Get and validate database URL"""
    database_url = os.getenv("DATABASE_URL", "").strip()

    if not database_url:
        # If DATABASE_URL is not set in environment, use the one from config.py
        from config import DATABASE_URL as CFG_DATABASE_URL
        database_url = CFG_DATABASE_URL

    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://", "postgresql://", 1
        )

    return database_url

def get_engine_kwargs():
    """Get engine configuration based on environment"""
    return {
        "pool_pre_ping": True,
        "future": True,
    }

class DatabaseManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
        
    def _initialize_engine(self):
        if self._initialized:
            return
            
        try:
            self.database_url = get_database_url()
            self.engine = create_engine(
                self.database_url,
                **get_engine_kwargs()
            )
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine) # Added autocommit/autoflush for session management
            self._initialized = True
            logger.info("Database engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database engine: {e}")
            raise
            
    def __init__(self):
        if not hasattr(self, '_initialized') or not self._initialized:
            self._initialize_engine()
            
    @contextlib.contextmanager
    def get_session(self):
        """Get a new database session (for ORM use)"""
        if not self._initialized:
            self._initialize_engine()
        db_session = self.SessionLocal()
        try:
            yield db_session
        finally:
            db_session.close()

    @contextlib.contextmanager # NEW: Decorate with contextlib.contextmanager
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
        
    def test_connection(self):
        """Test database connection"""
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                conn.execute(text("SELECT 1"))
                logger.info("Database connection successful")
                return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
            
    def _prepare_query(self, query: str, params: Any) -> tuple[str, Any]:
        """Converts positional %s parameters to named :p0, :p1 parameters if params is a tuple/list."""
        if isinstance(params, (list, tuple)):
            new_params = {}
            new_query = query
            # We need to be careful with %s replacement to only replace literal %s
            # and handle multiple occurrences.
            for i in range(query.count("%s")):
                placeholder = f"p{i}"
                new_query = new_query.replace("%s", f":{placeholder}", 1)
                if i < len(params):
                    new_params[placeholder] = params[i]
            return new_query, new_params
        return query, params or {}

    def fetch_one(self, query: str, params: Optional[Any] = None, connection=None) -> Optional[Dict[str, Any]]:
        """Execute a query and return a single result, optionally using an existing connection."""
        conn_provided = connection is not None
        conn = connection
        
        if not conn_provided:
            conn = self.engine.connect() # Manually obtain a connection

        try:
            prepared_query, prepared_params = self._prepare_query(query, params)
            result = conn.execute(text(prepared_query), prepared_params)
            row = result.fetchone()
            if not conn_provided:
                conn.commit() # Ensure commit if we opened the connection
            return dict(row._mapping) if row else None
        except Exception as e:
            if not conn_provided and conn:
                conn.rollback() # Rollback on error
            logger.error(f"Query execution failed: {e}")
            raise
        finally:
            if not conn_provided and conn:
                conn.close()
            
    def fetch_all(self, query: str, params: Optional[Any] = None) -> List[Dict[str, Any]]:
        """Execute a query and return all results"""
        try:
            with self.get_connection() as conn: # Use the new get_connection context manager
                prepared_query, prepared_params = self._prepare_query(query, params)
                result = conn.execute(text(prepared_query), prepared_params)
                rows = [dict(row._mapping) for row in result]
                conn.commit() # Ensure commit for consistency
                return rows
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
            
    def execute(self, query: str, params: Optional[Any] = None, connection=None) -> Any: # Changed return type to Any
        """Execute a command (INSERT, UPDATE, DELETE) and return the result object."""
        target_conn = connection # Use passed connection if available
        needs_commit = False
        if not target_conn: # If no connection passed, get a new one and manage its transaction
            target_conn = self.engine.connect()
            needs_commit = True # Mark for local transaction management
        try:
            prepared_query, prepared_params = self._prepare_query(query, params)
            result = target_conn.execute(text(prepared_query), prepared_params) # Store result
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

    def insert_and_return_id(self, query: str, params: Optional[Dict[str, Any]] = None, connection=None) -> Optional[Any]:
        """Execute an INSERT query and return the ID of the newly inserted row."""
        try:
            result = self.execute(query, params, connection) # Use new execute, passing connection
            new_id = result.scalar_one_or_none() 
            # Commit is handled by execute if no connection is passed, or by external transaction
            return new_id
        except Exception as e:
            logger.error(f"Insert and return ID failed: {e}")
            raise

    # --- System Settings Methods ---

    def get_setting(self, key: str, default: Any = None, tenant_id: Optional[int] = None) -> Any:
        """Retrieves a system setting for a specific tenant or globally."""
        try:
            query = "SELECT setting_value FROM system_settings WHERE setting_key = :key"
            params = {"key": key}
            
            if tenant_id:
                query += " AND tenant_id = :tid"
                params["tid"] = tenant_id
            else:
                query += " AND tenant_id IS NULL"
                
            result = self.fetch_one(query, params)
            return result['setting_value'] if result else default
        except Exception as e:
            logger.error(f"Error fetching setting {key}: {e}")
            return default

    def set_setting(self, key: str, value: Any, tenant_id: Optional[int] = None):
        """Sets or updates a system setting."""
        try:
            # Check if exists
            existing = self.get_setting(key, tenant_id=tenant_id)
            
            if existing is not None:
                query = "UPDATE system_settings SET setting_value = :val, updated_at = CURRENT_TIMESTAMP WHERE setting_key = :key"
                params = {"val": str(value), "key": key}
                if tenant_id:
                    query += " AND tenant_id = :tid"
                    params["tid"] = tenant_id
                else:
                    query += " AND tenant_id IS NULL"
            else:
                query = "INSERT INTO system_settings (tenant_id, setting_key, setting_value) VALUES (:tid, :key, :val)"
                params = {"tid": tenant_id, "key": key, "val": str(value)}
                
            self.execute(query, params)
            return True
        except Exception as e:
            logger.error(f"Error setting {key}: {e}")
            return False

_db_manager = None

def get_db_manager():
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager
