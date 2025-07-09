-- Table 1837 Database Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User roles enum
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'bartender', 'server', 'host', 'kitchen');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  pin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Content versioning
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  is_published BOOLEAN DEFAULT FALSE
);

-- Cocktails
CREATE TABLE cocktails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wine list
CREATE TABLE wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  vintage INTEGER,
  region TEXT,
  varietal TEXT,
  description TEXT,
  glass_price DECIMAL(10,2),
  bottle_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  inventory INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 86 List (real-time)
CREATE TABLE eighty_six_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  removed_by UUID REFERENCES users(id),
  removed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled content
CREATE TABLE scheduled_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL,
  content_data JSONB NOT NULL,
  publish_at TIMESTAMPTZ NOT NULL,
  expire_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending'
);

-- Checklists
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  items JSONB NOT NULL,
  active_time JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist completions
CREATE TABLE checklist_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID REFERENCES checklists(id),
  task_id TEXT NOT NULL,
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_cocktails_name ON cocktails USING gin(name gin_trgm_ops);
CREATE INDEX idx_wines_name ON wines USING gin(name gin_trgm_ops);
CREATE INDEX idx_86_active ON eighty_six_list(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_scheduled_publish ON scheduled_content(publish_at) WHERE status = 'pending';

-- Row Level Security (RLS)
ALTER TABLE cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE eighty_six_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read cocktails" ON cocktails FOR SELECT USING (true);
CREATE POLICY "Manager write cocktails" ON cocktails FOR ALL USING (
  auth.jwt() ->> 'role' IN ('owner', 'manager')
);

CREATE POLICY "Public read wines" ON wines FOR SELECT USING (true);
CREATE POLICY "Manager write wines" ON wines FOR ALL USING (
  auth.jwt() ->> 'role' IN ('owner', 'manager')
);

CREATE POLICY "Public read 86 list" ON eighty_six_list FOR SELECT USING (is_active = true);
CREATE POLICY "Staff write 86 list" ON eighty_six_list FOR INSERT USING (
  auth.jwt() ->> 'role' IN ('owner', 'manager', 'bartender', 'kitchen')
);

-- Real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE eighty_six_list;