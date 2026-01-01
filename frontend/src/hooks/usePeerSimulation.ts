import { useState, useEffect, useCallback } from 'react';

export interface Peer {
  id: string;
  location: string;
  flag: string;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  connectedAt: Date;
  avatar: string;
}

const LOCATIONS = [
  { city: 'New York', flag: '🇺🇸' },
  { city: 'London', flag: '🇬🇧' },
  { city: 'Tokyo', flag: '🇯🇵' },
  { city: 'Sydney', flag: '🇦🇺' },
  { city: 'Berlin', flag: '🇩🇪' },
  { city: 'Paris', flag: '🇫🇷' },
  { city: 'Toronto', flag: '🇨🇦' },
  { city: 'Singapore', flag: '🇸🇬' },
  { city: 'Seoul', flag: '🇰🇷' },
  { city: 'Mumbai', flag: '🇮🇳' },
];

const generatePeerId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'peer_';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const generatePeer = (): Peer => {
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const id = generatePeerId();
  return {
    id,
    location: location.city,
    flag: location.flag,
    downloadSpeed: 5 + Math.random() * 10,
    uploadSpeed: 2 + Math.random() * 6,
    latency: 20 + Math.random() * 130,
    connectedAt: new Date(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
  };
};

export type ConnectionStatus = 'connecting' | 'connected' | 'cdn-only';

export const usePeerSimulation = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [p2pEnabled, setP2pEnabled] = useState(true);

  const addPeer = useCallback(() => {
    if (peers.length < 12) {
      setPeers((prev) => [...prev, generatePeer()]);
    }
  }, [peers.length]);

  const removePeer = useCallback(() => {
    if (peers.length > 2) {
      setPeers((prev) => {
        const index = Math.floor(Math.random() * prev.length);
        return prev.filter((_, i) => i !== index);
      });
    }
  }, [peers.length]);

  const toggleP2p = useCallback(() => {
    setP2pEnabled((prev) => !prev);
    if (p2pEnabled) {
      setPeers([]);
      setConnectionStatus('cdn-only');
    } else {
      setConnectionStatus('connecting');
    }
  }, [p2pEnabled]);

  // Initial connection simulation
  useEffect(() => {
    if (!p2pEnabled) return;

    const timers: NodeJS.Timeout[] = [];

    // Start connecting
    setConnectionStatus('connecting');

    // First peer at 3s
    timers.push(
      setTimeout(() => {
        addPeer();
        setConnectionStatus('connected');
      }, 3000)
    );

    // 2 more at 5s
    timers.push(
      setTimeout(() => {
        addPeer();
        addPeer();
      }, 5000)
    );

    // 3 more at 8s
    timers.push(
      setTimeout(() => {
        addPeer();
        addPeer();
        addPeer();
      }, 8000)
    );

    return () => timers.forEach(clearTimeout);
  }, [p2pEnabled, addPeer]);

  // Random fluctuation
  useEffect(() => {
    if (!p2pEnabled || connectionStatus !== 'connected') return;

    const interval = setInterval(() => {
      const action = Math.random();
      if (action < 0.3 && peers.length < 10) {
        addPeer();
      } else if (action < 0.4 && peers.length > 4) {
        removePeer();
      }

      // Update peer speeds
      setPeers((prev) =>
        prev.map((peer) => ({
          ...peer,
          downloadSpeed: Math.max(2, peer.downloadSpeed + (Math.random() - 0.5) * 2),
          uploadSpeed: Math.max(1, peer.uploadSpeed + (Math.random() - 0.5) * 1),
          latency: Math.max(10, Math.min(200, peer.latency + (Math.random() - 0.5) * 20)),
        }))
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [p2pEnabled, connectionStatus, peers.length, addPeer, removePeer]);

  return {
    peers,
    peerCount: peers.length,
    connectionStatus,
    p2pEnabled,
    toggleP2p,
    addPeer,
    removePeer,
  };
};
