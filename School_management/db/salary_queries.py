from db.database import get_db_manager # Use the global get_db_manager function
from sqlalchemy import text # Import text for SQLAlchemy queries
from db.lecturer_queries import lecturer_manager # Import from lecturer_queries

def add_salary_record(lecturer_id: int, amount, payment_date, status, notes=None, receipt_number=None):
    try:
        # Convert empty strings to None for optional fields to avoid unique constraint issues and maintain database integrity
        receipt_number = receipt_number.strip() if isinstance(receipt_number, str) and receipt_number.strip() else None

        query = """
        INSERT INTO salaries (lecturer_id, amount, payment_date, status, notes, receipt_number)
        VALUES (:lecturer_id, :amount, :payment_date, :status, :notes, :receipt_number)
        RETURNING id
        """
        result = get_db_manager().insert_and_return_id(query, {
            "lecturer_id": lecturer_id,
            "amount": amount,
            "payment_date": payment_date,
            "status": status,
            "notes": notes,
            "receipt_number": receipt_number
        })
        return result
    except Exception as e:
        print(f"Error adding salary record: {e}")
        return None

def get_salary_records_by_lecturer_pk_id(lecturer_pk_id: int): # Renamed parameter and type-hinted to INT
    try:
        query = "SELECT * FROM salaries WHERE lecturer_id = :lecturer_pk_id ORDER BY payment_date DESC"
        return get_db_manager().fetch_all(query, {"lecturer_pk_id": lecturer_pk_id})
    except Exception as e:
        print(f"Error getting salary records by lecturer PK ID: {e}")
        return []

def search_salaries(search_query):
    """
    Searches for salary records by lecturer_id, first_name, last_name, status, or receipt_number.
    """
    try:
        query = """
        SELECT 
            s.id,
            s.lecturer_id,
            l.first_name,
            l.last_name,
            s.amount,
            s.payment_date,
            s.status,
            s.notes,
            s.receipt_number
        FROM 
            salaries s
        JOIN 
            lecturers l ON s.lecturer_id = l.id -- Changed join condition
        WHERE 
            l.lecturer_id ILIKE :search_pattern  -- Search by VARCHAR lecturer_id
            OR l.first_name ILIKE :search_pattern 
            OR l.last_name ILIKE :search_pattern 
            OR s.status ILIKE :search_pattern 
            OR s.receipt_number ILIKE :search_pattern
        ORDER BY 
            s.payment_date DESC
        """
        search_pattern = f"%{search_query}%"
        return get_db_manager().fetch_all(query, {"search_pattern": search_pattern})
    except Exception as e:
        print(f"Error searching salaries: {e}")
        return []

def get_salary_record_by_id(salary_id):
    try:
        query = """
        SELECT s.id, s.lecturer_id, l.first_name, l.last_name, s.amount, s.payment_date, s.status, s.notes, s.receipt_number
        FROM salaries s
        JOIN lecturers l ON s.lecturer_id = l.id -- Changed join condition
        WHERE s.id = :salary_id
        """
        return get_db_manager().fetch_one(query, {"salary_id": salary_id})
    except Exception as e:
        print(f"Error getting salary record by ID: {e}")
        return None
def update_salary_record(salary_id, lecturer_id: int, amount, payment_date, status, notes=None, receipt_number=None):
    try:
        # Convert empty strings to None for optional fields to avoid unique constraint issues and maintain database integrity
        receipt_number = receipt_number.strip() if isinstance(receipt_number, str) and receipt_number.strip() else None

        query = """
        UPDATE salaries
        SET lecturer_id = :lecturer_id, amount = :amount, payment_date = :payment_date, status = :status, notes = :notes, receipt_number = :receipt_number, updated_at = CURRENT_TIMESTAMP
        WHERE id = :salary_id
        """
        get_db_manager().execute(query, {
            "lecturer_id": lecturer_id,
            "amount": amount,
            "payment_date": payment_date,
            "status": status,
            "notes": notes,
            "receipt_number": receipt_number,
            "salary_id": salary_id
        })
        return True
    except Exception as e:
        print(f"Error updating salary record: {e}")
        return False

def delete_salary_record(salary_id):
    try:
        query = "DELETE FROM salaries WHERE id = :salary_id"
        get_db_manager().execute(query, {"salary_id": salary_id})
        return True
    except Exception as e:
        print(f"Error deleting salary record: {e}")
        return False

def get_all_lecturers_with_salary_status():
    try:
        query = """
        SELECT 
            l.lecturer_id,
            l.first_name || ' ' || l.last_name AS full_name,
            l.department,
            (SELECT MAX(payment_date) FROM salaries WHERE lecturer_id = l.id AND status = 'Paid') AS last_paid_date,
            (SELECT amount FROM salaries WHERE lecturer_id = l.id AND status = 'Paid' ORDER BY payment_date DESC LIMIT 1) AS last_paid_amount,
            (SELECT COUNT(*) FROM salaries WHERE lecturer_id = l.id AND status = 'Pending') AS pending_payments_count
        FROM 
            lecturers l
        ORDER BY 
            l.last_name, l.first_name
        """
        return get_db_manager().fetch_all(query)
    except Exception as e:
        print(f"Error getting lecturers with salary status: {e}")
        return []
def get_all_salaries():
    try:
        query = """
        SELECT 
            s.id,
            s.lecturer_id,
            l.first_name,
            l.last_name,
            s.amount,
            s.payment_date,
            s.status,
            s.notes,
            s.receipt_number
        FROM 
            salaries s
        JOIN 
            lecturers l ON s.lecturer_id = l.id -- Changed join condition
        ORDER BY 
            s.payment_date DESC
        """
        return get_db_manager().fetch_all(query)
    except Exception as e:
        print(f"Error getting all salaries: {e}")
        return []