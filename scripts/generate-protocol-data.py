"""
Generate protocol page data from Optiqal catalog + health DB.

Run from the optiqal-ai/python directory:
    cd ~/optiqal-ai/python && uv run python ~/maxghenis.com/scripts/generate-protocol-data.py

Outputs: ~/maxghenis.com/src/data/protocol-data.json
"""

from __future__ import annotations

import json

from protocol_export_support import (
    OUTPUT,
    build_protocol_analysis_state,
    build_protocol_export_data,
    load_protocol_resources,
)


def main() -> None:
    resources = load_protocol_resources()
    state = build_protocol_analysis_state(resources)
    data = build_protocol_export_data(state)
    OUTPUT.write_text(json.dumps(data, indent=2))

    summary = data["summary"]
    schedule = data["schedule"]
    print(f"Wrote {OUTPUT}")
    print(
        f"  {len(data['supplements'])} supplements, {len(data['bundles'])} bundles, "
        f"{len(data['portfolio'])} portfolio steps"
    )
    print(
        f"  Schedule: {sum(len(items) for items in schedule.values())} items across "
        f"{len(schedule)} time slots"
    )
    print(f"  Summary: {summary['total_items']} selected, {summary['total_days']:.0f} days, ${summary['total_annual_cost']}/yr")


if __name__ == "__main__":
    main()
