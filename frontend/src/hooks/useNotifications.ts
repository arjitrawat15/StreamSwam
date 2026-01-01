import { useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'peer' | 'chunk' | 'quality' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const getNotificationDetails = (type: Notification['type'], message: string) => {
  switch (type) {
    case 'peer':
      return {
        title: 'Peer Connected',
        description: message,
      };
    case 'chunk':
      return {
        title: 'Chunk Downloaded',
        description: message,
      };
    case 'quality':
      return {
        title: 'Quality Changed',
        description: message,
      };
    case 'system':
      return {
        title: 'System Update',
        description: message,
      };
    default:
      return {
        title: 'Notification',
        description: message,
      };
  }
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'system',
      title: 'Welcome to StreamSwarm',
      description: 'Experience the future of P2P streaming',
      timestamp: new Date(Date.now() - 60000),
      read: false,
    },
  ]);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const details = getNotificationDetails(type, message);
    const notification: Notification = {
      id: generateId(),
      type,
      ...details,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev].slice(0, 20));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Generate random notifications periodically
  useEffect(() => {
    const messages = [
      { type: 'peer' as const, msg: 'New peer connected from Tokyo' },
      { type: 'chunk' as const, msg: 'Chunk #67 downloaded via P2P' },
      { type: 'system' as const, msg: 'Network conditions improved' },
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const { type, msg } = messages[Math.floor(Math.random() * messages.length)];
        addNotification(type, msg);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    addNotification,
    markAsRead,
    clearAll,
  };
};
