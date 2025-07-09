#!/bin/bash

echo "🗄️ Setting up Neon Database for Table 1837 Tavern"
echo "================================================"

# Neon connection details
NEON_CONNECTION="postgresql://neondb_owner:npg_yUzrV75hQIfM@ep-shy-math-aeg5mcxo.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Run the schema
echo "Creating database schema..."
psql "$NEON_CONNECTION" < infrastructure/neon-schema.sql

echo "✅ Database schema created!"

# Create staging branch in Neon
echo "Creating staging branch..."
curl -X POST https://console.neon.tech/api/v2/projects/cold-surf-85059894/branches \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": {
      "name": "staging",
      "parent_id": "main"
    }
  }'

echo "✅ Neon database setup complete!"
echo ""
echo "Connection strings:"
echo "Pooled (for app): postgresql://neondb_owner:npg_yUzrV75hQIfM@ep-shy-math-aeg5mcxo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
echo "Direct (for migrations): postgresql://neondb_owner:npg_yUzrV75hQIfM@ep-shy-math-aeg5mcxo.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"