-- SaaS API Gateway Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE tenant_plan AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial');
CREATE TYPE integration_type AS ENUM ('ecommerce', 'accounting', 'warehouse', 'payment', 'banking', 'crm', 'custom');
CREATE TYPE integration_status AS ENUM ('connected', 'disconnected', 'error', 'configuring');
CREATE TYPE auth_type AS ENUM ('api_key', 'oauth2', 'basic_auth', 'bearer_token');
CREATE TYPE pipeline_status AS ENUM ('active', 'paused', 'error');
CREATE TYPE transformation_type AS ENUM ('merge', 'filter', 'aggregate', 'enrich', 'clean', 'validate');
CREATE TYPE suggestion_type AS ENUM ('integration', 'transformation', 'optimization');
CREATE TYPE suggestion_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');

-- Tenants table
CREATE TABLE public.tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  domain VARCHAR UNIQUE NOT NULL,
  plan tenant_plan DEFAULT 'starter',
  status tenant_status DEFAULT 'trial',
  settings JSONB DEFAULT '{
    "dataRetentionDays": 30,
    "maxIntegrations": 5,
    "maxApiCalls": 10000
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update user_profiles to include tenant_id
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Integrations table
CREATE TABLE public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  type integration_type NOT NULL,
  provider VARCHAR NOT NULL,
  status integration_status DEFAULT 'configuring',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{
    "totalRequests": 0,
    "successfulRequests": 0,
    "failedRequests": 0,
    "avgResponseTime": 0,
    "dataPointsProcessed": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sources table
CREATE TABLE public.data_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  record_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR DEFAULT 'synced',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data pipelines table
CREATE TABLE public.data_pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  source_integrations UUID[] DEFAULT '{}',
  transformations JSONB DEFAULT '[]'::jsonb,
  destinations JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '{"type": "realtime"}'::jsonb,
  status pipeline_status DEFAULT 'active',
  metrics JSONB DEFAULT '{
    "recordsProcessed": 0,
    "successRate": 1.0,
    "avgProcessingTime": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI suggestions table
CREATE TABLE public.ai_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  type suggestion_type NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  estimated_impact VARCHAR DEFAULT 'medium',
  config JSONB DEFAULT '{}'::jsonb,
  status suggestion_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook events table
CREATE TABLE public.webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking table
CREATE TABLE public.api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  requests INTEGER DEFAULT 0,
  data_processed BIGINT DEFAULT 0,
  integrations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, date)
);

-- Gateway alerts table
CREATE TABLE public.gateway_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  severity alert_severity DEFAULT 'info',
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  acknowledged BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration templates table
CREATE TABLE public.integration_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  type integration_type NOT NULL,
  provider VARCHAR NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  documentation TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_integrations_tenant_id ON public.integrations(tenant_id);
CREATE INDEX idx_integrations_type ON public.integrations(type);
CREATE INDEX idx_integrations_status ON public.integrations(status);
CREATE INDEX idx_data_sources_tenant_id ON public.data_sources(tenant_id);
CREATE INDEX idx_data_sources_integration_id ON public.data_sources(integration_id);
CREATE INDEX idx_data_pipelines_tenant_id ON public.data_pipelines(tenant_id);
CREATE INDEX idx_webhook_events_tenant_id ON public.webhook_events(tenant_id);
CREATE INDEX idx_webhook_events_integration_id ON public.webhook_events(integration_id);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_api_usage_tenant_date ON public.api_usage(tenant_id, date);
CREATE INDEX idx_gateway_alerts_tenant_id ON public.gateway_alerts(tenant_id);
CREATE INDEX idx_gateway_alerts_severity ON public.gateway_alerts(severity);
CREATE INDEX idx_ai_suggestions_tenant_id ON public.ai_suggestions(tenant_id);
CREATE INDEX idx_ai_suggestions_status ON public.ai_suggestions(status);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_pipelines_updated_at BEFORE UPDATE ON public.data_pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_suggestions_updated_at BEFORE UPDATE ON public.ai_suggestions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "Users can only access their tenant data" ON public.integrations FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can only access their tenant data sources" ON public.data_sources FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can only access their tenant pipelines" ON public.data_pipelines FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can only access their tenant webhooks" ON public.webhook_events FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can only access their tenant usage" ON public.api_usage FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can only access their tenant alerts" ON public.gateway_alerts FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can only access their tenant suggestions" ON public.ai_suggestions FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

-- Admin policies for tenants table
CREATE POLICY "Admins can manage tenants" ON public.tenants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Public read access for integration templates
CREATE POLICY "Anyone can view integration templates" ON public.integration_templates FOR SELECT USING (is_active = true);

-- Function to create tenant on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_tenant()
RETURNS TRIGGER AS $$
DECLARE
  tenant_id UUID;
BEGIN
  -- Create tenant for new user
  INSERT INTO public.tenants (name, domain, plan, status)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    COALESCE(NEW.raw_user_meta_data->>'domain', LOWER(REPLACE(NEW.email, '@', '-at-'))),
    'starter',
    'trial'
  )
  RETURNING id INTO tenant_id;

  -- Update user profile with tenant_id
  UPDATE public.user_profiles 
  SET tenant_id = tenant_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create tenant on user signup
CREATE TRIGGER on_auth_user_created_tenant
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_tenant();

-- Insert sample integration templates
INSERT INTO public.integration_templates (name, description, type, provider, config, documentation, tags) VALUES
('Shopify Store', 'Connect your Shopify store to sync products, orders, and customers', 'ecommerce', 'shopify', 
 '{"endpoints": {"products": "/admin/api/2023-10/products.json", "orders": "/admin/api/2023-10/orders.json"}, "authentication": {"type": "api_key", "headerName": "X-Shopify-Access-Token"}}',
 'https://shopify.dev/api/admin-rest', 
 ARRAY['ecommerce', 'retail', 'popular']),

('QuickBooks Online', 'Integrate with QuickBooks for accounting and financial data', 'accounting', 'quickbooks',
 '{"endpoints": {"companies": "/v3/companyinfo", "items": "/v3/items"}, "authentication": {"type": "oauth2"}}',
 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting',
 ARRAY['accounting', 'finance', 'popular']),

('Stripe Payments', 'Connect Stripe for payment processing and transaction data', 'payment', 'stripe',
 '{"endpoints": {"charges": "/v1/charges", "customers": "/v1/customers"}, "authentication": {"type": "bearer_token"}}',
 'https://stripe.com/docs/api',
 ARRAY['payment', 'finance', 'popular']),

('WooCommerce', 'Integrate with WooCommerce stores', 'ecommerce', 'woocommerce',
 '{"endpoints": {"products": "/wp-json/wc/v3/products", "orders": "/wp-json/wc/v3/orders"}, "authentication": {"type": "basic_auth"}}',
 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
 ARRAY['ecommerce', 'wordpress']);
