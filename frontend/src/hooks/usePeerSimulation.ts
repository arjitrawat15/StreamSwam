import { useState, useEffect, useCallback, useRef } from 'react';

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

export type ConnectionStatus = 'connecting' | 'connected' | 'cdn-only';

export const usePeerSimulation = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [p2pEnabled, setP2pEnabled] = useState(true);

  const trackerUrl = import.meta.env.VITE_TRACKER_URL || 'ws://localhost:9000';
  const videoId = new URLSearchParams(window.location.search).get('v') || 'demo-video';

  const wsRef = useRef<WebSocket | null>(null);
  const rtcConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const myPeerId = useRef<string>('');

  useEffect(() => {
    if (!p2pEnabled) {
      setConnectionStatus('cdn-only');
      setPeers([]);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      rtcConnections.current.forEach(pc => pc.close());
      rtcConnections.current.clear();
      return;
    }

    setConnectionStatus('connecting');
    const ws = new WebSocket(trackerUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      ws.send(JSON.stringify({ type: 'join', video_id: videoId }));
      
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 15000);
      
      ws.addEventListener('close', () => clearInterval(heartbeat));
    };

    const createPeerConnection = (targetPeerId: string, isInitiator: boolean) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      rtcConnections.current.set(targetPeerId, pc);

      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'ice_candidate',
            target_peer_id: targetPeerId,
            candidate: event.candidate
          }));
        }
      };

      if (isInitiator) {
        const dc = pc.createDataChannel('streamswarm');
        dc.onopen = () => console.log('Data channel opened with', targetPeerId);
        
        pc.createOffer().then(offer => {
          return pc.setLocalDescription(offer);
        }).then(() => {
          ws.send(JSON.stringify({
            type: 'offer',
            target_peer_id: targetPeerId,
            sdp: pc.localDescription
          }));
        });
      } else {
        pc.ondatachannel = (event) => {
          event.channel.onopen = () => console.log('Data channel received from', targetPeerId);
        };
      }

      return pc;
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'swarm_info') {
          myPeerId.current = msg.peer_id;
        } 
        else if (msg.type === 'peer_joined') {
          const newPeerId = msg.peer_id;
          // Add peer to UI
          setPeers(prev => {
            if (prev.find(p => p.id === newPeerId)) return prev;
            return [...prev, {
              id: newPeerId,
              location: 'Live Peer',
              flag: '🌐',
              downloadSpeed: 5 + Math.random() * 5,
              uploadSpeed: 2 + Math.random() * 5,
              latency: Math.floor(20 + Math.random() * 80),
              connectedAt: new Date(),
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPeerId}`
            }];
          });
          // Initiate WebRTC connection
          createPeerConnection(newPeerId, true);
        }
        else if (msg.type === 'peer_left') {
          setPeers(prev => prev.filter(p => p.id !== msg.peer_id));
          const pc = rtcConnections.current.get(msg.peer_id);
          if (pc) {
            pc.close();
            rtcConnections.current.delete(msg.peer_id);
          }
        }
        else if (msg.type === 'offer') {
          const fromPeerId = msg.from_peer_id;
          const pc = createPeerConnection(fromPeerId, false);
          
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          ws.send(JSON.stringify({
            type: 'answer',
            target_peer_id: fromPeerId,
            sdp: pc.localDescription
          }));
          
          setPeers(prev => {
            if (prev.find(p => p.id === fromPeerId)) return prev;
            return [...prev, {
              id: fromPeerId,
              location: 'Live Peer',
              flag: '🌐',
              downloadSpeed: 5 + Math.random() * 5,
              uploadSpeed: 2 + Math.random() * 5,
              latency: Math.floor(20 + Math.random() * 80),
              connectedAt: new Date(),
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fromPeerId}`
            }];
          });
        }
        else if (msg.type === 'answer') {
          const fromPeerId = msg.from_peer_id;
          const pc = rtcConnections.current.get(fromPeerId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          }
        }
        else if (msg.type === 'ice_candidate') {
          const fromPeerId = msg.from_peer_id;
          const pc = rtcConnections.current.get(fromPeerId);
          if (pc && msg.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
          }
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('connecting');
      setPeers([]);
      rtcConnections.current.forEach(pc => pc.close());
      rtcConnections.current.clear();
    };

    return () => {
      ws.close();
    };
  }, [p2pEnabled, trackerUrl, videoId]);

  const toggleP2p = useCallback(() => {
    setP2pEnabled(prev => !prev);
  }, []);

  const addPeer = useCallback(() => {}, []);
  const removePeer = useCallback(() => {}, []);

  // Simulate updating speeds for connected WebRTC peers for UI
  useEffect(() => {
    if (!p2pEnabled || peers.length === 0) return;
    const interval = setInterval(() => {
      setPeers(prev => prev.map(peer => ({
        ...peer,
        downloadSpeed: Math.max(2, peer.downloadSpeed + (Math.random() - 0.5) * 2),
        uploadSpeed: Math.max(1, Math.min(10, peer.uploadSpeed + (Math.random() - 0.5))),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [p2pEnabled, peers.length]);

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
