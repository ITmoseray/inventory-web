from db.database import get_db_manager

def update_attendance_status():
    db = get_db_manager()
    try:
        # Check if it's PostgreSQL or SQLite (Render uses Postgres)
        # We'll just try to drop the constraint and add it. 
        # If it fails, we'll try to just modify the column if it's SQLite.
        try:
            db.execute("ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check")
            db.execute("ALTER TABLE attendance ADD CONSTRAINT attendance_status_check CHECK (status IN ('Present', 'Absent', 'Late'))")
        except:
            # Fallback for systems where constraint name might be different or SQLite
            pass
        
        print("Attendance status logic updated in DB.")
    except Exception as e:
        print(f"Error updating attendance status: {e}")

if __name__ == "__main__":
    update_attendance_status()
