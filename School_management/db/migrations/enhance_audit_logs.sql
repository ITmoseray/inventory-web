-- Migration to enhance Audit Logs with multi-tenancy support

-- Add tenant_id to activity_logs if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activity_logs' AND column_name='tenant_id') THEN
        ALTER TABLE activity_logs ADD COLUMN tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create an index for faster filtering by tenant
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant ON activity_logs(tenant_id);
