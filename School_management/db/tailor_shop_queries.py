from db.database import get_db_manager
from decimal import Decimal

def add_tailor_payment(
    student_id,
    item_type,
    measurement,
    amount,
    payment_date,
    status,
    receipt_number=None
):
    query = """
        INSERT INTO tailor_shop_payments (
            student_id,
            item_type,
            measurement,
            amount,
            payment_date,
            status,
            receipt_number
        )
        VALUES (
            :student_id,
            :item_type,
            :measurement,
            :amount,
            :payment_date,
            :status,
            COALESCE(:receipt_number, CONCAT('TSP-', EXTRACT(EPOCH FROM NOW())::BIGINT))
        )
        RETURNING id
    """

    return get_db_manager().insert_and_return_id(
        query,
        {
            "student_id": student_id,
            "item_type": item_type,
            "measurement": measurement,
            "amount": amount,
            "payment_date": payment_date,
            "status": status,
            "receipt_number": receipt_number,
        }
    )

def get_all_tailor_payments():
    try:
        query = """
        SELECT tsp.*, s.first_name, s.last_name, s.student_id as student_unique_id
        FROM tailor_shop_payments tsp
        JOIN students s ON tsp.student_id = s.id
        ORDER BY tsp.payment_date DESC
        """
        return get_db_manager().fetch_all(query)
    except Exception as e:
        print(f"Error fetching tailor shop payments: {e}")
        return []

def get_tailor_payment_by_id(payment_id):
    try:
        query = """
        SELECT tsp.*, s.first_name, s.last_name, s.student_id as student_unique_id
        FROM tailor_shop_payments tsp
        JOIN students s ON tsp.student_id = s.id
        WHERE tsp.id = :payment_id
        """
        return get_db_manager().fetch_one(query, {"payment_id": payment_id})
    except Exception as e:
        print(f"Error fetching tailor shop payment by ID: {e}")
        return None

def get_tailor_payments_by_student_id(student_id):
    try:
        query = """
        SELECT tsp.*, s.first_name, s.last_name, s.student_id as student_unique_id
        FROM tailor_shop_payments tsp
        JOIN students s ON tsp.student_id = s.id
        WHERE tsp.student_id = :student_id
        ORDER BY tsp.payment_date DESC
        """
        return get_db_manager().fetch_all(query, {"student_id": student_id})
    except Exception as e:
        print(f"Error fetching tailor shop payments by student ID: {e}")
        return []

def update_tailor_payment(payment_id, student_id, item_type, measurement, amount, payment_date, receipt_number, status):
    try:
        query = """
        UPDATE tailor_shop_payments
        SET student_id = :student_id, 
            item_type = :item_type, 
            measurement = :measurement, 
            amount = :amount, 
            payment_date = :payment_date, 
            receipt_number = :receipt_number, 
            status = :status
        WHERE id = :payment_id
        """
        get_db_manager().execute(query, {
            "student_id": student_id,
            "item_type": item_type,
            "measurement": measurement,
            "amount": amount,
            "payment_date": payment_date,
            "receipt_number": receipt_number,
            "status": status,
            "payment_id": payment_id
        })
        return True
    except Exception as e:
        print(f"Error updating tailor shop payment: {e}")
        return False

def delete_tailor_payment(payment_id):
    try:
        query = "DELETE FROM tailor_shop_payments WHERE id = :payment_id"
        get_db_manager().execute(query, {"payment_id": payment_id})
        return True
    except Exception as e:
        print(f"Error deleting tailor shop payment: {e}")
        return False

def get_total_tailor_payments():
    try:
        query = "SELECT COALESCE(SUM(amount), 0) as total FROM tailor_shop_payments"
        result = get_db_manager().fetch_one(query)
        return Decimal(result['total'])
    except Exception as e:
        print(f"Error getting total tailor shop payments: {e}")
        return Decimal('0.00')
