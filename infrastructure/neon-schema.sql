-- Neon.tech PostgreSQL Schema for Table 1837
-- 10GB FREE TIER - LET'S FUCKING USE IT

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- Optimized user roles
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'bartender', 'server', 'host', 'kitchen');

-- Users table with Clerk integration
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Cocktails with vector embeddings for AI search
CREATE TABLE cocktails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  margin_percent GENERATED ALWAYS AS ((price - cost) / price * 100) STORED,
  category TEXT,
  tags TEXT[],
  image_r2_key TEXT, -- Cloudflare R2 storage key
  embedding vector(1536), -- OpenAI embeddings for semantic search
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wine with advanced inventory
CREATE TABLE wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  producer TEXT,
  vintage INTEGER,
  region TEXT,
  varietal TEXT[],
  description TEXT,
  tasting_notes JSONB,
  glass_price DECIMAL(10,2),
  bottle_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  par_level INTEGER DEFAULT 12,
  current_inventory INTEGER DEFAULT 0,
  reorder_point INTEGER GENERATED ALWAYS AS (par_level / 3) STORED,
  bin_location TEXT,
  image_r2_key TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time 86 list with history
CREATE TABLE eighty_six_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  added_by TEXT REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  estimated_return TIMESTAMPTZ,
  removed_by TEXT REFERENCES users(id),
  removed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Event log for real-time sync
CREATE TABLE eighty_six_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advanced content versioning
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version INTEGER NOT NULL,
  data JSONB NOT NULL,
  diff JSONB, -- JSON diff from previous version
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  commit_message TEXT,
  UNIQUE(entity_type, entity_id, version)
);

-- Scheduled content with cron-like scheduling
CREATE TABLE scheduled_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL,
  content_data JSONB NOT NULL,
  schedule_expression TEXT, -- Cron expression
  next_run TIMESTAMPTZ,
  last_run TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_by TEXT REFERENCES users(id)
);

-- Menu sections for organization
CREATE TABLE menu_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE
);

-- Junction table for menu items
CREATE TABLE menu_items (
  section_id UUID REFERENCES menu_sections(id),
  item_id UUID,
  item_type TEXT, -- 'cocktail', 'wine', 'food'
  display_order INTEGER,
  PRIMARY KEY (section_id, item_id, item_type)
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- High-performance indexes
CREATE INDEX idx_cocktails_name_trgm ON cocktails USING gin(name gin_trgm_ops);
CREATE INDEX idx_cocktails_embedding ON cocktails USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_wines_name_trgm ON wines USING gin(name gin_trgm_ops);
CREATE INDEX idx_wines_inventory ON wines(current_inventory) WHERE current_inventory < reorder_point;
CREATE INDEX idx_86_active ON eighty_six_list(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_content_versions ON content_versions(entity_type, entity_id, version DESC);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);

-- Materialized view for cocktail search
CREATE MATERIALIZED VIEW cocktail_search AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.category,
  c.price,
  c.image_r2_key,
  to_tsvector('english', c.name || ' ' || COALESCE(c.description, '') || ' ' || array_to_string(c.tags, ' ')) as search_vector,
  jsonb_agg(jsonb_build_object('name', i.key, 'amount', i.value)) as ingredients_list
FROM cocktails c,
     jsonb_each_text(c.ingredients) i
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.description, c.category, c.price, c.image_r2_key;

CREATE INDEX idx_cocktail_search ON cocktail_search USING gin(search_vector);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cocktails_timestamp BEFORE UPDATE ON cocktails
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function for version tracking
CREATE OR REPLACE FUNCTION track_version()
RETURNS TRIGGER AS $$
DECLARE
  v_version INTEGER;
  v_diff JSONB;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
  FROM content_versions
  WHERE entity_type = TG_TABLE_NAME AND entity_id = NEW.id;
  
  IF TG_OP = 'UPDATE' THEN
    v_diff = jsonb_diff(row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
  END IF;
  
  INSERT INTO content_versions (entity_type, entity_id, version, data, diff)
  VALUES (TG_TABLE_NAME, NEW.id, v_version, row_to_json(NEW)::jsonb, v_diff);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_cocktail_versions AFTER INSERT OR UPDATE ON cocktails
FOR EACH ROW EXECUTE FUNCTION track_version();

CREATE TRIGGER track_wine_versions AFTER INSERT OR UPDATE ON wines
FOR EACH ROW EXECUTE FUNCTION track_version();