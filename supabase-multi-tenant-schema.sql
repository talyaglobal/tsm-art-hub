-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'starter',
    status VARCHAR(50) NOT NULL DEFAULT 'trial',
    
    -- Settings JSON
    settings JSONB NOT NULL DEFAULT '{
        "timezone": "UTC",
        "dateFormat": "YYYY-MM-DD",
        "currency": "USD",
        "language": "en",
        "features": {
            "apiGateway": true,
            "analytics": true,
            "monitoring": true,
            "webhooks": true,
            "customIntegrations": false,
            "whiteLabeling": false,
            "sso": false,
            "auditLogs": true
        },
        "branding": {
            "primaryColor": "#3b82f6",
            "secondaryColor": "#64748b"
        },
        "dataRetentionDays": 90,
        "logRetentionDays": 30,
        "backupRetentionDays": 7
    }',
    
    -- Limits JSON
    limits JSONB NOT NULL DEFAULT '{
        "maxApiCalls": 10000,
        "maxIntegrations": 5,
        "maxWebhooks": 10,
        "maxUsers": 5,
        "maxProjects": 3,
        "maxStorageGB": 1,
        "maxFileSize": 10485760,
        "maxDatabaseConnections": 5,
        "rateLimitPerMinute": 100,
        "rateLimitPerHour": 1000,
        "rateLimitPerDay": 10000,
        "maxCustomDomains": 0,
        "maxEnvironments": 2,
        "maxApiKeys": 10
    }',
    
    -- Billing JSON
    billing JSONB NOT NULL DEFAULT '{
        "plan": "starter",
        "billingCycle": "monthly",
        "currentUsage": {
            "apiCalls": 0,
            "storage": 0,
            "users": 0,
            "integrations": 0
        }
    }',
    
    -- Security JSON
    security JSONB NOT NULL DEFAULT '{
        "ssoEnabled": false,
        "ipWhitelist": [],
        "allowedDomains": [],
        "requireMfa": false,
        "sessionTimeout": 3600,
        "passwordPolicy": {
            "minLength": 8,
            "requireUppercase": true,
            "requireLowercase": true,
            "requireNumbers": true,
            "requireSymbols": false,
            "maxAge": 90
        },
        "auditLogEnabled": true,
        "securityNotifications": true
    }',
    
    -- Metadata JSON
    metadata JSONB NOT NULL DEFAULT '{
        "onboardingCompleted": false,
        "setupSteps": {
            "profileCompleted": false,
            "integrationAdded": false,
            "apiKeyGenerated": false,
            "webhookConfigured": false,
            "teamInvited": false
        }
    }',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenant_users table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, user_id)
);

-- Create tenant_invitations table
CREATE TABLE IF NOT EXISTS tenant_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, email)
);

-- Create tenant_analytics table
CREATE TABLE IF NOT EXISTS tenant_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{
        "apiCalls": 0,
        "uniqueUsers": 0,
        "dataProcessed": 0,
        "errors": 0,
        "avgResponseTime": 0,
        "uptime": 100
    }',
    usage JSONB NOT NULL DEFAULT '{
        "storage": 0,
        "bandwidth": 0,
        "integrations": 0,
        "webhooks": 0
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, date)
);

-- Create tenant_audit_logs table
CREATE TABLE IF NOT EXISTS tenant_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing tables to be tenant-aware
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_active_tenant_id UUID REFERENCES tenants(id);

-- Make existing tables tenant-aware
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE data_pipelines ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE gateway_alerts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON tenant_users(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_tenant_id ON tenant_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON tenant_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_token ON tenant_invitations(token);
CREATE INDEX IF NOT EXISTS idx_tenant_analytics_tenant_date ON tenant_analytics(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_tenant_id ON tenant_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_audit_logs_timestamp ON tenant_audit_logs(timestamp);

-- Row Level Security Policies

-- Tenants table - users can only see their own tenant
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Tenant owners can update their tenant" ON tenants
    FOR UPDATE USING (
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Tenant users table
CREATE POLICY "Users can view tenant members" ON tenant_users
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins can manage tenant users" ON tenant_users
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Tenant invitations table
CREATE POLICY "Admins can manage invitations" ON tenant_invitations
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Tenant analytics table
CREATE POLICY "Users can view tenant analytics" ON tenant_analytics
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Tenant audit logs table
CREATE POLICY "Users can view tenant audit logs" ON tenant_audit_logs
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Update existing table policies to be tenant-aware
DROP POLICY IF EXISTS "Users can view integrations" ON integrations;
CREATE POLICY "Users can view tenant integrations" ON integrations
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

DROP POLICY IF EXISTS "Users can manage integrations" ON integrations;
CREATE POLICY "Users can manage tenant integrations" ON integrations
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit_logs ENABLE ROW LEVEL SECURITY;

-- Functions for tenant management
CREATE OR REPLACE FUNCTION create_tenant_with_owner(
    tenant_name TEXT,
    tenant_slug TEXT,
    tenant_subdomain TEXT,
    owner_user_id UUID
) RETURNS UUID AS $$
DECLARE
    new_tenant_id UUID;
BEGIN
    -- Create the tenant
    INSERT INTO tenants (name, slug, subdomain)
    VALUES (tenant_name, tenant_slug, tenant_subdomain)
    RETURNING id INTO new_tenant_id;
    
    -- Add the owner
    INSERT INTO tenant_users (tenant_id, user_id, role, status)
    VALUES (new_tenant_id, owner_user_id, 'owner', 'active');
    
    -- Update user profile
    UPDATE user_profiles 
    SET tenant_id = new_tenant_id, last_active_tenant_id = new_tenant_id
    WHERE id = owner_user_id;
    
    RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to switch user's active tenant
CREATE OR REPLACE FUNCTION switch_active_tenant(
    target_tenant_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Verify user has access to the tenant
    IF NOT EXISTS (
        SELECT 1 FROM tenant_users 
        WHERE user_id = auth.uid() 
        AND tenant_id = target_tenant_id 
        AND status = 'active'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Update user's active tenant
    UPDATE user_profiles 
    SET last_active_tenant_id = target_tenant_id
    WHERE id = auth.uid();
    
    -- Update last active time
    UPDATE tenant_users 
    SET last_active_at = NOW()
    WHERE user_id = auth.uid() AND tenant_id = target_tenant_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update tenant updated_at
CREATE OR REPLACE FUNCTION update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_updated_at();

CREATE TRIGGER update_tenant_users_updated_at
    BEFORE UPDATE ON tenant_users
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_updated_at();
