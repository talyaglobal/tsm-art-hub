-- High Availability Tables
CREATE TABLE IF NOT EXISTS service_instances (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  region TEXT NOT NULL,
  zone TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'degraded', 'maintenance')),
  last_health_check TIMESTAMPTZ NOT NULL,
  version TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  load_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS failover_rules (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('health_check', 'response_time', 'error_rate', 'manual')),
  threshold NUMERIC NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('failover', 'scale_up', 'alert', 'circuit_break')),
  target_region TEXT,
  cooldown_period INTEGER NOT NULL DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS load_balancer_configs (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  algorithm TEXT NOT NULL CHECK (algorithm IN ('round_robin', 'least_connections', 'weighted', 'ip_hash')),
  health_check_interval INTEGER NOT NULL DEFAULT 30,
  failover_threshold INTEGER NOT NULL DEFAULT 3,
  weights JSONB DEFAULT '{}',
  sticky_session BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disaster Recovery Tables
CREATE TABLE IF NOT EXISTS backup_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full', 'incremental', 'differential')),
  schedule TEXT NOT NULL, -- Cron expression
  retention JSONB NOT NULL,
  targets JSONB NOT NULL,
  encryption JSONB DEFAULT '{"enabled": false}',
  compression JSONB DEFAULT '{"enabled": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backup_jobs (
  id TEXT PRIMARY KEY,
  config_id TEXT NOT NULL REFERENCES backup_configs(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- milliseconds
  size BIGINT, -- bytes
  checksum TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recovery_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rto INTEGER NOT NULL, -- Recovery Time Objective in minutes
  rpo INTEGER NOT NULL, -- Recovery Point Objective in minutes
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  steps JSONB NOT NULL,
  dependencies TEXT[] DEFAULT '{}',
  validation_checks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disaster_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('outage', 'data_corruption', 'security_breach', 'natural_disaster')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'major', 'critical', 'catastrophic')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  affected_services TEXT[] NOT NULL,
  affected_regions TEXT[] NOT NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  recovery_plan_id TEXT REFERENCES recovery_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'recovering', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure Monitoring Tables
CREATE TABLE IF NOT EXISTS infrastructure_metrics (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  region TEXT NOT NULL,
  zone TEXT NOT NULL,
  service TEXT NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS infrastructure_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  service TEXT NOT NULL,
  region TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  details JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capacity_plans (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  region TEXT NOT NULL,
  current_capacity JSONB NOT NULL,
  projected_growth JSONB NOT NULL,
  thresholds JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chaos_experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('latency', 'failure', 'resource', 'network', 'dependency')),
  target JSONB NOT NULL,
  parameters JSONB DEFAULT '{}',
  duration INTEGER NOT NULL, -- seconds
  schedule TEXT, -- Cron expression for recurring experiments
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'running', 'completed', 'failed', 'cancelled')),
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_instances_service ON service_instances(service);
CREATE INDEX IF NOT EXISTS idx_service_instances_region ON service_instances(region);
CREATE INDEX IF NOT EXISTS idx_service_instances_status ON service_instances(status);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_config_id ON backup_jobs(config_id);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_status ON backup_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_start_time ON backup_jobs(start_time);
CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_service ON infrastructure_metrics(service);
CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_timestamp ON infrastructure_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_infrastructure_alerts_status ON infrastructure_alerts(status);
CREATE INDEX IF NOT EXISTS idx_disaster_events_status ON disaster_events(status);
CREATE INDEX IF NOT EXISTS idx_chaos_experiments_status ON chaos_experiments(status);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_service_instances_updated_at BEFORE UPDATE ON service_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_failover_rules_updated_at BEFORE UPDATE ON failover_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_load_balancer_configs_updated_at BEFORE UPDATE ON load_balancer_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_configs_updated_at BEFORE UPDATE ON backup_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recovery_plans_updated_at BEFORE UPDATE ON recovery_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disaster_events_updated_at BEFORE UPDATE ON disaster_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capacity_plans_updated_at BEFORE UPDATE ON capacity_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chaos_experiments_updated_at BEFORE UPDATE ON chaos_experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
