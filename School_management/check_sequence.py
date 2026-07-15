from db.database import get_db_manager

db = get_db_manager()
# Get max ID
max_id = db.fetch_one("SELECT MAX(id) FROM courses")['max']
# Get sequence current value
# The sequence name for a SERIAL column 'id' in table 'courses' is usually 'courses_id_seq'
seq_val = db.fetch_one("SELECT last_value FROM courses_id_seq")['last_value']
print(f"Max ID: {max_id}, Sequence Val: {seq_val}")
