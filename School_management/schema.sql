-- PostgreSQL compatible schema for student_management

-- Lecturers table
CREATE TABLE IF NOT EXISTS lecturers (
    id SERIAL PRIMARY KEY,
    lecturer_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salaries table
CREATE TABLE IF NOT EXISTS salaries (
    id SERIAL PRIMARY KEY,
    lecturer_id INT NOT NULL, -- Changed from VARCHAR(20) to INT
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Paid', 'Pending')) NOT NULL,
    receipt_number VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE -- References lecturers(id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('admin', 'staff')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    photo_path VARCHAR(255),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lecturer_id VARCHAR(20) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL,
    application_source VARCHAR(20) DEFAULT 'online'
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    description TEXT,
    duration TEXT NOT NULL,
    fee DECIMAL(10,2) NOT NULL,
    schedule VARCHAR(200), -- New: Class schedule (e.g., 'Mon-Fri 4:00 PM')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lecturer_id VARCHAR(20),
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL
);

-- Course Materials table
CREATE TABLE IF NOT EXISTS course_materials (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    file_url TEXT NOT NULL, -- URL to Cloudinary or local path
    material_type VARCHAR(20) DEFAULT 'PDF', -- 'PDF', 'Video', 'Link', 'Doc'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Courses (Enrollments) table - Now the primary enrollment table
CREATE TABLE IF NOT EXISTS student_courses (
    id SERIAL PRIMARY KEY, -- Add primary key for individual record identification
    student_id INT NOT NULL, -- Changed from VARCHAR(20) to INT
    course_id INT NOT NULL, -- Changed from VARCHAR(50) course_code to INT course_id
    enrollment_date DATE DEFAULT CURRENT_DATE, -- Added
    completion_date DATE, -- Added
    status VARCHAR(20) CHECK (status IN ('Active', 'Completed', 'Dropped')) DEFAULT 'Active', -- Added
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id), -- Changed unique constraint
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, -- References students(id)
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE -- References courses(id)
);



-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id INT,
    course_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('Paid', 'Partial', 'Pending')) NOT NULL,
    receipt_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Form Payments table
CREATE TABLE IF NOT EXISTS form_payments (
    id SERIAL PRIMARY KEY,
    student_id INT,
    form_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    receipt_number VARCHAR(50) UNIQUE,
    payment_method VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('Paid', 'Pending', 'Waived')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')) NOT NULL DEFAULT 'Present', -- Broader status options
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(20) DEFAULT 'all', -- 'all', 'students', 'staff'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application Settings table
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
);

-- Petty Cash table
CREATE TABLE IF NOT EXISTS petty_cash (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('Income', 'Expense')) NOT NULL,
    authorized_by VARCHAR(100),
    source_payment_id INT,
    source_form_payment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    FOREIGN KEY (source_form_payment_id) REFERENCES form_payments(id) ON DELETE SET NULL
);

-- Insert sample data
-- Note: The passwords are the same as before, hashed with bcrypt.
INSERT INTO users (username, password, role, is_approved) VALUES
('admin', '$2b$12$lAQlZYeNUbpjL7/3/Ojm7eMxMsi.aY53LRgMYcfIshYlegPWHCyi6', 'admin', TRUE),
('staff', '$2b$12$lAQlZYeNUbpjL7/3/Ojm7eMxMsi.aY53LRgMYcfIshYlegPWHCyi6', 'staff', TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO courses (course_name, course_code, description, duration, fee) VALUES
('Computer Science', 'CS001', 'Introduction to Computer Science and Programming', 6, 1500000.00),
('Business Management', 'BM001', 'Fundamentals of Business Management', 4, 1000000.00),
('Web Development', 'WD001', 'Full Stack Web Development', 8, 2000000.00);

