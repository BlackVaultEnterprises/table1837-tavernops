# Deta Micro - Hot Python microservices for Table 1837
# NO COLD STARTS - ALWAYS HOT - FAST AS FUCK

from deta import Deta
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
import redis.asyncio as redis
from typing import List, Optional
import json
import os
from datetime import datetime
import httpx

app = FastAPI(title="Table 1837 Microservices")

# CORS for Cloudflare Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://table1837-glenrock.pages.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize connections
deta = Deta(os.getenv("DETA_PROJECT_KEY"))
db = deta.Base("table1837_cache")
neon_dsn = os.getenv("NEON_DATABASE_URL")
redis_client = None
pusher_client = None

@app.on_event("startup")
async def startup():
    global redis_client, pusher_client
    # Redis for caching (Railway Redis)
    redis_client = await redis.from_url(os.getenv("REDIS_URL"))
    
    # Initialize Pusher for real-time
    from pusher import Pusher
    pusher_client = Pusher(
        app_id=os.getenv("PUSHER_APP_ID"),
        key=os.getenv("PUSHER_KEY"),
        secret=os.getenv("PUSHER_SECRET"),
        cluster=os.getenv("PUSHER_CLUSTER"),
        ssl=True
    )

# Blazing fast cocktail search with caching
@app.get("/api/cocktails/search")
async def search_cocktails(q: str, limit: int = 10):
    # Check Redis cache first
    cache_key = f"cocktail_search:{q}:{limit}"
    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Query Neon with full-text search
    async with asyncpg.connect(neon_dsn) as conn:
        results = await conn.fetch("""
            SELECT id, name, description, category, price, image_r2_key, ingredients_list
            FROM cocktail_search
            WHERE search_vector @@ plainto_tsquery('english', $1)
            ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
            LIMIT $2
        """, q, limit)
        
        cocktails = [dict(r) for r in results]
        
        # Cache for 1 hour
        await redis_client.setex(cache_key, 3600, json.dumps(cocktails))
        
        return cocktails

# Real-time 86 list management
@app.post("/api/86-list/add")
async def add_86_item(item: dict):
    async with asyncpg.connect(neon_dsn) as conn:
        result = await conn.fetchrow("""
            INSERT INTO eighty_six_list (item_name, category, added_by, reason)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        """, item['name'], item['category'], item['user_id'], item.get('reason'))
        
        # Broadcast via Pusher
        pusher_client.trigger('86-list', 'item-added', {
            'item': dict(result),
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Invalidate cache
        await redis_client.delete("86_list:active")
        
        return dict(result)

# Pour cost calculation with margin alerts
@app.post("/api/cocktails/calculate-cost")
async def calculate_pour_cost(cocktail_id: str):
    async with asyncpg.connect(neon_dsn) as conn:
        cocktail = await conn.fetchrow("""
            SELECT * FROM cocktails WHERE id = $1
        """, cocktail_id)
        
        if not cocktail:
            raise HTTPException(404, "Cocktail not found")
        
        # Calculate cost from ingredients
        total_cost = 0
        ingredients = json.loads(cocktail['ingredients'])
        
        for ing_name, amount in ingredients.items():
            # Look up ingredient cost (would be in separate table)
            cost_per_oz = await get_ingredient_cost(ing_name)
            total_cost += cost_per_oz * amount
        
        margin = ((cocktail['price'] - total_cost) / cocktail['price']) * 100
        
        # Alert if margin too low
        if margin < 70:  # Industry standard
            await send_margin_alert(cocktail['name'], margin)
        
        return {
            'cocktail': cocktail['name'],
            'cost': total_cost,
            'price': cocktail['price'],
            'margin_percent': margin,
            'profit': cocktail['price'] - total_cost
        }

# OCR endpoint using Google Vision API
@app.post("/api/ocr/menu")
async def ocr_menu(image_url: str):
    async with httpx.AsyncClient() as client:
        # Call Google Vision API
        response = await client.post(
            f"https://vision.googleapis.com/v1/images:annotate?key={os.getenv('GOOGLE_API_KEY')}",
            json={
                "requests": [{
                    "image": {"source": {"imageUri": image_url}},
                    "features": [{"type": "TEXT_DETECTION"}]
                }]
            }
        )
        
        text = response.json()['responses'][0]['fullTextAnnotation']['text']
        
        # Parse menu items with AI
        menu_items = await parse_menu_with_ai(text)
        
        return {"raw_text": text, "parsed_items": menu_items}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "HOT 🔥",
        "service": "Table 1837 Microservices",
        "timestamp": datetime.utcnow().isoformat()
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Subscribe to Redis pub/sub for real-time updates
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("table1837:updates")
    
    try:
        async for message in pubsub.listen():
            if message['type'] == 'message':
                await websocket.send_text(message['data'].decode())
    except:
        await websocket.close()

async def get_ingredient_cost(ingredient: str) -> float:
    # Implement ingredient cost lookup
    # This would query a separate ingredients table
    return 0.25  # Placeholder

async def send_margin_alert(cocktail_name: str, margin: float):
    # Send alert via Pusher to management
    pusher_client.trigger('alerts', 'low-margin', {
        'cocktail': cocktail_name,
        'margin': margin,
        'timestamp': datetime.utcnow().isoformat()
    })

async def parse_menu_with_ai(text: str) -> List[dict]:
    # Use Gemini or GPT to parse menu text
    # Return structured menu items
    return []