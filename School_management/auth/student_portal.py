from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, send_file, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from db.database import get_db_manager
from db.models import Student, Course, Grade
from db import student_queries, course_queries, payment_queries, tailor_shop_queries, form_queries, tenant_queries
from utils.course_tracker import get_student_course_tracking
from utils.qr_generator import generate_student_qr
from utils import pdf_generator
from datetime import datetime
import os
from sqlalchemy.orm import joinedload

student_portal = Blueprint('student_portal', __name__, template_folder='../templates')

@student_portal.route('/student/login', methods=['GET', 'POST'])
def student_login():
    if current_user.is_authenticated and isinstance(current_user, Student):
        flash('You are already logged in.', 'info')
        return redirect(url_for('student_portal.student_dashboard'))
    
    tenants = tenant_queries.get_all_tenants()

    if request.method == 'POST':
        identifier = request.form.get('email') # This accepts Student ID or Email
        password = request.form.get('password')
        tenant_id = request.form.get('tenant_id')
        
        if not tenant_id:
            flash('Please select your school.', 'warning')
            return render_template('student_login.html', tenants=tenants)

        current_app.logger.info(f"Student login attempt for identifier: {identifier} at school {tenant_id}")

        with get_db_manager().get_session() as session:
            # Try to find by (email OR student_id) AND tenant_id
            student = session.query(Student).filter(
                ((Student.email == identifier) | (Student.student_id == identifier)) &
                (Student.tenant_id == tenant_id)
            ).first()

            if student:
                if student.check_password(password):
                    login_user(student)
                    # We store tenant_id in student session too for filtering
                    from flask import session as flask_session
                    flask_session['tenant_id'] = student.tenant_id
                    
                    current_app.logger.info(f"Student {identifier} logged in successfully.")
                    flash('Logged in successfully!', 'success')
                    next_page = request.args.get('next')
                    return redirect(next_page or url_for('student_portal.student_dashboard'))
                else:
                    flash('Invalid identifier or password.', 'danger')
            else:
                flash('No student found with these credentials in the selected school.', 'danger')
    
    return render_template('student_login.html', tenants=tenants)

@student_portal.route('/student/logout')
@login_required
def student_logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('student_portal.student_login'))

# Placeholder for dashboard (will implement in TODO 5)
@student_portal.route('/student/dashboard')
@login_required
def student_dashboard():
    # current_user is a Student object from db.models
    student_pk_id = current_user.id
    
    # Get student details using existing queries
    student_data = student_queries.get_student_by_pk_id(student_pk_id)
    
    if not student_data:
        flash('Student profile not found.', 'danger')
        logout_user()
        return redirect(url_for('student_portal.student_login'))
    
    # Get enrolled courses
    enrolled_courses = course_queries.get_courses_by_student_id(student_pk_id)
    
    # Get course payments
    course_payments = payment_queries.get_payments_by_student_id(student_pk_id)
    
    # Get tailoring payments
    tailoring_payments = tailor_shop_queries.get_tailor_payments_by_student_id(student_pk_id)
    
    # Get grades
    grades = student_queries.get_student_grades(student_pk_id)
    
    # Get attendance history
    attendance_history = student_queries.get_db_manager().fetch_all(
        """
        SELECT a.date, a.status, c.course_name, c.course_code
        FROM attendance a
        JOIN courses c ON a.course_id = c.id
        WHERE a.student_id = :student_pk_id
        ORDER BY a.date DESC
        """,
        {"student_pk_id": student_pk_id}
    )
    
    # Calculate attendance summary
    att_summary = {'Present': 0, 'Absent': 0, 'Late': 0, 'Excused': 0}
    for record in attendance_history:
        status = record.get('status')
        if status in att_summary:
            att_summary[status] += 1
            
    total_records = len(attendance_history)
    att_rate = 0
    if total_records > 0:
        # Rate = (Present + Late*0.5) / Total (Standard calculation)
        att_rate = round(((att_summary['Present'] + (att_summary['Late'] * 0.5)) / total_records) * 100)

    # Get course materials
    course_materials = []
    if enrolled_courses:
        course_ids = [c['id'] for c in enrolled_courses]
        course_materials = get_db_manager().fetch_all(
            "SELECT m.*, c.course_name FROM course_materials m JOIN courses c ON m.course_id = c.id WHERE m.course_id IN :course_ids",
            {"course_ids": tuple(course_ids)}
        )
    
    # Get announcements
    announcements = get_db_manager().fetch_all(
        "SELECT * FROM announcements WHERE target_audience IN ('all', 'students') ORDER BY created_at DESC"
    )

    # NEW: Get Notifications (targeted to all, their course, or them personally)
    course_ids = [c['id'] for c in enrolled_courses] if enrolled_courses else [-1]
    notifications = get_db_manager().fetch_all(
        """
        SELECT * FROM notifications 
        WHERE (target_type = 'all')
        OR (target_type = 'course' AND target_id IN :course_ids)
        OR (target_type = 'individual' AND target_id = :sid)
        ORDER BY created_at DESC LIMIT 10
        """,
        {"course_ids": tuple(course_ids), "sid": student_pk_id}
    )

    # NEW: Get Assignments
    assignments_raw = []
    if enrolled_courses:
        course_ids = [c['id'] for c in enrolled_courses]
        assignments_raw = get_db_manager().fetch_all(
            """
            SELECT a.*, c.course_name, 
            (SELECT submitted_at FROM assignment_submissions WHERE assignment_id = a.id AND student_id = :sid LIMIT 1) as submitted_at
            FROM assignments a 
            JOIN courses c ON a.course_id = c.id 
            WHERE a.course_id IN :cids 
            ORDER BY a.due_date ASC
            """,
            {"cids": tuple(course_ids), "sid": student_pk_id}
        )
    
    # Format assignment dates for template
    assignments = []
    for a in assignments_raw:
        a_dict = dict(a)
        if a_dict.get('due_date') and hasattr(a_dict['due_date'], 'strftime'):
            a_dict['due_date_str'] = a_dict['due_date'].strftime('%d %b %Y')
        else:
            a_dict['due_date_str'] = str(a_dict.get('due_date', 'N/A'))
            
        if a_dict.get('submitted_at') and hasattr(a_dict['submitted_at'], 'strftime'):
            a_dict['submitted_at_str'] = a_dict['submitted_at'].strftime('%d %b %H:%M')
        else:
            a_dict['submitted_at_str'] = None
        assignments.append(a_dict)

    # NEW: Get Student Timetable
    timetable = []
    if enrolled_courses:
        course_ids = [c['id'] for c in enrolled_courses]
        timetable = get_db_manager().fetch_all(
            """
            SELECT ct.*, c.course_name, c.course_code
            FROM course_timetables ct
            JOIN courses c ON ct.course_id = c.id
            JOIN student_courses sc ON ct.course_id = sc.course_id
            WHERE ct.course_id IN :cids AND sc.student_id = :sid AND sc.status = 'Active'
            ORDER BY CASE 
                WHEN day_of_week = 'Monday' THEN 1
                WHEN day_of_week = 'Tuesday' THEN 2
                WHEN day_of_week = 'Wednesday' THEN 3
                WHEN day_of_week = 'Thursday' THEN 4
                WHEN day_of_week = 'Friday' THEN 5
                WHEN day_of_week = 'Saturday' THEN 6
                WHEN day_of_week = 'Sunday' THEN 7
            END, start_time
            """,
            {"cids": tuple(course_ids), "sid": student_pk_id}
        )
            
    # NEW: Get course tracking information
    course_tracking = get_student_course_tracking(
        student_pk_id, 
        full_name=f"{student_data['first_name']} {student_data['last_name']}",
        phone=student_data['phone']
    )
            
    return render_template('student_dashboard.html', 
                           student=student_data, 
                           enrolled_courses=enrolled_courses,
                           course_payments=course_payments,
                           tailoring_payments=tailoring_payments,
                           grades=grades,
                           attendance_history=attendance_history,
                           att_summary=att_summary,
                           att_rate=att_rate,
                           course_materials=course_materials,
                           announcements=announcements,
                           notifications=notifications,
                           assignments=assignments,
                           timetable=timetable,
                           course_tracking=course_tracking)

@student_portal.route('/student/ai-chat', methods=['POST'])
@login_required
def ai_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        # Gather deep context for Trove
        from utils.course_tracker import get_student_course_tracking
        tracking = get_student_course_tracking(current_user.id)
        
        # Calculate rates for AI context
        total_bal = sum(t['balance'] for t in tracking)
        courses = [t['course_name'] for t in tracking]
        
        # Build context object
        context = {
            "total_balance": f"{total_bal:,.0f}",
            "enrolled_courses": courses,
            "status": current_user.status,
            "student_id": current_user.student_id
        }
        
        # Call Trove Brain
        from utils.ai_engine import ask_trove
        reply = ask_trove(
            user_role="Student",
            user_name=current_user.first_name,
            context_data=context,
            user_query=user_message
        )

        return jsonify({"reply": reply})
    except Exception as e:
        current_app.logger.error(f"Trove Student Error: {e}")
        return jsonify({"reply": "Trove is momentarily offline. Please check back shortly."}), 500

@student_portal.route('/student/assignment/submit/<int:assignment_id>', methods=['POST'])
@login_required
def submit_assignment(assignment_id):
    if 'file' not in request.files:
        flash('No file selected.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))

    # Upload to Cloudinary or Local
    import cloudinary.uploader
    import os
    from werkzeug.utils import secure_filename
    
    file_url = ""
    if os.getenv('CLOUDINARY_CLOUD_NAME'):
        try:
            upload_result = cloudinary.uploader.upload(file, folder="submissions", resource_type="auto")
            file_url = upload_result.get('secure_url')
        except Exception as e:
            flash(f'Upload failed: {e}', 'danger')
            return redirect(url_for('student_portal.student_dashboard'))
    else:
        filename = secure_filename(file.filename)
        path = os.path.join('static', 'submissions')
        if not os.path.exists(path): os.makedirs(path)
        file.save(os.path.join(path, filename))
        file_url = f"/static/submissions/{filename}"

    # Save submission record
    get_db_manager().execute(
        "INSERT INTO assignment_submissions (assignment_id, student_id, file_url) VALUES (:aid, :sid, :url)",
        {"aid": assignment_id, "sid": current_user.id, "url": file_url}
    )
    
    flash('Assignment submitted successfully!', 'success')
    return redirect(url_for('student_portal.student_dashboard'))

@student_portal.route('/student/id-card')
@login_required
def view_my_id_card():
    student_pk_id = current_user.id
    student_data = student_queries.get_student_by_pk_id(student_pk_id)
    
    if not student_data:
        flash('Student profile not found.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))
        
    # Get all enrolled courses
    enrolled_courses = course_queries.get_courses_by_student_id(student_pk_id)
    primary_course = enrolled_courses[0] if enrolled_courses else {'course_name': 'No Course Enrolled'}

    # Generate QR Code
    qr_web_path = generate_student_qr(student_data['student_id'])
    
    return render_template('student_id_card.html', 
                           student=student_data, 
                           primary_course=primary_course,
                           qr_code_path=qr_web_path)

@student_portal.route('/student/receipt/course/<int:payment_id>')
@login_required
def download_course_receipt(payment_id):
    payment = payment_queries.get_payment_by_id(payment_id)
    if not payment or payment['student_id'] != current_user.id:
        flash('Payment not found or access denied.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))

    student = student_queries.get_student_by_pk_id(current_user.id)
    course = course_queries.get_course_by_id(payment['course_id'])

    if isinstance(payment['payment_date'], datetime):
        payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')

    logo_path = os.path.join(current_app.root_path, 'assets', 'LOGO.jpeg')
    output_dir = os.path.join(current_app.root_path, 'temp_receipts')
    
    pdf_path = pdf_generator.generate_payment_receipt_pdf(
        payment, student, course['course_name'], 
        output_path=output_dir, logo_path=logo_path
    )

    if pdf_path:
        return send_file(pdf_path, as_attachment=True, mimetype='application/pdf')
    else:
        flash('Failed to generate receipt.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))

@student_portal.route('/student/receipt/tailoring/<int:payment_id>')
@login_required
def download_tailoring_receipt(payment_id):
    payment = tailor_shop_queries.get_tailor_payment_by_id(payment_id)
    # The tailor query return student_pk_id usually in these dicts
    if not payment or payment['student_id'] != current_user.id:
        flash('Payment not found or access denied.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))

    student = {
        'student_id': payment['student_unique_id'],
        'first_name': payment['first_name'],
        'last_name': payment['last_name']
    }
    
    if isinstance(payment['payment_date'], datetime):
        payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')

    logo_path = os.path.join(current_app.root_path, 'assets', 'LOGO.jpeg')
    output_dir = os.path.join(current_app.root_path, 'temp_receipts')
    
    pdf_path = pdf_generator.generate_tailoring_receipt_pdf(
        payment, student, payment['item_type'], 
        output_path=output_dir, logo_path=logo_path
    )

    if pdf_path:
        return send_file(pdf_path, as_attachment=True, mimetype='application/pdf')
    else:
        flash('Failed to generate receipt.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))

@student_portal.route('/student/receipt/form/<int:payment_id>')
@login_required
def download_form_receipt(payment_id):
    payment = form_queries.get_form_payment_by_id(payment_id)
    # Check if student matches. The query returns student_id (internal PK)
    # We need to verify if this record's student_identifier (the student_id string) 
    # belongs to current_user.
    
    student_data = student_queries.get_student_by_pk_id(current_user.id)
    if not payment or payment['student_identifier'] != student_data['student_id']:
        flash('Payment not found or access denied.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))

    if isinstance(payment['payment_date'], datetime):
        payment['payment_date'] = payment['payment_date'].strftime('%Y-%m-%d')

    logo_path = os.path.join(current_app.root_path, 'assets', 'LOGO.jpeg')
    output_dir = os.path.join(current_app.root_path, 'temp_receipts')
    
    pdf_path = pdf_generator.generate_form_receipt_pdf(
        payment, student_data, 
        output_path=output_dir, logo_path=logo_path
    )

    if pdf_path:
        return send_file(pdf_path, as_attachment=True, mimetype='application/pdf')
    else:
        flash('Failed to generate receipt.', 'danger')
        return redirect(url_for('student_portal.student_dashboard'))

