import os
import time
import main_split

def watch_videos(input_dir="videos", output_dir="chunks", interval=5):
    """
    Polls the input directory for new videos and triggers splitting.
    """
    print(f"👀 Watching directory: {input_dir}")
    print(f"📂 Saving chunks to: {output_dir}")
    print(f"⏱️  Checking every {interval} seconds...")

    # Ensure directories exist
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    # Track file sizes to ensure upload is complete
    last_sizes = {}

    try:
        while True:
            files = [f for f in os.listdir(input_dir) if f.lower().endswith(main_split.VIDEO_EXTENSIONS)]
            
            for file in files:
                filepath = os.path.join(input_dir, file)
                current_size = os.path.getsize(filepath)

                # Check if it's already processed
                if main_split.is_video_processed(filepath, output_dir):
                    continue

                # To prevent processing a file while it's still being uploaded/copied,
                # we check if its size has remained stable for one interval.
                if filepath in last_sizes:
                    if last_sizes[filepath] == current_size:
                        # Size is stable, start processing
                        print(f"\n📦 New video detected and stable: {file}")
                        main_split.split_unprocessed_videos(input_dir, output_dir)
                        # We don't need to track this file anymore unless it's deleted and re-added
                        del last_sizes[filepath]
                    else:
                        # Size is still changing
                        print(f"⏳ File still uploading: {file}...", end="\r")
                        last_sizes[filepath] = current_size
                else:
                    # First time seeing this file
                    last_sizes[filepath] = current_size

            # Clean up last_sizes for files that were removed
            for tracked_path in list(last_sizes.keys()):
                if not os.path.exists(tracked_path):
                    del last_sizes[tracked_path]

            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n🛑 Watcher stopped.")

if __name__ == "__main__":
    # You can change these paths as needed
    INPUT_DIR = "/home/ubuntu/share/videos"
    OUTPUT_DIR = "/home/ubuntu/share/chunks"
    
    # In main-split.py, default is /home/ubuntu/... 
    # Let's use relative paths for consistency in the project folder
    watch_videos(INPUT_DIR, OUTPUT_DIR)
