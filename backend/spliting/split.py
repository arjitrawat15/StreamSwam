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

    output_pattern = os.path.join(output_dir, "chunk_%03d.mp4")

    command = [
        "ffmpeg",
        "-i", input_video,
        "-c", "copy",
        "-map", "0",
        "-f", "segment",
        "-segment_time", str(chunk_duration),
        output_pattern
    ]

    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Chunks saved for {video_name}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to split video {video_name}. Error: {e.stderr}")
        raise e
