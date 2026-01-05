import asyncio
import websockets
import json

async def test():
    uri = "ws://localhost:8000"
    async with websockets.connect(uri) as websocket:
        
        # 1. Simulate "Announce" (I have chunk_1) [cite: 141]
        announce_msg = {
            "type": "announce",
            "chunks": ["chunk_1_hash", "chunk_2_hash"]
        }
        await websocket.send(json.dumps(announce_msg))
        response = await websocket.recv()
        print(f"Server Response: {response}")

        # 2. Simulate "Get Peers" (Who has chunk_5?) [cite: 144]
        request_msg = {
            "type": "get_peers",
            "chunk_id": "chunk_5_hash"
        }
        await websocket.send(json.dumps(request_msg))
        response = await websocket.recv()
        print(f"Server Response: {response}")

asyncio.run(test())