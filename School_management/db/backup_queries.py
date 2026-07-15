from db.database import get_db_manager
import json
import os
import gzip
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def archive_record(tenant_id, table_name, record_id, record_data, deleted_by=None):
    """Specifically for archiving deleted records for developer audits."""
    return log_record_change(
        tenant_id=tenant_id,
        table_name=table_name,
        record_id=record_id,
        action='DELETE',
        old_data=record_data,
        changed_by=deleted_by
    )

# --- Layer 9: Versioning (Time Travel) ---
def log_record_change(tenant_id, table_name, record_id, action, old_data=None, new_data=None, changed_by=None):
    """Tracks every change to allow full system state reconstruction."""
    try:
        query = """
            INSERT INTO record_history (tenant_id, table_name, record_id, action, old_data, new_data, changed_by)
            VALUES (:tid, :table, :rid, :action, :old, :new, :by)
        """
        # Detection of mass deletion (Security Monitoring)
        if action == 'DELETE':
            check_mass_deletion_threat(tenant_id)

        get_db_manager().execute(query, {
            "tid": tenant_id, "table": table_name, "rid": str(record_id),
            "action": action, 
            "old": json.dumps(old_data, default=str) if old_data else None,
            "new": json.dumps(new_data, default=str) if new_data else None,
            "by": changed_by
        })
    except Exception as e:
        logger.error(f"Versioning failed: {e}")

def check_mass_deletion_threat(tenant_id):
    """Alerts developer if more than 50 records deleted in 5 minutes."""
    try:
        res = get_db_manager().fetch_one(
            "SELECT COUNT(*) FROM record_history WHERE tenant_id = :tid AND action = 'DELETE' AND created_at > NOW() - INTERVAL '5 minutes'",
            {"tid": tenant_id}
        )
        if res and res['count'] > 50:
            get_db_manager().execute(
                "INSERT INTO security_alerts (tenant_id, alert_type, severity, message) VALUES (:tid, 'MASS_DELETION', 'critical', 'Suspicious activity: Over 50 records deleted in 5 mins.')",
                {"tid": tenant_id}
            )
    except: pass

# --- Layer 3 & 4: Backup Engine ---
def create_system_backup(scope='Full System', tenant_id=None):
    """Comprehensive backup with compression and offsite readiness."""
    try:
        db = get_db_manager()
        tables = ['tenants', 'users', 'students', 'payments', 'courses', 'attendance', 'registrations', 'record_history']
        backup_data = {"metadata": {"created_at": str(datetime.now()), "scope": scope, "tenant_id": tenant_id}}
        
        for table in tables:
            query = f"SELECT * FROM {table}"
            params = {}
            if tenant_id and table != 'tenants':
                query += " WHERE tenant_id = :tid"
                params["tid"] = tenant_id
            rows = db.fetch_all(query, params)
            backup_data[table] = [dict(r) for r in rows]

        # File Structure Organization
        sub_dir = 'daily' if scope == 'Daily' else 'full'
        target_dir = os.path.join('backups', sub_dir)
        if not os.path.exists(target_dir): os.makedirs(target_dir)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{scope.lower()}_{timestamp}.json.gz"
        file_path = os.path.join(target_dir, filename)

        # Compress JSON before storing (Layer 2 Optimization)
        content = json.dumps(backup_data, default=str).encode('utf-8')
        with gzip.open(file_path, 'wb') as f:
            f.write(content)

        # Log to system_backups
        size_kb = os.path.getsize(file_path) // 1024
        db.execute(
            "INSERT INTO system_backups (tenant_id, backup_type, filename, file_path, file_size_kb, status) VALUES (:tid, :bt, :fn, :fp, :s, 'success')",
            {"tid": tenant_id, "bt": scope, "fn": filename, "fp": file_path, "s": size_kb}
        )
        return True, filename
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        return False, str(e)

# --- Layer 6: Restore System ---
def restore_from_backup(backup_id, selective_tables=None):
    """Full or selective system state restoration."""
    try:
        db = get_db_manager()
        backup = db.fetch_one("SELECT * FROM system_backups WHERE id = :id", {"id": backup_id})
        if not backup: return False, "Backup not found"

        with gzip.open(backup['file_path'], 'rb') as f:
            data = json.loads(f.read().decode('utf-8'))

        target_tables = selective_tables if selective_tables else data.keys()
        
        for table in target_tables:
            if table == 'metadata' or table not in data: continue
            # Basic restoration logic: Clean table and re-insert
            # (In production, use a more surgical merge logic)
            db.execute(f"DELETE FROM {table} " + (f"WHERE tenant_id = {backup['tenant_id']}" if backup['tenant_id'] else ""))
            for row in data[table]:
                keys = row.keys()
                cols = ", ".join(keys)
                vals = ", ".join([f":{k}" for k in keys])
                db.execute(f"INSERT INTO {table} ({cols}) VALUES ({vals})", row)

        return True, "Restoration complete."
    except Exception as e:
        logger.error(f"Restore failed: {e}")
        return False, str(e)

def get_system_vault_stats():
    """Returns status data for Developer widgets."""
    try:
        db = get_db_manager()
        last_backup = db.fetch_one("SELECT created_at, status FROM system_backups ORDER BY created_at DESC LIMIT 1")
        alerts = db.fetch_all("SELECT * FROM security_alerts WHERE is_resolved = FALSE ORDER BY created_at DESC")
        archive_count = db.fetch_one("SELECT COUNT(*) FROM record_history WHERE action = 'DELETE'")['count']
        
        return {
            "last_backup_time": last_backup['created_at'] if last_backup else None,
            "last_backup_status": last_backup['status'] if last_backup else 'None',
            "active_alerts": alerts,
            "total_archived": archive_count
        }
    except: return {}

def get_all_backups():
    try:
        return get_db_manager().fetch_all("SELECT b.*, t.name as school_name FROM system_backups b LEFT JOIN tenants t ON b.tenant_id = t.id ORDER BY b.created_at DESC")
    except: return []

def get_archived_records():
    try:
        return get_db_manager().fetch_all("SELECT h.*, t.name as school_name, u.username FROM record_history h LEFT JOIN tenants t ON h.tenant_id = t.id LEFT JOIN users u ON h.changed_by = u.id WHERE h.action = 'DELETE' ORDER BY h.created_at DESC")
    except: return []
