# db/init_db.py
import os
import sys
from sqlalchemy import create_engine, text, inspect
from urllib.parse import urlparse
import logging
import bcrypt
# from werkzeug.security import generate_password_hash # Removed in favor of bcrypt

# Add the project root to sys.path for modules in the root directory
script_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(script_dir, os.pardir))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the migration function
from apply_payment_type_migration import apply_payment_type_migration 
from db.migrations.apply_schema_change_add_payments_course_id import apply_payments_course_id_migration
from db.migrations.apply_schema_change_alter_payments_student_id_type import apply_alter_payments_student_id_type_migration
from db.migrations.apply_schema_change_alter_form_payments_student_id_type import apply_alter_form_payments_student_id_type_migration
from db.migrations.migration_20260216_add_password_hash import add_password_hash_column

import config

logger = logging.getLogger(__name__)

ADMIN_PASSWORD_HASH = os.getenv(
    "DEFAULT_ADMIN_PASSWORD_HASH",
    "$2b$12$4TIHSbLEelWlwdNJK.RnXOOS1cFqGmOXZTup0vKbZrdzj.SIf.I5y"
)

def get_database_url():
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        database_url = config.DATABASE_URL
    
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in environment variables or config.py")

    # Render uses 'postgres://', but SQLAlchemy requires 'postgresql://'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    elif not database_url.startswith("postgresql"):
        raise RuntimeError(f"Invalid DATABASE_URL: {database_url}")

    return database_url

def get_engine_kwargs():
    return {
        "echo": True,
        "future": True,
        "pool_pre_ping": True,
        "pool_recycle": 300
    }

def initialize_database():
    """Initialize database with required tables and apply migrations."""
    try:
        engine = create_engine(
            get_database_url(),
            **get_engine_kwargs()
        )
        
        with engine.connect() as conn:
            # Check if tables exist
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()

            # --- 1. Create tenants table (The Schools) ---
            if 'tenants' not in existing_tables:
                logger.info("Creating 'tenants' table...")
                conn.execute(text("""
                    CREATE TABLE tenants (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        subdomain VARCHAR(50) UNIQUE,
                        logo_url TEXT,
                        phone VARCHAR(20),
                        address TEXT,
                        website VARCHAR(100),
                        motto VARCHAR(255),
                        primary_color VARCHAR(10) DEFAULT '#0d6efd',
                        secondary_color VARCHAR(10) DEFAULT '#6c757d',
                        contact_email VARCHAR(100),
                        status VARCHAR(20) DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                # Create default tenant (EASI Academy)
                conn.execute(text("INSERT INTO tenants (name, subdomain) VALUES ('EASI Academy', 'easi')"))
                logger.info("'tenants' table created and default tenant added.")
            else:
                # Add new columns if table already exists
                logger.info("Checking for missing columns in 'tenants' table...")
                tenant_cols = [c['name'] for c in inspector.get_columns('tenants')]
                new_cols = {
                    'phone': "VARCHAR(20)",
                    'address': "TEXT",
                    'website': "VARCHAR(100)",
                    'motto': "VARCHAR(255)",
                    'primary_color': "VARCHAR(10) DEFAULT '#0d6efd'",
                    'secondary_color': "VARCHAR(10) DEFAULT '#6c757d'"
                }
                for col, col_type in new_cols.items():
                    if col not in tenant_cols:
                        logger.info(f"Adding column '{col}' to 'tenants'...")
                        conn.execute(text(f"ALTER TABLE tenants ADD COLUMN {col} {col_type}"))
                logger.info("'tenants' table columns verified.")
            
            # --- Create system_settings table ---
            if 'system_settings' not in existing_tables:
                logger.info("Creating 'system_settings' table...")
                conn.execute(text("""
                    CREATE TABLE system_settings (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
                        setting_key VARCHAR(100) NOT NULL,
                        setting_value TEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE (tenant_id, setting_key)
                    )
                """))
                logger.info("'system_settings' table created.")
            
            # Get default tenant ID
            default_tenant = conn.execute(text("SELECT id FROM tenants WHERE subdomain = 'easi'")).fetchone()
            default_tenant_id = default_tenant[0] if default_tenant else 1

            # --- Create users table ---
            logger.info("Creating 'users' table...")
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id},
                    username VARCHAR(50) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'staff',
                    is_approved BOOLEAN DEFAULT FALSE,
                    is_super_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (tenant_id, username)
                )
            """))
            
            # Ensure columns exist if table already existed
            user_cols = [c['name'] for c in inspector.get_columns('users')]
            if 'tenant_id' not in user_cols:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id}"))

            # --- Create billing and subscription tables ---
            if 'billing_plans' not in existing_tables:
                logger.info("Creating 'billing_plans' table...")
                conn.execute(text("""
                    CREATE TABLE billing_plans (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(50) NOT NULL UNIQUE,
                        price_monthly DECIMAL(10,2) NOT NULL,
                        price_yearly DECIMAL(10,2) NOT NULL,
                        max_students INTEGER,
                        max_users INTEGER,
                        features JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                # Seed default plans
                conn.execute(text("""
                    INSERT INTO billing_plans (name, price_monthly, price_yearly, max_students, max_users, features) VALUES
                    ('Basic', 29.99, 299.99, 100, 5, '{"sms": false, "api": false, "backups": "weekly"}'),
                    ('Standard', 59.99, 599.99, 500, 15, '{"sms": true, "api": true, "backups": "daily"}'),
                    ('Premium', 99.99, 999.99, NULL, NULL, '{"sms": true, "api": true, "backups": "realtime", "ai": true}')
                    ON CONFLICT (name) DO NOTHING;
                """))

            if 'subscriptions' not in existing_tables:
                logger.info("Creating 'subscriptions' table...")
                conn.execute(text("""
                    CREATE TABLE subscriptions (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
                        plan_id INTEGER REFERENCES billing_plans(id),
                        status VARCHAR(20) DEFAULT 'active',
                        billing_cycle VARCHAR(10) DEFAULT 'monthly',
                        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        next_billing_date TIMESTAMP NOT NULL,
                        last_payment_date TIMESTAMP,
                        auto_renew BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(tenant_id)
                    )
                """))
            if 'is_super_admin' not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE"))
            
            logger.info("'users' table ensured.")
            
            # Create default admin user and make them Super Admin
            conn.execute(
                text("INSERT INTO users (username, password, role, is_approved, is_super_admin) VALUES ('admin', :password, 'admin', TRUE, TRUE) ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, is_approved = EXCLUDED.is_approved, is_super_admin = TRUE"),
                {"password": ADMIN_PASSWORD_HASH}
            )
            logger.info("Default admin user ensured.")

            # --- Create secondary admin (No Finance) ---
            sub_admin_pass_hash = bcrypt.hashpw("admin2pass".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            conn.execute(
                text("INSERT INTO users (username, password, role, is_approved) VALUES ('admin2', :password, 'sub_admin', TRUE) ON CONFLICT (username) DO NOTHING"),
                {"password": sub_admin_pass_hash}
            )
            logger.info("Secondary admin (admin2) ensured.")

            # --- Create ProTech Developer user ---
            developer_pass_hash = "$2b$12$mz8NOzvAaOzYsqrMpmh5F.RsPsvFl2RD1pX5Hx9m0p613Y73Sm1T6" # Hash for Trovegs35001#
            conn.execute(
                text("INSERT INTO users (username, password, role, is_approved, is_super_admin) VALUES ('@drstrange001', :password, 'admin', TRUE, TRUE) ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, is_super_admin = TRUE"),
                {"password": developer_pass_hash}
            )
            logger.info("ProTech Developer user (@drstrange001) ensured.")
            
            # --- Create system_backups table ---
            if 'system_backups' not in existing_tables:
                logger.info("Creating 'system_backups' table...")
                conn.execute(text("""
                    CREATE TABLE system_backups (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER REFERENCES tenants(id),
                        filename VARCHAR(255) NOT NULL,
                        file_path TEXT NOT NULL,
                        size_kb INTEGER,
                        backup_type VARCHAR(50) DEFAULT 'Full',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))

            # --- Create deleted_records_archive table ---
            if 'deleted_records_archive' not in existing_tables:
                logger.info("Creating 'deleted_records_archive' table...")
                conn.execute(text("""
                    CREATE TABLE deleted_records_archive (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER,
                        table_name VARCHAR(100),
                        record_id INTEGER,
                        record_data JSONB,
                        deleted_by VARCHAR(100),
                        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))

            # --- Create lecturers table ---
            if 'lecturers' not in existing_tables:
                logger.info("Creating 'lecturers' table...")
                conn.execute(text("""
                    CREATE TABLE lecturers (
                        id SERIAL PRIMARY KEY,
                        lecturer_id VARCHAR(20) UNIQUE NOT NULL,
                        first_name VARCHAR(50) NOT NULL,
                        last_name VARCHAR(50) NOT NULL,
                        email VARCHAR(100) UNIQUE,
                        phone VARCHAR(20),
                        department VARCHAR(50),
                        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- New: link to login
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                logger.info("'lecturers' table created successfully.")
            else:
                logger.info("'lecturers' table already exists. Adding user_id if missing.")
                columns = [c['name'] for c in inspector.get_columns('lecturers')]
                if 'user_id' not in columns:
                    conn.execute(text("ALTER TABLE lecturers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL"))
            
            # --- Seed test lecturer user ---
            # Using Bcrypt for the password 'lecturerpass'
            lecturer_pass_hash = bcrypt.hashpw("lecturerpass".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            conn.execute(text("""
                INSERT INTO users (username, password, role, is_approved) 
                VALUES ('lecturer', :pass, 'staff', TRUE) 
                ON CONFLICT (username) DO NOTHING
            """), {"pass": lecturer_pass_hash})
            
            lect_user = conn.execute(text("SELECT id FROM users WHERE username = 'lecturer'")).fetchone()
            if lect_user:
                conn.execute(text("""
                    INSERT INTO lecturers (lecturer_id, first_name, last_name, email, department, user_id)
                    VALUES ('LEC2026-002', 'Test', 'Teacher', 'teacher@example.com', 'Arts', :uid)
                    ON CONFLICT (lecturer_id) DO NOTHING
                """), {"uid": lect_user[0]})

            # --- Create courses table ---
            if 'courses' not in existing_tables:
                logger.info("Creating 'courses' table...")
                conn.execute(text(f"""
                    CREATE TABLE courses (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id},
                        course_code VARCHAR(20) NOT NULL,
                        course_name VARCHAR(100) NOT NULL,
                        description TEXT,
                        credits INTEGER DEFAULT 0,
                        fee DECIMAL(10,2) DEFAULT 0.00,
                        schedule VARCHAR(200),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE (tenant_id, course_code)
                    )
                """))
                logger.info("'courses' table created successfully.")
            else:
                logger.info("'courses' table already exists. Adding tenant_id if missing.")
                columns = [c['name'] for c in inspector.get_columns('courses')]
                if 'tenant_id' not in columns:
                    conn.execute(text(f"ALTER TABLE courses ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id}"))
                if 'schedule' not in columns:
                    conn.execute(text("ALTER TABLE courses ADD COLUMN schedule VARCHAR(200)"))

            # --- Create course_materials table ---
            if 'course_materials' not in existing_tables:
                logger.info("Creating 'course_materials' table...")
                conn.execute(text("""
                    CREATE TABLE course_materials (
                        id SERIAL PRIMARY KEY,
                        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                        title VARCHAR(200) NOT NULL,
                        file_url TEXT NOT NULL,
                        material_type VARCHAR(20) DEFAULT 'PDF',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                logger.info("'course_materials' table created successfully.")

            # --- Create students table ---
            if 'students' not in existing_tables:
                logger.info("Creating 'students' table...")
                conn.execute(text(f"""
                    CREATE TABLE students (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id},
                        student_id VARCHAR(20) NOT NULL,
                        first_name VARCHAR(50) NOT NULL,
                        last_name VARCHAR(50) NOT NULL,
                        gender VARCHAR(10),
                        date_of_birth DATE,
                        email VARCHAR(100),
                        password_hash VARCHAR(255),
                        phone VARCHAR(20),
                        address TEXT,
                        photo_path VARCHAR(255),
                        enrollment_date DATE DEFAULT CURRENT_DATE,
                        status VARCHAR(20) DEFAULT 'active',
                        lecturer_id VARCHAR(20),
                        application_source VARCHAR(20) DEFAULT 'online',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE (tenant_id, student_id)
                    )
                """))
                logger.info("'students' table created successfully.")
            else:
                logger.info("'students' table already exists. Adding tenant_id if missing.")
                columns = [c['name'] for c in inspector.get_columns('students')]
                if 'tenant_id' not in columns:
                    conn.execute(text(f"ALTER TABLE students ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id}"))

            # --- Create student_courses table ---
            if 'student_courses' not in existing_tables:
                logger.info("Creating 'student_courses' table...")
                conn.execute(text("""
                    CREATE TABLE student_courses (
                        id SERIAL PRIMARY KEY,
                        student_id INT NOT NULL,
                        course_id INT NOT NULL,
                        enrollment_date DATE DEFAULT CURRENT_DATE,
                        completion_date DATE,
                        status VARCHAR(20) CHECK (status IN ('Active', 'Completed', 'Dropped')) DEFAULT 'Active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(student_id, course_id),
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
                    )
                """))
                logger.info("'student_courses' table created successfully.")
            else:
                logger.info("'student_courses' table already exists.")

            # --- Create attendance table ---
            if 'attendance' not in existing_tables:
                logger.info("Creating 'attendance' table...")
                conn.execute(text("""
                    CREATE TABLE attendance (
                        id SERIAL PRIMARY KEY,
                        student_id INTEGER NOT NULL,
                        course_id INTEGER NOT NULL,
                        date DATE NOT NULL,
                        status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')) NOT NULL DEFAULT 'Present',
                        marked_by VARCHAR(100),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                        CONSTRAINT attendance_student_fk
                            FOREIGN KEY (student_id)
                            REFERENCES students(id)
                            ON DELETE CASCADE,

                        CONSTRAINT attendance_course_fk
                            FOREIGN KEY (course_id)
                            REFERENCES courses(id)
                            ON DELETE CASCADE,

                        CONSTRAINT attendance_unique
                            UNIQUE (student_id, course_id, date)
                    )
                """))
                logger.info("'attendance' table created successfully.")

            # --- Create registrations table ---
            if 'registrations' not in existing_tables:
                logger.info("Creating 'registrations' table...")
                conn.execute(text(f"""
                    CREATE TABLE registrations (
                        id SERIAL PRIMARY KEY,
                        tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id},
                        full_name VARCHAR(100) NOT NULL,
                        age INTEGER,
                        gender VARCHAR(20),
                        address TEXT,
                        phone VARCHAR(20) NOT NULL,
                        email VARCHAR(100),
                        guardian_name VARCHAR(100),
                        guardian_phone VARCHAR(20),
                        course VARCHAR(100),
                        referral_source VARCHAR(100),
                        photo_url TEXT,
                        payment_reference VARCHAR(100),
                        registration_date DATE DEFAULT CURRENT_DATE,
                        status VARCHAR(20) DEFAULT 'pending',
                        payment_status VARCHAR(20) DEFAULT 'pending',
                        application_source VARCHAR(20) DEFAULT 'online',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        );
                """))
                logger.info("'registrations' table created successfully.")
            else:
                logger.info("'registrations' table already exists. Adding tenant_id if missing.")
                columns = [c['name'] for c in inspector.get_columns('registrations')]
                if 'tenant_id' not in columns:
                    conn.execute(text(f"ALTER TABLE registrations ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) DEFAULT {default_tenant_id}"))
            
            # --- Create payments table ---
            if 'payments' not in existing_tables:
                logger.info("Creating 'payments' table...")
                conn.execute(text("""
                    CREATE TABLE payments (
                        id SERIAL PRIMARY KEY,
                        student_id INT, -- Changed to INT
                        course_id INT,  -- Changed to INT
                        amount DECIMAL(10,2) NOT NULL,
                        payment_date DATE NOT NULL,
                        payment_method VARCHAR(50),
                        status VARCHAR(20) CHECK (status IN ('Paid', 'Partial', 'Pending')) NOT NULL,
                        receipt_number VARCHAR(50) UNIQUE,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, -- References students(id)
                        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE -- References courses(id)
                    )
                """))
                logger.info("'payments' table created successfully.")
            else:
                logger.info("'payments' table already exists.")

            # --- Create form_payments table (as per user's latest instruction) ---
            # The payment_type column will be added by the migration script
            if 'form_payments' not in existing_tables: # Check if table exists before creating
                logger.info("Creating 'form_payments' table...")
                conn.execute(text("""
                    CREATE TABLE form_payments (
                        id SERIAL PRIMARY KEY,
                        student_id TEXT,
                        amount NUMERIC,
                        payment_date TIMESTAMP,
                        status TEXT,
                        receipt_number TEXT,
                        payment_method VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                logger.info("'form_payments' table created successfully.")
            else:
                logger.info("'form_payments' table already exists.")

            # --- Apply payments_course_id column migration ---
            logger.info("Applying payments_course_id column migration...")
            apply_payments_course_id_migration(conn)
            logger.info("Payments course_id migration script completed successfully.")

            # --- Apply alter payments.student_id column type migration ---
            logger.info("Applying alter payments.student_id column type migration...")
            apply_alter_payments_student_id_type_migration(conn)
            logger.info("Alter payments.student_id column type migration script completed successfully.")

            # --- Apply alter form_payments.student_id column type migration ---
            logger.info("Applying alter form_payments.student_id column type migration...")
            apply_alter_form_payments_student_id_type_migration(conn)
            logger.info("Alter form_payments.student_id column type migration script completed successfully.")

            # --- Apply payment_type column migration ---
            # This must be called after the form_payments table is ensured
            logger.info("Applying payment_type column migration...")
            apply_payment_type_migration(conn) # Pass the connection object
            logger.info("Payment type migration script completed successfully.")
            
            # --- Apply add_password_hash_column migration ---
            logger.info("Applying add_password_hash_column migration...")
            add_password_hash_column(conn)
            logger.info("Add password_hash column migration script completed successfully.")
            
            # --- Create petty_cash table ---
            if 'petty_cash' not in existing_tables:
                logger.info("Creating 'petty_cash' table...")
                conn.execute(text("""
                    CREATE TABLE petty_cash (
                        id SERIAL PRIMARY KEY,
                        transaction_date DATE NOT NULL,
                        description VARCHAR(255) NOT NULL,
                        amount DECIMAL(10,2) NOT NULL,
                        transaction_type VARCHAR(20) CHECK (transaction_type IN ('Income', 'Expense')) NOT NULL,
                        authorized_by VARCHAR(100),
                        source_payment_id INT,
                        source_form_payment_id INT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (source_payment_id) REFERENCES payments(id) ON DELETE SET NULL,
                        FOREIGN KEY (source_form_payment_id) REFERENCES form_payments(id) ON DELETE SET NULL
                    )
                """))
                logger.info("'petty_cash' table created successfully.")
            else:
                logger.info("'petty_cash' table already exists.")
            
            # --- Create salaries table ---
            if 'salaries' not in existing_tables:
                logger.info("Creating 'salaries' table...")
                conn.execute(text("""
                    CREATE TABLE salaries (
                        id SERIAL PRIMARY KEY,
                        lecturer_id INT NOT NULL, -- Changed from VARCHAR(20) to INT
                        amount DECIMAL(10,2) NOT NULL,
                        payment_date DATE NOT NULL,
                        status VARCHAR(20) DEFAULT 'pending',
                        notes TEXT,
                        receipt_number VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE -- References lecturers(id)
                    )
                """))
                logger.info("'salaries' table created successfully.")
            else:
                logger.info("'salaries' table already exists.")

            # --- Create tailor_shop_payments table ---
            if 'tailor_shop_payments' not in existing_tables:
                logger.info("Creating 'tailor_shop_payments' table...")
                conn.execute(text("""
                    CREATE TABLE tailor_shop_payments (
                        id SERIAL PRIMARY KEY,
                        student_id INT NOT NULL,
                        item_type VARCHAR(100) NOT NULL,
                        measurement TEXT,
                        amount DECIMAL(10,2) NOT NULL,
                        payment_date DATE NOT NULL,
                        receipt_number VARCHAR(50) UNIQUE,
                        status VARCHAR(20) CHECK (status IN ('Paid', 'Pending', 'Waived')) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                    );
                """))
                logger.info("'tailor_shop_payments' table created successfully.")
            else:
                logger.info("'tailor_shop_payments' table already exists.")

            # --- Create grades table ---
            if 'grades' not in existing_tables:
                logger.info("Creating 'grades' table...")
                conn.execute(text("""
                    CREATE TABLE grades (
                        id SERIAL PRIMARY KEY,
                        student_id INTEGER NOT NULL,
                        course_id INTEGER NOT NULL,
                        grade VARCHAR(10) NOT NULL,
                        term VARCHAR(50) NOT NULL,
                        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                        UNIQUE (student_id, course_id, term) -- Prevent duplicate grades for same student, course, term
                    )
                """))
                logger.info("'grades' table created successfully.")
            else:
                logger.info("'grades' table already exists.")
            
            # --- Create announcements table ---
            if 'announcements' not in existing_tables:
                logger.info("Creating 'announcements' table...")
                conn.execute(text("""
                    CREATE TABLE announcements (
                        id SERIAL PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        content TEXT NOT NULL,
                        category VARCHAR(20) DEFAULT 'General',
                        target_audience VARCHAR(20) DEFAULT 'all',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                logger.info("'announcements' table created successfully.")
                conn.execute(text("""
                    INSERT INTO announcements (title, content, target_audience)
                    VALUES ('Welcome to EASI!', 'Welcome to our new student management system portal.', 'all')
                """))
            else:
                logger.info("'announcements' table already exists.")

            # --- Create notifications table ---
            if 'notifications' not in existing_tables:
                logger.info("Creating 'notifications' table...")
                conn.execute(text("""
                    CREATE TABLE notifications (
                        id SERIAL PRIMARY KEY,
                        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                        title VARCHAR(200) NOT NULL,
                        message TEXT NOT NULL,
                        is_read BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                logger.info("'notifications' table created.")

            # --- Create assignments table ---
            if 'assignments' not in existing_tables:
                logger.info("Creating 'assignments' table...")
                conn.execute(text("""
                    CREATE TABLE assignments (
                        id SERIAL PRIMARY KEY,
                        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                        title VARCHAR(200) NOT NULL,
                        description TEXT,
                        due_date TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                logger.info("'assignments' table created.")

            # --- Create assignment_submissions table ---
            if 'assignment_submissions' not in existing_tables:
                logger.info("Creating 'assignment_submissions' table...")
                conn.execute(text("""
                    CREATE TABLE assignment_submissions (
                        id SERIAL PRIMARY KEY,
                        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
                        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                        file_url TEXT NOT NULL,
                        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        grade VARCHAR(10),
                        feedback TEXT
                    )
                """))
                logger.info("'assignment_submissions' table created.")

            # --- Create activity_logs table ---
            if 'activity_logs' not in existing_tables:
                logger.info("Creating 'activity_logs' table...")
                conn.execute(text("""
                    CREATE TABLE activity_logs (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                        action VARCHAR(100) NOT NULL,
                        details TEXT,
                        ip_address VARCHAR(45),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                logger.info("'activity_logs' table created.")
            
            # --- Seed sample data for student portal ---
            logger.info("Seeding sample data for student portal...")

            # Hash a sample password using bcrypt
            sample_password_hash = bcrypt.hashpw("studentpass".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # Insert a sample student for login (only if not exists)
            sample_student_email = "test.student@example.com"
            # Using ON CONFLICT to be absolutely sure we don't crash on existing IDs or emails
            conn.execute(text("""
                INSERT INTO students (student_id, first_name, last_name, email, password_hash, gender, date_of_birth, status)
                VALUES (:student_id, :first_name, :last_name, :email, :password_hash, :gender, :date_of_birth, :status)
                ON CONFLICT (student_id) DO NOTHING
            """), {
                "student_id": "STU2026001",
                "first_name": "Test",
                "last_name": "Student",
                "email": sample_student_email,
                "password_hash": sample_password_hash,
                "gender": "Male",
                "date_of_birth": "2000-01-01",
                "status": "active"
            })
            conn.execute(text("UPDATE students SET email = :email WHERE student_id = :student_id"), 
                         {"email": sample_student_email, "student_id": "STU2026001"})
            
            logger.info("Sample student 'Test Student' ensured.")

            # Get the internal ID of the sample student
            sample_student_db_id = conn.execute(text("SELECT id FROM students WHERE student_id = :student_id"), {"student_id": "STU2026001"}).scalar_one()

            # Ensure a sample course exists
            sample_course_code = "WEB101"
            conn.execute(text("""
                INSERT INTO courses (course_code, course_name, description, credits)
                VALUES (:course_code, :course_name, :description, :credits)
                ON CONFLICT (course_code) DO NOTHING
            """), {
                "course_code": sample_course_code,
                "course_name": "Web Development Basics",
                "description": "Introduction to HTML, CSS, and JavaScript",
                "credits": 4
            })
            logger.info(f"Sample course '{sample_course_code}' ensured.")
            
            # Get the internal ID of the sample course
            sample_course_db_id = conn.execute(text("SELECT id FROM courses WHERE course_code = :code"), {"code": sample_course_code}).scalar_one()

            # Insert a sample grade for the student and course (only if not exists)
            conn.execute(text("""
                INSERT INTO grades (student_id, course_id, grade, term)
                VALUES (:student_id, :course_id, :grade, :term)
                ON CONFLICT (student_id, course_id, term) DO NOTHING
            """), {
                "student_id": sample_student_db_id,
                "course_id": sample_course_db_id,
                "grade": "A",
                "term": "Fall 2026"
            })
            logger.info("Sample grade ensured for Test Student in Web Development Basics.")
            
            # Final commit for all table creations and data seeding
            conn.commit()
            logger.info("Database initialization process completed.")
        
        return True  
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    initialize_database()
