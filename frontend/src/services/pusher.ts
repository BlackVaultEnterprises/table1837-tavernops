import Pusher from 'pusher-js';

/**
 * Pusher service for real-time updates
 * Handles WebSocket connections for live features
 */
class PusherService {
  private pusher: Pusher | null = null;
  private channels: Map<string, any> = new Map();

  initialize() {
    if (this.pusher) return;

    const key = import.meta.env.VITE_PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

    if (!key || key === 'temp_pusher_key') {
      console.warn('Pusher not configured - running in demo mode');
      return;
    }

    this.pusher = new Pusher(key, {
      cluster,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
    });

    // Enable logging in development
    if (import.meta.env.DEV) {
      Pusher.logToConsole = true;
    }

    // Connection state listeners
    this.pusher.connection.bind('connected', () => {
      console.log('Connected to Pusher');
    });

    this.pusher.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });
  }

  subscribeToChannel(channelName: string) {
    if (!this.pusher) {
      console.warn('Pusher not initialized');
      return null;
    }

    // Return existing channel if already subscribed
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);
    return channel;
  }

  unsubscribeFromChannel(channelName: string) {
    if (!this.pusher) return;

    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  // Specific channel subscriptions for Table 1837
  subscribeToEightySixList(callback: (data: any) => void) {
    const channel = this.subscribeToChannel('86-list');
    if (channel) {
      channel.bind('item-added', callback);
      channel.bind('item-removed', callback);
      channel.bind('list-updated', callback);
    }
    return channel;
  }

  subscribeToReservations(callback: (data: any) => void) {
    const channel = this.subscribeToChannel('reservations');
    if (channel) {
      channel.bind('new-reservation', callback);
      channel.bind('reservation-updated', callback);
      channel.bind('reservation-cancelled', callback);
    }
    return channel;
  }

  subscribeToAlerts(callback: (data: any) => void) {
    const channel = this.subscribeToChannel('alerts');
    if (channel) {
      channel.bind('low-stock', callback);
      channel.bind('low-margin', callback);
      channel.bind('vip-arrival', callback);
    }
    return channel;
  }

  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.channels.clear();
    }
  }
}

// Export singleton instance
export const pusherService = new PusherService();