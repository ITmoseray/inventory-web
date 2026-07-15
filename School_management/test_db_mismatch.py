from db.database import get_db_manager
from sqlalchemy import text

def test_query_mismatch():
    db = get_db_manager()
    username = "admin"
    
    # This is what's in auth/login.py
    query = "SELECT * FROM users WHERE username = %s"
    params = (username,)
    
    print(f"Testing query: {query} with params: {params}")
    try:
        # Fetch one uses text(query) internally
        user = db.fetch_one(query, params)
        print(f"Result: {user}")
    except Exception as e:
        print(f"Caught expected error: {e}")

if __name__ == "__main__":
    test_query_mismatch()
