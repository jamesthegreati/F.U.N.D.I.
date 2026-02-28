from __future__ import annotations

from pathlib import Path
import sys

# Ensure backend root is importable when running this file directly.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from bootstrap_board_cores import main


if __name__ == "__main__":
    raise SystemExit(main())
