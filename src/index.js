export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve static files from the frontend build
    return env.ASSETS.fetch(request);
  }
};