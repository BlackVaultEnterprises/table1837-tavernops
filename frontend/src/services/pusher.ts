import Pusher from 'pusher-js';

class PusherService {
  private pusher: Pusher | null = null;
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    const key = import.meta.env.VITE_PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

    if (!key) {
      console.warn('Pusher key not found, real-time features disabled');
      return;
    }

    this.pusher = new Pusher(key, {
      cluster,
      forceTLS: true
    });

    this.initialized = true;
  }

  subscribe(channelName: string) {
    if (!this.pusher) return null;
    return this.pusher.subscribe(channelName);
  }

  unsubscribe(channelName: string) {
    if (!this.pusher) return;
    this.pusher.unsubscribe(channelName);
  }

  disconnect() {
    if (!this.pusher) return;
    this.pusher.disconnect();
    this.initialized = false;
  }
}

export const pusherService = new PusherService();