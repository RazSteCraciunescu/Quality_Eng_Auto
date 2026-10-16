from __future__ import annotations

import argparse
import json
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def request_json(url: str) -> tuple[int, dict[str, object]]:
    request = Request(url, headers={"Accept": "application/json"})
    try:
        with urlopen(request, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        body = error.read().decode("utf-8")
        return error.code, json.loads(body) if body else {}


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a small smoke test against Release Readiness Lab.")
    parser.add_argument("--base-url", default="http://127.0.0.1:4173")
    args = parser.parse_args()
    base_url = args.base_url.rstrip("/")
    failures: list[str] = []

    try:
        health_status, health = request_json(f"{base_url}/api/health")
        if health_status != 200 or health.get("status") != "ok":
            failures.append(f"health check failed: {health_status} {health}")

        release_status, releases = request_json(
            f"{base_url}/api/releases?sort=riskScore&direction=desc"
        )
        data = releases.get("data")
        if release_status != 200 or not isinstance(data, list):
            failures.append(f"release list failed: {release_status} {releases}")
        elif len(data) != 3 or data[0].get("name") != "Cirrus":
            failures.append(f"unexpected release ordering: {data}")

        detail_status, detail = request_json(f"{base_url}/api/releases/aurora-480")
        release = detail.get("data")
        if detail_status != 200 or not isinstance(release, dict) or release.get("status") != "ready":
            failures.append(f"Aurora detail failed: {detail_status} {detail}")
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        failures.append(f"request failed: {error}")

    if failures:
        print("Smoke test failed:")
        for failure in failures:
            print(f"  - {failure}")
        return 1

    print("Smoke test passed: health, risk ordering, and ready-release detail verified.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
