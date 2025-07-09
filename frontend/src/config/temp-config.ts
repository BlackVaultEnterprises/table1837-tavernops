/**
 * Temporary configuration for initial deployment
 * Replace these with real credentials when available
 */

export const tempConfig = {
  // Temporary auth config (will replace with Clerk)
  auth: {
    enabled: false,
    mockUser: {
      id: 'demo-user',
      name: 'Demo User',
      role: 'Manager',
    }
  },
  
  // Temporary WebSocket config (will replace with Pusher)
  realtime: {
    enabled: false,
    mockUpdates: true,
    updateInterval: 30000, // 30 seconds
  },
  
  // Features to show in demo mode
  features: {
    showAuth: false,
    show86List: true,
    showPourCost: true,
    showChecklists: true,
    showReservations: false, // Requires auth
  }
};