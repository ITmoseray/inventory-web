from db.database import get_db_manager # Import the global get_db_manager function
from typing import Optional, List, Any

def get_all_courses(tenant_id=None):
    """
    Retrieves all courses from the database, optionally filtered by tenant.
    """
    try:
        if tenant_id:
            query = "SELECT id, course_name, course_code, description, duration, credits, fee, schedule FROM courses WHERE tenant_id = :tenant_id ORDER BY course_name"
            courses = get_db_manager().fetch_all(query, {"tenant_id": tenant_id})
        else:
            query = "SELECT id, course_name, course_code, description, duration, credits, fee, schedule FROM courses ORDER BY course_name"
            courses = get_db_manager().fetch_all(query)
        return courses
    except Exception as e:
        print(f"Error getting all courses: {e}")
        return []

def search_courses(search_query, tenant_id: Optional[int] = None):
    """
    Searches for courses by course_name, course_code, or description, 
    filtered by tenant_id if provided.
    """
    try:
        query = """
        SELECT id, course_name, course_code, description, duration, credits, fee, schedule
        FROM courses
        WHERE (course_name ILIKE :search_pattern OR course_code ILIKE :search_pattern OR description ILIKE :search_pattern)
        """
        params = {"search_pattern": f"%{search_query}%"}
        if tenant_id:
            query += " AND tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY created_at DESC"
        courses = get_db_manager().fetch_all(query, params)
        return courses
    except Exception as e:
        print(f"Error searching courses: {e}")
        return []

def add_course(course_name, course_code, description, duration="Unknown", credits=0, fee=0.00, schedule=None, tenant_id=None):
    """
    Adds a new course to the database.
    """
    try:
        query = """
        INSERT INTO courses (course_name, course_code, description, duration, credits, fee, schedule, tenant_id)
        VALUES (:course_name, :course_code, :description, :duration, :credits, :fee, :schedule, :tenant_id)
        RETURNING id
        """
        result = get_db_manager().insert_and_return_id(query, {
            "course_name": course_name,
            "course_code": course_code,
            "description": description,
            "duration": duration,
            "credits": credits,
            "fee": fee,
            "schedule": schedule,
            "tenant_id": tenant_id
        })
        return result
    except Exception as e:
        print(f"Error adding course: {e}")
        return None

def get_course_by_id(course_id):
    """
    Retrieves a single course's details by its internal primary key ID.
    """
    try:
        query = "SELECT id, course_name, course_code, description, duration, credits, fee, schedule, tenant_id FROM courses WHERE id = :course_id"
        course = get_db_manager().fetch_one(query, {"course_id": course_id})
        return course
    except Exception as e:
        print(f"Error getting course by ID: {e}")
        return None

def get_course_by_code(course_code, tenant_id: Optional[int] = None):
    """
    Retrieves a single course's details by its course_code and tenant_id.
    """
    try:
        query = "SELECT id, course_name, course_code, description, duration, credits, fee, schedule FROM courses WHERE course_code = :course_code"
        params = {"course_code": course_code}
        if tenant_id:
            query += " AND tenant_id = :tid"
            params["tid"] = tenant_id
            
        course = get_db_manager().fetch_one(query, params)
        return course
    except Exception as e:
        print(f"Error getting course by code: {e}")
        return None

def update_course(course_id, course_name, course_code, description, duration, credits, fee, schedule=None):
    """
    Updates an existing course's details.
    """
    try:
        query = """
        UPDATE courses
        SET course_name = :course_name, course_code = :course_code, description = :description, duration = :duration, credits = :credits, fee = :fee, schedule = :schedule, updated_at = CURRENT_TIMESTAMP
        WHERE id = :course_id
        """
        get_db_manager().execute(query, {
            "course_name": course_name,
            "course_code": course_code,
            "description": description,
            "duration": duration,
            "credits": credits,
            "fee": fee,
            "schedule": schedule,
            "course_id": course_id
        })
        return True
    except Exception as e:
        print(f"Error updating course: {e}")
        return False

def delete_course(course_id, performed_by=None):
    """
    Deletes a course from the database after archiving it.
    """
    try:
        from db.backup_queries import archive_record
        course = get_course_by_id(course_id)
        if not course: return False

        # Archive for developer record keeping
        archive_record(
            tenant_id=course.get('tenant_id'),
            table_name='courses',
            record_id=course_id,
            record_data=course,
            deleted_by=performed_by
        )

        query = "DELETE FROM courses WHERE id = :course_id"
        get_db_manager().execute(query, {"course_id": course_id})
        return True
    except Exception as e:
        print(f"Error deleting course: {e}")
        return False

def get_courses_by_student_id(student_id: int):
    """
    Retrieves all courses a student is enrolled in.
    """
    try:
        query = """
        SELECT c.id, c.course_name, c.course_code, c.duration, c.credits, c.fee, c.schedule
        FROM courses c
        JOIN student_courses sc ON c.id = sc.course_id
        WHERE sc.student_id = :student_id
        ORDER BY c.course_name
        """
        courses = get_db_manager().fetch_all(query, {"student_id": student_id})
        return courses
    except Exception as e:
        print(f"Error getting courses by student ID: {e}")
        return []

def get_course_code_by_name(course_name):
    """
    Retrieves the course code for a given course name.
    """
    try:
        query = "SELECT course_code FROM courses WHERE course_name = :course_name"
        result = get_db_manager().fetch_one(query, {"course_name": course_name})
        return result['course_code'] if result else None
    except Exception as e:
        print(f"Error getting course code by name: {e}")
        return None
