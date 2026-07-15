from flask import Blueprint, jsonify, request
from db.student_queries import get_all_students, get_student_by_id
from db.payment_queries import get_all_payments
from auth.permissions import is_super_admin, is_school_admin
import logging

api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')
logger = logging.getLogger(__name__)

# Helper to check API Key (Basic implementation for Feature 6)
def require_api_key(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-KEY')
        # In a real SaaS, you'd check this against a 'tenant_api_keys' table
        if not api_key or api_key != "remaster_secret_2026": 
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@api_v1.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "1.0.0"})

@api_v1.route('/students', methods=['GET'])
@require_api_key
def list_students():
    tenant_id = request.args.get('tenant_id', type=int)
    students = get_all_students(tenant_id=tenant_id)
    return jsonify(students)

@api_v1.route('/payments', methods=['GET'])
@require_api_key
def list_payments():
    tenant_id = request.args.get('tenant_id', type=int)
    payments = get_all_payments(tenant_id=tenant_id)
    return jsonify(payments)

@api_v1.route('/notify', methods=['POST'])
@require_api_key
def send_notification():
    """
    Feature 7: Communication System Endpoint
    Body: {"tenant_id": 1, "target": "students", "message": "School is closed tomorrow"}
    """
    data = request.json
    tenant_id = data.get('tenant_id')
    message = data.get('message')
    
    # Mock sending SMS/Email
    logger.info(f"MOCK NOTIFICATION: [Tenant {tenant_id}] Sending to {data.get('target')}: {message}")
    
    return jsonify({"status": "queued", "message": "Notification process started"})
