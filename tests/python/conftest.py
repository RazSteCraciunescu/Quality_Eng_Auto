from __future__ import annotations

import os
import socket
import subprocess
import time
from pathlib import Path

import pytest
import requests

ROOT = Path(__file__).resolve().parents[2]


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


@pytest.fixture(scope="session")
def base_url() -> str:
    external = os.getenv("BASE_URL")
    if external:
        yield external.rstrip("/")
        return

    port = free_port()
    process = subprocess.Popen(
        ["node", "dist/server.js"],
        cwd=ROOT,
        env={**os.environ, "HOST": "127.0.0.1", "PORT": str(port)},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    url = f"http://127.0.0.1:{port}"
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline:
        if process.poll() is not None:
            stdout, stderr = process.communicate(timeout=2)
            raise RuntimeError(f"Server stopped during startup.\nSTDOUT:\n{stdout}\nSTDERR:\n{stderr}")
        try:
            if requests.get(f"{url}/api/health", timeout=0.4).status_code == 200:
                break
        except requests.RequestException:
            time.sleep(0.1)
    else:
        process.terminate()
        raise RuntimeError("Timed out waiting for the local server")

    yield url

    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
