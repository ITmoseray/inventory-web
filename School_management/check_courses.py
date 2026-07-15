from db.database import get_db_manager

db = get_db_manager()
query = "SELECT id, course_name, course_code, duration, lecturer_id FROM courses"
courses = db.fetch_all(query)
for c in courses:
    print(f"ID: {c['id']}, Name: {c['course_name']}, Code: {c['course_code']}, Duration: {c['duration']}, Lecturer: {c['lecturer_id']}")
