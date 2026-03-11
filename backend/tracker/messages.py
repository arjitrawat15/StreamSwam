\"\"\"
All WebSocket message types between tracker and peers.
All messages are JSON with a 'type' field.
\"\"\"

# CLIENT → TRACKER
MSG_JOIN        = "join"         # Peer joins a video swarm
MSG_HAVE        = "have"         # Peer announces chunks it has
MSG_WANT        = "want"         # Peer requests peers who have a chunk
MSG_LEAVE       = "leave"        # Peer leaves swarm
MSG_HEARTBEAT   = "heartbeat"    # Keep-alive ping

# TRACKER → CLIENT  
MSG_PEERS       = "peers"        # List of peers with wanted chunks
MSG_PEER_JOINED = "peer_joined"  # New peer joined this swarm
MSG_PEER_LEFT   = "peer_left"    # Peer left this swarm
MSG_SWARM_INFO  = "swarm_info"   # Current swarm statistics
MSG_ERROR       = "error"        # Error response
MSG_PONG        = "pong"         # Heartbeat response

# CLIENT ↔ CLIENT (relayed through tracker for WebRTC signaling)
MSG_OFFER       = "offer"        # WebRTC SDP offer
MSG_ANSWER      = "answer"       # WebRTC SDP answer  
MSG_ICE         = "ice_candidate" # WebRTC ICE candidate
