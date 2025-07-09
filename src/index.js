export default {
  async fetch(request, env, ctx) {
    // Serve static assets from the frontend build directory
    try {
      // Try to fetch the requested asset
      const response = await env.ASSETS.fetch(request);
      
      // If successful, return it
      if (response.status !== 404) {
        return response;
      }
      
      // For 404s on non-asset paths, return index.html for client-side routing
      const url = new URL(request.url);
      if (!url.pathname.includes('.')) {
        return env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
      }
      
      return response;
    } catch (e) {
      // Fallback response if ASSETS binding is not configured
      return new Response('Site is being deployed. Please refresh in a moment.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};