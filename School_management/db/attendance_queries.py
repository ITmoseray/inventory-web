from db.database import get_db_manager # Use the global get_db_manager function
from sqlalchemy import text

def get_all_attendance_records(tenant_id=None):
    """
    Retrieves all attendance records with student and course details,
    filtered by tenant_id if provided.
    """
    try:
        query = """
        SELECT a.id, a.date, a.status, a.marked_by, a.arrival_time,
               s.student_id AS student_unique_id, s.first_name, s.last_name,
               c.course_name, c.course_code AS course_unique_code
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN courses c ON a.course_id = c.id
        """
        params = {}
        if tenant_id:
            query += " WHERE s.tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY a.date DESC, c.course_name, s.last_name, s.first_name"
        records = get_db_manager().fetch_all(query, params)
        return records
    except Exception as e:
        print(f"Error getting all attendance records: {e}")
        return []

def search_attendance_records(search_query, tenant_id=None):
    """
    Searches for attendance records by student name, student unique ID, or course name/code,
    filtered by tenant_id if provided.
    """
    try:
        query = """
        SELECT a.id, a.date, a.status, a.marked_by, a.arrival_time,
               s.student_id AS student_unique_id, s.first_name, s.last_name,
               c.course_name, c.course_code AS course_unique_code
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN courses c ON a.course_id = c.id
        WHERE (s.first_name ILIKE :search_pattern OR s.last_name ILIKE :search_pattern OR s.student_id ILIKE :search_pattern OR c.course_name ILIKE :search_pattern OR c.course_code ILIKE :search_pattern)
        """
        params = {"search_pattern": f"%{search_query}%"}
        if tenant_id:
            query += " AND s.tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY a.date DESC, c.course_name, s.last_name, s.first_name"
        records = get_db_manager().fetch_all(query, params)
        return records
    except Exception as e:
        print(f"Error searching attendance records: {e}")
        return []

def get_attendance_for_date_and_course(date: str, course_id: int): # Changed parameter to course_id (INT)
    """
    Retrieves attendance records for a specific date and course.
    """
    try:
        query = """
        SELECT a.id, a.student_id, a.status, a.arrival_time
        FROM attendance a
        WHERE a.date = :date AND a.course_id = :course_id -- Use course_id
        """
        records = get_db_manager().fetch_all(query, {"date": date, "course_id": course_id})
        return records
    except Exception as e:
        print(f"Error getting attendance for date and course: {e}")
        return []

def save_attendance_record(student_id: int, course_id: int, date, status, arrival_time=None, marked_by="System"): # Changed parameters to INT
    """
    Saves an attendance record, updating if it exists, inserting if new.
    """
    try:
        # Check if record already exists
        check_query = """
        SELECT id FROM attendance
        WHERE student_id = :student_id AND course_id = :course_id AND date = :date
        """
        existing_record = get_db_manager().fetch_one(check_query, {
            "student_id": student_id,
            "course_id": course_id,
            "date": date
        })

        if existing_record:
            # Update existing record
            update_query = """
            UPDATE attendance
            SET status = :status, arrival_time = :arrival_time, marked_by = :marked_by, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
            """
            get_db_manager().execute(update_query, {
                "status": status,
                "arrival_time": arrival_time,
                "marked_by": marked_by,
                "id": existing_record['id']
            })
        else:
            # Insert new record
            insert_query = """
            INSERT INTO attendance (student_id, course_id, date, status, arrival_time, marked_by)
            VALUES (:student_id, :course_id, :date, :status, :arrival_time, :marked_by)
            RETURNING id
            """
            new_id = get_db_manager().insert_and_return_id(insert_query, {
                "student_id": student_id,
                "course_id": course_id,
                "date": date,
                "status": status,
                "arrival_time": arrival_time,
                "marked_by": marked_by
            })
            return new_id
        return True
    except Exception as e:
        print(f"Error saving attendance record: {e}")
        return False
def delete_attendance_record(record_id):
    """
    Deletes an attendance record from the database.
    """
    try:
        query = "DELETE FROM attendance WHERE id = :record_id"
        get_db_manager().execute(query, {"record_id": record_id})
        return True
    except Exception as e:
        print(f"Error deleting attendance record: {e}")
        return False

def get_student_attendance_history(student_pk_id: int):
    """
    Retrieves the full attendance history for a specific student.
    """
    try:
        query = """
        SELECT a.date, a.status, c.course_name, c.course_code
        FROM attendance a
        JOIN courses c ON a.course_id = c.id
        WHERE a.student_id = :student_pk_id
        ORDER BY a.date DESC
        """
        records = get_db_manager().fetch_all(query, {"student_pk_id": student_pk_id})
        return records
    except Exception as e:
        print(f"Error getting student attendance history: {e}")
        return []

def get_attendance_record_by_id(record_id):

    """

    Retrieves a single attendance record by its ID, along with student and course details.

    """

    try:

        query = """

        SELECT a.id, a.date, a.status, a.marked_by,

               s.student_id AS student_unique_id, s.first_name, s.last_name,

               c.course_name, c.course_code AS course_unique_code

        FROM attendance a

        JOIN students s ON a.student_id = s.id -- Join on s.id

        JOIN courses c ON a.course_id = c.id -- Join on c.id

        WHERE a.id = :record_id

        """

        record = get_db_manager().fetch_one(query, {"record_id": record_id})

        return record

    except Exception as e:

        print(f"Error getting attendance record by ID: {e}")

        return None