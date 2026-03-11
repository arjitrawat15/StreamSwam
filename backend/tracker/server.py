import asyncio
import json
import logging
import os
import time
import websockets
from websockets.server import WebSocketServerProtocol

from .peer_manager import PeerManager
from .messages import (
    MSG_JOIN, MSG_HAVE, MSG_WANT, MSG_LEAVE, MSG_HEARTBEAT,
    MSG_PEERS, MSG_PEER_JOINED, MSG_PEER_LEFT, MSG_SWARM_INFO,
    MSG_ERROR, MSG_PONG, MSG_OFFER, MSG_ANSWER, MSG_ICE
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tracker")

manager = PeerManager(peer_timeout=30)

# Track which websocket belongs to which (video_id, peer_id)
# { websocket: (video_id, peer_id) }
ws_registry: dict = {}


async def send(ws, msg_type: str, **data):
    \"\"\"Send JSON message to a websocket\"\"\"
    try:
        payload = {"type": msg_type, **data}
        await ws.send(json.dumps(payload))
    except Exception as e:
        logger.warning(f"Failed to send {msg_type}: {e}")


async def broadcast_to_swarm(video_id: str, msg_type: str, exclude_peer_id: str = None, **data):
    \"\"\"Send message to all peers in a swarm\"\"\"
    swarm = manager.swarms.get(video_id, {})
    payload = json.dumps({"type": msg_type, **data})

    tasks = []
    for pid, peer in swarm.items():
        if pid == exclude_peer_id:
            continue
        try:
            tasks.append(peer.websocket.send(payload))
        except Exception:
            pass

    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)


async def handle_message(ws: WebSocketServerProtocol, peer_id: str, video_id: str, message: dict):
    \"\"\"Handle incoming message from a peer\"\"\"
    msg_type = message.get("type")

    # ── HAVE: peer announces chunks it has ───────────────────────
    if msg_type == MSG_HAVE:
        chunks = message.get("chunks", [])
        manager.update_chunks_have(video_id, peer_id, chunks)

        # Broadcast to swarm so other peers know
        await broadcast_to_swarm(
            video_id, MSG_PEER_JOINED,
            exclude_peer_id=peer_id,
            peer_id=peer_id,
            chunks=chunks
        )
        logger.info(f"Peer {peer_id} has {len(chunks)} chunks for {video_id}")

    # ── WANT: peer requests peers who have certain chunks ─────────
    elif msg_type == MSG_WANT:
        chunk_ids = message.get("chunks", [])
        manager.update_chunks_want(video_id, peer_id, chunk_ids)

        peers_map = manager.find_peers_for_chunks(video_id, chunk_ids, peer_id)

        await send(ws, MSG_PEERS,
            video_id=video_id,
            peers=peers_map,
            swarm=manager.get_swarm_info(video_id)
        )

    # ── HEARTBEAT ─────────────────────────────────────────────────
    elif msg_type == MSG_HEARTBEAT:
        peer = manager.get_peer(video_id, peer_id)
        if peer:
            peer.touch()
        await send(ws, MSG_PONG, timestamp=time.time())

    # ── WEBRTC SIGNALING: relay offer/answer/ice between peers ────
    elif msg_type in (MSG_OFFER, MSG_ANSWER, MSG_ICE):
        target_peer_id = message.get("target_peer_id")
        if not target_peer_id:
            await send(ws, MSG_ERROR, message="Missing target_peer_id")
            return

        target_peer = manager.get_peer(video_id, target_peer_id)
        if not target_peer:
            await send(ws, MSG_ERROR, message=f"Peer {target_peer_id} not found")
            return

        # Relay the signaling message to target peer
        await send(
            target_peer.websocket,
            msg_type,
            from_peer_id=peer_id,
            **{k: v for k, v in message.items() if k not in ("type", "target_peer_id")}
        )

    # ── SWARM INFO: request stats ─────────────────────────────────
    elif msg_type == "get_swarm_info":
        info = manager.get_swarm_info(video_id)
        await send(ws, MSG_SWARM_INFO, **info)

    else:
        await send(ws, MSG_ERROR, message=f"Unknown message type: {msg_type}")


async def handle_connection(ws: WebSocketServerProtocol):
    \"\"\"Handle a new WebSocket connection\"\"\"
    ip = ws.remote_address[0] if ws.remote_address else "unknown"
    peer = None
    video_id = None
    peer_id = None

    try:
        # First message must be JOIN
        raw = await asyncio.wait_for(ws.recv(), timeout=10)
        join_msg = json.loads(raw)

        if join_msg.get("type") != MSG_JOIN:
            await send(ws, MSG_ERROR, message="First message must be 'join'")
            return

        video_id = join_msg.get("video_id")
        if not video_id:
            await send(ws, MSG_ERROR, message="Missing video_id in join message")
            return

        # Register peer
        peer = manager.add_peer(ws, video_id, ip)
        peer_id = peer.peer_id
        ws_registry[ws] = (video_id, peer_id)

        logger.info(f"✅ Peer {peer_id} joined swarm for video {video_id} (from {ip})")

        # Send join confirmation with swarm info
        swarm_info = manager.get_swarm_info(video_id)
        await send(ws, MSG_SWARM_INFO,
            peer_id=peer_id,
            video_id=video_id,
            **swarm_info
        )

        # Tell other peers in swarm that someone joined
        await broadcast_to_swarm(
            video_id, MSG_PEER_JOINED,
            exclude_peer_id=peer_id,
            peer_id=peer_id
        )

        # Handle messages
        async for raw_msg in ws:
            try:
                message = json.loads(raw_msg)
                await handle_message(ws, peer_id, video_id, message)
            except json.JSONDecodeError:
                await send(ws, MSG_ERROR, message="Invalid JSON")
            except Exception as e:
                logger.error(f"Message handling error: {e}")

    except asyncio.TimeoutError:
        logger.warning(f"Peer from {ip} timed out waiting for join")
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Peer {peer_id} disconnected from {video_id}")
    except Exception as e:
        logger.error(f"Connection error: {e}")
    finally:
        # Clean up on disconnect
        if video_id and peer_id:
            manager.remove_peer(video_id, peer_id)
            ws_registry.pop(ws, None)

            await broadcast_to_swarm(
                video_id, MSG_PEER_LEFT,
                peer_id=peer_id
            )
            logger.info(f"🔴 Peer {peer_id} removed from swarm {video_id}")


async def cleanup_loop():
    \"\"\"Periodically remove stale peers\"\"\"
    while True:
        await asyncio.sleep(15)
        removed = manager.remove_stale_peers()
        if removed:
            logger.info(f"🧹 Removed {removed} stale peers")


async def stats_loop():
    \"\"\"Log swarm stats every 30 seconds\"\"\"
    while True:
        await asyncio.sleep(30)
        info = manager.get_all_swarms_info()
        logger.info(
            f"📊 Tracker stats — "
            f"Swarms: {info['active_swarms']} | "
            f"Peers: {info['total_peers']}"
        )


async def main():
    host = os.getenv("TRACKER_HOST", "0.0.0.0")
    port = int(os.getenv("TRACKER_PORT", 9000))

    print(f\"\"\"
    ╔═══════════════════════════════════════════╗
    ║     StreamSwarm Tracker Server            ║
    ║                                           ║
    ║  🔌 WebSocket: ws://{host}:{port}          ║
    ║  📡 Waiting for peers...                  ║
    ╚═══════════════════════════════════════════╝
    \"\"\")

    async with websockets.serve(
        handle_connection,
        host,
        port,
        ping_interval=20,
        ping_timeout=10,
        max_size=1_048_576,  # 1MB max message
    ):
        await asyncio.gather(
            asyncio.Future(),   # run forever
            cleanup_loop(),
            stats_loop()
        )
