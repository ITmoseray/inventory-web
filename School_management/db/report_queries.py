from db.database import get_db_manager # Use the global get_db_manager function
from sqlalchemy import text

def get_student_enrollment_report():
    """
    Generates a report of all students and their enrollment status.
    """
    try:
        query = """
        SELECT s.student_id, s.first_name, s.last_name, s.email,
               c.course_name, c.course_code, sc.enrollment_date, sc.status as enrollment_status
        FROM students s
        JOIN student_courses sc ON s.id = sc.student_id
        JOIN courses c ON sc.course_id = c.id
        ORDER BY c.course_name, s.last_name, s.first_name
        """
        data = get_db_manager().fetch_all(query)
        return data
    except Exception as e:
        print(f"Error generating Student Enrollment Report: {e}")
        return []
def get_payment_summary_report():
    """
    Generates a summary of payments made by each student, including regular and tailoring payments.
    """
    try:
        query = """
        SELECT s.student_id, s.first_name, s.last_name,
               COALESCE(SUM(all_p.amount), 0) as total_paid,
               COUNT(all_p.id) as total_payments
        FROM students s
        LEFT JOIN (
            SELECT id, student_id, amount FROM payments
            UNION ALL
            SELECT id, student_id, amount FROM tailor_shop_payments
        ) all_p ON s.id = all_p.student_id
        GROUP BY s.student_id, s.first_name, s.last_name
        ORDER BY s.last_name, s.first_name
        """
        data = get_db_manager().fetch_all(query)
        return data
    except Exception as e:
        print(f"Error generating Payment Summary Report: {e}")
        return []

def get_attendance_overview_report():
    """
    Generates a report summarizing student attendance.
    """
    try:
        query = """
        SELECT s.student_id, s.first_name, s.last_name,
               c.course_name, c.course_code,
               COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as days_present,
               COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as days_absent,
               COUNT(a.id) as total_sessions
        FROM students s
        JOIN attendance a ON s.id = a.student_id
        JOIN courses c ON a.course_id = c.id
        GROUP BY s.student_id, s.first_name, s.last_name, c.course_name, c.course_code
        ORDER BY c.course_name, s.last_name, s.first_name
        """
        data = get_db_manager().fetch_all(query)
        return data
    except Exception as e:
        print(f"Error generating Attendance Overview Report: {e}")
        return []
def get_course_popularity_report():
    """
    Generates a report showing the number of students enrolled in each course.
    """
    try:
        query = """
        SELECT c.course_name, c.course_code, COUNT(sc.student_id) as enrolled_students
        FROM courses c
        LEFT JOIN student_courses sc ON c.id = sc.course_id
        GROUP BY c.course_name, c.course_code
        ORDER BY enrolled_students DESC
        """
        data = get_db_manager().fetch_all(query)
        return data
    except Exception as e:
        print(f"Error generating Course Popularity Report: {e}")
        return []
# Placeholder functions for payment reports, assuming stored procedures or more complex logic
# These would interact with stored procedures in a real scenario
def get_daily_payments(date_str):
    try:
        # Example: Call a stored procedure or execute a direct query
        # For stored procedures, ensure they are already defined in your DB
        query = "SELECT * FROM GetDailyPayments(:date_str)"
        data = get_db_manager().fetch_all(query, {"date_str": date_str})
        return data
    except Exception as e:
        print(f"Error getting daily payments: {e}")
        return []

def get_monthly_payments(year, month):
    try:
        query = "SELECT * FROM GetMonthlyPayments(:year, :month)"
        data = get_db_manager().fetch_all(query, {"year": year, "month": month})
        return data
    except Exception as e:
        print(f"Error getting monthly payments: {e}")
        return []

def get_yearly_payments(year):
    try:
        query = "SELECT * FROM GetYearlyPayments(:year)"
        data = get_db_manager().fetch_all(query, {"year": year})
        return data
    except Exception as e:
        print(f"Error getting yearly payments: {e}")
        return []

def get_student_status_distribution():
    """
    Retrieves the count of students for each enrollment status (e.g., Active, Inactive, Graduated).
    """
    try:
        query = """
        SELECT status, COUNT(DISTINCT student_id) as count
        FROM student_courses
        GROUP BY status
        """
        results = get_db_manager().fetch_all(query)
        return results
    except Exception as e:
        print(f"Error getting student status distribution: {e}")
        return []
def get_monthly_payment_trends(year):
    """
    Retrieves the total payment amount for each month of a given year, including tailoring payments.
    Returns a list of dictionaries with 'month' (1-12) and 'total_amount'.
    """
    try:
        # Initialize results for all 12 months with 0 amount
        monthly_amounts = [{'month': i, 'total_amount': 0.0} for i in range(1, 13)]

        query = """
        SELECT
            EXTRACT(MONTH FROM payment_date) as month,
            SUM(amount) as total_amount
        FROM (
            SELECT amount, payment_date FROM payments
            UNION ALL
            SELECT amount, payment_date FROM tailor_shop_payments
        ) all_p
        WHERE EXTRACT(YEAR FROM payment_date) = :year
        GROUP BY EXTRACT(MONTH FROM payment_date)
        ORDER BY EXTRACT(MONTH FROM payment_date)
        """
        results = get_db_manager().fetch_all(query, {"year": year})

        # Update initialized monthly_amounts with actual data
        for row in results:
            month_index = row['month'] - 1  # Adjust for 0-based indexing
            monthly_amounts[month_index]['total_amount'] = float(row['total_amount']) # Ensure float for JSON serialization

        return monthly_amounts
    except Exception as e:
        print(f"Error getting monthly payment trends: {e}")
        return []

def get_course_enrollment_distribution():
    """
    Retrieves the count of enrolled students for each course.
    """
    try:
        query = """
        SELECT c.course_name, c.course_code, COUNT(sc.student_id) as enrolled_students
        FROM courses c
        LEFT JOIN student_courses sc ON c.id = sc.course_id
        GROUP BY c.course_name, c.course_code
        ORDER BY enrolled_students DESC
        """
        results = get_db_manager().fetch_all(query)
        return results
    except Exception as e:
        print(f"Error getting course enrollment distribution: {e}")
        return []
