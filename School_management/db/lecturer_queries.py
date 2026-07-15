from db.database import get_db_manager # Import the global get_db_manager function
from datetime import datetime
import random
import string

class LecturerManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LecturerManager, cls).__new__(cls)
            # Use the globally available get_db_manager function to get the instance
            cls._instance.db_manager = get_db_manager()
        return cls._instance

    def _generate_unique_lecturer_id(self):
        year = datetime.now().year
        query = """
            SELECT lecturer_id FROM lecturers
            WHERE lecturer_id LIKE :prefix
            ORDER BY lecturer_id DESC
            LIMIT 1
        """
        result = self.db_manager.fetch_one(query, {"prefix": f"LEC{year}-%"})

        last_id_num = 0
        if result:
            last_id = result['lecturer_id']
            try:
                last_id_num = int(last_id.split('-')[1])
            except (ValueError, IndexError):
                pass

        new_num = last_id_num + 1
        return f"LEC{year}-{new_num:03d}"

    def create_lecturer(self, first_name, last_name, email, phone, department, user_id=None):
        lecturer_id = self._generate_unique_lecturer_id()
        try:
            query = """
            INSERT INTO lecturers (lecturer_id, first_name, last_name, email, phone, department, user_id)
            VALUES (:lecturer_id, :first_name, :last_name, :email, :phone, :department, :user_id)
            RETURNING lecturer_id
            """
            # Use fetch_one as it returns scalar_one_or_none for RETURNING
            returned_lecturer_id = self.db_manager.insert_and_return_id(query, {
                "lecturer_id": lecturer_id, 
                "first_name": first_name, 
                "last_name": last_name, 
                "email": email, 
                "phone": phone, 
                "department": department,
                "user_id": user_id
            })
            return returned_lecturer_id if returned_lecturer_id else None
        except Exception as e:
            print(f"Error adding lecturer: {e}")
            return None

    def get_all_lecturers(self, tenant_id=None):
        query = """
        SELECT l.id, l.lecturer_id, l.first_name, l.last_name, l.first_name || ' ' || l.last_name AS full_name, 
               l.email, l.phone, l.department, l.user_id 
        FROM lecturers l
        LEFT JOIN users u ON l.user_id = u.id
        """
        params = {}
        if tenant_id:
            query += " WHERE u.tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY l.last_name, l.first_name"
        return self.db_manager.fetch_all(query, params)

    def search_lecturers(self, search_query, tenant_id=None):
        query = """
        SELECT l.id, l.lecturer_id, l.first_name, l.last_name, l.email, l.phone, l.department, l.user_id
        FROM lecturers l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE (l.lecturer_id LIKE :search_pattern OR l.first_name LIKE :search_pattern OR l.last_name LIKE :search_pattern OR l.email LIKE :search_pattern OR l.phone LIKE :search_pattern OR l.department LIKE :search_pattern)
        """
        params = {"search_pattern": f"%{search_query}%"}
        if tenant_id:
            query += " AND u.tenant_id = :tid"
            params["tid"] = tenant_id
            
        query += " ORDER BY l.last_name, l.first_name"
        return self.db_manager.fetch_all(query, params)

    def get_lecturer_by_pk_id(self, pk_id):
        query = "SELECT id, lecturer_id, first_name, last_name, email, phone, department, user_id FROM lecturers WHERE id = :pk_id"
        return self.db_manager.fetch_one(query, {"pk_id": pk_id})

    def get_lecturer_by_lecturer_id(self, lecturer_id):
        query = "SELECT id, lecturer_id, first_name, last_name, email, phone, department, user_id FROM lecturers WHERE lecturer_id = :lecturer_id"
        return self.db_manager.fetch_one(query, {"lecturer_id": lecturer_id})

    def update_lecturer(self, pk_id, lecturer_id, first_name, last_name, email, phone, department):
        try:
            query = """
            UPDATE lecturers
            SET lecturer_id = :lecturer_id, first_name = :first_name, last_name = :last_name, email = :email, phone = :phone, department = :department, updated_at = CURRENT_TIMESTAMP
            WHERE id = :pk_id
            """
            self.db_manager.execute(query, {
                "lecturer_id": lecturer_id, 
                "first_name": first_name, 
                "last_name": last_name, 
                "email": email, 
                "phone": phone, 
                "department": department, 
                "pk_id": pk_id
            })
            return True
        except Exception as e:
            print(f"Error updating lecturer: {e}")
            return False

    def delete_lecturer(self, pk_id):
        try:
            # First, check if the lecturer has a linked user account and delete it if needed? 
            # Or just NULL it out? Schema says ON DELETE SET NULL for user_id in lecturers.
            # But what about the 'users' table? Let's just delete the lecturer record.
            query = "DELETE FROM lecturers WHERE id = :pk_id"
            self.db_manager.execute(query, {"pk_id": pk_id})
            return True
        except Exception as e:
            print(f"Error deleting lecturer: {e}")
            return False

    def get_lecturer_count(self):
        query = "SELECT COUNT(*) as count FROM lecturers"
        return self.db_manager.fetch_all(query)

    def get_lecturer_by_user_id(self, user_id):
        query = "SELECT * FROM lecturers WHERE user_id = :user_id"
        result = self.db_manager.fetch_one(query, {"user_id": user_id})
        return result

lecturer_manager = LecturerManager()
