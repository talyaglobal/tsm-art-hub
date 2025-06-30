-- Structured Logs Table
CREATE TABLE IF NOT EXISTS structured_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT NOT NULL,
    service TEXT NOT NULL,
    trace_id TEXT,
    span_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    tenant_id UUID,
    api_id TEXT,
    integration_id TEXT,
    request_id TEXT,
    duration INTEGER,
    status_code INTEGER,
    method TEXT,
    path TEXT,
    user_agent TEXT,
    ip INET,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    environment TEXT NOT NULL DEFAULT 'production'
);

-- Indexes for structured logs
CREATE INDEX IF NOT EXISTS idx_structured_logs_timestamp ON structured_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_structured_logs_level ON structured_logs(level);
CREATE INDEX IF NOT EXISTS idx_structured_logs_service ON structured_logs(service);
CREATE INDEX IF NOT EXISTS idx_structured_logs_trace_id ON structured_logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_structured_logs_user_id ON structured_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_structured_logs_tenant_id ON structured_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_structured_logs_tags ON structured_logs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_structured_logs_metadata ON structured_logs USING GIN(metadata);

-- Distributed Traces Table
CREATE TABLE IF NOT EXISTS distributed_traces (
    id TEXT PRIMARY KEY,
    trace_id TEXT NOT NULL,
    parent_span_id TEXT,
    operation_name TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration INTEGER,
    status TEXT NOT NULL CHECK (status IN ('started', 'finished', 'error')),
    tags JSONB DEFAULT '{}',
    logs JSONB DEFAULT '[]',
    service TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    tenant_id UUID
);

-- Indexes for distributed traces
CREATE INDEX IF NOT EXISTS idx_distributed_traces_trace_id ON distributed_traces(trace_id);
CREATE INDEX IF NOT EXISTS idx_distributed_traces_start_time ON distributed_traces(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_distributed_traces_service ON distributed_traces(service);
CREATE INDEX IF NOT EXISTS idx_distributed_traces_operation_name ON distributed_traces(operation_name);
CREATE INDEX IF NOT EXISTS idx_distributed_traces_user_id ON distributed_traces(user_id);
CREATE INDEX IF NOT EXISTS idx_distributed_traces_tenant_id ON distributed_traces(tenant_id);
CREATE INDEX IF NOT EXISTS idx_distributed_traces_status ON distributed_traces(status);
CREATE INDEX IF NOT EXISTS idx_distributed_traces_duration ON distributed_traces(duration);

-- Alert Rules Table
CREATE TABLE IF NOT EXISTS alert_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    metric TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('gt', 'lt', 'eq', 'gte', 'lte')),
    threshold NUMERIC NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    channels TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    tenant_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Channels Table
CREATE TABLE IF NOT EXISTS notification_channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'slack', 'webhook', 'sms', 'teams')),
    enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}',
    tenant_id UUID,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert History Table
CREATE TABLE IF NOT EXISTS alert_history (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('triggered', 'acknowledged', 'resolved', 'suppressed')),
    metric_value NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    channels_notified TEXT[] DEFAULT '{}',
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for alert history
CREATE INDEX IF NOT EXISTS idx_alert_history_rule_id ON alert_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered_at ON alert_history(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_status ON alert_history(status);
CREATE INDEX IF NOT EXISTS idx_alert_history_severity ON alert_history(severity);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_email TEXT,
    tenant_id UUID,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET NOT NULL,
    user_agent TEXT,
    session_id TEXT,
    outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'partial')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL CHECK (category IN ('authentication', 'authorization', 'data', 'configuration', 'system', 'security')),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_outcome ON audit_logs(outcome);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Real-time Metrics Table (for dashboard)
CREATE TABLE IF NOT EXISTS real_time_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id UUID,
    api_id TEXT,
    integration_id TEXT,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    tags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Indexes for real-time metrics
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_timestamp ON real_time_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_tenant_id ON real_time_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_api_id ON real_time_metrics(api_id);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_integration_id ON real_time_metrics(integration_id);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_metric_name ON real_time_metrics(metric_name);

-- Metric Aggregations Table (for performance)
CREATE TABLE IF NOT EXISTS metric_aggregations (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    tenant_id UUID,
    api_id TEXT,
    integration_id TEXT,
    metric_name TEXT NOT NULL,
    aggregation_type TEXT NOT NULL CHECK (aggregation_type IN ('sum', 'avg', 'min', 'max', 'count')),
    time_window TEXT NOT NULL CHECK (time_window IN ('1m', '5m', '15m', '1h', '6h', '24h')),
    value NUMERIC NOT NULL,
    sample_count INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for metric aggregations
CREATE INDEX IF NOT EXISTS idx_metric_aggregations_timestamp ON metric_aggregations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metric_aggregations_tenant_id ON metric_aggregations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metric_aggregations_metric_name ON metric_aggregations(metric_name);
CREATE INDEX IF NOT EXISTS idx_metric_aggregations_time_window ON metric_aggregations(time_window);

-- System Health Checks Table
CREATE TABLE IF NOT EXISTS system_health_checks (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    service_name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
    response_time INTEGER, -- milliseconds
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for system health checks
CREATE INDEX IF NOT EXISTS idx_system_health_checks_timestamp ON system_health_checks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_service_name ON system_health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_status ON system_health_checks(status);

-- Performance Baselines Table
CREATE TABLE IF NOT EXISTS performance_baselines (
    id SERIAL PRIMARY KEY,
    tenant_id UUID,
    api_id TEXT,
    integration_id TEXT,
    metric_name TEXT NOT NULL,
    baseline_value NUMERIC NOT NULL,
    confidence_interval NUMERIC,
    sample_size INTEGER NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for performance baselines
CREATE INDEX IF NOT EXISTS idx_performance_baselines_tenant_id ON performance_baselines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_baselines_api_id ON performance_baselines(api_id);
CREATE INDEX IF NOT EXISTS idx_performance_baselines_integration_id ON performance_baselines(integration_id);
CREATE INDEX IF NOT EXISTS idx_performance_baselines_metric_name ON performance_baselines(metric_name);

-- Row Level Security (RLS) Policies
ALTER TABLE structured_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributed_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_baselines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY "Users can access their tenant's structured logs" ON structured_logs
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access their tenant's traces" ON distributed_traces
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can manage their tenant's alert rules" ON alert_rules
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can manage their tenant's notification channels" ON notification_channels
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access their tenant's alert history" ON alert_history
    FOR ALL USING (
        rule_id IN (
            SELECT id FROM alert_rules 
            WHERE tenant_id IN (
                SELECT tenant_id FROM tenant_users 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can access their tenant's audit logs" ON audit_logs
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access their tenant's metrics" ON real_time_metrics
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access their tenant's metric aggregations" ON metric_aggregations
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can access their tenant's performance baselines" ON performance_baselines
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Functions for automatic cleanup of old data
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    -- Delete structured logs older than 90 days
    DELETE FROM structured_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    -- Delete traces older than 30 days
    DELETE FROM distributed_traces 
    WHERE start_time < NOW() - INTERVAL '30 days';
    
    -- Delete real-time metrics older than 7 days
    DELETE FROM real_time_metrics 
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    -- Delete resolved alerts older than 180 days
    DELETE FROM alert_history 
    WHERE status = 'resolved' AND resolved_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup function (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-logs', '0 2 * * *', 'SELECT cleanup_old_logs();');

-- Function to calculate metric aggregations
CREATE OR REPLACE FUNCTION calculate_metric_aggregations()
RETURNS void AS $$
BEGIN
    -- Calculate 5-minute aggregations
    INSERT INTO metric_aggregations (
        timestamp, tenant_id, api_id, integration_id, metric_name, 
        aggregation_type, time_window, value, sample_count
    )
    SELECT 
        date_trunc('minute', timestamp) + INTERVAL '5 minutes' * FLOOR(EXTRACT(MINUTE FROM timestamp) / 5) as window_start,
        tenant_id,
        api_id,
        integration_id,
        metric_name,
        'avg' as aggregation_type,
        '5m' as time_window,
        AVG(metric_value) as value,
        COUNT(*) as sample_count
    FROM real_time_metrics
    WHERE timestamp >= NOW() - INTERVAL '1 hour'
    GROUP BY window_start, tenant_id, api_id, integration_id, metric_name
    ON CONFLICT DO NOTHING;
    
    -- Calculate hourly aggregations
    INSERT INTO metric_aggregations (
        timestamp, tenant_id, api_id, integration_id, metric_name, 
        aggregation_type, time_window, value, sample_count
    )
    SELECT 
        date_trunc('hour', timestamp) as window_start,
        tenant_id,
        api_id,
        integration_id,
        metric_name,
        'avg' as aggregation_type,
        '1h' as time_window,
        AVG(metric_value) as value,
        COUNT(*) as sample_count
    FROM real_time_metrics
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY window_start, tenant_id, api_id, integration_id, metric_name
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alert_rules_updated_at 
    BEFORE UPDATE ON alert_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_channels_updated_at 
    BEFORE UPDATE ON notification_channels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
