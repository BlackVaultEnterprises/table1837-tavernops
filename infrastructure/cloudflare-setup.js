// Cloudflare Pages + Workers Configuration
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Edge-based routing for API endpoints
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, ctx);
    }
    
    // Serve static assets with aggressive caching
    return env.ASSETS.fetch(request);
  },
};

async function handleAPI(request, env, ctx) {
  const url = new URL(request.url);
  
  // Real-time 86 list via Durable Objects
  if (url.pathname === '/api/86-list/ws') {
    const id = env.EIGHTY_SIX_LIST.idFromName('global');
    const obj = env.EIGHTY_SIX_LIST.get(id);
    return obj.fetch(request);
  }
  
  // Forward to Deta/Railway backend
  const backendUrl = `${env.BACKEND_URL}${url.pathname}`;
  return fetch(backendUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}

// Durable Object for real-time 86 list
export class EightySixList {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    await this.handleSession(server);
    
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSession(websocket) {
    websocket.accept();
    this.sessions.push(websocket);
    
    websocket.addEventListener('message', async (msg) => {
      const data = JSON.parse(msg.data);
      
      // Broadcast to all connected clients
      this.sessions.forEach(session => {
        if (session.readyState === 1) {
          session.send(JSON.stringify(data));
        }
      });
      
      // Persist to Neon DB
      await this.env.DB.prepare(
        'INSERT INTO eighty_six_events (data) VALUES (?)'
      ).bind(JSON.stringify(data)).run();
    });
    
    websocket.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== websocket);
    });
  }
}