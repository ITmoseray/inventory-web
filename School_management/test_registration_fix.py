from db.student_queries import add_registration
from db.database import get_db_manager
from sqlalchemy import text

def test_add_registration():
    print("Testing add_registration...")
    result = add_registration(
        full_name="Test Student",
        age=20,
        gender="Male",
        address="123 Test St",
        phone="123456789",
        email="test@student.com",
        guardian_name="Guardian",
        guardian_phone="987654321",
        course="Computer Classes (Microsoft Office & Internet)",
        referral_source="Friend/Relatives",
        photo_url=None,
        payment_reference="TEST-REF-001",
        tenant_id=1
    )
    
    if result:
        print(f"✅ Registration added successfully! App Code: {result['app_code']}")
    else:
        print("❌ Registration failed to add.")

    # Now count again
    db = get_db_manager()
    with db.engine.connect() as conn:
        res = conn.execute(text("SELECT COUNT(*) FROM registrations")).fetchone()
        print(f"Total registrations now: {res[0]}")

if __name__ == "__main__":
    test_add_registration()
