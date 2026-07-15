-- Professional SaaS Backup & Recovery Migration (Level 4)

-- 1. Layer 9: Versioning System (Record History)
-- This tracks EVERY change, not just deletes, allowing "Time Travel" restores.
CREATE TABLE IF NOT EXISTS record_history (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id TEXT NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    old_data JSONB, -- NULL for CREATE
    new_data JSONB, -- NULL for DELETE
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enhanced Backup Tracking
DROP TABLE IF EXISTS system_backups CASCADE;
CREATE TABLE system_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for Global
    backup_type VARCHAR(50) NOT NULL, -- 'Incremental', 'Daily', 'Full'
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_kb INTEGER,
    backup_format VARCHAR(10) DEFAULT 'json',
    status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed', 'pending'
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_offsite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Security Monitoring Table
CREATE TABLE IF NOT EXISTS security_alerts (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    alert_type VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'warning',
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Index for Time Travel Performance
CREATE INDEX IF NOT EXISTS idx_history_record ON record_history(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_history_tenant ON record_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_backup_status ON system_backups(status);
