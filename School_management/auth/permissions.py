"""
Role-Based Access Control (RBAC) for Remastered System.
Roles:
- super_admin: You (@drstrange001). Access to all schools, billing, and system-wide settings.
- admin: School owner. Full access to their specific school.
- teacher: Access to attendance, grades, and their assigned courses.
- accountant: Access to payments, salaries, and petty cash.
- student: Access to their own portal (grades, materials).
"""

def is_super_admin(user):
    """Checks if the user is a system-wide Super Admin."""
    if not user: return False
    return user.get("is_super_admin") is True and user.get("is_approved") is True

def is_school_admin(user):
    """Checks if the user is a School Admin (or higher)."""
    if not user: return False
    if is_super_admin(user): return True
    return user.get("role", "").lower() == "admin" and user.get("is_approved") is True

def is_teacher(user):
    """Checks if the user is a Teacher."""
    if not user: return False
    if is_school_admin(user): return True
    return user.get("role", "").lower() == "teacher" and user.get("is_approved") is True

def is_accountant(user):
    """Checks if the user is an Accountant."""
    if not user: return False
    if is_school_admin(user): return True
    return user.get("role", "").lower() == "accountant" and user.get("is_approved") is True

def is_student(user):
    """Checks if the user is a Student."""
    if not user: return False
    return user.get("role", "").lower() == "student"

# Granular Permissions
def can_access_billing(user):
    return is_super_admin(user)

def can_manage_tenants(user):
    return is_super_admin(user)

def can_manage_users(user, target_tenant_id=None):
    if is_super_admin(user): return True
    if is_school_admin(user):
        # A school admin can only manage users in their own tenant
        return user.get("tenant_id") == target_tenant_id
    return False

def can_manage_payments(user):
    return is_accountant(user) or is_school_admin(user)

def can_mark_attendance(user):
    return is_teacher(user) or is_school_admin(user)

def can_view_system_stats(user):
    return is_super_admin(user)
