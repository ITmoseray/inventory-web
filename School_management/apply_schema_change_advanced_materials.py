from db.database import get_db_manager

def apply_migration():
    db = get_db_manager()
    try:
        # Add 'tag' column
        db.execute("ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS tag VARCHAR(50)")
        # Add 'deadline' column
        db.execute("ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS deadline TIMESTAMP")
        print("Migration for course_materials successful!")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    apply_migration()
