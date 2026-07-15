from db.database import get_db_manager # Use the global get_db_manager function
from sqlalchemy import text # Import text for SQLAlchemy queries
from db.activity_queries import log_activity

def get_all_payments():
    """
    Retrieves all payments from the database.
    """
    try:
        query = """
        SELECT p.id, p.student_id, p.course_id, s.student_id as student_identifier, s.first_name, s.last_name, c.course_name, c.course_code, p.amount, p.payment_date, p.status, p.payment_method, p.receipt_number
        FROM payments p
        JOIN students s ON p.student_id = s.id -- Use student.id
        JOIN courses c ON p.course_id = c.id -- Use course.id
        ORDER BY p.payment_date DESC
        """
        payments = get_db_manager().fetch_all(query)
        return payments
    except Exception as e:
        print(f"Error getting all payments: {e}")
        return []
def search_payments(search_query):
    """
    Searches for payments by student ID, student name, course name, or status.
    """
    try:
        query = """
        SELECT p.id, p.student_id, p.course_id, s.student_id as student_identifier, s.first_name, s.last_name, c.course_name, c.course_code, p.amount, p.payment_date, p.status, p.payment_method, p.receipt_number
        FROM payments p
        JOIN students s ON p.student_id = s.id
        JOIN courses c ON p.course_id = c.id
        WHERE s.student_id ILIKE :search_pattern OR s.first_name ILIKE :search_pattern OR s.last_name ILIKE :search_pattern OR c.course_name ILIKE :search_pattern OR c.course_code ILIKE :search_pattern OR p.status ILIKE :search_pattern
        ORDER BY p.payment_date DESC
        """
        search_pattern = f"%{search_query}%"
        payments = get_db_manager().fetch_all(query, {"search_pattern": search_pattern})
        return payments
    except Exception as e:
        print(f"Error searching payments: {e}")
        return []
def get_student_identifier_by_identifier(student_identifier):
    """Retrieves the student_id (string) of a student by their student_id string."""
    try:
        query = "SELECT student_id FROM students WHERE student_id = :student_identifier"
        result = get_db_manager().fetch_one(query, {"student_identifier": student_identifier})
        return result['student_id'] if result else None
    except Exception as e:
        print(f"Error getting student identifier by identifier: {e}")
        return None

def get_course_code_by_name(course_name):
    """Retrieves the course_code (string) of a course by its course_name."""
    try:
        query = "SELECT course_code FROM courses WHERE course_name = :course_name"
        result = get_db_manager().fetch_one(query, {"course_name": course_name})
        return result['course_code'] if result else None
    except Exception as e:
        print(f"Error getting course code by name: {e}")
        return None

def get_student_db_id_by_identifier(identifier):
    """
    Retrieves the internal database ID (students.id - INTEGER) of a student
    by their student_id (VARCHAR).
    """
    try:
        query = "SELECT id FROM students WHERE student_id = :identifier"
        result = get_db_manager().fetch_one(query, {"identifier": identifier})
        print(f"DEBUG: get_student_db_id_by_identifier raw result for identifier '{identifier}': {result}") # ADDED FOR DEBUGGING
        return result["id"] if result else None
    except Exception as e:
        print(f"Error getting student DB ID by identifier: {e}")
        return None
def add_payment(student_id: int, course_id: int, amount, payment_date, status, payment_method, receipt_number, performed_by=None): # Changed parameters to INT
    """
    Adds a new payment to the database.
    """
    db_manager = get_db_manager()

    # Verify student exists
    student = db_manager.fetch_one(
        "SELECT id, first_name, last_name FROM students WHERE id = :student_id",
        {"student_id": student_id}
    )
    if not student:
        raise Exception("Invalid student selected")
        
    try:
        query = """
        INSERT INTO payments (student_id, course_id, amount, payment_date, status, payment_method, receipt_number)
        VALUES (:student_id, :course_id, :amount, :payment_date, :status, :payment_method, :receipt_number)
        RETURNING id
        """
        # Convert empty strings to None for optional fields to avoid unique constraint issues and maintain database integrity
        receipt_number = receipt_number.strip() if isinstance(receipt_number, str) and receipt_number.strip() else None
        payment_method = payment_method.strip() if isinstance(payment_method, str) and payment_method.strip() else None

        payment_db_id = db_manager.insert_and_return_id(query, {
            "student_id": student_id,
            "course_id": course_id,
            "amount": amount,
            "payment_date": payment_date,
            "status": status,
            "payment_method": payment_method,
            "receipt_number": receipt_number
        })
        
        if payment_db_id:
            log_activity(performed_by, "Add Payment", f"Added payment of {amount} for {student['first_name']} {student['last_name']}")
            
        return payment_db_id
    except Exception as e:
        print(f"Error adding payment: {e}")
        return None
def get_payment_by_id(payment_id):
    """
    Retrieves a single payment's details by its ID.
    """
    try:
        query = """
        SELECT p.id, p.student_id, p.course_id, s.student_id as student_identifier, s.first_name, s.last_name, c.course_name, c.course_code, p.amount, p.payment_date, p.status, p.payment_method, p.receipt_number
        FROM payments p
        JOIN students s ON p.student_id = s.id
        JOIN courses c ON p.course_id = c.id
        WHERE p.id = :payment_id
        """
        payment = get_db_manager().fetch_one(query, {"payment_id": payment_id})
        return payment
    except Exception as e:
        print(f"Error getting payment by ID: {e}")
        return None
def update_payment(payment_id, student_id: int, course_id: int, amount, payment_date, status, payment_method, receipt_number, performed_by=None): # Changed parameters to INT
    """
    Updates an existing payment's details.
    """
    try:
        # Convert empty strings to None for optional fields to avoid unique constraint issues and maintain database integrity
        receipt_number = receipt_number.strip() if isinstance(receipt_number, str) and receipt_number.strip() else None
        payment_method = payment_method.strip() if isinstance(payment_method, str) and payment_method.strip() else None

        query = """
        UPDATE payments
        SET student_id = :student_id, course_id = :course_id, amount = :amount, payment_date = :payment_date, status = :status, payment_method = :payment_method, receipt_number = :receipt_number, updated_at = CURRENT_TIMESTAMP
        WHERE id = :payment_id
        """
        get_db_manager().execute(query, {
            "student_id": student_id,
            "course_id": course_id,
            "amount": amount,
            "payment_date": payment_date,
            "status": status,
            "payment_method": payment_method,
            "receipt_number": receipt_number,
            "payment_id": payment_id
        })
        
        # Fetch student name for logging
        student = get_db_manager().fetch_one("SELECT first_name, last_name FROM students WHERE id = :id", {"id": student_id})
        log_activity(performed_by, "Update Payment", f"Updated payment ID {payment_id} for {student['first_name']} {student['last_name']}")
        
        return True
    except Exception as e:
        print(f"Error updating payment: {e}")
        return False
def get_payments_by_student_id(student_id: int):
    """
    Retrieves all payments for a specific student by their internal ID.
    """
    try:
        query = """
        SELECT p.id, p.student_id, p.course_id, c.course_name, c.course_code, p.amount, p.payment_date, p.status, p.payment_method, p.receipt_number
        FROM payments p
        JOIN courses c ON p.course_id = c.id
        WHERE p.student_id = :student_id
        ORDER BY p.payment_date DESC
        """
        payments = get_db_manager().fetch_all(query, {"student_id": student_id})
        return payments
    except Exception as e:
        print(f"Error getting payments by student ID: {e}")
        return []

def delete_payment(payment_id, performed_by=None):
    """
    Deletes a payment from the database after archiving it.
    """
    try:
        from db.backup_queries import archive_record
        # Fetch details for logging and archiving before deletion
        payment = get_payment_by_id(payment_id)
        if not payment: return False

        # Archive for Developer record keeping
        archive_record(
            tenant_id=payment.get('tenant_id'),
            table_name='payments',
            record_id=payment_id,
            record_data=payment,
            deleted_by=performed_by
        )

        query = "DELETE FROM payments WHERE id = :payment_id"
        get_db_manager().execute(query, {"payment_id": payment_id})

        if performed_by:
            from db.activity_queries import log_activity
            log_activity(performed_by, "Delete Payment", f"Deleted payment of {payment.get('amount')} for student {payment.get('student_identifier')}", tenant_id=payment.get('tenant_id'))

        return True
    except Exception as e:
        print(f"Error deleting payment: {e}")
        return False

print("Loaded payment_queries helpers:",
      [name for name in globals() if name.startswith("get_")])