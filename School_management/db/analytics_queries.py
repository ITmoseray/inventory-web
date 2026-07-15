from db.database import get_db_manager
import logging

logger = logging.getLogger(__name__)

def get_global_revenue_summary():
    """Aggregates revenue across all tenants for the super admin."""
    try:
        db = get_db_manager()
        query = """
            SELECT 
                SUM(amount) as total_revenue,
                COUNT(id) as total_transactions,
                SUM(CASE WHEN payment_date >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END) as revenue_30d
            FROM payments 
            WHERE status = 'Paid'
        """
        return db.fetch_one(query)
    except Exception as e:
        logger.error(f"Error fetching global revenue: {e}")
        return {"total_revenue": 0, "total_transactions": 0, "revenue_30d": 0}

def get_at_risk_students(attendance_threshold=75, payment_threshold=50, tenant_id=None):
    """
    Identifies students who are at risk based on:
    1. Low Attendance (< attendance_threshold%)
    2. Low Payment (< payment_threshold% of total fees)
    
    Returns a list of dictionaries with student details and risk factors.
    """
    try:
        # 1. Get all active students
        query = """
            SELECT s.id, s.first_name, s.last_name, s.student_id, s.phone, s.email,
                   c.course_name, c.fee as course_fee
            FROM students s
            JOIN student_courses sc ON s.id = sc.student_id
            JOIN courses c ON sc.course_id = c.id
            WHERE s.status = 'active' AND sc.status = 'Active'
        """
        params = {}
        if tenant_id:
            query += " AND s.tenant_id = :tid"
            params['tid'] = tenant_id

        students = get_db_manager().fetch_all(query, params)

        at_risk_list = []

        for s in students:
            risk_reasons = []
            
            # --- Check Attendance ---
            att_counts = get_db_manager().fetch_one("""
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
                FROM attendance 
                WHERE student_id = :sid
            """, {"sid": s['id']})
            
            total_classes = att_counts['total'] or 0
            present_classes = att_counts['present'] or 0
            
            att_rate = 100.0
            if total_classes > 0:
                att_rate = (present_classes / total_classes) * 100
            
            if total_classes > 5 and att_rate < attendance_threshold: # Only flag if they've had at least 5 classes
                risk_reasons.append(f"Low Attendance ({int(att_rate)}%)")

            # --- Check Payments ---
            # Calculate total payments for this student
            # Note: This is simplified. Ideally we match payments to specific courses, 
            # but for risk analysis, total paid vs total fee obligation is a good proxy.
            
            paid_result = get_db_manager().fetch_one("""
                SELECT SUM(amount) as total_paid 
                FROM payments 
                WHERE student_id = :sid AND status = 'Paid'
            """, {"sid": s['id']})
            
            total_paid = float(paid_result['total_paid'] or 0)
            course_fee = float(s['course_fee'] or 0)
            
            payment_rate = 100.0
            if course_fee > 0:
                payment_rate = (total_paid / course_fee) * 100
                
            if payment_rate < payment_threshold:
                risk_reasons.append(f"Low Fee Payment ({int(payment_rate)}%)")

            # --- Add to list if risks found ---
            if risk_reasons:
                at_risk_list.append({
                    "id": s['id'],
                    "student_id": s['student_id'],
                    "full_name": f"{s['first_name']} {s['last_name']}",
                    "course": s['course_name'],
                    "attendance_rate": int(att_rate),
                    "payment_rate": int(payment_rate),
                    "risks": risk_reasons
                })

        return at_risk_list

    except Exception as e:
        logger.error(f"Error getting at-risk students: {e}")
        return []
