import os
import sys
import bcrypt
import config 
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
import cloudinary
import cloudinary.uploader
import cloudinary.api
from flask import Flask, render_template, session, redirect, url_for, request, flash, jsonify, send_file
from functools import wraps
import logging
logger = logging.getLogger(__name__)
import calendar
from datetime import datetime
from decimal import Decimal, InvalidOperation
from werkzeug.utils import secure_filename
from flask_login import LoginManager, login_user, logout_user, current_user, login_required

# Database imports
from db import student_queries
from db import course_queries
from db import payment_queries
from db import form_queries
from db import user_queries
from db import report_queries
from db import attendance_queries
from db import analytics_queries # NEW: Analytics import
from db import tenant_queries # NEW: Tenant import
from db import backup_queries # NEW: Backup import
from db import tailor_shop_queries # NEW: Tailor shop import
from db import salary_queries # NEW: Salary import
from db import petty_cash_queries # NEW: Petty cash import
from db.lecturer_queries import lecturer_manager # NEW: Lecturer manager
from utils.notifier import notify_payment_received # NEW: Import notifier
from db.database import get_db_manager
from db.init_db import initialize_database # Imported from db.init_db for initialization block
from sqlalchemy.exc import ProgrammingError

# ... (rest of imports)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your_super_secret_key')

@app.before_request
def check_maintenance_mode():
    from db.super_admin_queries import get_global_maintenance
    is_enabled, message = get_global_maintenance()
    
    # Bypass for static files, login page, and Developer
    if not is_enabled:
        return None
    
    allowed_paths = ['/login', '/protech-login', '/static', '/logout']
    if request.path in allowed_paths or request.path.startswith('/static/'):
        return None
        
    if session.get('is_developer'):
        return None
        
    return f"<h1>System Maintenance</h1><p>{message}</p><hr><small>ProTech Remastered</small>", 503

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'student_portal.student_login' # Redirect to student login page if not logged in
login_manager.login_message_category = 'info' # Flash message category

# User loader callback for Flask-Login
from db.models import Student # Import the Student model

@login_manager.user_loader
def load_user(user_id):
    with get_db_manager().get_session() as session:
        return session.query(Student).get(int(user_id))

from auth.student_portal import student_portal
from api_v1 import api_v1 # Import API Blueprint

app.register_blueprint(student_portal)
app.register_blueprint(api_v1) # Register API Blueprint

# Configure Cloudinary
cloudinary.config(
    cloud_name=config.CLOUDINARY_CLOUD_NAME,
    api_key=config.CLOUDINARY_API_KEY,
    api_secret=config.CLOUDINARY_API_SECRET,
    secure=True
)

# File upload configuration
UPLOAD_FOLDER = 'static/photos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.context_processor
def inject_tenant():
    """Provides current tenant info to all templates."""
    tenant_info = None
    if 'tenant_id' in session:
        tenant_info = tenant_queries.get_tenant_by_id(session['tenant_id'])
    return dict(current_tenant=tenant_info)

# Login decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# --- Helper functions for dashboard statistics ---
def get_total_students_web(tenant_id=None):
    try:
        query = "SELECT COUNT(*) as count FROM students"
        params = {}
        if tenant_id:
            query += " WHERE tenant_id = :tid"
            params["tid"] = tenant_id
        result = get_db_manager().fetch_one(query, params)
        return result['count'] if result else 0
    except Exception:
        return 0

def get_active_students_web(tenant_id=None):
    try:
        query = "SELECT COUNT(*) as count FROM student_courses sc JOIN students s ON sc.student_id = s.id WHERE sc.status = 'Active'"
        params = {}
        if tenant_id:
            query += " AND s.tenant_id = :tid"
            params["tid"] = tenant_id
        result = get_db_manager().fetch_one(query, params)
        return result['count'] if result else 0
    except Exception:
        return 0

def get_attendance_rate_web(tenant_id=None):
    try:
        present_query = "SELECT COUNT(*) as count FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.status = 'Present'"
        total_query = "SELECT COUNT(*) as count FROM attendance a JOIN students s ON a.student_id = s.id"
        params = {}
        if tenant_id:
            present_query += " AND s.tenant_id = :tid"
            total_query += " WHERE s.tenant_id = :tid"
            params["tid"] = tenant_id

        total_present_result = get_db_manager().fetch_one(present_query, params)
        total_records_result = get_db_manager().fetch_one(total_query, params)

        total_present = total_present_result['count'] if total_present_result else 0
        total_records = total_records_result['count'] if total_records_result else 0

        if total_records > 0:
            rate = (total_present / total_records) * 100
            return round(rate, 1)
        return 0
    except Exception as e:
        logger.error(f"Error calculating attendance rate: {e}")
        return 0

def get_pending_payments_count_web(tenant_id=None):
    try:
        query = "SELECT COUNT(*) as count FROM payments p JOIN students s ON p.student_id = s.id WHERE p.status = 'Pending'"
        params = {}
        if tenant_id:
            query += " AND s.tenant_id = :tid"
            params["tid"] = tenant_id
        result = get_db_manager().fetch_one(query, params)
        return result['count'] if result else 0
    except Exception:
        return 0

def get_total_courses_web(tenant_id=None):
    try:
        query = "SELECT COUNT(*) as count FROM courses"
        params = {}
        if tenant_id:
            query += " WHERE tenant_id = :tid"
            params["tid"] = tenant_id
        result = get_db_manager().fetch_one(query, params)
        return result['count'] if result else 0
    except Exception:
        return 0

def get_todays_attendance_count_web(tenant_id=None):
    try:
        today_date = datetime.now().strftime("%Y-%m-%d")
        query = "SELECT COUNT(*) as count FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.date = :today_date AND a.status = 'Present'"
        params = {"today_date": today_date}
        if tenant_id:
            query += " AND s.tenant_id = :tid"
            params["tid"] = tenant_id
        result = get_db_manager().fetch_one(query, params, )
        return result['count'] if result else 0
    except Exception:
        return 0

# -------------------------------------------------


@app.route('/')
def index():
    """Renders the Central School Hub."""
    tenants = tenant_queries.get_all_tenants()
    return render_template('index.html', tenants=tenants)

@app.route('/school/<string:subdomain>')
def school_portal(subdomain):
    """Entry point for a specific school. Sets session context and renders school-specific landing."""
    tenant = tenant_queries.get_tenant_by_subdomain(subdomain)
    if not tenant:
        flash("School not found in the network.", "danger")
        return redirect(url_for('index'))
    
    # Set the active context for this visitor
    session['tenant_id'] = tenant['id']
    session['tenant_name'] = tenant['name']
    
    # Fetch courses for this specific school
    courses = course_queries.get_all_courses(tenant_id=tenant['id'])
    
    # Check if they want the registration form immediately
    show_register = request.args.get('register') == 'true'
    
    return render_template('school_landing.html', tenant=tenant, courses=courses, show_register=show_register)

@app.route('/login', methods=['GET', 'POST'])
def login():
    tenants = tenant_queries.get_all_tenants()
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        tenant_id = request.form.get('tenant_id')
        
        if not tenant_id:
            flash('Please select your school.', 'warning')
            return render_template('login.html', tenants=tenants)

        app.logger.info(f"Login attempt for user: {username} at tenant: {tenant_id}")

        user_data = get_db_manager().fetch_one(
            "SELECT * FROM users WHERE username = :username AND tenant_id = :tid", 
            {"username": username, "tid": tenant_id}
        )

        if user_data:
            app.logger.info(f"User found: {username}. Role: {user_data['role']}. Approved: {user_data['is_approved']}")
            if bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
                if not user_data['is_approved']:
                    app.logger.warning(f"User {username} is not approved yet.")
                    flash('Your account is pending admin approval.', 'warning')
                    return render_template('login.html', tenants=tenants)
                
                session['user_id'] = user_data['id']
                session['username'] = user_data['username']
                session['role'] = user_data['role']
                session['tenant_id'] = user_data['tenant_id'] # NEW: Save tenant in session
                session['is_super_admin'] = user_data.get('is_super_admin', False) # NEW: Save super admin status
                
                from db.activity_queries import log_activity
                log_activity(user_data['id'], "Login", "User logged in via Web Portal", request.remote_addr)

                app.logger.info(f"User {username} logged in successfully to school {tenant_id}.")
                flash('Logged in successfully!', 'success')
                
                # Redirect lecturers to their dedicated portal
                lecturer = get_db_manager().fetch_one("SELECT id FROM lecturers WHERE user_id = :uid", {"uid": user_data['id']})
                if lecturer:
                    app.logger.info(f"User {username} recognized as lecturer. Redirecting to portal.")
                    return redirect(url_for('lecturer_dashboard'))
                    
                return redirect(url_for('dashboard')) # Redirect to a dashboard after login
            else:
                app.logger.warning(f"Password mismatch for user {username}")
                flash('Invalid username or password.', 'danger')
        else:
            app.logger.warning(f"User not found: {username} in school {tenant_id}")
            flash('Invalid username or password for the selected school.', 'danger')
            
    return render_template('login.html', tenants=tenants)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        role = request.form.get('role', 'staff') # Default to staff if not provided

        if not all([username, password, confirm_password]):
            flash('Please fill all fields.', 'danger')
            return render_template('register.html')

        if password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return render_template('register.html')

        if len(password) < 8:
            flash('Password must be at least 8 characters.', 'danger')
            return render_template('register.html')

        try:
            # Check if username already exists
            existing_user = get_db_manager().fetch_one("SELECT id FROM users WHERE username = :username", {"username": username})
            if existing_user:
                flash('Username already taken. Please choose a different one.', 'danger')
                return render_template('register.html')

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Use a standard INSERT for new staff registrations, not the 'admin' overwrite logic
            get_db_manager().execute(
                "INSERT INTO users (username, password, role, is_approved) VALUES (:username, :password, :role, FALSE)",
                {"username": username, "password": hashed_password, "role": role}
            )
            flash('Account created successfully! Awaiting admin approval.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            flash(f'Registration failed: {str(e)}', 'danger')
            # Log the exception for debugging in development
            app.logger.error("Registration error: %s", e)
            return render_template('register.html')
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    session.pop('role', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    """
    Renders the dashboard page with statistics. Restricted to Admins.
    """
    if session.get('role') not in ['admin', 'sub_admin']:
        # If they are staff, check if they are a lecturer and send them to their portal
        user_id = session.get('user_id')
        lecturer = get_db_manager().fetch_one("SELECT id FROM lecturers WHERE user_id = :uid", {"uid": user_id})
        if lecturer:
            return redirect(url_for('lecturer_dashboard'))

        flash('Unauthorized access. Main dashboard is restricted to administrators.', 'danger')
        return redirect(url_for('index'))

    tenant_id = session.get('tenant_id')
    total_students = get_total_students_web(tenant_id)
    active_students = get_active_students_web(tenant_id)
    attendance_rate = get_attendance_rate_web(tenant_id)
    pending_payments = get_pending_payments_count_web(tenant_id)
    total_courses = get_total_courses_web(tenant_id)
    todays_attendance = get_todays_attendance_count_web(tenant_id)

    stats = {
        'total_students': total_students,
        'active_students': active_students,
        'attendance_rate': attendance_rate,
        'pending_payments': pending_payments,
        'total_courses': total_courses,
        'todays_attendance': todays_attendance
    }

    return render_template('dashboard.html', stats=stats)

@app.route('/students')
@login_required
def student_list():
    """
    Renders the student list page.
    """
    tenant_id = session.get('tenant_id')
    search_query = request.args.get('search_query')
    if search_query:
        students = student_queries.search_students(search_query, tenant_id=tenant_id)
    else:
        students = student_queries.get_all_students(tenant_id=tenant_id)
    app.logger.debug(f"student_list route - Students fetched: {len(students)} students for tenant {tenant_id}.")
    return render_template('students.html', students=students)
@app.route('/students/add', methods=['GET', 'POST'])
@login_required
def add_student_web():
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    all_courses = course_queries.get_all_courses()
    all_lecturers = lecturer_manager.get_all_lecturers()

    if request.method == 'POST':
        student_id_from_form = request.form['student_id'].strip()
        app.logger.debug(f"DEBUG: Student ID from form: '{student_id_from_form}'")
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        gender = request.form['gender']
        date_of_birth = request.form['date_of_birth']
        email = request.form.get('email')
        phone = request.form.get('phone')
        address = request.form.get('address', '')
        status = request.form.get('status')
        lecturer_id = request.form.get('lecturer_id')
        password = request.form.get('password') # New: Get password from form

        photo_path = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and allowed_file(file.filename):
                # Always prioritize Cloudinary for persistence if credentials exist
                if config.CLOUDINARY_CLOUD_NAME and config.CLOUDINARY_API_KEY:
                    try:
                        app.logger.info(f"Uploading to Cloudinary: {file.filename}")
                        upload_result = cloudinary.uploader.upload(
                            file, 
                            folder="students",
                            public_id=f"{student_id_from_form}_{int(datetime.now().timestamp())}",
                            transformation=[
                                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                                {"quality": "auto", "fetch_format": "auto"}
                            ]
                        )
                        photo_path = upload_result.get('secure_url')
                        app.logger.info(f"Cloudinary URL: {photo_path}")
                    except Exception as e:
                        app.logger.error(f"Cloudinary upload failed: {e}")
                        # Fallback to local
                        filename = secure_filename(file.filename)
                        photo_filename = f"{student_id_from_form}_{filename}"
                        file_path = os.path.join(UPLOAD_FOLDER, photo_filename)
                        file.save(file_path)
                        photo_path = os.path.join('photos', photo_filename).replace('\\', '/')
                else:
                    # Default to local upload
                    filename = secure_filename(file.filename)
                    photo_filename = f"{student_id_from_form}_{filename}"
                    file_path = os.path.join(UPLOAD_FOLDER, photo_filename)
                    file.save(file_path)
                    photo_path = os.path.join('photos', photo_filename).replace('\\', '/')

        try:
            student_db_id = student_queries.add_student(
                student_id_from_form, # Use the ID from the form
                first_name, last_name, gender, date_of_birth, email, phone,
                photo_path, address, status, lecturer_id, password,
                performed_by=current_user.id,
                tenant_id=current_user.tenant_id,
                application_source='manual'
            )

            flash('Student added successfully!', 'success')
            
            # Now, handle course enrollments
            course_codes = request.form.getlist('courses')
            if student_db_id: # student_db_id is the internal DB 'id' (integer)
                # enroll_student_in_course now expects student.id (INT) and course.id (INT)
                for course_code in course_codes:
                    course = course_queries.get_course_by_code(course_code)
                    if course:
                        student_queries.enroll_student_in_course(student_db_id, course['id'])
                    else:
                        flash(f'Warning: Course "{course_code}" not found for enrollment.', 'warning')
            
            return redirect(url_for('student_list'))

        except student_queries.DuplicateStudentIdError as e:
            flash(f'{e}', 'danger')
            # Re-render the form with a NEW unique ID for the user to try again
            # And also pass back the other form data for convenience
            return render_template(
                'add_student.html',
                all_courses=all_courses,
                all_lecturers=all_lecturers,
                student_id=student_id_from_form, # Keep the old ID in the form as a reference
                first_name=first_name,
                last_name=last_name,
                gender=gender,
                date_of_birth=date_of_birth,
                email=email,
                phone=phone,
                address=address,
                status=status,
                lecturer_id=lecturer_id,
                selected_courses=request.form.getlist('courses')
            )
        except student_queries.DuplicateStudentEmailError as e:
            flash(f'{e}', 'danger')
            return render_template(
                'add_student.html',
                all_courses=all_courses,
                all_lecturers=all_lecturers,
                student_id=student_id_from_form,
                first_name=first_name,
                last_name=last_name,
                gender=gender,
                date_of_birth=date_of_birth,
                email=email,
                phone=phone,
                address=address,
                status=status,
                lecturer_id=lecturer_id,
                selected_courses=request.form.getlist('courses')
            )
        except Exception as e:
            flash(f'Failed to add student: {str(e)}', 'danger')
            app.logger.error(f"Error adding student: {e}")
            return render_template(
                'add_student.html',
                all_courses=all_courses,
                all_lecturers=all_lecturers,
                student_id=student_id_from_form,
                first_name=first_name,
                last_name=last_name,
                gender=gender,
                date_of_birth=date_of_birth,
                email=email,
                phone=phone,
                address=address,
                status=status,
                lecturer_id=lecturer_id,
                selected_courses=request.form.getlist('courses')
            )
            
    # GET request
    return render_template('add_student.html', all_courses=all_courses, all_lecturers=all_lecturers)

@app.route('/api/students/search', methods=['GET'])
@login_required
def api_search_students():
    search_query = request.args.get('query', '')
    students = student_queries.search_students(search_query)
    print(f"DEBUG: API Search: Returning {len(students)} students for query '{search_query}'. Data: {students}") # Add print here
    return jsonify(students)

@app.route('/students/edit/', methods=['GET'])
@login_required
def edit_student_web_no_id():
    flash('Student ID is missing. Please select a student to edit.', 'danger')
    return redirect(url_for('student_list'))

@app.route('/students/edit/<string:student_id>', methods=['GET', 'POST'])
@login_required
def edit_student_web(student_id):
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    student = student_queries.get_student_by_id(student_id)
    if not student:
        flash('Student not found.', 'danger')
        return redirect(url_for('student_list'))

    all_courses = course_queries.get_all_courses()
    all_lecturers = lecturer_manager.get_all_lecturers()
    # Fix: use student['id'] (INT) for enrollments lookup
    enrolled_courses = student_queries.get_student_enrollments(student['id']) 

    if request.method == 'POST':
        original_student_id = request.form['original_student_id'] # Hidden field for original ID
        new_student_id = request.form['student_id']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        gender = request.form['gender']
        date_of_birth = request.form['date_of_birth']
        email = request.form.get('email')
        phone = request.form.get('phone')
        address = request.form.get('address')
        status = request.form.get('status')
        lecturer_id = request.form.get('lecturer_id')
        password = request.form.get('password') # New: Get password from form
        if lecturer_id == '': # Convert empty string to None for database
            lecturer_id = None
        
        photo_path = student['photo_path'] # Start with existing photo path

        if 'photo' in request.files:
            file = request.files['photo']
            if file and allowed_file(file.filename):
                # Always prioritize Cloudinary for persistence if credentials exist
                if config.CLOUDINARY_CLOUD_NAME and config.CLOUDINARY_API_KEY:
                    try:
                        app.logger.info(f"Updating photo on Cloudinary: {file.filename}")
                        upload_result = cloudinary.uploader.upload(
                            file, 
                            folder="students",
                            public_id=f"{new_student_id}_{int(datetime.now().timestamp())}",
                            transformation=[
                                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                                {"quality": "auto", "fetch_format": "auto"}
                            ]
                        )
                        photo_path = upload_result.get('secure_url')
                        app.logger.info(f"New Cloudinary URL: {photo_path}")
                    except Exception as e:
                        app.logger.error(f"Cloudinary upload failed: {e}")
                        # Fallback to local if Cloudinary fails
                        filename = secure_filename(file.filename)
                        photo_filename = f"{new_student_id}_{filename}"
                        file_path = os.path.join(UPLOAD_FOLDER, photo_filename)
                        file.save(file_path)
                        photo_path = os.path.join('photos', photo_filename).replace('\\', '/')
                else:
                    # Default to local upload
                    filename = secure_filename(file.filename)
                    photo_filename = f"{new_student_id}_{filename}"
                    file_path = os.path.join(UPLOAD_FOLDER, photo_filename)
                    file.save(file_path)
                    photo_path = os.path.join('photos', photo_filename).replace('\\', '/')

        if student_queries.update_student(original_student_id, new_student_id, first_name, last_name, gender, date_of_birth, email, phone, photo_path, address, status, lecturer_id, password):
            flash('Student updated successfully!', 'success')
            
            # Update course enrollments - new_course_ids for student_queries
            new_course_codes_from_form = request.form.getlist('courses')
            new_course_ids = []
            for course_code in new_course_codes_from_form:
                course = course_queries.get_course_by_code(course_code)
                if course:
                    new_course_ids.append(course['id'])
                else:
                    flash(f'Warning: Course "{course_code}" not found for enrollment update.', 'warning')
            
            student_queries.update_student_enrollments(student['id'], new_course_ids) # Use student['id'] (INT)
            
            return redirect(url_for('student_list'))
        else:
            flash('Failed to update student.', 'danger')
            return render_template('edit_student.html', student=request.form, all_courses=all_courses, all_lecturers=all_lecturers, enrolled_courses=enrolled_courses, address=address)
    
    # Ensure address is present for GET requests
    if student and 'address' not in student:
        student['address'] = '' # Default empty if not set

    return render_template('edit_student.html', student=student, all_courses=all_courses, all_lecturers=all_lecturers, enrolled_courses=enrolled_courses)

@app.route('/students/delete/<string:student_id>', methods=['POST']) # Keep route name for compatibility
@login_required
def delete_student_web(student_id):
    if student_queries.deactivate_student(student_id): # Call deactivate_student
        flash('Student deactivated successfully!', 'success') # Change message
    else:
        flash('Failed to deactivate student.', 'danger') # Change message
    return redirect(url_for('student_list'))

@app.route('/students/delete-permanently/<student_id>', methods=['POST'])
@login_required
def delete_student_permanently_web(student_id):
    try:
        if student_queries.delete_student(student_id):
            flash('Student permanently deleted successfully!', 'success')
        else:
            flash('Failed to permanently delete student. Student not found or database error.', 'danger')
    except Exception as e:
        flash(f'An error occurred during permanent deletion: {str(e)}', 'danger')
        app.logger.error(f"Error permanently deleting student {student_id}: {e}")
    return redirect(url_for("student_list"))

@app.route('/students/view/<string:student_id>')
@login_required
def view_student_details_web(student_id):
    from db.lecturer_queries import lecturer_manager # NEW: Local import to resolve NameError
    student = student_queries.get_student_by_id(student_id)
    if not student:
        flash('Student not found.', 'danger')
        return redirect(url_for('student_list'))

    # Get lecturer details if assigned
    lecturer = None
    if student.get('lecturer_id'):
        lecturer = lecturer_manager.get_lecturer_by_lecturer_id(student['lecturer_id'])
    
    # Get all enrolled courses
    enrolled_courses = course_queries.get_courses_by_student_id(student['id']) # Use student['id'] (INT)

    # Get tailoring payments
    tailoring_payments = tailor_shop_queries.get_tailor_payments_by_student_id(student['id'])

    # Get regular course payments
    course_payments = payment_queries.get_payments_by_student_id(student['id'])

    # Get grades
    grades = student_queries.get_student_grades(student['id'])

    # Get attendance history
    attendance_history = attendance_queries.get_db_manager().fetch_all(
        """
        SELECT a.date, a.status, c.course_name, c.course_code
        FROM attendance a
        JOIN courses c ON a.course_id = c.id
        WHERE a.student_id = :student_pk_id
        ORDER BY a.date DESC
        """,
        {"student_pk_id": student['id']}
    )

    return render_template('student_detail.html',
                           student=student,
                           lecturer=lecturer,
                           enrolled_courses=enrolled_courses,
                           tailoring_payments=tailoring_payments,
                           course_payments=course_payments,
                           grades=grades,
                           attendance_history=attendance_history)

# --- New Registration Routes ---

@app.route('/registration-success')
def registration_success():
    app_code = request.args.get('app_code')
    return render_template('registration_success.html', app_code=app_code)

@app.route('/register-student', methods=['POST'])
def handle_registration():
    tenant_id = request.form.get('tenant_id', 1, type=int) # Capture tenant_id from hidden field
    full_name = request.form.get('full_name')
    age = request.form.get('age')
    gender = request.form.get('gender')
    address = request.form.get('address')
    phone = request.form.get('phone')
    email = request.form.get('email')
    guardian_name = request.form.get('guardian_name')
    guardian_phone = request.form.get('guardian_phone')
    course = request.form.get('course')
    referral_source = request.form.get('referral_source')
    payment_reference = request.form.get('payment_reference')

    # New Fields
    payment_method = request.form.get('payment_method')
    sender_name = request.form.get('sender_name')
    sender_phone = request.form.get('sender_phone')

    photo_url = None
    if 'photo' in request.files:
        file = request.files['photo']
        if file and allowed_file(file.filename):
            try:
                upload_result = cloudinary.uploader.upload(
                    file,
                    folder="registrations",
                    transformation=[
                        {"width": 500, "height": 500, "crop": "fill"},
                        {"quality": "auto", "fetch_format": "auto"}
                    ]
                )
                photo_url = upload_result.get('secure_url')
            except Exception as e:
                app.logger.error(f"Cloudinary upload failed for registration: {e}")

    result = student_queries.add_registration(
        full_name, age, gender, address, phone, email,
        guardian_name, guardian_phone, course, referral_source,
        photo_url, payment_reference, 
        payment_method=payment_method,
        sender_name=sender_name,
        sender_phone=sender_phone,
        tenant_id=tenant_id # Pass tenant_id here
    )

    if result and 'app_code' in result:
        return redirect(url_for('registration_success', app_code=result['app_code']))
    else:
        flash('Registration failed. Please try again or contact support.', 'danger')
        return redirect(url_for('index'))
@app.route('/admin/registrations')
@login_required
def admin_registrations():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    # NEW: Super Admin sees all, school admin sees only theirs
    tenant_id = None if session.get('is_super_admin') else session.get('tenant_id')
    registrations = student_queries.get_all_registrations(tenant_id=tenant_id)
    return render_template('admin_registrations.html', registrations=registrations)

@app.route('/admin/approve-registration/<int:reg_id>', methods=['POST'])
@login_required
def approve_registration_web(reg_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    success, message, welcome_text = student_queries.approve_registration(reg_id, performed_by=session.get('user_id'))
    if success:
        flash(message, 'success')
        if welcome_text:
            flash(welcome_text, 'registration_approved')
    else:
        flash(message, 'danger')
    
    return redirect(url_for('admin_registrations'))

@app.route('/admin/delete-registration/<int:reg_id>', methods=['POST'])
@login_required
def delete_registration_web(reg_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    success, message = student_queries.delete_registration(reg_id, performed_by=session.get('user_id'))
    if success:
        flash(message, 'success')
    else:
        flash(message, 'danger')

    return redirect(url_for('admin_registrations'))

@app.route('/students/view/<string:student_id>/id-card')
@login_required
def generate_id_card_web(student_id):
    student = student_queries.get_student_by_id(student_id)
    if not student:
        flash('Student not found.', 'danger')
        return redirect(url_for('student_list'))

    # Get all enrolled courses
    enrolled_courses = course_queries.get_courses_by_student_id(student['id'])
    primary_course = enrolled_courses[0] if enrolled_courses else {'course_name': 'No Course Enrolled'}

    # Generate QR Code
    qr_web_path = generate_student_qr(student['student_id'])

    return render_template('student_id_card.html', 
                           student=student, 
                           primary_course=primary_course,
                           qr_code_path=qr_web_path)

@app.route('/courses')
@login_required
def course_list():
    """
    Renders the course list page.
    """
    tenant_id = session.get('tenant_id')
    search_query = request.args.get('search_query')
    if search_query:
        courses = course_queries.search_courses(search_query, tenant_id=tenant_id)
    else:
        courses = course_queries.get_all_courses(tenant_id=tenant_id)
    return render_template('courses.html', courses=courses)

@app.route('/courses/add', methods=['GET', 'POST'])
@login_required
def add_course_web():
    if request.method == 'POST':
        course_name = request.form['course_name']
        course_code = request.form['course_code']
        description = request.form.get('description')
        duration = request.form.get('duration')
        credits = request.form.get('credits', 0, type=int)
        fee = request.form.get('fee', 0.0, type=float)
        schedule = request.form.get('schedule')
        tenant_id = session.get('tenant_id')

        if course_queries.add_course(course_name, course_code, description, duration, credits, fee, schedule, tenant_id=tenant_id):
            flash('Course added successfully!', 'success')
            return redirect(url_for('course_list'))
        else:
            flash('Failed to add course. Course code might already exist.', 'danger')
            return render_template('add_course.html', **request.form)
    return render_template('add_course.html')

@app.route('/courses/edit/<int:course_id>', methods=['GET', 'POST'])
@login_required
def edit_course_web(course_id):
    course = get_course_by_id(course_id)
    if not course:
        flash('Course not found.', 'danger')
        return redirect(url_for('course_list'))

    if request.method == 'POST':
        course_name = request.form['course_name']
        course_code = request.form['course_code']
        description = request.form.get('description')
        duration = request.form.get('duration')
        credits = request.form.get('credits', 0, type=int)
        fee = request.form.get('fee', 0.0, type=float)
        schedule = request.form.get('schedule')

        if update_course(course_id, course_name, course_code, description, duration, credits, fee, schedule):
            flash('Course updated successfully!', 'success')
            return redirect(url_for('course_list'))
        else:
            flash('Failed to update course.', 'danger')
            return render_template('edit_course.html', course=request.form)
    
    return render_template('edit_course.html', course=course)

@app.route('/courses/delete/<int:course_id>', methods=['POST'])
@login_required
def delete_course_web(course_id):
    if delete_course(course_id):
        flash('Course deleted successfully!', 'success')
    else:
        flash('Failed to delete course.', 'danger')
    return redirect(url_for('course_list'))

@app.route('/courses/view/<int:course_id>')
@login_required
def view_course_details_web(course_id):
    course = get_course_by_id(course_id)
    if not course:
        flash('Course not found.', 'danger')
        return redirect(url_for('course_list'))
    return render_template('course_detail.html', course=course)

@app.route('/payments')
@login_required
def payment_list():
    """
    Renders the payment list page. Restricted to full Admin.
    """
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Financial records are restricted to administrators.', 'danger')
        return redirect(url_for('index'))
    search_query = request.args.get('search_query')
    if search_query:
        payments = payment_queries.search_payments(search_query)
    else:
        payments = payment_queries.get_all_payments()
    return render_template('payments.html', payments=payments)

@app.route('/payments/add', methods=['GET', 'POST'])
@login_required
def add_payment_web():
    all_students = student_queries.get_all_students()
    all_courses = course_queries.get_all_courses() # Use course_queries.get_all_courses()

    if request.method == 'POST':
        student_id_identifier = request.form['student_id_identifier']
        course_code_from_form = request.form.get('course_code', '').strip().upper()
        
        if not course_code_from_form:
            flash("No course selected!", "danger")
            return render_template('add_payment.html', all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, amount=request.form.get('amount', ''),
                                   payment_date=request.form.get('payment_date', ''), status=request.form.get('status', ''),
                                   payment_method=request.form.get('payment_method', ''), receipt_number=request.form.get('receipt_number', ''))

        amount_str = request.form.get('amount')
        payment_date = request.form.get('payment_date')
        status = request.form.get('status')
        payment_method = request.form.get('payment_method')
        receipt_number = request.form.get('receipt_number')

        # Server-side validation for required fields
        if not all([student_id_identifier, course_code_from_form, amount_str, payment_date, status]):
            flash("All required fields must be filled: Student, Course, Amount, Payment Date, Status.", "danger")
            return render_template('add_payment.html', all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form,
                                   amount=amount_str, payment_date=payment_date, status=status,
                                   payment_method=payment_method, receipt_number=receipt_number)
        
        try:
            amount = Decimal(amount_str)
        except InvalidOperation:
            flash("Invalid amount format. Please enter a valid number.", "danger")
            return render_template('add_payment.html', all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form,
                                   amount=amount_str, payment_date=payment_date, status=status,
                                   payment_method=payment_method, receipt_number=receipt_number)

        student_db_id = payment_queries.get_student_db_id_by_identifier(student_id_identifier) # Get internal student ID
        app.logger.debug(f"Attempting to find student with identifier '{student_id_identifier}'. Found internal DB ID: {student_db_id}")

        if student_db_id is None:
            flash(f'Student with ID "{student_id_identifier}" not found.', 'danger')
            return render_template('add_payment.html', all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form, amount=amount_str,
                                   payment_date=payment_date, status=status, payment_method=payment_method, receipt_number=receipt_number)
        
        # Explicitly verify that the student_db_id actually exists in the students table
        verified_student = student_queries.get_student_by_pk_id(student_db_id)
        app.logger.debug(f"Verification check for student_db_id {student_db_id}: {verified_student is not None}")
        
        if verified_student is None:
            flash(f'Student with internal ID "{student_db_id}" found by identifier but not by primary key. Data inconsistency detected. Please check database.', 'danger')
            return render_template('add_payment.html', all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form, amount=amount_str,
                                   payment_date=payment_date, status=status, payment_method=payment_method, receipt_number=receipt_number)
        
        course = course_queries.get_course_by_code(course_code_from_form) # Get course object to get its ID
        if not course:
            flash(f'Course with code "{course_code_from_form}" not found.', 'danger')
            return render_template('add_payment.html', all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form, amount=amount,
                                   payment_date=payment_date, status=status, payment_method=payment_method, receipt_number=receipt_number)

        course_db_id = course['id'] # Extract internal course ID

        try:
            if payment_queries.add_payment(student_db_id, course_db_id, amount, payment_date, status, payment_method, receipt_number):
                flash('Payment added successfully!', 'success')
                
                # NEW: Notify Student
                try:
                    if status == 'Paid':
                        notify_payment_received(
                            full_name=f"{verified_student['first_name']} {verified_student['last_name']}",
                            phone=verified_student['phone'],
                            amount=float(amount),
                            course_name=course['course_name']
                        )
                except Exception as notify_err:
                    app.logger.warning(f"Payment notification failed: {notify_err}")

                return redirect(url_for('payment_list'))
            else:
                # This 'else' block might be hit if add_payment returns False for a non-exception reason.
                flash('Failed to add payment. The add_payment function returned False.', 'danger')
        except Exception as e:
            app.logger.error(f"Add payment failed with exception: {e}") # Log the specific error
            flash(f'Failed to add payment due to a database error: {e}', 'danger')
            
        # If we reach here, it means the payment failed, so re-render the form with existing data
        return render_template('add_payment.html', all_students=all_students, all_courses=all_courses,
                               student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form, amount=amount_str,
                               payment_date=payment_date, status=status, payment_method=payment_method, receipt_number=receipt_number)
    return render_template('add_payment.html', all_students=all_students, all_courses=all_courses)

@app.route('/payments/edit/<int:payment_id>', methods=['GET', 'POST'])
@login_required
def edit_payment_web(payment_id):
    payment = payment_queries.get_payment_by_id(payment_id)
    if not payment:
        flash('Payment not found.', 'danger')
        return redirect(url_for('payment_list'))

    all_students = student_queries.get_all_students()
    all_courses = course_queries.get_all_courses()

    if request.method == 'POST':
        student_id_identifier = request.form['student_id_identifier']
        course_code_from_form = request.form.get('course_code', '').strip().upper()
        if not course_code_from_form:
            flash("No course selected!", "danger")
            # Pass back all form data and dynamic options
            return render_template('edit_payment.html', payment=request.form, all_students=all_students, all_courses=all_courses, payment_method=request.form.get('payment_method'), receipt_number=request.form.get('receipt_number'))

        amount_str = request.form.get('amount')
        payment_date = request.form.get('payment_date')
        status = request.form.get('status')
        payment_method = request.form.get('payment_method')
        receipt_number = request.form.get('receipt_number')

        # Server-side validation for required fields
        if not all([student_id_identifier, course_code_from_form, amount_str, payment_date, status]):
            flash("All required fields must be filled: Student, Course, Amount, Payment Date, Status.", "danger")
            return render_template('edit_payment.html', payment=request.form, all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form,
                                   amount=amount_str, payment_date=payment_date, status=status,
                                   payment_method=payment_method, receipt_number=receipt_number)
        
        try:
            amount = Decimal(amount_str)
        except InvalidOperation:
            flash("Invalid amount format. Please enter a valid number.", "danger")
            return render_template('edit_payment.html', payment=request.form, all_students=all_students, all_courses=all_courses,
                                   student_id_identifier=student_id_identifier, course_code_from_form=course_code_from_form,
                                   amount=amount_str, payment_date=payment_date, status=status,
                                   payment_method=payment_method, receipt_number=receipt_number)

        student_db_id = payment_queries.get_student_db_id_by_identifier(student_id_identifier) # Get internal student ID
        app.logger.debug(f"Attempting to find student with identifier '{student_id_identifier}'. Found internal DB ID: {student_db_id}")

        if student_db_id is None:
            flash(f'Student with ID "{student_id_identifier}" not found.', 'danger')
            # Pass back all form data and dynamic options
            return render_template('edit_payment.html', payment=request.form, all_students=all_students, all_courses=all_courses, payment_method=payment_method, receipt_number=receipt_number)
        
        # Explicitly verify that the found student_db_id actually exists in the students table
        verified_student = student_queries.get_student_by_pk_id(student_db_id)
        app.logger.debug(f"Verification check for student_db_id {student_db_id}: {verified_student is not None}")

        if verified_student is None:
            flash(f'Student with internal ID "{student_db_id}" found by identifier but not by primary key. Data inconsistency detected. Please check database.', 'danger')
            return render_template('edit_payment.html', payment=request.form, all_students=all_students, all_courses=all_courses, payment_method=payment_method, receipt_number=receipt_number)
        
        course = course_queries.get_course_by_code(course_code_from_form) # Get course object to get its ID
        if not course:
            flash(f'Course with code "{course_code_from_form}" not found.', 'danger')
            # Pass back all form data and dynamic options
            return render_template('edit_payment.html', payment=request.form, all_students=all_students, all_courses=all_courses, payment_method=payment_method, receipt_number=receipt_number)

        course_db_id = course['id'] # Extract internal course ID

        try:
            if payment_queries.update_payment(payment_id, student_db_id, course_db_id, amount, payment_date, status, payment_method, receipt_number):
                flash('Payment updated successfully!', 'success')
                return redirect(url_for('payment_list'))
            else:
                flash('Failed to update payment. The update_payment function returned False.', 'danger')
        except Exception as e:
            app.logger.error(f"Update payment failed with exception: {e}") # Log the specific error
            flash(f'Failed to update payment due to a database error: {e}', 'danger')

        # If we reach here, it means the update failed, so re-render the form with existing data
        return render_template('edit_payment.html', payment=request.form, all_students=all_students, all_courses=all_courses, payment_method=payment_method, receipt_number=receipt_number)
    
    # Format date for HTML input type="date" and ensure payment_method/receipt_number is present for GET requests
    if payment and payment['payment_date']:
        payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')
    if payment and 'payment_method' not in payment: # Ensure payment_method is always available in context
        payment['payment_method'] = '' # Default empty if not set
    if payment and 'receipt_number' not in payment: # Ensure receipt_number is always available in context
        payment['receipt_number'] = '' # Default empty if not set

    return render_template('edit_payment.html', payment=payment, all_students=all_students, all_courses=all_courses)

@app.route('/payments/delete/<int:payment_id>', methods=['POST'])
@login_required
def delete_payment_web(payment_id):
    if payment_queries.delete_payment(payment_id):
        flash('Payment deleted successfully!', 'success')
    else:
        flash('Failed to delete payment.', 'danger')
    return redirect(url_for('payment_list'))

@app.route('/payments/view/<int:payment_id>')
@login_required
def view_payment_details_web(payment_id):
    payment = payment_queries.get_payment_by_id(payment_id)
    if not payment:
        flash('Payment not found.', 'danger')
        return redirect(url_for('payment_list'))
    return render_template('payment_detail.html', payment=payment)

@app.route('/form-payments')
@login_required
def form_payment_list():
    """
    Renders the form payment list page. Restricted to Admins.
    """
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Access is restricted to administrators.', 'danger')
        return redirect(url_for('index'))
    search_query = request.args.get('search_query')
    if search_query:
        form_payments = form_queries.search_form_payments(search_query)
    else:
        form_payments = form_queries.get_all_form_payments()
    return render_template('form_payments.html', form_payments=form_payments)

@app.route('/form-payments/add', methods=['GET', 'POST'])
@login_required
def add_form_payment_web():
    all_students = student_queries.get_all_students()

    if request.method == 'POST':
        student_id_identifier = request.form['student_id_identifier']
        form_type = request.form['form_type']
        amount = request.form['amount']
        payment_date = request.form['payment_date']
        status = request.form['status']
        receipt_number = request.form.get('receipt_number')
        payment_method = request.form.get('payment_method')

        student_db_id = payment_queries.get_student_db_id_by_identifier(student_id_identifier) # Use new helper

        if not student_db_id:
            flash(f'Student with ID "{student_id_identifier}" not found.', 'danger')
            return render_template('add_form_payment.html', all_students=all_students,
                                   student_id_identifier=student_id_identifier, form_type=form_type, amount=amount,
                                   payment_date=payment_date, status=status, receipt_number=receipt_number, payment_method=payment_method)

        if form_queries.add_form_payment(student_db_id, form_type, amount, payment_date, receipt_number, status, payment_method):
            flash('Form Payment added successfully!', 'success')
            return redirect(url_for('form_payment_list'))
        else:
            flash('Failed to add form payment.', 'danger')
            return render_template('add_form_payment.html', all_students=all_students,
                                   student_id_identifier=student_id_identifier, form_type=form_type, amount=amount,
                                   payment_date=payment_date, status=status, receipt_number=receipt_number, payment_method=payment_method)
    return render_template('add_form_payment.html', all_students=all_students, now_strftime=datetime.now().strftime('%Y%m%d%H%M%S'))

@app.route('/form-payments/edit/<int:form_payment_id>', methods=['GET', 'POST'])
@login_required
def edit_form_payment_web(form_payment_id):
    form_payment = form_queries.get_form_payment_by_id(form_payment_id)
    if not form_payment:
        flash('Form Payment not found.', 'danger')
        return redirect(url_for('form_payment_list'))

    all_students = student_queries.get_all_students()

    if request.method == 'POST':
        student_id_identifier = request.form['student_id_identifier']
        form_type = request.form['form_type']
        amount = request.form['amount']
        payment_date = request.form['payment_date']
        status = request.form['status']
        receipt_number = request.form.get('receipt_number')
        payment_method = request.form.get('payment_method')

        student_db_id = payment_queries.get_student_db_id_by_identifier(student_id_identifier) # Use new helper
        
        if not student_db_id:
            flash(f'Student with ID "{student_id_identifier}" not found.', 'danger')
            return render_template('edit_form_payment.html', form_payment=request.form, all_students=all_students)

        if form_queries.update_form_payment(form_payment_id, student_db_id, form_type, amount, payment_date, receipt_number, status, payment_method):
            flash('Form Payment updated successfully!', 'success')
            return redirect(url_for('form_payment_list'))
        else:
            flash('Failed to update form payment.', 'danger')
            return render_template('edit_form_payment.html', form_payment=request.form, all_students=all_students)
    
    # Format date for HTML input type="date" and ensure payment_method/receipt_number is present for GET requests
    if form_payment and form_payment['payment_date']:
        form_payment['payment_date'] = form_payment['payment_date'].strftime('%Y-%m-%d')

    return render_template('edit_form_payment.html', form_payment=form_payment, all_students=all_students)

@app.route('/form-payments/delete/<int:form_payment_id>', methods=['POST'])
@login_required
def delete_form_payment_web(form_payment_id):
    if form_queries.delete_form_payment(form_payment_id):
        flash('Form Payment deleted successfully!', 'success')
    else:
        flash('Failed to delete form payment.', 'danger')
    return redirect(url_for('form_payment_list'))

@app.route('/form-payments/view/<int:form_payment_id>')
@login_required
def view_form_payment_details_web(form_payment_id):
    form_payment = form_queries.get_form_payment_by_id(form_payment_id)
    if not form_payment:
        flash('Form Payment not found.', 'danger')
        return redirect(url_for('form_payment_list'))
    return render_template('form_payment_detail.html', form_payment=form_payment)

@app.route('/lecturers')
@login_required
def lecturer_list():
    """
    Renders the lecturer list page.
    """
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    search_query = request.args.get('search_query')
    if search_query:
        lecturers = lecturer_manager.search_lecturers(search_query)
    else:
        lecturers = lecturer_manager.get_all_lecturers()
    return render_template('lecturers.html', lecturers=lecturers)

@app.route('/lecturers/add', methods=['GET', 'POST'])
@login_required
def add_lecturer_web():
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    if request.method == 'POST':
        # Retrieve fields using .get() to prevent KeyError
        lecturer_id_from_form = request.form.get('lecturer_id')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        department = request.form.get('department')
        username = request.form.get('username')
        password = request.form.get('password')

        # Add validation for required fields
        if not first_name or not last_name or not username or not password:
            flash("First Name, Last Name, Username, and Password are required.", "danger")
            return render_template('add_lecturer.html', **request.form)

        # 1. Create the user account first
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        try:
            user_id = get_db_manager().insert_and_return_id(
                "INSERT INTO users (username, password, role, is_approved) VALUES (:u, :p, 'staff', TRUE) RETURNING id",
                {"u": username, "p": hashed_password}
            )

            # 2. Add lecturer linked to this user
            newly_created_lecturer_id = lecturer_manager.create_lecturer(
                first_name=first_name, 
                last_name=last_name, 
                email=email, 
                phone=phone, 
                department=department,
                user_id=user_id
            )

            if newly_created_lecturer_id:
                flash(f'Lecturer {first_name} {last_name} and login portal created successfully!', 'success')
                return redirect(url_for('lecturer_list'))
            else:
                flash('Failed to create lecturer profile.', 'danger')
        except Exception as e:
            app.logger.error(f"Error creating lecturer: {e}")
            flash('Error creating lecturer. Username might already be taken.', 'danger')

    return render_template('add_lecturer.html')
@app.route('/lecturers/edit/<int:lecturer_pk_id>', methods=['GET', 'POST'])
@login_required
def edit_lecturer_web(lecturer_pk_id):
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    lecturer = lecturer_manager.get_lecturer_by_pk_id(lecturer_pk_id) # Using pk_id
    if not lecturer:
        flash('Lecturer not found.', 'danger')
        return redirect(url_for('lecturer_list'))

    # Fetch associated user for this lecturer
    lecturer_user = None
    if lecturer.get('user_id'):
        lecturer_user = get_db_manager().fetch_one("SELECT * FROM users WHERE id = :uid", {"uid": lecturer['user_id']})

    if request.method == 'POST':
        # Get the lecturer_id (string) from the form, not generated again
        lecturer_id_str = request.form['lecturer_id'] 
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form.get('email')
        phone = request.form.get('phone')
        department = request.form.get('department')
        username = request.form.get('username')
        password = request.form.get('password')

        if lecturer_manager.update_lecturer(lecturer_pk_id, lecturer_id_str, first_name, last_name, email, phone, department):
            
            # Update user account if linked
            if lecturer['user_id']:
                update_params = {"u": username, "uid": lecturer['user_id']}
                set_clauses = ["username = :u"]
                
                if password and password.strip():
                    set_clauses.append("password = :p")
                    update_params["p"] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                get_db_manager().execute(
                    f"UPDATE users SET {', '.join(set_clauses)} WHERE id = :uid",
                    update_params
                )

            flash('Lecturer updated successfully!', 'success')
            return redirect(url_for('lecturer_list'))
        else:
            flash('Failed to update lecturer.', 'danger')
            return render_template('edit_lecturer.html', lecturer=request.form, lecturer_user=lecturer_user)
    
    return render_template('edit_lecturer.html', lecturer=lecturer, lecturer_user=lecturer_user)

@app.route('/lecturers/delete/<int:lecturer_pk_id>', methods=['POST'])
@login_required
def delete_lecturer_web(lecturer_pk_id):
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    if lecturer_manager.delete_lecturer(lecturer_pk_id):
        flash('Lecturer deleted successfully!', 'success')
    else:
        flash('Failed to delete lecturer.', 'danger')
    return redirect(url_for('lecturer_list'))

@app.route('/lecturers/view/<int:lecturer_pk_id>')
@login_required
def view_lecturer_details_web(lecturer_pk_id):
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    lecturer = lecturer_manager.get_lecturer_by_pk_id(lecturer_pk_id)
    if not lecturer:
        flash('Lecturer not found.', 'danger')
        return redirect(url_for('lecturer_list'))
    return render_template('lecturer_detail.html', lecturer=lecturer)

@app.route('/salaries')
@login_required
def salary_list():
    """
    Renders the salary list page. Restricted to Admins.
    """
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Access is restricted to administrators.', 'danger')
        return redirect(url_for('index'))
    salaries = salary_queries.get_all_salaries()
    return render_template('salaries.html', salaries=salaries)

@app.route('/salaries/add', methods=['GET', 'POST'])
@login_required
def add_salary_web():
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    all_lecturers = lecturer_manager.get_all_lecturers() # Get all lecturers for the dropdown

    if request.method == 'POST':
        lecturer_pk_id_str = request.form.get('lecturer_pk_id')
        
        # Basic validation
        if not lecturer_pk_id_str:
            flash("Lecturer selection is required.", "danger")
            return render_template('add_salary.html', all_lecturers=all_lecturers,
                                   lecturer_pk_id=lecturer_pk_id_str, amount=request.form.get('amount'), payment_date=request.form.get('payment_date'),
                                   status=request.form.get('status'), notes=request.form.get('notes'), receipt_number=request.form.get('receipt_number'))

        try:
            lecturer_pk_id = int(lecturer_pk_id_str)
        except ValueError:
            flash("Invalid Lecturer ID format.", "danger")
            return render_template('add_salary.html', all_lecturers=all_lecturers,
                                   lecturer_pk_id=lecturer_pk_id_str, amount=request.form.get('amount'), payment_date=request.form.get('payment_date'),
                                   status=status, notes=request.form.get('notes'), receipt_number=request.form.get('receipt_number'))


        amount = request.form['amount']
        payment_date = request.form['payment_date']
        status = request.form.get('status')
        notes = request.form.get('notes')
        receipt_number = request.form.get('receipt_number')

        if salary_queries.add_salary_record(lecturer_pk_id, amount, payment_date, status, notes, receipt_number):
            flash('Salary record added successfully!', 'success')
            return redirect(url_for('salary_list'))
        else:
            flash('Failed to add salary record.', 'danger')
            return render_template('add_salary.html', all_lecturers=all_lecturers,
                                   lecturer_pk_id=lecturer_pk_id_str, amount=amount, payment_date=payment_date,
                                   status=status, notes=notes, receipt_number=receipt_number)
    return render_template('add_salary.html', all_lecturers=all_lecturers)

@app.route('/salaries/edit/<int:salary_id>', methods=['GET', 'POST'])
@login_required
def edit_salary_web(salary_id):
    from db.lecturer_queries import lecturer_manager # NEW: Local import
    salary = salary_queries.get_salary_record_by_id(salary_id)
    if not salary:
        flash('Salary record not found.', 'danger')
        return redirect(url_for('salary_list'))

    all_lecturers = lecturer_manager.get_all_lecturers() # Get all lecturers for the dropdown

    if request.method == 'POST':
        lecturer_pk_id_str = request.form.get('lecturer_pk_id')

        # Basic validation
        if not lecturer_pk_id_str:
            flash("Lecturer selection is required.", "danger")
            # Create a dictionary for passing back form data
            form_data = request.form.to_dict()
            form_data['lecturer_pk_id'] = lecturer_pk_id_str # Ensure the string value is passed back
            return render_template('edit_salary.html', salary=form_data, all_lecturers=all_lecturers)

        try:
            lecturer_pk_id = int(lecturer_pk_id_str)
        except ValueError:
            flash("Invalid Lecturer ID format.", "danger")
            form_data = request.form.to_dict()
            form_data['lecturer_pk_id'] = lecturer_pk_id_str # Ensure the string value is passed back
            return render_template('edit_salary.html', salary=form_data, all_lecturers=all_lecturers)


        amount = request.form['amount']
        payment_date = request.form['payment_date']
        status = request.form['status']
        notes = request.form.get('notes')
        receipt_number = request.form.get('receipt_number')

        if salary_queries.update_salary_record(salary_id, lecturer_pk_id, amount, payment_date, status, notes, receipt_number):
            flash('Salary record updated successfully!', 'success')
            return redirect(url_for('salary_list'))
        else:
            flash('Failed to update salary record.', 'danger')
            # Create a dictionary for passing back form data
            form_data = request.form.to_dict()
            form_data['lecturer_pk_id'] = lecturer_pk_id_str # Ensure the string value is passed back
            return render_template('edit_salary.html', salary=form_data, all_lecturers=all_lecturers)
    
    # Format date for HTML input type="date"
    if salary and salary['payment_date']:
        salary['payment_date'] = salary['payment_date'].strftime('%Y-%m-%d')

    return render_template('edit_salary.html', salary=salary, all_lecturers=all_lecturers)


@app.route('/salaries/delete/<int:salary_id>', methods=['POST'])
@login_required
def delete_salary_web(salary_id):
    if salary_queries.delete_salary_record(salary_id):
        flash('Salary record deleted successfully!', 'success')
    else:
        flash('Failed to delete salary record.', 'danger')
    return redirect(url_for('salary_list'))

@app.route('/salaries/view/<int:salary_id>')
@login_required
def view_salary_details_web(salary_id):
    salary = salary_queries.get_salary_record_by_id(salary_id)
    if not salary:
        flash('Salary record not found.', 'danger')
        return redirect(url_for('salary_list'))
    return render_template('salary_detail.html', salary=salary)

@app.route('/petty-cash')
@login_required
def petty_cash_list():
    """
    Renders the petty cash list page. Restricted to full Admin.
    """
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Petty Cash records are restricted to administrators.', 'danger')
        return redirect(url_for('index'))
    search_query = request.args.get('search_query')
    if search_query:
        # Assuming a search function for petty cash will be added
        # For now, just return all if no specific search function exists yet
        petty_cash_transactions = petty_cash_queries.get_all_petty_cash_transactions() 
        flash('Search for petty cash not fully implemented yet, showing all transactions.', 'info')
    else:
        petty_cash_transactions = petty_cash_queries.get_all_petty_cash_transactions()
    return render_template('petty_cash.html', petty_cash_transactions=petty_cash_transactions)

@app.route('/petty-cash/add', methods=['GET', 'POST'])
@login_required
def add_petty_cash_web():
    if request.method == 'POST':
        transaction_date = request.form.get('transaction_date')
        description = request.form.get('description')
        amount_str = request.form.get('amount')
        transaction_type = request.form.get('transaction_type')
        authorized_by = request.form.get('authorized_by')

        # Basic validation for presence of required fields
        if not all([transaction_date, description, amount_str, transaction_type, authorized_by]):
            flash("All fields (Transaction Date, Description, Amount, Type, Authorized By) are required.", "danger")
            return render_template('add_petty_cash.html', 
                                   transaction_date=transaction_date, 
                                   description=description, 
                                   amount=amount_str, 
                                   transaction_type=transaction_type, 
                                   authorized_by=authorized_by)

        try:
            amount = Decimal(amount_str)
        except InvalidOperation:
            flash("Invalid amount format. Please enter a valid number.", "danger")
            return render_template('add_petty_cash.html', 
                                   transaction_date=transaction_date, 
                                   description=description, 
                                   amount=amount_str, 
                                   transaction_type=transaction_type, 
                                   authorized_by=authorized_by)

        if petty_cash_queries.add_petty_cash_transaction(transaction_date, description, amount, transaction_type, authorized_by):
            flash('Petty Cash transaction added successfully!', 'success')
            return redirect(url_for('petty_cash_list'))
        else:
            flash('Failed to add petty cash transaction. Check server logs for details.', 'danger')
            return render_template('add_petty_cash.html', 
                                   transaction_date=transaction_date, 
                                   description=description, 
                                   amount=amount_str, 
                                   transaction_type=transaction_type, 
                                   authorized_by=authorized_by)
    return render_template('add_petty_cash.html')

@app.route('/petty-cash/edit/<int:transaction_id>', methods=['GET', 'POST'])
@login_required
def edit_petty_cash_web(transaction_id):
    transaction = petty_cash_queries.get_petty_cash_transaction_by_id(transaction_id)
    if not transaction:
        flash('Petty Cash transaction not found.', 'danger')
        return redirect(url_for('petty_cash_list'))

    if request.method == 'POST':
        transaction_date = request.form['transaction_date']
        description = request.form['description']
        amount = Decimal(request.form['amount'])
        transaction_type = request.form['transaction_type']
        authorized_by = request.form['authorized_by']

        if update_petty_cash_transaction(transaction_id, transaction_date, description, amount, transaction_type, authorized_by):
            flash('Petty Cash transaction updated successfully!', 'success')
            return redirect(url_for('petty_cash_list'))
        else:
            flash('Failed to update petty cash transaction.', 'danger')
            return render_template('edit_petty_cash.html', transaction=request.form)
    
    if transaction and transaction['transaction_date']:
        transaction['transaction_date'] = transaction['transaction_date'].strftime('%Y-%m-%d')

    return render_template('edit_petty_cash.html', transaction=transaction)

@app.route('/petty-cash/delete/<int:transaction_id>', methods=['POST'])
@login_required
def delete_petty_cash_web(transaction_id):
    if delete_petty_cash_transaction(transaction_id):
        flash('Petty Cash transaction deleted successfully!', 'success')
    else:
        flash('Failed to delete petty cash transaction.', 'danger')
    return redirect(url_for('petty_cash_list'))

    return redirect(url_for('petty_cash_list'))

@app.route('/petty-cash/view/<int:transaction_id>')
@login_required
def view_petty_cash_details_web(transaction_id):
    transaction = petty_cash_queries.get_petty_cash_transaction_by_id(transaction_id)
    if not transaction:
        flash('Petty Cash transaction not found.', 'danger')
        return redirect(url_for('petty_cash_list'))
    return render_template('petty_cash_detail.html', transaction=transaction)

    return render_template('petty_cash_detail.html', transaction=transaction)

@app.route('/attendance')
@login_required
def attendance():
    tenant_id = session.get('tenant_id')
    search_query = request.args.get('search_query')
    if search_query:
        attendance_records = attendance_queries.search_attendance_records(search_query, tenant_id=tenant_id)
    else:
        attendance_records = attendance_queries.get_all_attendance_records(tenant_id=tenant_id)
    return render_template('attendance.html', attendance_records=attendance_records)

@app.route('/attendance/mark', methods=['GET'])
@login_required
def mark_attendance_web():
    tenant_id = session.get('tenant_id')
    all_courses = course_queries.get_all_courses(tenant_id=tenant_id)
    today = datetime.now().strftime('%Y-%m-%d')
    return render_template('mark_attendance.html', all_courses=all_courses, today=today)

@app.route('/api/attendance/students-for-course/<string:course_code>', methods=['GET'])
@login_required
def api_students_for_course(course_code):
    students = student_queries.get_students_by_course_id(course_code)
    # Ensure any Decimal or datetime objects are converted to string for JSON serialization
    for student in students:
        if 'date_of_birth' in student and isinstance(student['date_of_birth'], datetime):
            student['date_of_birth'] = student['date_of_birth'].strftime('%Y-%m-%d')
    return jsonify(students)

@app.route('/api/attendance/for-date-course', methods=['GET'])
@login_required
def api_attendance_for_date_course():
    attendance_date = request.args.get('date')
    course_id_str = request.args.get('course_id') # Retrieve as string first
    
    if not attendance_date or not course_id_str:
        return jsonify([]) # Return empty list, not 400

    try:
        course_id = int(course_id_str) # Convert to int
        records = attendance_queries.get_attendance_for_date_and_course(attendance_date, course_id)
        # Ensure any Decimal or datetime objects are converted to string for JSON serialization
        # (This is already handled by fetch_all returning dicts, but explicit conversion for dates is good)
        for record in records:
            if 'date' in record and isinstance(record['date'], datetime):
                record['date'] = record['date'].strftime('%Y-%m-%d')
        return jsonify(records or []) # Ensure an empty list is returned if records is None/empty
    except ValueError:
        app.logger.error(f"Invalid course_id format: {course_id_str}")
        return jsonify([])
    except Exception as e:
        app.logger.error(f"Attendance fetch error: {e}")
        return jsonify([]) # NEVER break the frontend with non-array response

@app.route('/attendance/save-mark', methods=['POST'])
@login_required
def save_attendance_mark_web():
    selected_course_id_str = request.form.get('course_id') # Changed to course_id
    selected_date = request.form.get('attendance_date')
    
    if not selected_course_id_str or not selected_date:
        flash('Course and date are required for attendance marking.', 'danger')
        return redirect(url_for('mark_attendance_web'))

    try:
        selected_course_id = int(selected_course_id_str)
    except ValueError:
        flash('Invalid course ID format.', 'danger')
        return redirect(url_for('mark_attendance_web'))

    # Iterate through all form items to find student attendance
    students_to_mark = {}
    arrival_times = {}
    for key, value in request.form.items():
        if key.startswith('student_status_'):
            student_id_str = key.replace('student_status_', '') # This is the internal PK id
            try:
                student_id = int(student_id_str)
                students_to_mark[student_id] = value
                
                # Check for arrival time if it was "Late"
                arrival_time = request.form.get(f'arrival_time_{student_id}')
                if arrival_time:
                    arrival_times[student_id] = arrival_time
            except ValueError:
                app.logger.warning(f"Skipping invalid student_id format: {student_id_str}")
    
    if not students_to_mark:
        flash('No students selected for attendance marking or invalid student IDs.', 'warning')
        return redirect(url_for('mark_attendance_web'))

    try:
        for student_id, status in students_to_mark.items():
            atime = arrival_times.get(student_id) if status == "Late" else None
            attendance_queries.save_attendance_record(
                student_id=student_id, # Use student_id INT
                course_id=selected_course_id, # Use course_id INT
                date=selected_date,
                status=status,
                arrival_time=atime, # Pass the arrival time
                marked_by=session.get('username', 'Admin') # Log who marked it
            )
        flash('Attendance records saved successfully!', 'success')
    except Exception as e:
        flash(f'Failed to save attendance records: {e}', 'danger')
        app.logger.error(f"Error saving attendance: {e}")
    
    return redirect(url_for('attendance')) # Redirect to the attendance list view

@app.route('/attendance/delete/<int:record_id>', methods=['POST'])
@login_required
def delete_attendance_web(record_id):
    try:
        attendance_queries.delete_attendance_record(record_id)
        flash('Attendance record deleted successfully!', 'success')
    except Exception as e:
        flash(f'Failed to delete attendance record: {e}', 'danger')
    return redirect(url_for('attendance'))

@app.route('/attendance/view/<int:record_id>', methods=['GET'])
@login_required
def view_attendance_details_web(record_id):
    record = attendance_queries.get_attendance_record_by_id(record_id)
    if not record:
        flash('Attendance record not found.', 'danger')
        return redirect(url_for('attendance'))
    
    # Ensure date is string for template
    if 'date' in record and isinstance(record['date'], datetime):
            record['date'] = record['date'].strftime('%Y-%m-%d')

    return render_template('attendance_detail.html', record=record)

@app.route('/reports')
@login_required
def reports():
    # Prepare data for the reports.html template
    today = datetime.now().strftime('%Y-%m-%d')
    current_year = datetime.now().year
    current_month = datetime.now().month
    month_names = [calendar.month_name[i] for i in range(1, 13)]
    
    return render_template('reports.html', 
                           today=today, 
                           current_year=current_year, 
                           current_month=current_month, 
                           month_names=month_names)

@app.route('/reports/student-enrollment')
@login_required
def report_student_enrollment():
    data = report_queries.get_student_enrollment_report()
    return render_template('report_display.html', report_title="Student Enrollment Report", report_data=data)

@app.route('/reports/payment-summary')
@login_required
def report_payment_summary():
    data = report_queries.get_payment_summary_report()
    return render_template('report_display.html', report_title="Payment Summary Report", report_data=data)

@app.route('/reports/attendance-overview')
@login_required
def report_attendance_overview():
    data = report_queries.get_attendance_overview_report()
    return render_template('report_display.html', report_title="Attendance Overview Report", report_data=data)

@app.route('/reports/course-popularity')
@login_required
def report_course_popularity():
    data = report_queries.get_course_popularity_report()
    return render_template('report_display.html', report_title="Course Popularity Report", report_data=data)

@app.route('/reports/daily-payments', methods=['GET'])
@login_required
def report_daily_payments():
    report_date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    data = report_queries.get_daily_payments(report_date)
    return render_template('report_display.html', report_title=f"Daily Payments Report ({report_date})", report_data=data)

@app.route('/reports/monthly-payments', methods=['GET'])
@login_required
def report_monthly_payments():
    year = request.args.get('year', datetime.now().year, type=int)
    month = request.args.get('month', datetime.now().month, type=int)
    # Using Python's calendar to get month name (for display)
    import calendar
    month_name = calendar.month_name[month]
    data = report_queries.get_monthly_payments(year, month)
    return render_template('report_display.html', report_title=f"Monthly Payments Report ({month_name} {year})", report_data=data)

@app.route('/reports/yearly-payments', methods=['GET'])
@login_required
def report_yearly_payments():
    year = request.args.get('year', datetime.now().year, type=int)
    data = report_queries.get_yearly_payments(year)
    return render_template('report_display.html', report_title=f"Yearly Payments Report ({year})", report_data=data)





@app.route('/graduation')
@login_required
def graduation():
    FORM_TYPE = "Graduation Fee"
    graduation_payments = form_queries.get_all_form_payments(form_type=FORM_TYPE)
    all_students = student_queries.get_all_students()
    print(f"DEBUG: Graduation route - all_students: {all_students}") # Added debug print
    return render_template('graduation.html', graduation_payments=graduation_payments, all_students=all_students, today=datetime.now().strftime('%Y-%m-%d'))

@app.route('/graduation/add', methods=['POST'])
@login_required
def add_graduation_payment_web():
    FORM_TYPE = "Graduation Fee"
    
    # Debug: show what keys were sent
    print("DEBUG POST keys:", request.form.keys())

    # Safely get form data
    student_id_identifier = request.form.get("student_id_identifier")
    amount = request.form.get("amount")
    payment_method = request.form.get("payment_method")
    
    # Optional fields, provide defaults or get from form if present
    payment_date_str = request.form.get('payment_date', datetime.now().strftime('%Y-%m-%d'))
    status = request.form.get('status', 'Paid')
    receipt_number = request.form.get('receipt_number')

    # Validate required fields
    if not student_id_identifier:
        flash("Please select a student.", "error")
        return redirect(url_for("graduation"))

    if not amount or not payment_method:
        flash("Please fill in all required fields (Amount and Payment Method).", "error")
        return redirect(url_for("graduation"))

    # Ensure student exists
    student_db_id = payment_queries.get_student_db_id_by_identifier(student_id_identifier)
    if not student_db_id:
        flash(f'Student with ID "{student_id_identifier}" not found.', "error")
        return redirect(url_for("graduation"))

    # Convert amount to Decimal safely
    try:
        amount_decimal = Decimal(amount)
    except InvalidOperation: # Use specific exception for Decimal conversion
        flash("Invalid amount format. Please enter a valid number.", "error")
        return redirect(url_for("graduation"))
    except Exception:
        flash("Invalid amount.", "error")
        return redirect(url_for("graduation"))

    # Auto-generate receipt number if not provided
    if not receipt_number:
        receipt_number = f"GRAD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{student_id_identifier}"

    # Add payment (calls your DB function that validates FK)
    try:
        # Calling form_queries.add_form_payment for Graduation Fee
        form_queries.add_form_payment(
            student_id=student_db_id,
            form_type=FORM_TYPE,
            amount=amount_decimal,
            payment_date=payment_date_str, # Use the potentially retrieved date or default
            receipt_number=receipt_number,
            status=status,
            payment_method=payment_method
        )
        flash("Graduation payment added successfully.", "success")
    except Exception as e:
        app.logger.error(f"Failed to add graduation payment: {e}")
        flash(f"Failed to add payment: {str(e)}", "error")

    return redirect(url_for("graduation"))

@app.route('/graduation/edit/<int:payment_id>', methods=['POST'])
@login_required
def edit_graduation_payment_web(payment_id):
    FORM_TYPE = "Graduation Fee"
    student_id_identifier = request.form['student_id_identifier']
    amount = request.form['amount']
    payment_date = request.form['payment_date']
    payment_method = request.form.get('payment_method')
    status = request.form['status']

    student_db_id = payment_queries.get_student_db_id_by_identifier(student_id_identifier) # Use new helper
    if not student_db_id:
        flash(f'Student with ID "{student_id_identifier}" not found.', 'danger')
        return redirect(url_for('graduation'))

    receipt_number = request.form.get('receipt_number')
    if not receipt_number:
        existing_payment = form_queries.get_form_payment_by_id(payment_id)
        receipt_number = existing_payment['receipt_number'] if existing_payment else None

    try:
        form_queries.update_form_payment(
            payment_id=payment_id,
            student_id=student_db_id, # Use new helper
            form_type=FORM_TYPE,
            amount=Decimal(amount),
            payment_date=payment_date,
            receipt_number=receipt_number,
            status=status,
            payment_method=payment_method
        )
        flash('Graduation Payment updated successfully!', 'success')
    except Exception as e:
        flash(f'Failed to update Graduation Payment: {e}', 'danger')
    return redirect(url_for('graduation'))

@app.route('/graduation/delete/<int:payment_id>', methods=['POST'])
@login_required
def delete_graduation_payment_web(payment_id):
    try:
        form_queries.delete_form_payment(payment_id)
        flash('Graduation Payment deleted successfully!', 'success')
    except Exception as e:
        flash(f'Failed to delete Graduation Payment: {e}', 'danger')
    return redirect(url_for('graduation'))

# --- Tailor Shop Routes ---
@app.route('/tailor-shop')
@login_required
def tailor_shop_list():
    """
    Renders the tailor shop payment list page.
    """
    payments = tailor_shop_queries.get_all_tailor_payments()
    all_students = student_queries.get_all_students()
    total_revenue = tailor_shop_queries.get_total_tailor_payments()
    
    now = datetime.now()
    return render_template('tailor_shop.html', 
                           payments=payments, 
                           all_students=all_students, 
                           total_revenue=total_revenue,
                           today=now.strftime('%Y-%m-%d'),
                           today_month=now.strftime('%B'),
                           today_year=now.year)

@app.route('/tailor-shop/add', methods=['POST'])
@login_required
def add_tailor_payment_web():
    student_db_id = request.form.get('student_id')
    month = request.form.get('month')
    year = request.form.get('year')
    item_type = f"{month} {year}"
    measurement = "Monthly Fee"
    amount = request.form.get('amount')
    payment_date = request.form.get('payment_date')
    status = request.form.get('status')
    receipt_number = request.form.get('receipt_number')

    if not all([student_db_id, month, year, amount, payment_date, status]):
        flash('Please fill all required fields.', 'danger')
        return redirect(url_for('tailor_shop_list'))

    try:
        amount_decimal = Decimal(amount)
        if not receipt_number:
            receipt_number = f"TF-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        tailor_shop_queries.add_tailor_payment(
            student_id=int(student_db_id),
            item_type=item_type,
            measurement=measurement,
            amount=amount_decimal,
            payment_date=payment_date,
            status=status,
            receipt_number=receipt_number
        )
        flash('Tailoring fee payment added successfully!', 'success')
    except Exception as e:
        app.logger.error(f"Error adding tailor payment: {e}")
        flash(f'Failed to add tailoring fee payment: {str(e)}', 'danger')
    
    return redirect(url_for('tailor_shop_list'))

@app.route('/tailor-shop/edit/<int:payment_id>', methods=['POST'])
@login_required
def edit_tailor_payment_web(payment_id):
    student_db_id = request.form.get('student_id')
    month = request.form.get('month')
    year = request.form.get('year')
    item_type = f"{month} {year}"
    measurement = "Monthly Fee"
    amount = request.form.get('amount')
    payment_date = request.form.get('payment_date')
    status = request.form.get('status')
    receipt_number = request.form.get('receipt_number')

    try:
        tailor_shop_queries.update_tailor_payment(
            payment_id=payment_id,
            student_id=int(student_db_id),
            item_type=item_type,
            measurement=measurement,
            amount=Decimal(amount),
            payment_date=payment_date,
            receipt_number=receipt_number,
            status=status
        )
        flash('Tailoring fee record updated successfully!', 'success')
    except Exception as e:
        app.logger.error(f"Error updating tailor payment: {e}")
        flash(f'Failed to update tailoring fee record: {str(e)}', 'danger')
    
    return redirect(url_for('tailor_shop_list'))

@app.route('/tailor-shop/<int:payment_id>/generate-receipt')
@login_required
def generate_tailoring_receipt_web(payment_id):
    from utils import pdf_generator # NEW: Local import
    payment = tailor_shop_queries.get_tailor_payment_by_id(payment_id)
    if not payment:
        flash('Payment record not found.', 'danger')
        return redirect(url_for('tailor_shop_list'))

    student = {
        'student_id': payment['student_unique_id'],
        'first_name': payment['first_name'],
        'last_name': payment['last_name']
    }
    
    # Convert date for PDF generator
    if isinstance(payment['payment_date'], datetime):
        payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')

    logo_path = os.path.join(app.root_path, 'assets', 'LOGO.jpeg')
    output_dir = os.path.join(app.root_path, 'temp_receipts')
    
    pdf_path = pdf_generator.generate_tailoring_receipt_pdf(
        payment, student, payment['item_type'], 
        output_path=output_dir, logo_path=logo_path
    )

    if pdf_path:
        return send_file(pdf_path, as_attachment=True, mimetype='application/pdf')
    else:
        flash('Failed to generate PDF receipt.', 'danger')
        return redirect(url_for('tailor_shop_list'))

@app.route('/tailor-shop/delete/<int:payment_id>', methods=['POST'])
@login_required
def delete_tailor_payment_web(payment_id):
    try:
        tailor_shop_queries.delete_tailor_payment(payment_id)
        flash('Tailor shop payment deleted successfully!', 'success')
    except Exception as e:
        flash(f'Failed to delete tailor shop payment: {e}', 'danger')
    return redirect(url_for('tailor_shop_list'))

@app.route('/tailor-shop/view/<int:payment_id>')
@login_required
def tailor_shop_detail_web(payment_id):
    payment = tailor_shop_queries.get_tailor_payment_by_id(payment_id)
    if not payment:
        flash('Order not found.', 'danger')
        return redirect(url_for('tailor_shop_list'))
    
    if payment['payment_date']:
        payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')
    if 'created_at' in payment and payment['created_at']:
        payment['created_at'] = payment['created_at'].strftime('%Y-%m-%d %H:%M:%S')

    return render_template('tailor_shop_detail.html', payment=payment)

@app.route('/api/tailor-shop/<int:payment_id>')
@login_required
def api_get_tailor_payment(payment_id):
    payment = tailor_shop_queries.get_tailor_payment_by_id(payment_id)
    if payment:
        # Format for JSON
        if payment['payment_date']:
            payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')
        # Decimal to float for JSON
        payment['amount'] = float(payment['amount'])
        # created_at if exists
        if 'created_at' in payment and payment['created_at']:
            payment['created_at'] = payment['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        return jsonify(payment)
    return jsonify({"error": "Payment not found"}), 404

@app.route('/admin/approvals')
@login_required
def admin_approvals():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
        
    # Super Admin sees all pending users, school admin sees only theirs
    tenant_id = None if session.get('is_super_admin') else session.get('tenant_id')
    pending_users = user_queries.get_pending_users(tenant_id=tenant_id)
    return render_template('admin_approvals.html', pending_users=pending_users)

@app.route('/admin/approve-user/<int:user_id>', methods=['POST'])
@login_required
def approve_user_web(user_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    try:
        user_queries.approve_user(user_id)
        flash(f'User approved successfully!', 'success')
    except Exception as e:
        flash(f'Failed to approve user: {e}', 'danger')
    return redirect(url_for('admin_approvals'))

@app.route('/admin/disapprove-user/<int:user_id>', methods=['POST'])
@login_required
def disapprove_user_web(user_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    try:
        user_queries.disapprove_user(user_id)
        flash(f'User disapproved successfully!', 'success')
    except Exception as e:
        flash(f'Failed to disapprove user: {e}', 'danger')
    return redirect(url_for('admin_approvals'))

@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
@login_required
def delete_user_web(user_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        return jsonify({"success": False, "message": "Unauthorized"}), 403
        
    try:
        user_queries.delete_user(user_id)
        flash(f'User deleted successfully!', 'success')
    except Exception as e:
        flash(f'Failed to delete user: {e}', 'danger')
    return redirect(url_for('admin_approvals'))

# --- PDF Generation Routes ---
@app.route('/payments/<int:payment_id>/generate-receipt')
@login_required
def generate_payment_receipt_web(payment_id):
    from utils import pdf_generator # NEW: Local import
    payment = payment_queries.get_payment_by_id(payment_id)
    if not payment:
        flash('Payment not found.', 'danger')
        return redirect(url_for('payment_list'))

    # Use get_student_by_pk_id with the internal student.id (INT) from the payments table
    student = student_queries.get_student_by_pk_id(payment['student_id'])
    # Use get_course_by_id with the internal course.id (INT) from the payments table
    course = course_queries.get_course_by_id(payment['course_id'])

    if not student or not course:
        flash('Associated student or course not found for this payment.', 'danger')
        return redirect(url_for('payment_list'))
    
    # Convert date to string for PDF generator if it's a datetime object
    if isinstance(payment['payment_date'], datetime):
        payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')

    logger.debug(f"DEBUG: payment_record data for PDF: {payment}")
    logger.debug(f"DEBUG: student_info data for PDF: {student}")
    logger.debug(f"DEBUG: course_name for PDF: {course['course_name']}")

    logo_path_check = os.path.join(app.root_path, 'assets', 'LOGO.jpeg')
    if not os.path.exists(logo_path_check):
        logger.warning(f"WARNING: Logo file not found at {logo_path_check}. Logo will not appear on PDF receipt.")

    output_dir = os.path.join(app.root_path, 'temp_receipts') # Temporary directory for receipts
    pdf_path = pdf_generator.generate_payment_receipt_pdf(payment, student, course['course_name'], output_path=output_dir, logo_path=logo_path_check)

    if pdf_path:
        filename = os.path.basename(pdf_path)
        return send_file(pdf_path, as_attachment=True, download_name=filename, mimetype='application/pdf')
    else:
        flash('Failed to generate PDF receipt.', 'danger')
        return redirect(url_for('payment_list'))

@app.route('/form-payments/<int:form_payment_id>/generate-receipt')
@login_required
def generate_form_receipt_web(form_payment_id):
    from utils import pdf_generator # NEW: Local import
    form_payment = form_queries.get_form_payment_by_id(form_payment_id)
    if not form_payment:
        flash('Form Payment not found.', 'danger')
        return redirect(url_for('form_payment_list')) # Redirect to generic form payments list

    student = student_queries.get_student_by_id(form_payment['student_identifier']) # Assuming student_identifier is the student_id string
    
    if not student:
        flash('Associated student not found for this form payment.', 'danger')
        return redirect(url_for('form_payment_list'))

    # Convert date to string for PDF generator if it's a datetime object
    if isinstance(form_payment['payment_date'], datetime):
        form_payment['payment_date'] = form_payment['payment_date'].strftime('%Y-%m-%d')

    logo_path_check = os.path.join(app.root_path, 'assets', 'LOGO.jpeg')
    if not os.path.exists(logo_path_check):
        logger.warning(f"WARNING: Logo file not found at {logo_path_check}. Logo will not appear on PDF receipt.")

    output_dir = os.path.join(app.root_path, 'temp_receipts') # Temporary directory for receipts
    pdf_path = pdf_generator.generate_form_receipt_pdf(form_payment, student, output_path=output_dir, logo_path=logo_path_check)

    if pdf_path:
        filename = os.path.basename(pdf_path)
        return send_file(pdf_path, as_attachment=True, download_name=filename, mimetype='application/pdf')
    else:
        flash('Failed to generate PDF receipt.', 'danger')
        return redirect(url_for('form_payment_list')) # Redirect to generic form payments list

# --- Dashboard Chart API Endpoints ---
@app.route('/api/dashboard/student-status-data', methods=['GET'])
@login_required
def api_student_status_data():
    data = report_queries.get_student_status_distribution()
    labels = [row['status'] for row in data]
    counts = [row['count'] for row in data]
    return jsonify({'labels': labels, 'data': counts})

@app.route('/api/dashboard/monthly-payments-data', methods=['GET'])
@login_required
def api_monthly_payments_data():
    year = request.args.get('year', datetime.now().year, type=int)
    data = report_queries.get_monthly_payment_trends(year)
    
    # Chart.js expects labels for all 12 months, even if data is 0
    month_names = [calendar.month_abbr[i] for i in range(1, 13)] # Jan, Feb, etc.
    amounts = [0.0] * 12 # Initialize all to 0

    for item in data:
        month_index = int(item['month']) - 1 # Adjust to 0-based index
        amounts[month_index] = item['total_amount']
    
    return jsonify({'labels': month_names, 'data': amounts, 'year': year})

@app.route('/api/dashboard/course-enrollment-data', methods=['GET'])
@login_required
def api_course_enrollment_data():
    data = report_queries.get_course_enrollment_distribution()
    labels = [row['course_name'] for row in data]
    counts = [row['enrolled_students'] for row in data]
    return jsonify({'labels': labels, 'data': counts})

# NEW: API Endpoints for Lecturers
@app.route('/api/lecturers', methods=['GET'])
@login_required
def api_get_lecturers():
    try:
        from db.lecturer_queries import lecturer_manager # NEW: Local import
        lecturers = lecturer_manager.get_all_lecturers()
        return jsonify(lecturers)
    except Exception as e:
        app.logger.error(f"Error in api_get_lecturers: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lecturers', methods=['POST'])
@login_required
def api_create_lecturer():
    try:
        from db.lecturer_queries import lecturer_manager # NEW: Local import
        data = request.get_json()
        if not data or not all(key in data for key in ['first_name', 'last_name', 'email', 'phone', 'department']):
            return jsonify({"error": "Missing lecturer data"}), 400
        
        lecturer_id = lecturer_manager.create_lecturer(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data['phone'],
            department=data['department']
        )
        if lecturer_id:
            return jsonify({"message": "Lecturer created successfully", "lecturer_id": lecturer_id}), 201
        else:
            return jsonify({"error": "Failed to create lecturer"}), 500
    except Exception as e:
        app.logger.error(f"Error in api_create_lecturer: {e}")
        return jsonify({"error": str(e)}), 500

# --- Announcement Management (Admin) ---
@app.route('/announcements')
@login_required
def announcement_list():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Admin access required.', 'danger')
        return redirect(url_for('dashboard'))
    announcements = get_db_manager().fetch_all("SELECT * FROM announcements ORDER BY created_at DESC")
    return render_template('announcements.html', announcements=announcements)

@app.route('/announcements/add', methods=['GET', 'POST'])
@login_required
def add_announcement():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Admin access required.', 'danger')
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        category = request.form.get('category', 'General')
        target = request.form['target_audience']
        get_db_manager().execute(
            "INSERT INTO announcements (title, content, category, target_audience) VALUES (:title, :content, :category, :target)",
            {"title": title, "content": content, "category": category, "target": target}
        )
        flash('Announcement added successfully!', 'success')
        return redirect(url_for('announcement_list'))
    return render_template('add_announcement.html')

@app.route('/announcements/delete/<int:ann_id>', methods=['POST'])
@login_required
def delete_announcement(ann_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Admin access required.', 'danger')
        return redirect(url_for('dashboard'))
    get_db_manager().execute("DELETE FROM announcements WHERE id = :id", {"id": ann_id})
    flash('Announcement deleted.', 'success')
    return redirect(url_for('announcement_list'))

# --- Grade Management (Admin) ---
@app.route('/grades')
@login_required
def grade_list():
    if session.get('role') not in ['admin', 'sub_admin', 'staff']:
        flash('Unauthorized. Staff access required.', 'danger')
        return redirect(url_for('dashboard'))
    
    query = """
    SELECT g.id, g.grade, g.term, s.first_name, s.last_name, s.student_id as student_unique_id, c.course_name
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN courses c ON g.course_id = c.id
    ORDER BY g.date_created DESC
    """
    grades = get_db_manager().fetch_all(query)
    return render_template('grades.html', grades=grades)

@app.route('/grades/add', methods=['GET', 'POST'])
@login_required
def add_grade():
    if session.get('role') not in ['admin', 'sub_admin', 'staff']:
        flash('Unauthorized. Staff access required.', 'danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        student_id = request.form['student_id'] # This is the internal DB id (INT)
        course_id = request.form['course_id']
        grade = request.form['grade']
        term = request.form['term']
        
        try:
            get_db_manager().execute(
                "INSERT INTO grades (student_id, course_id, grade, term) VALUES (:student_id, :course_id, :grade, :term)",
                {"student_id": int(student_id), "course_id": int(course_id), "grade": grade, "term": term}
            )
            flash('Grade posted successfully!', 'success')
            return redirect(url_for('grade_list'))
        except Exception as e:
            app.logger.error(f"Error adding grade: {e}")
            flash('Failed to post grade. Possible duplicate for same student, course and term.', 'danger')
            
    students = student_queries.get_all_students()
    courses = course_queries.get_all_courses()
    return render_template('add_grade.html', students=students, courses=courses)

@app.route('/grades/delete/<int:grade_id>', methods=['POST'])
@login_required
def delete_grade(grade_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized. Admin access required.', 'danger')
        return redirect(url_for('dashboard'))
    
    get_db_manager().execute("DELETE FROM grades WHERE id = :id", {"id": grade_id})
    flash('Grade record deleted.', 'success')
    return redirect(url_for('grade_list'))

# --- Course Materials Management (Admin) ---
@app.route('/admin/materials')
@login_required
def material_list():
    if session.get('role') not in ['admin', 'sub_admin', 'staff']:
        flash('Unauthorized.', 'danger')
        return redirect(url_for('dashboard'))
    materials = get_db_manager().fetch_all(
        "SELECT m.*, c.course_name FROM course_materials m JOIN courses c ON m.course_id = c.id ORDER BY m.created_at DESC"
    )
    return render_template('admin_materials.html', materials=materials)

@app.route('/admin/materials/add', methods=['GET', 'POST'])
@login_required
def add_material():
    if session.get('role') not in ['admin', 'sub_admin', 'staff']:
        flash('Unauthorized.', 'danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        course_id = request.form['course_id']
        main_title = request.form['title']
        material_type = request.form['material_type']
        tag = request.form.get('tag')
        deadline_str = request.form.get('deadline')
        deadline = datetime.strptime(deadline_str, '%Y-%m-%dT%H:%M') if deadline_str else None

        uploaded_files = request.files.getlist('file')

        has_files = any(f.filename != '' for f in uploaded_files)

        if has_files:
            for file in uploaded_files:
                if file.filename == '': continue
                file_url = ""
                # Try Cloudinary
                if os.getenv('CLOUDINARY_CLOUD_NAME'):
                    try:
                        upload_result = cloudinary.uploader.upload(file, folder="course_materials", resource_type="auto")
                        file_url = upload_result.get('secure_url')
                    except Exception as e:
                        app.logger.error(f"Cloudinary material upload failed: {e}")
                        flash(f'Cloudinary upload failed for {file.filename}.', 'danger')
                        continue
                else:
                    # Local fallback
                    filename = secure_filename(file.filename)
                    upload_path = os.path.join(app.root_path, 'static', 'materials')
                    if not os.path.exists(upload_path): os.makedirs(upload_path)
                    file.save(os.path.join(upload_path, filename))
                    file_url = f"/static/materials/{filename}"

                if file_url:
                    # If multiple files, append original filename to main title
                    title = main_title if len(uploaded_files) == 1 else f"{main_title} - {file.filename}"
                    get_db_manager().execute(
                        "INSERT INTO course_materials (course_id, title, file_url, material_type, tag, deadline) VALUES (:c_id, :title, :url, :type, :tag, :deadline)",
                        {"c_id": course_id, "title": title, "url": file_url, "type": material_type, "tag": tag, "deadline": deadline}
                    )
            flash('Materials processed successfully!', 'success')
        else:
            file_url = request.form.get('external_url', '')
            if file_url:
                get_db_manager().execute(
                    "INSERT INTO course_materials (course_id, title, file_url, material_type, tag, deadline) VALUES (:c_id, :title, :url, :type, :tag, :deadline)",
                    {"c_id": course_id, "title": main_title, "url": file_url, "type": material_type, "tag": tag, "deadline": deadline}
                )
                flash('External link added successfully!', 'success')
            else:
                flash('No files or URL provided.', 'warning')

        return redirect(url_for('material_list'))

    courses = course_queries.get_all_courses()
    return render_template('add_material.html', courses=courses)

@app.route('/admin/materials/delete/<int:mat_id>', methods=['POST'])
@login_required
def delete_material(mat_id):
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized.', 'danger')
        return redirect(url_for('dashboard'))
    get_db_manager().execute("DELETE FROM course_materials WHERE id = :id", {"id": mat_id})
    flash('Material deleted.', 'success')
    return redirect(url_for('material_list'))

# --- Lecturer Portal ---
@app.route('/lecturer/dashboard')
@login_required
def lecturer_dashboard():
    # Find if this user is a linked lecturer
    user_id = session.get('user_id')
    lecturer = get_db_manager().fetch_one(
        "SELECT * FROM lecturers WHERE user_id = :uid", 
        {"uid": user_id}
    )
    
    if not lecturer:
        flash('Unauthorized. This account is not linked to a lecturer profile.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Get courses assigned to this lecturer
    my_courses = get_db_manager().fetch_all(
        "SELECT * FROM courses WHERE lecturer_id = :lid",
        {"lid": lecturer['lecturer_id']}
    )
    
    # Get recent attendance marked by this lecturer
    recent_attendance = get_db_manager().fetch_all(
        """
        SELECT a.*, s.first_name, s.last_name, c.course_name 
        FROM attendance a 
        JOIN students s ON a.student_id = s.id 
        JOIN courses c ON a.course_id = c.id
        WHERE c.lecturer_id = :lid
        ORDER BY a.date DESC LIMIT 10
        """,
        {"lid": lecturer['lecturer_id']}
    )
    
    return render_template('lecturer_dashboard.html', 
                           lecturer=lecturer, 
                           courses=my_courses,
                           recent_attendance=recent_attendance)

@app.route('/admin/activity-log')
@login_required
def activity_log_web():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    from db.activity_queries import get_recent_activities
    logs = get_recent_activities(limit=200)
    return render_template('activity_log.html', logs=logs)

@app.route('/admin/messaging', methods=['GET', 'POST'])
@login_required
def admin_messaging():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        target_type = request.form.get('target_type')
        message = request.form.get('message')
        # Logic to save notification
        get_db_manager().execute(
            "INSERT INTO notifications (user_id, target_type, message) VALUES (:uid, :type, :msg)",
            {"uid": session['user_id'], "type": target_type, "msg": message}
        )
        flash('Message sent successfully!', 'success')
        return redirect(url_for('admin_messaging'))

    courses = course_queries.get_all_courses()
    return render_template('admin_messaging.html', courses=courses)

@app.route('/reports')
@login_required
def reports_web():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Financial data for charts
    revenue_data = get_db_manager().fetch_all(
        "SELECT DATE_FORMAT(payment_date, '%b %Y') as month, SUM(amount) as total FROM payments GROUP BY month ORDER BY month DESC LIMIT 6"
    )
    
    # Enrollment data
    enrollment_data = get_db_manager().fetch_all(
        "SELECT c.course_name, COUNT(e.id) as count FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id GROUP BY c.course_name"
    )
    
    return render_template('reports.html', revenue_data=revenue_data, enrollment_data=enrollment_data)

@app.route('/admin/risk-analysis')
@login_required
def risk_analysis_web():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    at_risk_students = analytics_queries.get_at_risk_students()
    return render_template('admin_risk.html', at_risk_students=at_risk_students)

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings_web():
    if session.get('role') not in ['admin', 'sub_admin']:
        flash('Unauthorized access.', 'danger')
        return redirect(url_for('dashboard'))
    
    tenant_id = session.get('tenant_id')
    tenant = tenant_queries.get_tenant_by_id(tenant_id)
    
    if request.method == 'POST':
        school_name = request.form.get('school_name')
        contact_email = request.form.get('contact_email')
        
        # Update tenant info
        try:
            get_db_manager().execute(
                "UPDATE tenants SET name = :name, contact_email = :email WHERE id = :tid",
                {"name": school_name, "email": contact_email, "tid": tenant_id}
            )
            
            # If Super Admin, also save Twilio settings
            if session.get('is_super_admin'):
                sid = request.form.get('twilio_sid')
                token = request.form.get('twilio_token')
                sms_num = request.form.get('twilio_sms_num')
                wa_num = request.form.get('twilio_wa_num')
                
                db = get_db_manager()
                if sid: db.set_setting('TWILIO_ACCOUNT_SID', sid)
                if token: db.set_setting('TWILIO_AUTH_TOKEN', token)
                if sms_num: db.set_setting('TWILIO_PHONE_NUMBER', sms_num)
                if wa_num: db.set_setting('TWILIO_WHATSAPP_NUMBER', wa_num)

            flash('System settings updated successfully!', 'success')
            return redirect(url_for('settings_web'))
        except Exception as e:
            app.logger.error(f"Failed to update settings: {e}")
            flash('Error updating settings.', 'danger')

    # Fetch current settings for Super Admin
    twilio_config = {}
    if session.get('is_super_admin'):
        db = get_db_manager()
        twilio_config = {
            'sid': db.get_setting('TWILIO_ACCOUNT_SID', ''),
            'token': db.get_setting('TWILIO_AUTH_TOKEN', ''),
            'sms_num': db.get_setting('TWILIO_PHONE_NUMBER', ''),
            'wa_num': db.get_setting('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
        }

    return render_template('settings.html', tenant=tenant, twilio=twilio_config)

# --- Super Admin Portal Routes ---

@app.route('/protech-login', methods=['GET', 'POST'])
def protech_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # We allow @drstrange001 or drstrange001
        clean_username = username if username.startswith('@') else f"@{username}"
        
        # Developer is stored in the users table under EASI Academy (Tenant 1)
        user_data = get_db_manager().fetch_one(
            "SELECT * FROM users WHERE username = :username AND is_super_admin = TRUE", 
            {"username": clean_username}
        )
        
        if user_data and bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
            session['user_id'] = user_data['id']
            session['username'] = user_data['username']
            session['role'] = 'admin'
            session['tenant_id'] = user_data['tenant_id']
            session['is_super_admin'] = True
            session['is_developer'] = True # Special flag for independent access
            
            flash('Developer authentication successful!', 'success')
            return redirect(url_for('protech_admin'))
        else:
            flash('Invalid Developer Credentials.', 'danger')
            
    return render_template('protech_login.html')

@app.route('/protech-admin', methods=['GET', 'POST'])
@login_required
def protech_admin():
    # Strict Developer Gate: Must have is_developer flag
    if not session.get('is_developer') or session.get('username') != '@drstrange001':
        app.logger.warning(f"Unauthorized developer access attempt by user: {session.get('username')}")
        flash('Unauthorized access. Professional Developer authentication required.', 'danger')
        return redirect(url_for('protech_login'))
    
    from db.super_admin_queries import (
        get_system_health, get_tenant_performance_leaderboard, 
        broadcast_system_notification,
        get_tenant_resource_usage, impersonate_school_admin,
        set_global_maintenance, get_global_maintenance,
        update_billing_plan
    )
    from db.activity_queries import get_recent_activities
    from db.backup_queries import get_archived_records, get_all_backups, create_system_backup

    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'backup':
            tid = request.form.get('tenant_id')
            success, msg = create_system_backup(tenant_id=tid if tid else None)
            flash(f"Backup Status: {msg}", "success" if success else "danger")

        elif action == 'impersonate':
            # ... rest of post logic
            target_id = request.form.get('tenant_id')
            target_user = impersonate_school_admin(session, target_id)
            if target_user:
                # Store developer state to allow "Switching back"
                session['developer_user_id'] = session['user_id']
                session['user_id'] = target_user['id']
                session['username'] = target_user['username']
                session['tenant_id'] = target_user['tenant_id']
                session['role'] = target_user['role']
                session['is_super_admin'] = False # Temporarily drop super admin for real testing
                flash(f"Impersonating {target_user['username']} @ Tenant {target_id}", "info")
                return redirect(url_for('dashboard'))
            flash("Impersonation failed. No admin user found for school.", "danger")

        elif action == 'maintenance':
            enabled = request.form.get('enabled') == 'true'
            message = request.form.get('message', "System maintenance in progress.")
            set_global_maintenance(enabled, message)
            flash(f"Global Maintenance Mode: {'Enabled' if enabled else 'Disabled'}", "warning")

        elif action == 'edit_plan':
            plan_id = request.form.get('plan_id')
            update_billing_plan(
                plan_id, 
                request.form.get('price_monthly'),
                request.form.get('price_yearly'),
                request.form.get('max_students'),
                request.form.get('max_users'),
                request.form.get('features')
            )
            flash("Billing plan updated.", "success")
            
        elif action == 'broadcast':
            # ... (rest of post logic)
            msg = request.form.get('message')
            broadcast_system_notification(msg, session.get('user_id'))
            flash('System-wide broadcast sent to all school admins.', 'info')
            
        elif action == 'provision':
            name = request.form.get('name')
            subdomain = request.form.get('subdomain')
            email = request.form.get('contact_email')
            admin_username = request.form.get('admin_username')
            admin_password = request.form.get('admin_password')
            plan_name = request.form.get('plan_name', 'Premium')
            
            # Handle Logo Upload
            logo_url = None
            if 'logo' in request.files:
                file = request.files['logo']
                if file and allowed_file(file.filename):
                    if config.CLOUDINARY_CLOUD_NAME and config.CLOUDINARY_API_KEY:
                        try:
                            upload_result = cloudinary.uploader.upload(file, folder="school_logos")
                            logo_url = upload_result.get('secure_url')
                        except Exception as e:
                            app.logger.error(f"Cloudinary logo upload failed: {e}")
                    else:
                        filename = secure_filename(file.filename)
                        photo_filename = f"logo_{subdomain}_{filename}"
                        file_path = os.path.join(UPLOAD_FOLDER, photo_filename)
                        file.save(file_path)
                        logo_url = os.path.join('photos', photo_filename).replace('\\', '/')
            
            new_id = tenant_queries.create_tenant(
                name=name, 
                subdomain=subdomain, 
                contact_email=email, 
                logo_url=logo_url
            )
            if new_id:
                hashed = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                get_db_manager().execute(
                    "INSERT INTO users (username, password, role, is_approved, tenant_id) VALUES (:u, :p, 'admin', TRUE, :tid)",
                    {"u": admin_username, "p": hashed, "tid": new_id}
                )
                from db.billing_queries import create_initial_subscription
                create_initial_subscription(new_id, plan_name)
                flash(f'School "{name}" deployed successfully.', 'success')
            else:
                flash("Provisioning failed. Subdomain might be taken.", "danger")

        elif action == 'delete_school':
            tenant_id = request.form.get('tenant_id')
            from db.tenant_queries import delete_tenant
            if delete_tenant(tenant_id):
                flash(f"School (ID: {tenant_id}) and all its data have been permanently deleted.", "success")
            else:
                flash("Failed to delete school. Check logs.", "danger")

        elif action == 'update_status':
            target_id = request.form.get('tenant_id')
            new_status = request.form.get('status')
            if tenant_queries.update_tenant_status(target_id, new_status):
                flash(f"Tenant status updated to {new_status}.", "success")
            else:
                flash("Failed to update status.", "danger")
        
        return redirect(url_for('protech_admin'))

    # GET: Prepare data
    stats = tenant_queries.get_global_stats()
    health = get_system_health()
    leaderboard = get_tenant_performance_leaderboard()
    recent_logs = get_recent_activities(limit=15)
    resources = get_tenant_resource_usage()
    archives = get_archived_records()
    backups = get_all_backups()
    
    from db.billing_queries import get_billing_plans
    billing_plans = get_billing_plans()
    
    from db.backup_queries import get_system_vault_stats
    vault_stats = get_system_vault_stats()
    
    m_enabled, m_message = get_global_maintenance()

    return render_template('protech_admin.html', 
                           global_stats=stats, 
                           health=health, 
                           leaderboard=leaderboard, 
                           recent_logs=recent_logs,
                           resources=resources,
                           archives=archives,
                           backups=backups,
                           vault_stats=vault_stats,
                           billing_plans=billing_plans,
                           maintenance_enabled=m_enabled,
                           maintenance_message=m_message)

@app.route('/protech/broadcast', methods=['POST'])
@login_required
def protech_broadcast():
    if not session.get('is_developer'):
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    title = request.form.get('title')
    message = request.form.get('message')
    category = request.form.get('category', 'System Update')
    
    # Send to ALL schools
    try:
        get_db_manager().execute(
            "INSERT INTO announcements (title, content, category, target_audience) VALUES (:t, :c, :cat, 'Admin')",
            {"t": title, "c": message, "cat": category}
        )
        flash('System-wide broadcast sent to all school administrators.', 'success')
    except Exception as e:
        app.logger.error(f"Broadcast failed: {e}")
        flash('Broadcast failed.', 'danger')
        
    return redirect(url_for('protech_admin'))

@app.route('/protech/restore', methods=['POST'])
@login_required
def protech_restore():
    if not session.get('is_developer'):
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    backup_id = request.form.get('backup_id')
    from db.backup_queries import restore_from_backup
    success, message = restore_from_backup(backup_id)
    
    if success:
        flash("Restoration successful. System state resumed.", "success")
    else:
        flash(f"Restoration failed: {message}", "danger")
        
    return redirect(url_for('protech_admin'))

@app.route('/protech/reset-admin-password', methods=['POST'])
@login_required
def protech_reset_admin():
    if not session.get('is_developer'):
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    tenant_id = request.form.get('tenant_id')
    new_password = request.form.get('new_password')
    
    try:
        hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        if tenant_queries.reset_tenant_admin_password(tenant_id, hashed):
            flash('Admin password reset successfully.', 'success')
        else:
            flash('Failed to reset admin password.', 'danger')
    except Exception as e:
        flash(f'Error: {str(e)}', 'danger')
        
    return redirect(url_for('protech_admin'))

@app.route('/super-admin/schools', methods=['GET', 'POST'])
@login_required
def super_admin_schools():
    if not session.get('is_super_admin'):
        flash('Unauthorized access. Super Admin only.', 'danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        name = request.form.get('name')
        subdomain = request.form.get('subdomain')
        email = request.form.get('email')
        phone = request.form.get('phone')
        address = request.form.get('address')
        website = request.form.get('website')
        motto = request.form.get('motto')
        primary_color = request.form.get('primary_color')
        secondary_color = request.form.get('secondary_color')

        logo_url = None
        if 'logo' in request.files:
            file = request.files['logo']
            if file and file.filename:
                try:
                    upload_result = cloudinary.uploader.upload(file, folder="school_logos")
                    logo_url = upload_result.get('secure_url')
                except Exception as e:
                    app.logger.error(f"Logo upload failed: {e}")

        new_id = tenant_queries.create_tenant(
            name=name, 
            subdomain=subdomain, 
            contact_email=email,
            logo_url=logo_url,
            phone=phone,
            address=address,
            website=website,
            motto=motto,
            primary_color=primary_color,
            secondary_color=secondary_color
        )
        if new_id:
            flash(f'School "{name}" registered successfully!', 'success')
        else:
            flash('Failed to register school. Subdomain might be taken.', 'danger')
        return redirect(url_for('super_admin_schools'))
    schools = tenant_queries.get_all_tenants()
    return render_template('super_admin_schools.html', schools=schools)

@app.route('/super-admin/test-notification', methods=['POST'])
@login_required
def test_notification():
    if not session.get('is_super_admin'):
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    target_number = request.form.get('target_number')
    message_type = request.form.get('message_type') # 'sms' or 'whatsapp'
    
    if not target_number:
        return jsonify({"success": False, "message": "Phone number is required"}), 400
    
    from utils.notifier import send_sms, send_whatsapp
    
    test_msg = "Hello! This is a test message from your EASI Academy Platform. Your notification system is working! 🚀"
    
    if message_type == 'sms':
        success, result = send_sms(target_number, test_msg)
    else:
        success, result = send_whatsapp(target_number, test_msg)
        
    if success:
        return jsonify({"success": True, "message": f"Test {message_type.upper()} sent successfully!"})
    else:
        return jsonify({"success": False, "message": f"Failed: {result}"})

@app.route('/api/ai/lecturer-chat', methods=['POST'])
@login_required
def lecturer_ai_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_id = session.get('user_id')
        
        # Get Lecturer Context
        lecturer = get_db_manager().fetch_one("SELECT * FROM lecturers WHERE user_id = :uid", {"uid": user_id})
        if not lecturer:
            return jsonify({"reply": "Error: Profile link missing."}), 403
            
        my_courses = get_db_manager().fetch_all("SELECT course_name, course_code FROM courses WHERE lecturer_id = :lid", {"lid": lecturer['lecturer_id']})
        
        context = {
            "assigned_modules": [f"{c['course_name']} ({c['course_code']})" for c in my_courses],
            "department": lecturer['department'],
            "lecturer_id": lecturer['lecturer_id']
        }
        
        from utils.ai_engine import ask_trove
        reply = ask_trove(
            user_role="Lecturer",
            user_name=lecturer['first_name'],
            context_data=context,
            user_query=user_message
        )

        return jsonify({"reply": reply})
    except Exception as e:
        app.logger.error(f"Trove Lecturer Error: {e}")
        return jsonify({"reply": "Trove Faculty link disrupted."}), 500

@app.route('/api/ai/admin-chat', methods=['POST'])
@login_required
def admin_ai_chat():
    if session.get('role') not in ['admin', 'sub_admin']:
        return jsonify({"reply": "Unauthorized."}), 403
        
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        # Get subscription info
        from db.billing_queries import get_tenant_subscription
        sub = get_tenant_subscription(session.get('tenant_id'))

        # High-Level Admin Analytics for Trove
        context = {
            "total_students": get_total_students_web(),
            "active_students": get_active_students_web(),
            "campus_attendance_rate": f"{get_attendance_rate_web()}%",
            "pending_payments_count": get_pending_payments_count_web(),
            "total_courses": get_total_courses_web(),
            "subscription_status": sub['status'] if sub else 'Active',
            "plan_name": sub['plan_name'] if sub else 'Premium',
            "next_billing_date": sub['next_billing_date'].strftime('%Y-%m-%d') if sub else 'N/A'
        }
        
        from utils.ai_engine import ask_trove
        reply = ask_trove(
            user_role="Administrator",
            user_name=session.get('username'),
            context_data=context,
            user_query=user_message
        )

        return jsonify({"reply": reply})
    except Exception as e:
        app.logger.error(f"Trove Admin Error: {e}")
        return jsonify({"reply": "Trove Analytics offline."}), 500

@app.route('/about')
def about():
    """Renders the about us page."""
    return render_template('about.html')

@app.route('/terms')
def terms():
    """Renders the terms of use page."""
    return render_template('terms.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
