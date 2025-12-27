# Spliting 

Overview
- Purpose: utilities to split input streams/files and optionally watch directories for new files to process.
- Location: `backend/spliting`

Key files
- `main_split.py`: CLI/entrypoint for running split workflows.
- `split.py`: core splitting logic (functions to partition/segment data/files).
- `watcher.py`: filesystem watcher that triggers splitting when new files appear.

Requirements
- Python 3.8+ (adjust if the project uses a different minimum).
- Common libs: add any required packages to your project-level `requirements.txt` if missing.

Quick start
1. From the repository root, run the main script (example):

```bash
python3 backend/spliting/main_split.py --input /path/to/input --outdir /path/to/output
```

2. To run the watcher (auto-process new files):

```bash
python3 backend/spliting/watcher.py --watch /path/to/watch --outdir /path/to/output
```

Usage notes
- `--input`: path to an input file or directory depending on the script.
- `--outdir`: destination for split outputs.
- Check each script's `--help` for full CLI flags: e.g. `python3 backend/spliting/main_split.py --help`.

API (developer quick reference)
- In `split.py` you'll find functions that perform the splitting. Typical function signatures:
  - `split_file(path, outdir, **options)` — splits a single file and writes output to `outdir`.
  - `split_stream(stream, outdir, **options)` — splits data from a stream-like object.

- `watcher.py` exposes a watcher loop that monitors a directory and calls the split functions when new files arrive.

Configuration
- If the scripts read a config or env vars, document them here (e.g., chunk size, file patterns). If none exist, consider adding a small config file or CLI flags.

Troubleshooting
- Permission errors: ensure the process can read `--input` and write `--outdir`.
- Long-running watcher: run under a process manager (systemd, supervisor) for reliability.

Contributing
- Follow the repo's contribution guidelines.
- Add tests for any new splitting behavior and update `remed.md` when APIs change.

Contact
- If you need help, open an issue in the repo or contact the maintainer listed in the project root.
