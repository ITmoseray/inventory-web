from db.database import get_db_manager

db = get_db_manager()
query = """
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'courses'
"""
constraints = db.fetch_all(query)
for c in constraints:
    print(f"Constraint: {c['conname']}, Def: {c['pg_get_constraintdef']}")
