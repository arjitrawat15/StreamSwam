import asyncio
import websockets
import json
from collections import defaultdict

# Store active connections: peer_id -> websocket object
connected_peers = {}

# Store chunk ownership: chunk_id -> set of peer_ids
# Example: "chunk_5": {"peer_abc", "peer_xyz"} [cite: 50]
chunk_owners = defaultdict(set)

async def handler(websocket):
    # Assign a temporary ID to the connection (in production, use a UUID)
    peer_id = str(id(websocket))
    connected_peers[peer_id] = websocket
    print(f"New Peer Connected: {peer_id}")

    try:
        async for message in websocket:
            data = json.loads(message)
            action = data.get("type")

            # --- ACTION 1: ANNOUNCE ---
            # Peer tells tracker: "I have these chunks" [cite: 141]
            if action == "announce":
                new_chunks = data.get("chunks", [])
                for chunk_hash in new_chunks:
                    chunk_owners[chunk_hash].add(peer_id)
                
                print(f"Peer {peer_id} announced ownership of {len(new_chunks)} chunks.")
                
                # Acknowledge receipt
                await websocket.send(json.dumps({
                    "type": "announce_ack",
                    "status": "success"
                }))

            # --- ACTION 2: REQUEST PEERS ---
            # Peer asks: "Who has this chunk?" [cite: 144]
            elif action == "get_peers":
                target_chunk = data.get("chunk_id")
                
                # Find owners (excluding the requester themselves)
                potential_owners = chunk_owners.get(target_chunk, set())
                peers_list = list(potential_owners - {peer_id})
                
                # Send list back to client [cite: 145]
                response = {
                    "type": "peers_list",
                    "chunk_id": target_chunk,
                    "peers": peers_list
                }
                await websocket.send(json.dumps(response))
                print(f"Sent {len(peers_list)} peers for {target_chunk} to {peer_id}")

            # --- FUTURE: SIGNALING (WebRTC) ---
            # This is where you will add logic later to exchange ICE candidates [cite: 32]
            
    except websockets.exceptions.ConnectionClosed:
        print(f"Peer {peer_id} disconnected")
    finally:
        # Cleanup: Remove peer from connections and chunk ownership lists
        if peer_id in connected_peers:
            del connected_peers[peer_id]
        
        # Remove this peer from all chunk records
        for chunk_hash in chunk_owners:
            if peer_id in chunk_owners[chunk_hash]:
                chunk_owners[chunk_hash].remove(peer_id)

async def main():
    # Start the WebSocket server on localhost:8000 
    print("Tracker Server running on ws://localhost:8000...")
    async with websockets.serve(handler, "localhost", 8000):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())