from db.database import get_db_manager
import bcrypt

def reset_passwords():
    db = get_db_manager()
    
    # Passwords to set
    passwords = {
        "admin": "admin123",
        "@drstrange001": "Trovegs35001#",
        "admin2": "admin2pass"
    }
    
    for username, password in passwords.items():
        hash_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        try:
            db.execute(
                "UPDATE users SET password = :p, is_approved = TRUE, is_super_admin = TRUE WHERE username = :u",
                {"p": hash_pw, "u": username}
            )
            print(f"Password for {username} reset to: {password}")
        except Exception as e:
            print(f"Error resetting {username}: {e}")

if __name__ == "__main__":
    reset_passwords()
