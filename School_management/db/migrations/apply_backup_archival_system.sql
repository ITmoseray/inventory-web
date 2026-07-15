-- Migration for Backup and Archival System

-- 1. Table for archived records (when school admins delete anything)
CREATE TABLE IF NOT EXISTS deleted_records_archive (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id TEXT, -- Can be INT or string ID
    record_data JSONB NOT NULL, -- Full details at the time of deletion
    deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for tracking system backups
CREATE TABLE IF NOT EXISTS system_backups (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE, -- NULL means global backup
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    size_kb INTEGER,
    backup_type VARCHAR(50) DEFAULT 'Full System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for developer searches
CREATE INDEX IF NOT EXISTS idx_archive_tenant ON deleted_records_archive(tenant_id);
CREATE INDEX IF NOT EXISTS idx_archive_table ON deleted_records_archive(table_name);
