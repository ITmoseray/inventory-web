from db.database import get_db_manager
from datetime import datetime
import bcrypt
from db.activity_queries import log_activity
from utils.notifier import notify_registration_approval # NEW: Import notifier

from typing import List, Any, Optional # Added Optional
from db.lecturer_queries import lecturer_manager # Import the lecturer manager
import psycopg2.errors

import logging
try:
    from flask import current_app
    def _log_debug(message):
        if current_app:
            current_app.logger.info(message) # Use info level for more visibility
        else:
            logging.info(message) # Use info level for more visibility
except ImportError:
    logging.basicConfig(level=logging.INFO) # Configure basic logging if Flask is not available
    def _log_debug(message):
        logging.info(message) # Use info level for more visibility

class DuplicateStudentIdError(Exception):
    """Custom exception for duplicate student ID errors."""
    pass

class DuplicateStudentEmailError(Exception):
    """Custom exception for duplicate student email errors."""
    pass

def get_all_students(tenant_id: Optional[int] = None):
    """
    Retrieves all students from the database with basic details, 
    filtered by tenant_id if provided.
    """
    try:
        query = """
        SELECT
            id,
            student_id,
            first_name,
            last_name,
            gender,
            date_of_birth,
            email,
            phone,
            status,
            photo_path,
            address,
            lecturer_id,
            password_hash,
            application_source
        FROM
            students
        """
        params = {}
        if tenant_id:
            query += " WHERE tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY created_at DESC"
        
        students = get_db_manager().fetch_all(query, params)
        _log_debug(f"DEBUG: get_all_students fetched {len(students)} students.")
        return students
    except Exception as e:
        _log_debug(f"DEBUG: Error getting all students: {e}")
        return []

def search_students(search_query, tenant_id: Optional[int] = None):
    """
    Searches for students by student_id, first_name, last_name, or email,
    and retrieves their basic details, filtered by tenant_id if provided.
    """
    try:
        query = """
        SELECT
            id,
            student_id,
            first_name,
            last_name,
            gender,
            date_of_birth,
            email,
            phone,
            status,
            photo_path,
            address,
            lecturer_id,
            password_hash,
            application_source
        FROM
            students
        WHERE 
            (student_id ILIKE :search_pattern OR first_name ILIKE :search_pattern OR last_name ILIKE :search_pattern OR email ILIKE :search_pattern)
        """
        params = {"search_pattern": f"%{search_query}%"}
        if tenant_id:
            query += " AND tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY created_at DESC"
        
        students = get_db_manager().fetch_all(query, params)
        _log_debug(f"DEBUG: search_students fetched {len(students)} students for query '{search_query}'.")
        return students
    except Exception as e:
        _log_debug(f"DEBUG: Error searching students: {e}")
        return []

def add_student(student_id, first_name, last_name, gender, date_of_birth, email, phone, photo_path=None, address=None, status='active', lecturer_id=None, password=None, performed_by=None, tenant_id=None, application_source='online'):
    """
    Adds a new student to the database. If lecturer_id is not provided,
    it attempts to assign a default lecturer.
    """
    
    # Logic to handle default lecturer if not provided
    if not lecturer_id:
        _log_debug("No lecturer_id provided for student. Attempting to assign default lecturer.")
        default_lecturer_id_str = 'LEC2026-001'
        default_lecturer = lecturer_manager.get_lecturer_by_lecturer_id(default_lecturer_id_str)
        
        if not default_lecturer:
            _log_debug(f"Default lecturer '{default_lecturer_id_str}' not found. Creating it.")
            # Assume sensible defaults for creating the default lecturer
            # Note: create_lecturer now returns the lecturer_id string
            lecturer_manager.create_lecturer(
                first_name='Default',
                last_name='Lecturer',
                email='default.lecturer@example.com',
                phone='000-000-0000',
                department='General'
            )
            lecturer_id = default_lecturer_id_str # Assign the newly created default
        else:
            lecturer_id = default_lecturer_id_str # Assign the existing default
    
    # Ensure empty email string is treated as NULL for database insertion
    if email == "":
        email = None
    
    # Check for duplicate email before inserting
    if email and check_email_exists(email):
        raise DuplicateStudentEmailError(f"Student with email '{email}' already exists.")
    
    # Hash password if provided using bcrypt
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8') if password else None
    
    try:
        _log_debug(f"Attempting to add student: ID={student_id}, Name={first_name} {last_name}, Lecturer={lecturer_id}, Tenant={tenant_id}, Source={application_source}")
        query = """
        INSERT INTO students (tenant_id, student_id, first_name, last_name, gender, date_of_birth, email, phone, photo_path, address, status, lecturer_id, password_hash, application_source)
        VALUES (:tenant_id, :student_id, :first_name, :last_name, :gender, :date_of_birth, :email, :phone, :photo_path, :address, :status, :lecturer_id, :password_hash, :application_source)
        RETURNING id
        """
        # Note: enrollment_date, created_at, updated_at have DEFAULT values in schema, so they are not included here.
        student_db_id = get_db_manager().insert_and_return_id(query, {
            "tenant_id": tenant_id,
            "student_id": student_id,
            "first_name": first_name,
            "last_name": last_name,
            "gender": gender,
            "date_of_birth": date_of_birth,
            "email": email,
            "phone": phone,
            "photo_path": photo_path,
            "address": address,
            "status": status,
            "lecturer_id": lecturer_id,
            "password_hash": password_hash,
            "application_source": application_source
        })
        
        if student_db_id:
            log_activity(performed_by, "Add Student", f"Added student {first_name} {last_name} ({student_id})")
            
        _log_debug(f"Successfully added student with internal DB ID: {student_db_id}")
        return student_db_id
    except Exception as e: # Catch all exceptions, then check type
        # Check for unique violation using SQLAlchemy's DBAPIError or directly check psycopg2 error
        if hasattr(e, 'orig') and isinstance(e.orig, psycopg2.errors.UniqueViolation):
            error_message = str(e.orig)
            if "students_email_key" in error_message:
                _log_debug(f"Error adding student '{student_id}': Duplicate Email - {error_message}")
                raise DuplicateStudentEmailError(f"Student with email '{email}' already exists.")
            else:
                _log_debug(f"Error adding student '{student_id}': Duplicate ID - {error_message}")
                raise DuplicateStudentIdError(f"Student with ID '{student_id}' already exists.")
        elif isinstance(e, psycopg2.errors.UniqueViolation): # Fallback if e is directly psycopg2.errors.UniqueViolation
            error_message = str(e)
            if "students_email_key" in error_message:
                _log_debug(f"Error adding student '{student_id}': Duplicate Email - {error_message}")
                raise DuplicateStudentEmailError(f"Student with email '{email}' already exists.")
            else:
                _log_debug(f"Error adding student '{student_id}': Duplicate ID - {error_message}")
                raise DuplicateStudentIdError(f"Student with ID '{student_id}' already exists.")
        else:
            _log_debug(f"Error adding student '{student_id}': {e}")
            return None

def get_student_by_id(student_id):
    """
    Retrieves a single student's details by their student_id (VARCHAR).
    """
    try:
        query = "SELECT id, student_id, first_name, last_name, gender, date_of_birth, email, phone, photo_path, address, status, lecturer_id, password_hash FROM students WHERE student_id = :student_id"
        student = get_db_manager().fetch_one(query, {"student_id": student_id})
        return student
    except Exception as e:
        _log_debug(f"Error getting student by ID: {e}")
        return None

def get_student_by_pk_id(student_pk_id: int):
    """
    Retrieves a single student's details by their internal primary key ID (INT).
    """
    try:
        query = "SELECT id, student_id, first_name, last_name, gender, date_of_birth, email, phone, photo_path, address, status, lecturer_id, password_hash FROM students WHERE id = :student_pk_id"
        student = get_db_manager().fetch_one(query, {"student_pk_id": student_pk_id})
        return student
    except Exception as e:
        _log_debug(f"Error getting student by PK ID: {e}")
        return None

def check_email_exists(email: str, exclude_student_pk_id: int = None) -> bool:
    """
    Checks if an email already exists in the database.
    Optionally excludes a student by their primary key ID for update scenarios.
    """
    # If email is None, it should not be considered a duplicate for uniqueness checks
    if email is None:
        return False
    
    try:
        query = "SELECT COUNT(*) FROM students WHERE email = :email"
        params = {"email": email}
        if exclude_student_pk_id:
            query += " AND id != :exclude_student_pk_id"
            params["exclude_student_pk_id"] = exclude_student_pk_id
        
        result = get_db_manager().fetch_one(query, params)
        count = result['COUNT(*)'] if result and 'COUNT(*)' in result else 0
        return count > 0
    except Exception as e:
        _log_debug(f"Error checking if email '{email}' exists: {e}")
        return False


def update_student(original_student_id, student_id, first_name, last_name, gender, date_of_birth, email, phone, photo_path=None, address=None, status=None, lecturer_id=None, password=None, performed_by=None):
    """
    Updates an existing student's details, including photo path and sets updated_at timestamp.
    """
    try:
        _log_debug(f"Attempting to update student: Original ID={original_student_id}, New ID={student_id}")
        
        # Build query and params dynamically based on whether password is provided
        set_clauses = [
            "student_id = :student_id", "first_name = :first_name", "last_name = :last_name",
            "gender = :gender", "date_of_birth = :date_of_birth", "email = :email",
            "phone = :phone", "photo_path = :photo_path", "address = :address",
            "status = :status", "lecturer_id = :lecturer_id", "updated_at = CURRENT_TIMESTAMP"
        ]
        
        params = {
            "student_id": student_id,
            "first_name": first_name,
            "last_name": last_name,
            "gender": gender,
            "date_of_birth": date_of_birth,
            "email": email,
            "phone": phone,
            "photo_path": photo_path,
            "address": address,
            "status": status,
            "lecturer_id": lecturer_id,
            "original_student_id": original_student_id
        }
        
        if password and password.strip():
            set_clauses.append("password_hash = :password_hash")
            params["password_hash"] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        query = f"""
        UPDATE students
        SET {', '.join(set_clauses)}
        WHERE student_id = :original_student_id
        """
        
        get_db_manager().execute(query, params)
        
        log_activity(performed_by, "Update Student", f"Updated student {first_name} {last_name} ({student_id})")
        
        _log_debug(f"Successfully updated student with ID: {original_student_id}")
        return True
    except Exception as e:
        _log_debug(f"Error updating student '{original_student_id}': {e}")
        return False

def deactivate_student(student_id: str): # Renamed to deactivate_student
    """
    Deactivates a student (sets their status to 'Inactive') in the database
    instead of permanently deleting them.
    """
    try:
        _log_debug(f"Attempting to deactivate student with ID: {student_id}")
        query = "UPDATE students SET status = 'Inactive', updated_at = CURRENT_TIMESTAMP WHERE student_id = :student_id"
        get_db_manager().execute(query, {"student_id": student_id})
        _log_debug(f"Successfully deactivated student with ID: {student_id}")
        return True
    except Exception as e:
        _log_debug(f"Error deactivating student '{student_id}': {e}")
        return False

import logging
from sqlalchemy import text # Added import for text

try:
    from flask import current_app
    def _log_debug(message):
        if current_app:
            current_app.logger.info(message) # Use info level for more visibility
        else:
            logging.info(message) # Use info level for more visibility
except ImportError:
    logging.basicConfig(level=logging.INFO) # Configure basic logging if Flask is not available
    def _log_debug(message):
        logging.info(message) # Use info level for more visibility

class DuplicateStudentIdError(Exception):
    """Custom exception for duplicate student ID errors."""
    pass

class DuplicateStudentEmailError(Exception):
    """Custom exception for duplicate student email errors."""
    pass

# ... (rest of existing code) ...

def delete_student(student_id: str, performed_by=None):
    """
    Alias for permanently deleting a student. This function is kept for
    compatibility with UI calls that may refer to 'delete_student'.
    """
    return delete_student_permanently(student_id, performed_by)

def delete_student_permanently(student_id: str, performed_by=None):
    """
    Permanently deletes a student record. It is recommended to rely on
    ON DELETE CASCADE for cleaning up dependent records. This function now
    fetches the internal ID and deletes the main student record, allowing
    the database to handle cascading deletes.
    """
    db_manager = get_db_manager()
    conn = db_manager.engine.connect()
    trans = conn.begin()
    try:
        _log_debug(f"Attempting atomic permanent deletion for student ID: {student_id}")
        from db.backup_queries import archive_record
        from flask import session

        # Step 1: Get the internal numeric ID for the given student_id
        student_record = db_manager.fetch_one(
            "SELECT * FROM students WHERE student_id = :student_id",
            {"student_id": student_id},
            connection=conn
        )

        if not student_record:
            _log_debug(f"Student with ID '{student_id}' not found. No deletion occurred.")
            trans.rollback()
            return False

        internal_id = student_record['id']
        # Archive for developer
        archive_record(
            tenant_id=student_record.get('tenant_id'),
            table_name='students',
            record_id=internal_id,
            record_data=dict(student_record),
            deleted_by=session.get('username', 'System')
        )
        _log_debug(f"Student record archived for developer: {student_id}")
        first_name = student_record['first_name']
        last_name = student_record['last_name']
        _log_debug(f"Found internal ID {internal_id} for student {student_id}")

        # Step 2: Delete the student from the main students table using the internal ID.
        # The ON DELETE CASCADE constraint will handle dependent records.
        result = db_manager.execute(
            "DELETE FROM students WHERE id = :internal_id",
            {"internal_id": internal_id},
            connection=conn
        )

        # Check if the deletion was successful
        if result.rowcount == 0:
            _log_debug(f"Student with internal ID '{internal_id}' not found for deletion, though it was just fetched. Rolling back.")
            trans.rollback()
            return False

        log_activity(performed_by, "Delete Student", f"Permanently deleted student {first_name} {last_name} ({student_id})")

        trans.commit()
        _log_debug(f"Student '{student_id}' (Internal ID: {internal_id}) successfully permanently deleted. Associated data removed via CASCADE.")
        return True

    except Exception as e:
        _log_debug(f"Database error during atomic permanent deletion for student {student_id}: {e}")
        trans.rollback()
        raise
    finally:
        conn.close()
def get_students_by_course_id(course_id: int): # Changed parameter to course_id (INT)
    """
    Retrieves students enrolled in a specific course.
    """
    try:
        _log_debug(f"Attempting to get students for course ID: {course_id}")
        query = """
        SELECT s.id, s.student_id, s.first_name, s.last_name
        FROM students s
        JOIN student_courses sc ON s.id = sc.student_id
        WHERE sc.course_id = :course_id AND sc.status = 'Active'
        ORDER BY s.last_name, s.first_name
        """
        students = get_db_manager().fetch_all(query, {"course_id": course_id})
        _log_debug(f"Found {len(students)} students for course ID: {course_id}")
        return students
    except Exception as e:
        _log_debug(f"Error getting students by course ID '{course_id}': {e}")
        return []
def generate_unique_student_id():
    """
    Generates a unique student ID in the format "STUYYYY-NNN".
    Checks against the database to ensure uniqueness.
    """
    current_year = datetime.now().year
    prefix = f"STU{current_year}-"
    
    try:
        _log_debug(f"Generating unique student ID for prefix: '{prefix}'")
        query = "SELECT student_id FROM students WHERE student_id LIKE :prefix ORDER BY student_id DESC LIMIT 1"
        latest_id = get_db_manager().fetch_one(query, {"prefix": f"{prefix}%"})
        _log_debug(f"Latest ID found: {latest_id}")
        
        if latest_id and latest_id['student_id'].startswith(prefix):
            try:
                sequence_part = latest_id['student_id'].split('-')[-1]
                next_sequence = int(sequence_part) + 1
            except ValueError:
                next_sequence = 1
        else:
            next_sequence = 1
            
        while True:
            new_id = f"{prefix}{next_sequence:03d}" # e.g., STU2026-001
            _log_debug(f"Checking uniqueness for generated ID: '{new_id}'")
            existing_student = get_db_manager().fetch_one("SELECT student_id FROM students WHERE student_id = :new_id", {"new_id": new_id})
            if not existing_student:
                _log_debug(f"Unique ID found: '{new_id}'")
                return new_id
            next_sequence += 1
            
    except Exception as e:
        _log_debug(f"Error generating unique student ID in loop: {e}")
        # Fallback to a timestamp-based ID if database check fails catastrophically
        return f"STU{datetime.now().strftime('%Y%m%d%H%M%S')}"

def enroll_student_in_course(student_id: int, course_id: int):
    """
    Enrolls a student in a course by inserting into the student_courses table.
    Uses ON CONFLICT DO NOTHING to prevent duplicate entries.
    """
    try:
        _log_debug(f"ENROLL ATTEMPT into student_courses → student_id={student_id}, course_id={course_id}")
        query = """
        INSERT INTO student_courses (student_id, course_id, enrollment_date, status)
        VALUES (:student_id, :course_id, :enrollment_date, :status)
        ON CONFLICT (student_id, course_id) DO NOTHING
        """
        get_db_manager().execute(query, {
            "student_id": student_id,
            "course_id": course_id,
            "enrollment_date": datetime.now().strftime('%Y-%m-%d'),
            "status": 'Active'
        })
        _log_debug("ENROLL INSERT into student_courses EXECUTED")
        _log_debug(f"Successfully enrolled student '{student_id}' in course '{course_id}' (or already enrolled).")
        return True
    except Exception as e:
        _log_debug(f"Error enrolling student '{student_id}' in course '{course_id}': {e}")
        return False
def get_student_enrollments(student_pk_id: int) -> List[int]: # Renamed parameter and type-hinted to INT, returns List[int]
    """
    Retrieves the course enrollments (course IDs) for a given student from the student_courses table.
    """
    try:
        _log_debug(f"Attempting to get enrollments from student_courses table for student PK ID: {student_pk_id}")
        query = "SELECT course_id FROM student_courses WHERE student_id = :student_pk_id"
        enrollments = get_db_manager().fetch_all(query, {"student_pk_id": student_pk_id})
        _log_debug(f"Found {len(enrollments)} enrollments in student_courses table for student PK ID: {student_pk_id}")
        return [enrollment['course_id'] for enrollment in enrollments]
    except Exception as e:
        _log_debug(f"Error getting student enrollments from student_courses table for student PK ID '{student_pk_id}': {e}")
        return []

# --- Registration Functions ---

def add_registration(full_name, age, gender, address, phone, email, guardian_name, guardian_phone, course, referral_source, photo_url, payment_reference, payment_method=None, sender_name=None, sender_phone=None, tenant_id=1, application_source='online'):
    """
    Adds a new student registration application to the database.
    """
    try:
        db = get_db_manager()
        
        # 1. Generate unique Application Code (EASI-YYYY-XXX)
        year = datetime.now().year
        prefix = f"EASI-{year}-"
        
        # Find the latest app_code for this year to determine the next sequence number
        latest_query = "SELECT app_code FROM registrations WHERE app_code LIKE :pattern ORDER BY app_code DESC LIMIT 1"
        latest_res = db.fetch_one(latest_query, {"pattern": f"{prefix}%"})
        
        if latest_res and latest_res['app_code'].startswith(prefix):
            try:
                sequence_part = latest_res['app_code'].split('-')[-1]
                next_num = int(sequence_part) + 1
            except (ValueError, IndexError):
                next_num = 1
        else:
            next_num = 1
            
        # Safety loop to ensure uniqueness
        while True:
            app_code = f"{prefix}{next_num:03d}"
            existing = db.fetch_one("SELECT id FROM registrations WHERE app_code = :app_code", {"app_code": app_code})
            if not existing:
                break
            next_num += 1

        query = """
        INSERT INTO registrations (
            tenant_id, app_code, full_name, age, gender, address, phone, email, 
            guardian_name, guardian_phone, course, referral_source, 
            photo_url, payment_reference, payment_method, sender_name, sender_phone,
            status, payment_status, application_source
        ) VALUES (
            :tenant_id, :app_code, :full_name, :age, :gender, :address, :phone, :email, 
            :guardian_name, :guardian_phone, :course, :referral_source, 
            :photo_url, :payment_reference, :payment_method, :sender_name, :sender_phone,
            'pending', 'pending', :application_source
        ) RETURNING id, app_code
        """
        
        # We need both id and app_code to return to the user
        result = db.fetch_one(query, {
            "tenant_id": tenant_id,
            "app_code": app_code,
            "full_name": full_name,
            "age": age,
            "gender": gender,
            "address": address,
            "phone": phone,
            "email": email if email else None,
            "guardian_name": guardian_name,
            "guardian_phone": guardian_phone,
            "course": course,
            "referral_source": referral_source,
            "photo_url": photo_url,
            "payment_reference": payment_reference,
            "payment_method": payment_method,
            "sender_name": sender_name,
            "sender_phone": sender_phone,
            "application_source": application_source
        })
        
        return result # Now returns a dict with 'id' and 'app_code'
    except Exception as e:
        _log_debug(f"Error adding registration: {e}")
        return None

def get_all_registrations(tenant_id=None):
    """
    Retrieves student registrations, filtered by tenant_id if provided.
    """
    try:
        db = get_db_manager()
        params = {}
        query = "SELECT * FROM registrations"
        
        if tenant_id:
            query += " WHERE tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY created_at DESC"
        return db.fetch_all(query, params)
    except Exception as e:
        _log_debug(f"Error getting all registrations: {e}")
        return []

def get_registration_by_id(reg_id):
    """
    Retrieves a registration by its internal ID.
    """
    try:
        query = "SELECT * FROM registrations WHERE id = :id"
        return get_db_manager().fetch_one(query, {"id": reg_id})
    except Exception as e:
        _log_debug(f"Error getting registration by ID: {e}")
        return None

def generate_welcome_message(full_name, student_id, password, school_name="EASI Academy"):
    """
    Generates a welcome text message for the student.
    """
    return f"""🎉 Congratulations, {full_name}!
Your registration at {school_name} has been approved.

📚 Student ID: {student_id}
🔑 Initial Password: {password}

Login at: https://easi-student-system.onrender.com/student/login

Welcome to the family! 🚀"""

def approve_registration(reg_id, performed_by=None):
    """
    Approves a registration, creates a student record, and enrolls them in the course.
    Returns (success, message, welcome_text)
    """
    try:
        reg = get_registration_by_id(reg_id)
        if not reg:
            return False, "Registration not found", None
        
        if reg['status'] == 'approved':
            return False, "Registration already approved", None

        # 1. Split name (simple split)
        name_parts = reg['full_name'].strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "Student"

        # 2. Generate unique student ID
        student_id = generate_unique_student_id()

        # 3. Create student record
        # Note: We use last 8 digits of phone as initial password
        initial_password = reg['phone'].replace('+', '').replace(' ', '')[-8:] # Last 8 digits
        
        student_db_id = add_student(
            student_id=student_id,
            first_name=first_name,
            last_name=last_name,
            gender=reg['gender'],
            date_of_birth=None, # age is provided, not DOB
            email=reg['email'],
            phone=reg['phone'],
            photo_path=reg['photo_url'],
            address=reg['address'],
            status='Active',
            password=initial_password,
            performed_by=performed_by,
            tenant_id=reg['tenant_id'], # Pass tenant_id from registration
            application_source=reg.get('application_source', 'online') # NEW: Pass source
        )

        if not student_db_id:
            return False, "Failed to create student record (possible duplicate email/phone)", None

        # 4. Enroll in course (if matching course found)
        from db.course_queries import get_all_courses
        all_courses = get_all_courses()
        matched_course = None
        
        # Try to find best match for course string
        course_str = reg['course'].lower()
        for c in all_courses:
            if c['course_name'].lower() in course_str or course_str in c['course_name'].lower():
                matched_course = c
                break
        
        if matched_course:
            enroll_student_in_course(student_db_id, matched_course['id'])
        
        # 5. Update registration status
        update_query = """
        UPDATE registrations 
        SET status = 'approved', payment_status = 'paid' 
        WHERE id = :id
        """
        get_db_manager().execute(update_query, {"id": reg_id})

        log_activity(performed_by, "Approve Registration", f"Approved registration for {reg['full_name']} (ID: {student_id})")
        
        # Fetch school name for welcome message
        from db.tenant_queries import get_tenant_by_id
        school_name = "EASI Academy"
        if reg.get('tenant_id'):
            tenant = get_tenant_by_id(reg['tenant_id'])
            if tenant:
                school_name = tenant['name']

        welcome_text = generate_welcome_message(reg['full_name'], student_id, initial_password, school_name)

        # 6. Notify Student via SMS/WhatsApp/Email
        try:
            notify_registration_approval(
                full_name=reg['full_name'],
                phone=reg['phone'],
                student_id=student_id,
                password=initial_password,
                email=reg.get('email')
            )
        except Exception as notify_err:
            _log_debug(f"Notification failed (non-critical): {notify_err}")

        return True, f"Successfully approved! Student ID is {student_id}.", welcome_text

    except Exception as e:
        _log_debug(f"Error approving registration: {e}")
        return False, f"Error: {str(e)}", None

def delete_registration(reg_id, performed_by=None):
    """
    Deletes a registration record permanently.
    """
    try:
        reg = get_registration_by_id(reg_id)
        if not reg:
            return False, "Registration not found"
        
        query = "DELETE FROM registrations WHERE id = :id"
        get_db_manager().execute(query, {"id": reg_id})
        
        log_activity(performed_by, "Delete Registration", f"Deleted registration application for {reg.get('full_name', 'Unknown')}")
        return True, "Registration deleted successfully."
    except Exception as e:
        _log_debug(f"Error deleting registration: {e}")
        return False, f"Error: {str(e)}"

def update_student_enrollments(student_pk_id: int, new_course_ids: List[int]): # Renamed parameter and type-hinted
    """
    Updates the course enrollments for a student in the student_courses table.
    Deletes old enrollments and adds new ones.
    """
    try:
        _log_debug(f"Attempting to update enrollments in student_courses table for student PK ID: {student_pk_id}. New course IDs: {new_course_ids}")
        # First, delete existing enrollments for the student from student_courses table
        delete_query = "DELETE FROM student_courses WHERE student_id = :student_pk_id"
        get_db_manager().execute(delete_query, {"student_pk_id": student_pk_id})
        _log_debug(f"Deleted existing enrollments from student_courses table for student PK ID: {student_pk_id}")
        
        # Then, add the new enrollments
        for course_id in new_course_ids:
            enroll_student_in_course(student_pk_id, course_id)
        _log_debug(f"Successfully updated enrollments in student_courses table for student PK ID: {student_pk_id}")
        return True
    except Exception as e:
        _log_debug(f"Error updating student enrollments in student_courses table for student PK ID '{student_pk_id}': {e}")
        return False

def get_student_grades(student_pk_id: int):
    """
    Retrieves all grades for a specific student.
    """
    try:
        query = """
        SELECT g.grade, g.term, c.course_name, c.course_code, g.date_created
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        WHERE g.student_id = :student_pk_id
        ORDER BY g.date_created DESC
        """
        grades = get_db_manager().fetch_all(query, {"student_pk_id": student_pk_id})
        return grades
    except Exception as e:
        _log_debug(f"Error getting student grades for student PK ID '{student_pk_id}': {e}")
        return []
