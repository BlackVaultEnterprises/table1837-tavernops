import { useEffect, useState, useCallback } from 'react';
import { pusherService } from '../services/pusher';

interface UsePusherOptions {
  channelName: string;
  events: string[];
  enabled?: boolean;
}

/**
 * Custom hook for Pusher real-time subscriptions
 * Handles channel lifecycle and event binding
 */
export const usePusher = ({ channelName, events, enabled = true }: UsePusherOptions) => {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Initialize Pusher if not already done
    pusherService.initialize();

    // Subscribe to channel
    const channel = pusherService.subscribeToChannel(channelName);
    if (!channel) return;

    setIsConnected(true);

    // Bind to all specified events
    const handleEvent = (data: any) => {
      setLastMessage({
        channel: channelName,
        data,
        timestamp: new Date(),
      });
    };

    events.forEach(eventName => {
      channel.bind(eventName, handleEvent);
    });

    // Cleanup
    return () => {
      events.forEach(eventName => {
        channel.unbind(eventName, handleEvent);
      });
      pusherService.unsubscribeFromChannel(channelName);
      setIsConnected(false);
    };
  }, [channelName, events, enabled]);

  const sendMessage = useCallback((eventName: string, data: any) => {
    // Note: Pusher is publish from server only
    // This would make an API call to your backend
    console.warn('Pusher events must be triggered from the server');
  }, []);

  return {
    lastMessage,
    isConnected,
    sendMessage,
  };
};