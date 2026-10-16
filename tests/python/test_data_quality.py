from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_release_fixture_has_unique_ids_and_valid_totals() -> None:
    releases = json.loads((ROOT / "data" / "releases.json").read_text(encoding="utf-8"))
    ids = [release["id"] for release in releases]
    assert len(ids) == len(set(ids))

    for release in releases:
        date.fromisoformat(release["targetDate"])
        execution = release["execution"]
        assert execution["total"] == execution["passed"] + execution["failed"] + execution["skipped"]
        assert execution["automated"] <= execution["total"]
        assert release["defects"]["critical"] == release["metrics"]["criticalDefects"]
        assert release["defects"]["high"] == release["metrics"]["highDefects"]


def test_every_requirement_has_test_coverage() -> None:
    releases = json.loads((ROOT / "data" / "releases.json").read_text(encoding="utf-8"))
    uncovered = [
        requirement["id"]
        for release in releases
        for requirement in release["requirements"]
        if not requirement["coveredBy"]
    ]
    assert uncovered == []
