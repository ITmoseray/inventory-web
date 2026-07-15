import os
import logging
import config
from utils.email_sender import send_email
from db.database import get_db_manager

# Try to import twilio, but don't fail if not installed
try:
    from twilio.rest import Client
except ImportError:
    Client = None

logger = logging.getLogger(__name__)

def send_sms(to_number, message):
    """
    Sends an SMS using Twilio.
    """
    db = get_db_manager()
    sid = db.get_setting('TWILIO_ACCOUNT_SID') or config.TWILIO_ACCOUNT_SID
    token = db.get_setting('TWILIO_AUTH_TOKEN') or config.TWILIO_AUTH_TOKEN
    from_num = db.get_setting('TWILIO_PHONE_NUMBER') or config.TWILIO_PHONE_NUMBER

    if not Client or sid == 'your_sid_here' or not sid:
        logger.info(f"[MOCK SMS] To: {to_number} | Msg: {message}")
        return True, "Mock SMS sent"

    try:
        client = Client(sid, token)
        # Ensure number has plus sign
        if not to_number.startswith('+'):
            # Default to +232 for Sierra Leone if not specified
            to_number = '+232' + to_number.lstrip('0')
            
        msg = client.messages.create(
            body=message,
            from_=from_num,
            to=to_number
        )
        logger.info(f"SMS sent: {msg.sid}")
        return True, msg.sid
    except Exception as e:
        logger.error(f"Failed to send SMS: {e}")
        return False, str(e)

def send_whatsapp(to_number, message):
    """
    Sends a WhatsApp message using Twilio.
    """
    db = get_db_manager()
    sid = db.get_setting('TWILIO_ACCOUNT_SID') or config.TWILIO_ACCOUNT_SID
    token = db.get_setting('TWILIO_AUTH_TOKEN') or config.TWILIO_AUTH_TOKEN
    from_num = db.get_setting('TWILIO_WHATSAPP_NUMBER') or config.TWILIO_WHATSAPP_NUMBER

    if not Client or sid == 'your_sid_here' or not sid:
        logger.info(f"[MOCK WhatsApp] To: {to_number} | Msg: {message}")
        return True, "Mock WhatsApp sent"

    try:
        client = Client(sid, token)
        
        # Format WhatsApp number
        if not to_number.startswith('whatsapp:'):
            if not to_number.startswith('+'):
                to_number = '+232' + to_number.lstrip('0')
            to_number = f"whatsapp:{to_number}"
            
        msg = client.messages.create(
            body=message,
            from_=from_num,
            to=to_number
        )
        logger.info(f"WhatsApp sent: {msg.sid}")
        return True, msg.sid
    except Exception as e:
        logger.error(f"Failed to send WhatsApp: {e}")
        return False, str(e)

def send_notification(student, event_type, extra_data=None, method="both"):
    """
    Send SMS/WhatsApp notifications to a student based on event type.

    :param student: dict with keys 'name', 'phone', 'student_id', 'school_name'
    :param event_type: 'approval', 'payment', 'graduation', 'reminder'
    :param extra_data: dict for event-specific data
    :param method: 'sms', 'whatsapp', or 'both'
    """
    extra_data = extra_data or {}
    portal_url = extra_data.get("portal_url", "https://easi-student-system.onrender.com")
    
    templates = {
        "approval": f"""
🎉 Congratulations, {student['name']}!
Your registration at {student['school_name']} has been approved.
📚 Student ID: {student['student_id']}
🔑 Initial Password: {extra_data.get('initial_password', '******')}
Login at: {portal_url}
""",
        "payment": f"""
💰 Payment Received!
Hi {student['name']}, we’ve received your payment of Le {extra_data.get('amount', '0')} for {extra_data.get('course_name', '')}.
Thank you for staying up to date! ✅
""",
        "graduation": f"""
🎓 Congratulations, {student['name']}!
You have completed your {extra_data.get('course_name', '')} course at {student['school_name']} and are eligible for graduation.
Please check your portal for graduation steps and certificate details: {portal_url}
""",
        "reminder": f"""
⏳ Payment Reminder
Hi {student['name']}, you have an outstanding balance of Le {extra_data.get('balance', '0')} for {extra_data.get('course_name', '')}.
Please settle your payment to continue accessing your course materials.
"""
    }

    message_body = templates.get(event_type)
    if not message_body:
        logger.error(f"Unknown event_type: {event_type}")
        return False

    # Send via selected method(s)
    success = True
    if method in ("sms", "both"):
        res, msg = send_sms(student['phone'], message_body)
        if not res: success = False
        
    if method in ("whatsapp", "both"):
        res, msg = send_whatsapp(student['phone'], message_body)
        if not res: success = False
        
    # Send email if it's an approval and email is provided
    if event_type == "approval" and extra_data.get('email'):
        try:
            send_email(extra_data['email'], f"{student['school_name']} Registration Approved", message_body)
        except Exception as e:
            logger.error(f"Email failed: {e}")

    return success

# Legacy support functions (mapping to new generic function)
def notify_registration_approval(full_name, phone, student_id, password, email=None):
    student = {"name": full_name, "phone": phone, "student_id": student_id, "school_name": "EASI Academy"}
    return send_notification(student, "approval", {"initial_password": password, "email": email})

def notify_payment_received(full_name, phone, amount, course_name):
    student = {"name": full_name, "phone": phone, "student_id": "N/A", "school_name": "EASI Academy"}
    return send_notification(student, "payment", {"amount": amount, "course_name": course_name})

def notify_graduation_eligibility(full_name, phone, course_name):
    student = {"name": full_name, "phone": phone, "student_id": "N/A", "school_name": "EASI Academy"}
    return send_notification(student, "graduation", {"course_name": course_name})
