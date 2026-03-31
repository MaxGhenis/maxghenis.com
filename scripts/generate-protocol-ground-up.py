"""Thin wrapper for the canonical Optiqal protocol ground-up builder."""

from __future__ import annotations

import sys
from pathlib import Path


sys.path.insert(0, str(Path.home() / "optiqal-ai" / "python"))

from optiqal.protocol_ground_up import main


if __name__ == "__main__":
    main()
