from db.database import get_db_manager
from decimal import Decimal

db = get_db_manager()
try:
    query = """
    INSERT INTO courses (course_name, course_code, description, duration, fee, credits)
    VALUES (:name, :code, :desc, :dur, :fee, :credits)
    RETURNING id
    """
    params = {
        "name": "Test Course",
        "code": "TEST101",
        "desc": "Test Description",
        "dur": "3 months",
        "fee": Decimal("100.00"),
        "credits": 3
    }
    new_id = db.insert_and_return_id(query, params)
    print(f"Success! New ID: {new_id}")
except Exception as e:
    print(f"Failed! Error: {e}")
