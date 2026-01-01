import split
import os

import subprocess

VIDEO_EXTENSIONS = ('.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv')

def is_video_processed(video_path: str, base_output_dir: str = "chunks") -> bool:
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    output_dir = os.path.join(base_output_dir, video_name)

    if not os.path.exists(output_dir):
        return False
    
    for f in os.listdir(output_dir):
        if f.startswith("chunk_") and f.endswith(".mp4"):
            return True

    return False

def split_unprocessed_videos(
    input_videos_dir: str,
    base_output_dir: str = "chunks",
    chunk_duration: int = 5
):
    if not os.path.exists(input_videos_dir):
        print(f"❌ Input directory does not exist: {input_videos_dir}")
        return

    os.makedirs(base_output_dir, exist_ok=True)

    for file in os.listdir(input_videos_dir):
        if not file.lower().endswith(VIDEO_EXTENSIONS):
            continue

        video_path = os.path.join(input_videos_dir, file)

        # if(file start with done) continue; //adding later

        if is_video_processed(video_path, base_output_dir):
            print(f"⏭️  Skipping (already processed): {file}")
            continue

        print(f"▶️  Processing: {file}")
        try:
            split.split_video(video_path, base_output_dir, chunk_duration)
        except Exception as e:
            print(f"❌ Failed: {file}. Error: {e}")

if __name__ == "__main__":
    # Example usage:
    # Set your input directory and output directory here
    INPUT_DIR = "videos"  # Change this to your videos folder
    OUTPUT_DIR = "chunks"
    
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR, exist_ok=True)
        print(f"📁 Created '{INPUT_DIR}' directory. Please put your videos there.")
    else:
        split_unprocessed_videos(INPUT_DIR, OUTPUT_DIR)