from datetime import datetime, date, timedelta
from db.database import get_db_manager
from utils.notifier import notify_graduation_eligibility # NEW IMPORT
import logging

logger = logging.getLogger(__name__)

def get_course_duration_months(course_duration_str):
    """
    Parses the duration string from the database (e.g., '6', '2 months') 
    and returns the number of months as an integer.
    """
    if not course_duration_str:
        return 2 # Default to 2 months if not specified
    
    try:
        # Extract the first number found in the string
        import re
        match = re.search(r'\d+', str(course_duration_str))
        if match:
            return int(match.group())
    except Exception:
        pass
    return 2

def get_graduation_date(enrollment_date, duration_months):
    """
    Calculates the expected graduation date.
    """
    if isinstance(enrollment_date, str):
        enrollment_date = datetime.strptime(enrollment_date, "%Y-%m-%d").date()
    elif isinstance(enrollment_date, datetime):
        enrollment_date = enrollment_date.date()
        
    # Approximate month as 30 days
    graduation_date = enrollment_date + timedelta(days=duration_months * 30)
    return graduation_date

def get_days_remaining(enrollment_date, duration_months):
    """
    Calculates days remaining until graduation.
    """
    grad_date = get_graduation_date(enrollment_date, duration_months)
    today = date.today()
    remaining = (grad_date - today).days
    return max(remaining, 0)

def calculate_progress(enrollment_date, duration_months):
    """
    Calculates course progress as a percentage.
    """
    if isinstance(enrollment_date, str):
        enrollment_date = datetime.strptime(enrollment_date, "%Y-%m-%d").date()
    elif isinstance(enrollment_date, datetime):
        enrollment_date = enrollment_date.date()
        
    today = date.today()
    total_days = duration_months * 30
    days_passed = (today - enrollment_date).days
    
    if total_days == 0:
        return 100
        
    progress = (days_passed / total_days) * 100
    return min(max(progress, 0), 100)

def update_course_completion(student_course_id, progress):
    """
    Automatically marks a course as 'Completed' if progress is 100%.
    """
    if progress >= 100:
        try:
            query = "UPDATE student_courses SET status = 'Completed', completion_date = CURRENT_DATE WHERE id = :id AND status != 'Completed'"
            get_db_manager().execute(query, {"id": student_course_id})
            return True
        except Exception as e:
            logger.error(f"Error updating course completion: {e}")
    return False

def get_student_course_tracking(student_pk_id, full_name=None, phone=None):
    """
    Fetches all courses for a student and calculates tracking info for each.
    """
    query = """
        SELECT sc.id as sc_id, sc.enrollment_date, sc.status, 
               c.id as course_id, c.course_name, c.duration, c.course_code, c.fee
        FROM student_courses sc
        JOIN courses c ON sc.course_id = c.id
        WHERE sc.student_id = :student_id
    """
    courses = get_db_manager().fetch_all(query, {"student_id": student_pk_id})
    
    # Get payments for all these courses
    payment_query = "SELECT course_id, SUM(amount) as total_paid FROM payments WHERE student_id = :sid AND status = 'Paid' GROUP BY course_id"
    payments = get_db_manager().fetch_all(payment_query, {"sid": student_pk_id})
    payments_map = {p['course_id']: float(p['total_paid'] or 0) for p in payments}

    tracking_info = []
    for course in courses:
        # Convert enrollment_date if it's a string from DB (depends on driver)
        enroll_date = course['enrollment_date']
        duration_months = get_course_duration_months(course['duration'])
        
        progress = calculate_progress(enroll_date, duration_months)
        days_left = get_days_remaining(enroll_date, duration_months)
        grad_date = get_graduation_date(enroll_date, duration_months)
        
        # Financial check
        course_fee = float(course['fee'] or 0)
        amount_paid = payments_map.get(course['course_id'], 0.0)
        balance = max(course_fee - amount_paid, 0.0)
        is_paid = balance <= 0

        # Eligibility check
        can_graduate = (progress >= 100 and is_paid)

        # Auto-update status if 100%
        if progress >= 100 and course['status'] == 'Active':
            update_course_completion(course['sc_id'], progress)
            course['status'] = 'Completed'
            
            # Send graduation notice if eligible and info provided
            if can_graduate and full_name and phone:
                try:
                    notify_graduation_eligibility(full_name, phone, course['course_name'])
                except Exception as notify_err:
                    logger.warning(f"Graduation notice failed: {notify_err}")

        tracking_info.append({
            "course_id": course['course_id'],
            "course_name": course['course_name'],
            "course_code": course['course_code'],
            "progress": round(progress, 1),
            "days_left": days_left,
            "grad_date": grad_date.strftime("%d %b %Y"),
            "status": course['status'],
            "fee": course_fee,
            "paid": amount_paid,
            "balance": balance,
            "is_fully_paid": is_paid,
            "can_graduate": can_graduate
        })
        
    return tracking_info
