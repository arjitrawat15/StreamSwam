import time
import uuid
from dataclasses import dataclass, field
from typing import Dict, Set, Optional, Any
import asyncio

@dataclass
class Peer:
    peer_id: str
    websocket: Any                        # websocket connection object
    video_id: str
    chunks_have: Set[int] = field(default_factory=set)   # chunk IDs this peer has
    chunks_want: Set[int] = field(default_factory=set)   # chunk IDs this peer wants
    joined_at: float = field(default_factory=time.time)
    last_seen: float = field(default_factory=time.time)
    ip: str = ""

    def to_dict(self):
        return {
            "peer_id": self.peer_id,
            "video_id": self.video_id,
            "chunks_have": list(self.chunks_have),
            "ip": self.ip
        }

    def touch(self):
        self.last_seen = time.time()


class PeerManager:
    def __init__(self, peer_timeout: int = 30):
        # { video_id: { peer_id: Peer } }
        self.swarms: Dict[str, Dict[str, Peer]] = {}
        self.peer_timeout = peer_timeout  # seconds before peer is considered dead

    # ─── PEER LIFECYCLE ───────────────────────────────────────────

    def add_peer(self, websocket, video_id: str, ip: str = "") -> Peer:
        \"\"\"Register a new peer joining a video swarm\"\"\"
        peer_id = str(uuid.uuid4())[:8]

        if video_id not in self.swarms:
            self.swarms[video_id] = {}

        peer = Peer(
            peer_id=peer_id,
            websocket=websocket,
            video_id=video_id,
            ip=ip
        )
        self.swarms[video_id][peer_id] = peer
        return peer

    def remove_peer(self, video_id: str, peer_id: str) -> Optional[Peer]:
        \"\"\"Remove a peer from a swarm\"\"\"
        swarm = self.swarms.get(video_id, {})
        peer = swarm.pop(peer_id, None)

        # Clean up empty swarms
        if video_id in self.swarms and not self.swarms[video_id]:
            del self.swarms[video_id]

        return peer

    def get_peer(self, video_id: str, peer_id: str) -> Optional[Peer]:
        return self.swarms.get(video_id, {}).get(peer_id)

    # ─── CHUNK TRACKING ───────────────────────────────────────────

    def update_chunks_have(self, video_id: str, peer_id: str, chunk_ids: list):
        \"\"\"Update which chunks a peer has available\"\"\"
        peer = self.get_peer(video_id, peer_id)
        if peer:
            peer.chunks_have.update(chunk_ids)
            peer.touch()

    def update_chunks_want(self, video_id: str, peer_id: str, chunk_ids: list):
        \"\"\"Update which chunks a peer needs\"\"\"
        peer = self.get_peer(video_id, peer_id)
        if peer:
            peer.chunks_want = set(chunk_ids)
            peer.touch()

    # ─── PEER DISCOVERY ───────────────────────────────────────────

    def find_peers_with_chunk(
        self,
        video_id: str,
        chunk_id: int,
        requesting_peer_id: str,
        max_results: int = 5
    ) -> list:
        \"\"\"
        Find peers in the swarm who have a specific chunk.
        Excludes the requesting peer itself.
        Returns list of peer dicts.
        \"\"\"
        swarm = self.swarms.get(video_id, {})
        results = []

        for pid, peer in swarm.items():
            if pid == requesting_peer_id:
                continue
            if chunk_id in peer.chunks_have:
                results.append(peer.to_dict())
            if len(results) >= max_results:
                break

        return results

    def find_peers_for_chunks(
        self,
        video_id: str,
        chunk_ids: list,
        requesting_peer_id: str,
        max_per_chunk: int = 3
    ) -> Dict[int, list]:
        \"\"\"
        Find peers for multiple chunks at once.
        Returns { chunk_id: [peer_dicts] }
        \"\"\"
        result = {}
        for chunk_id in chunk_ids:
            peers = self.find_peers_with_chunk(
                video_id, chunk_id, requesting_peer_id, max_per_chunk
            )
            if peers:
                result[chunk_id] = peers
        return result

    # ─── SWARM INFO ───────────────────────────────────────────────

    def get_swarm_info(self, video_id: str) -> dict:
        \"\"\"Get statistics about a video's swarm\"\"\"
        swarm = self.swarms.get(video_id, {})
        total_peers = len(swarm)

        all_chunks = set()
        for peer in swarm.values():
            all_chunks.update(peer.chunks_have)

        return {
            "video_id": video_id,
            "peer_count": total_peers,
            "chunks_available": sorted(list(all_chunks)),
            "total_chunks_seeded": len(all_chunks)
        }

    def get_all_swarms_info(self) -> dict:
        \"\"\"Get overview of all active swarms\"\"\"
        return {
            "active_swarms": len(self.swarms),
            "total_peers": sum(len(s) for s in self.swarms.values()),
            "swarms": {
                vid: self.get_swarm_info(vid)
                for vid in self.swarms
            }
        }

    # ─── CLEANUP ──────────────────────────────────────────────────

    def remove_stale_peers(self) -> int:
        \"\"\"Remove peers that haven't sent a heartbeat recently\"\"\"
        now = time.time()
        removed = 0
        for video_id in list(self.swarms.keys()):
            for peer_id in list(self.swarms.get(video_id, {}).keys()):
                peer = self.swarms[video_id].get(peer_id)
                if peer and (now - peer.last_seen) > self.peer_timeout:
                    self.remove_peer(video_id, peer_id)
                    removed += 1
        return removed
