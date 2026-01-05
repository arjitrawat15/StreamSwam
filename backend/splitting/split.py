import os
import subprocess

def split_video(
    input_video: str,
    base_output_dir: str = "/home/ubuntu/share/videos/chunks",
    chunk_duration: int = 5
):
    video_name = os.path.splitext(os.path.basename(input_video))[0]
    output_dir = os.path.join(base_output_dir, video_name)
    os.makedirs(output_dir, exist_ok=True)

    # Use HLS muxer to generate fMP4 segments which are MSE-compatible
    # This generates:
    # - manifest.m3u8 (we'll ignore or use as backup)
    # - init.mp4 (initialization segment)
    # - chunk_000.m4s, chunk_001.m4s ... (media segments)
    
    # Clean up directory first to avoid mixing old chunks
    for f in os.listdir(output_dir):
        os.remove(os.path.join(output_dir, f))

    output_pattern = os.path.join(output_dir, "chunk_%03d.m4s")
    playlist_path = os.path.join(output_dir, "playlist.m3u8")
    
    # Enforce re-encoding to H.264/AAC to ensure MSE compatibility within the browser
    # The frontend expects 'video/mp4; codecs="avc1.64001f,mp4a.40.2"' (High Profile)
    # So we use libx264 and aac.
    
    command = [
        "ffmpeg",
        "-i", input_video,
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level", "4.0",
        "-c:a", "aac",
        "-ar", "44100",
        "-b:a", "128k",
        "-f", "hls",
        "-hls_time", str(chunk_duration),
        "-hls_playlist_type", "vod",
        "-hls_segment_type", "fmp4",
        "-hls_segment_filename", output_pattern,
        "-hls_fmp4_init_filename", "init.mp4",
        playlist_path
    ]

    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Chunks saved for {video_name}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to split video {video_name}. Error: {e.stderr}")
        raise e

