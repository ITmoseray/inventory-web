from db.database import get_db_manager

def get_timetable_by_course(course_id: int):
    """
    Retrieves the timetable for a specific course.
    """
    try:
        query = """
        SELECT id, course_id, day_of_week, start_time, end_time, room
        FROM course_timetables
        WHERE course_id = :course_id
        ORDER BY CASE 
            WHEN day_of_week = 'Monday' THEN 1
            WHEN day_of_week = 'Tuesday' THEN 2
            WHEN day_of_week = 'Wednesday' THEN 3
            WHEN day_of_week = 'Thursday' THEN 4
            WHEN day_of_week = 'Friday' THEN 5
            WHEN day_of_week = 'Saturday' THEN 6
            WHEN day_of_week = 'Sunday' THEN 7
        END, start_time
        """
        records = get_db_manager().fetch_all(query, {"course_id": course_id})
        return records
    except Exception as e:
        print(f"Error getting timetable for course: {e}")
        return []

def add_timetable_entry(course_id, day_of_week, start_time, end_time, room=None):
    """
    Adds a new entry to the course timetable.
    """
    try:
        query = """
        INSERT INTO course_timetables (course_id, day_of_week, start_time, end_time, room)
        VALUES (:course_id, :day_of_week, :start_time, :end_time, :room)
        RETURNING id
        """
        new_id = get_db_manager().insert_and_return_id(query, {
            "course_id": course_id,
            "day_of_week": day_of_week,
            "start_time": start_time,
            "end_time": end_time,
            "room": room
        })
        return new_id
    except Exception as e:
        print(f"Error adding timetable entry: {e}")
        return None

def update_timetable_entry(entry_id, day_of_week, start_time, end_time, room=None):
    """
    Updates an existing timetable entry.
    """
    try:
        query = """
        UPDATE course_timetables
        SET day_of_week = :day_of_week, start_time = :start_time, end_time = :end_time, room = :room, updated_at = CURRENT_TIMESTAMP
        WHERE id = :entry_id
        """
        get_db_manager().execute(query, {
            "day_of_week": day_of_week,
            "start_time": start_time,
            "end_time": end_time,
            "room": room,
            "entry_id": entry_id
        })
        return True
    except Exception as e:
        print(f"Error updating timetable entry: {e}")
        return False

def delete_timetable_entry(entry_id):
    """
    Deletes a timetable entry.
    """
    try:
        query = "DELETE FROM course_timetables WHERE id = :entry_id"
        get_db_manager().execute(query, {"entry_id": entry_id})
        return True
    except Exception as e:
        print(f"Error deleting timetable entry: {e}")
        return False

def get_student_timetable(student_id: int):
    """
    Retrieves the full timetable for all courses a student is enrolled in.
    """
    try:
        query = """
        SELECT ct.day_of_week, ct.start_time, ct.end_time, ct.room, c.course_name, c.course_code
        FROM course_timetables ct
        JOIN student_courses sc ON ct.course_id = sc.course_id
        JOIN courses c ON ct.course_id = c.id
        WHERE sc.student_id = :student_id AND sc.status = 'Active'
        ORDER BY CASE 
            WHEN day_of_week = 'Monday' THEN 1
            WHEN day_of_week = 'Tuesday' THEN 2
            WHEN day_of_week = 'Wednesday' THEN 3
            WHEN day_of_week = 'Thursday' THEN 4
            WHEN day_of_week = 'Friday' THEN 5
            WHEN day_of_week = 'Saturday' THEN 6
            WHEN day_of_week = 'Sunday' THEN 7
        END, start_time
        """
        records = get_db_manager().fetch_all(query, {"student_id": student_id})
        return records
    except Exception as e:
        print(f"Error getting student timetable: {e}")
        return []
