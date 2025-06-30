-- Health Monitoring Schema
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- API Health Status Table
CREATE TABLE IF NOT EXISTS api_health_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    last_check TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_time INTEGER NOT NULL DEFAULT 0, -- in milliseconds
    uptime_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    error_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monitoring Alerts Table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('error', 'warning', 'info')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    service VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    resolution TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Alert History Table
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES monitoring_alerts(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Metrics Table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- cpu, memory, disk, network
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    labels JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Metrics Table
CREATE TABLE IF NOT EXISTS api_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id VARCHAR(255) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER NOT NULL, -- in milliseconds
    request_size INTEGER DEFAULT 0, -- in bytes
    response_size INTEGER DEFAULT 0, -- in bytes
    user_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Log Entries Table
CREATE TABLE IF NOT EXISTS log_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level VARCHAR(10) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT NOT NULL,
    service VARCHAR(255) NOT NULL,
    trace_id VARCHAR(255),
    span_id VARCHAR(255),
    user_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trace Spans Table
CREATE TABLE IF NOT EXISTS trace_spans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id VARCHAR(255) NOT NULL,
    span_id VARCHAR(255) NOT NULL,
    parent_span_id VARCHAR(255),
    operation_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration INTEGER, -- in microseconds
    tags JSONB DEFAULT '{}',
    logs JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'error', 'timeout')),
    service VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Reports Table
CREATE TABLE IF NOT EXISTS performance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    summary JSONB NOT NULL,
    trends JSONB NOT NULL,
    top_endpoints JSONB NOT NULL,
    recommendations TEXT[],
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_health_status_api_id ON api_health_status(api_id);
CREATE INDEX IF NOT EXISTS idx_api_health_status_last_check ON api_health_status(last_check DESC);
CREATE INDEX IF NOT EXISTS idx_api_health_status_status ON api_health_status(status);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_status ON monitoring_alerts(status);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_service ON monitoring_alerts(service);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_created_at ON monitoring_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_timestamp ON alert_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_system_metrics_service ON system_metrics(service);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_api_metrics_api_id ON api_metrics(api_id);
CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_metrics_timestamp ON api_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_metrics_status_code ON api_metrics(status_code);

CREATE INDEX IF NOT EXISTS idx_log_entries_service ON log_entries(service);
CREATE INDEX IF NOT EXISTS idx_log_entries_level ON log_entries(level);
CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_log_entries_trace_id ON log_entries(trace_id);

CREATE INDEX IF NOT EXISTS idx_trace_spans_trace_id ON trace_spans(trace_id);
CREATE INDEX IF NOT EXISTS idx_trace_spans_span_id ON trace_spans(span_id);
CREATE INDEX IF NOT EXISTS idx_trace_spans_service ON trace_spans(service);
CREATE INDEX IF NOT EXISTS idx_trace_spans_start_time ON trace_spans(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_performance_reports_type ON performance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_performance_reports_period ON performance_reports(period_start, period_end);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_api_health_status_updated_at 
    BEFORE UPDATE ON api_health_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_alerts_updated_at 
    BEFORE UPDATE ON monitoring_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE api_health_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_spans ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your authentication system)
CREATE POLICY "Users can view their own API health status" ON api_health_status
    FOR SELECT USING (true); -- Adjust based on your user context

CREATE POLICY "Users can insert API health status" ON api_health_status
    FOR INSERT WITH CHECK (true); -- Adjust based on your user context

CREATE POLICY "Users can update their own API health status" ON api_health_status
    FOR UPDATE USING (true); -- Adjust based on your user context

-- Similar policies for other tables
CREATE POLICY "Users can view alerts" ON monitoring_alerts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert alerts" ON monitoring_alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update alerts" ON monitoring_alerts
    FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create views for common queries
CREATE OR REPLACE VIEW active_alerts AS
SELECT 
    id,
    type,
    title,
    message,
    service,
    severity,
    status,
    created_at,
    acknowledged_by,
    acknowledged_at
FROM monitoring_alerts 
WHERE status IN ('active', 'acknowledged')
ORDER BY 
    CASE severity 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    created_at DESC;

CREATE OR REPLACE VIEW service_health_summary AS
SELECT 
    service_name,
    status,
    AVG(response_time) as avg_response_time,
    AVG(uptime_percentage) as avg_uptime,
    AVG(error_rate) as avg_error_rate,
    MAX(last_check) as last_check,
    COUNT(*) as check_count
FROM api_health_status 
WHERE last_check > NOW() - INTERVAL '1 hour'
GROUP BY service_name, status
ORDER BY service_name, status;

-- Create function for health check aggregation
CREATE OR REPLACE FUNCTION get_service_health_metrics(
    service_name_param VARCHAR(255),
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    avg_response_time DECIMAL,
    uptime_percentage DECIMAL,
    error_rate DECIMAL,
    total_checks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(ahs.response_time)::DECIMAL as avg_response_time,
        AVG(ahs.uptime_percentage)::DECIMAL as uptime_percentage,
        AVG(ahs.error_rate)::DECIMAL as error_rate,
        COUNT(*)::BIGINT as total_checks
    FROM api_health_status ahs
    WHERE ahs.service_name = service_name_param
    AND ahs.last_check > NOW() - (time_range_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Create function for alert statistics
CREATE OR REPLACE FUNCTION get_alert_statistics(
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_alerts BIGINT,
    active_alerts BIGINT,
    critical_alerts BIGINT,
    resolved_alerts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_alerts,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::BIGINT as active_alerts,
        COUNT(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 END)::BIGINT as critical_alerts,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::BIGINT as resolved_alerts
    FROM monitoring_alerts
    WHERE created_at > NOW() - (time_range_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;
