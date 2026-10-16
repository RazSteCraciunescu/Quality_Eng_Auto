from __future__ import annotations

import requests


def test_release_summary_is_balanced(base_url: str) -> None:
    response = requests.get(f"{base_url}/api/releases", timeout=3)
    response.raise_for_status()
    payload = response.json()

    assert payload["meta"]["summary"] == {
        "total": 3,
        "ready": 1,
        "conditional": 1,
        "blocked": 1,
    }
    assert {item["name"] for item in payload["data"]} == {"Aurora", "Borealis", "Cirrus"}


def test_search_handles_case_and_partial_values(base_url: str) -> None:
    response = requests.get(f"{base_url}/api/releases", params={"q": "AUR"}, timeout=3)
    response.raise_for_status()

    assert [item["name"] for item in response.json()["data"]] == ["Aurora"]


def test_gate_can_be_re_evaluated_without_mutating_fixture(base_url: str) -> None:
    metrics = {
        "passRate": 98.5,
        "coverage": 90,
        "flakyRate": 1.2,
        "criticalDefects": 0,
        "highDefects": 0,
        "escapedDefects": 0,
    }
    evaluation = requests.post(
        f"{base_url}/api/releases/cirrus-231/evaluate",
        json={"metrics": metrics},
        timeout=3,
    )
    evaluation.raise_for_status()
    assert evaluation.json()["data"]["status"] == "ready"

    original = requests.get(f"{base_url}/api/releases/cirrus-231", timeout=3)
    original.raise_for_status()
    assert original.json()["data"]["status"] == "blocked"


def test_missing_release_has_traceable_error(base_url: str) -> None:
    response = requests.get(f"{base_url}/api/releases/missing-release", timeout=3)
    assert response.status_code == 404
    assert response.json()["error"] == "release_not_found"
    assert response.headers["X-Request-Id"]
