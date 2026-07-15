from db.database import get_db_manager # Use the global get_db_manager function
from decimal import Decimal
from sqlalchemy import text # Import text for SQLAlchemy queries



def add_form_payment(
    student_id,
    amount,
    payment_date,
    payment_method,
    status,
    form_type, # Added form_type as a parameter
    receipt_number=None
):
    query = """
        INSERT INTO form_payments (
            student_id,
            amount,
            payment_date,
            payment_method,
            status,
            receipt_number,
            form_type
        )
        VALUES (
            :student_id,
            :amount,
            :payment_date,
            :payment_method,
            :status,
            COALESCE(:receipt_number, CONCAT('TW-', EXTRACT(EPOCH FROM NOW())::BIGINT)),
            :form_type
        )
        RETURNING id
    """

    # Convert empty strings to None for optional fields to avoid unique constraint issues and maintain database integrity
    receipt_number = receipt_number.strip() if isinstance(receipt_number, str) and receipt_number.strip() else None

    return get_db_manager().insert_and_return_id(
        query,
        {
            "student_id": student_id,
            "amount": amount,
            "payment_date": payment_date,
            "payment_method": payment_method,
            "status": status,
            "receipt_number": receipt_number,
            "form_type": form_type,
        }
    )



def get_all_form_payments(form_type=None):
    """
    Retrieves all form payment records from the database, optionally filtered by form_type.
    """


    try:
        query = """
        SELECT fp.*, s.first_name, s.last_name, s.student_id as student_unique_id
        FROM form_payments fp
        JOIN students s ON fp.student_id = s.id
        """
        params = {}
        if form_type:
            query += " WHERE fp.form_type = :form_type"
            params["form_type"] = form_type
        query += " ORDER BY fp.payment_date DESC"
        
        payments = get_db_manager().fetch_all(query, params)
        return payments
    except Exception as e:
        print(f"Error fetching form payments: {e}")
        return []

def search_form_payments(search_query):
    """
    Searches for form payments by student name, student ID, form type, or status.
    """
    try:
        query = """
        SELECT fp.id, s.student_id as student_identifier, s.first_name, s.last_name, fp.form_type, fp.amount, fp.payment_date, fp.status, fp.receipt_number, fp.payment_method
        FROM form_payments fp
        JOIN students s ON fp.student_id = s.id
        WHERE s.student_id ILIKE :search_pattern 
           OR s.first_name ILIKE :search_pattern 
           OR s.last_name ILIKE :search_pattern 
           OR fp.form_type ILIKE :search_pattern 
           OR fp.status ILIKE :search_pattern
        ORDER BY fp.payment_date DESC
        """
        search_pattern = f"%{search_query}%"
        payments = get_db_manager().fetch_all(query, {"search_pattern": search_pattern})
        return payments
    except Exception as e:
        print(f"Error searching form payments: {e}")
        return []

def get_form_payment_by_id(payment_id: int):
    """
    Retrieves a form payment record by its ID.
    """
    try:
        query = """
        SELECT fp.*, s.first_name, s.last_name, s.student_id as student_unique_id
        FROM form_payments fp
        JOIN students s ON fp.student_id = s.id
        WHERE fp.id = :payment_id
        """
        return get_db_manager().fetch_one(query, {"payment_id": payment_id})
    except Exception as e:
        print(f"Error fetching form payment by ID: {e}")
        return None

def update_form_payment(payment_id: int, student_id: str, form_type: str, amount: Decimal, payment_date: str, receipt_number: str, status: str, payment_method: str):
    """
    Updates an existing form payment record.
    """
    try:
        # Convert empty strings to None for optional fields to avoid unique constraint issues and maintain database integrity
        receipt_number = receipt_number.strip() if isinstance(receipt_number, str) and receipt_number.strip() else None
        payment_method = payment_method.strip() if isinstance(payment_method, str) and payment_method.strip() else None

        query = """
        UPDATE form_payments
        SET student_id = :student_id, form_type = :form_type, amount = :amount, payment_date = :payment_date, receipt_number = :receipt_number, status = :status, payment_method = :payment_method, updated_at = CURRENT_TIMESTAMP
        WHERE id = :payment_id
        """
        get_db_manager().execute(query, {
            "student_id": student_id,
            "form_type": form_type,
            "amount": amount,
            "payment_date": payment_date,
            "receipt_number": receipt_number,
            "status": status,
            "payment_method": payment_method,
            "payment_id": payment_id
        })
        return True
    except Exception as e:
        print(f"Error updating form payment: {e}")
        return False

def delete_form_payment(payment_id: int):
    """
    Deletes a form payment record from the database.
    """
    try:
        query = "DELETE FROM form_payments WHERE id = :payment_id"
        get_db_manager().execute(query, {"payment_id": payment_id})
        return True
    except Exception as e:
        print(f"Error deleting form payment: {e}")
        return False

def get_total_form_payments() -> Decimal:
    """Calculates the total amount of all form payments, subtracting amounts transferred to petty cash."""
    total_form_payments_query = "SELECT COALESCE(SUM(amount), 0) AS total_form_payments FROM form_payments"
    total_petty_cash_from_form_payments_query = """
        SELECT COALESCE(SUM(pc.amount), 0) AS total_petty_cash_from_form_payments
        FROM petty_cash pc
        WHERE pc.source_form_payment_id IS NOT NULL AND pc.transaction_type = 'Income'
    """
    try:
        total_form_payments_result = get_db_manager().fetch_one(total_form_payments_query)
        total_form_payments = Decimal(total_form_payments_result['total_form_payments'])

        total_petty_cash_from_form_payments_result = get_db_manager().fetch_one(total_petty_cash_from_form_payments_query)
        total_petty_cash_from_form_payments = Decimal(total_petty_cash_from_form_payments_result['total_petty_cash_from_form_payments'])
        
        # Subtract petty cash amounts originating from form payments
        final_total = total_form_payments - total_petty_cash_from_form_payments
        
        return final_total
    except Exception as e:
        print(f"Error getting total form payments: {e}")
        return Decimal('0.00')

def get_form_payments_by_student_id(student_id: int):
    """
    Retrieves all form payment records for a specific student.
    """
    try:
        query = "SELECT * FROM form_payments WHERE student_id = :student_id ORDER BY payment_date DESC"
        return get_db_manager().fetch_all(query, {"student_id": student_id})
    except Exception as e:
        print(f"Error fetching form payments for student: {e}")
        return []
