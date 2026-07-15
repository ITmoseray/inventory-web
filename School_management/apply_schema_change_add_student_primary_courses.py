from db.database import DatabaseManager

def apply_student_primary_courses_fks():
    db = DatabaseManager()
    
    alter_statements = [
        """
        ALTER TABLE students
        ADD COLUMN primary_course_1_id INT,
        ADD COLUMN primary_course_2_id INT;
        """,
        """
        ALTER TABLE students
        ADD CONSTRAINT fk_primary_course_1
        FOREIGN KEY (primary_course_1_id) REFERENCES courses(id)
        ON DELETE SET NULL;
        """,
        """
        ALTER TABLE students
        ADD CONSTRAINT fk_primary_course_2
        FOREIGN KEY (primary_course_2_id) REFERENCES courses(id)
        ON DELETE SET NULL;
        """
    ]

    try:
        for statement in alter_statements:
            print(f"Executing: {statement.strip()}")
            db.execute(statement)
        print("Successfully applied schema changes to students table for primary courses.")
        return True
    except Exception as e:
        print(f"Error applying primary course FK schema changes to students table: {e}")
        return False

if __name__ == '__main__':
    if apply_student_primary_courses_fks():
        print("Primary course FK schema changes to students table applied successfully.")
    else:
        print("Failed to apply primary course FK schema changes to students table.")
