-- Migration to add Billing and Subscription System

-- 1. Billing Plans table
CREATE TABLE IF NOT EXISTS billing_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Basic', 'Standard', 'Premium'
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    max_students INTEGER, -- NULL for unlimited
    max_users INTEGER,
    features JSONB, -- Store feature flags like {'sms': true, 'api': false}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES billing_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'suspended', 'trial'
    billing_cycle VARCHAR(10) DEFAULT 'monthly', -- 'monthly', 'yearly'
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_billing_date TIMESTAMP NOT NULL,
    last_payment_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id)
);

-- 3. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid', -- 'paid', 'unpaid', 'overdue', 'cancelled'
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    payment_date TIMESTAMP,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default plans
INSERT INTO billing_plans (name, price_monthly, price_yearly, max_students, max_users, features) VALUES
('Basic', 29.99, 299.99, 100, 5, '{"sms": false, "api": false, "backups": "weekly"}'),
('Standard', 59.99, 599.99, 500, 15, '{"sms": true, "api": true, "backups": "daily"}'),
('Premium', 99.99, 999.99, NULL, NULL, '{"sms": true, "api": true, "backups": "realtime", "ai": true}')
ON CONFLICT DO NOTHING;
