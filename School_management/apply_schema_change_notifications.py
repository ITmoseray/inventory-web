from db.database import get_db_manager

def apply_migration():
    db = get_db_manager()
    try:
        query = """
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Sender
            target_type VARCHAR(20) NOT NULL, -- 'individual', 'course', 'all'
            target_id INTEGER, -- student_pk_id, course_id, or NULL
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        db.execute(query)
        print("Notifications table created successfully!")
    except Exception as e:
        print(f"Error creating notifications table: {e}")

if __name__ == "__main__":
    apply_migration()
