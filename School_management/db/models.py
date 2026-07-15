from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from flask_login import UserMixin
import bcrypt

Base = declarative_base()

class Tenant(Base):
    __tablename__ = 'tenants'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    subdomain = Column(String(50), unique=True)
    logo_url = Column(String)
    contact_email = Column(String(100))
    status = Column(String(20), default='active')
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    students = relationship("Student", back_populates="tenant")
    courses = relationship("Course", back_populates="tenant")
    users = relationship("User", back_populates="tenant")

class User(Base, UserMixin):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), default=1)
    username = Column(String(50), nullable=False)
    password = Column(String(255), nullable=False) # password_hash in DB is named 'password'
    role = Column(String(20), default='staff')
    is_approved = Column(Boolean, default=False)
    is_super_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="users")

    def set_password(self, password):
        """Hashes the password using bcrypt and stores it."""
        if password:
            self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Checks the password against the stored bcrypt hash."""
        if not self.password or not password:
            return False
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))
        except Exception:
            return False

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"

class Student(Base, UserMixin):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), default=1)
    student_id = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=True)
    date_of_birth = Column(DateTime)
    gender = Column(String)
    phone = Column(String)
    photo_path = Column(String)
    address = Column(String)
    status = Column(String, default='Active')
    lecturer_id = Column(String, ForeignKey('lecturers.lecturer_id', ondelete='SET NULL'), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="students")
    grades = relationship("Grade", back_populates="student")
    
    def set_password(self, password):
        """Hashes the password using bcrypt and stores it."""
        if password:
            self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Checks the password against the stored bcrypt hash."""
        if not self.password_hash or not password:
            return False
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            return False

    # Flask-Login integration
    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f"<Student {self.first_name} {self.last_name} ({self.student_id})>"

class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey('tenants.id'), default=1)
    course_name = Column(String, unique=True, nullable=False)
    course_code = Column(String, unique=True, nullable=False)
    description = Column(String)
    duration = Column(String)
    credits = Column(Integer)
    fee = Column(Integer)

    # Relationships
    tenant = relationship("Tenant", back_populates="courses")
    grades = relationship("Grade", back_populates="course")

    def __repr__(self):
        return f"<Course {self.course_name} ({self.course_code})>"

class Grade(Base):
    __tablename__ = 'grades'
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.id'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    grade = Column(String, nullable=False)
    term = Column(String, nullable=False)
    date_created = Column(DateTime, server_default=func.now())
    date_updated = Column(DateTime, onupdate=func.now())

    # Relationships
    student = relationship("Student", back_populates="grades")
    course = relationship("Course", back_populates="grades")

    def __repr__(self):
        return f"<Grade StudentID:{self.student_id} CourseID:{self.course_id} Grade:{self.grade}>"

class Lecturer(Base):
    __tablename__ = 'lecturers'
    id = Column(Integer, primary_key=True)
    lecturer_id = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True)
    phone = Column(String)
    department = Column(String)

    def __repr__(self):
        return f"<Lecturer {self.first_name} {self.last_name} ({self.lecturer_id})>"
