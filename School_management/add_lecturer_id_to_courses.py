from db.database import get_db_manager

db = get_db_manager()
try:
    print("Checking 'lecturer_id' column in 'courses' table...")
    # Add column
    db.execute("ALTER TABLE courses ADD COLUMN IF NOT EXISTS lecturer_id VARCHAR(20)")
    # Add foreign key
    db.execute("ALTER TABLE courses ADD CONSTRAINT fk_courses_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL")
    print("Successfully fixed 'courses' table schema.")
except Exception as e:
    print(f"Failed! Error: {e}")
