from __future__ import annotations

import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _statements(path: Path) -> list[str]:
    content = "\n".join(
        line for line in path.read_text(encoding="utf-8").splitlines()
        if not line.strip().startswith("--")
    )
    return [statement.strip() for statement in content.split(";") if statement.strip()]


def test_sql_schema_seed_and_zero_row_assertions_are_executable() -> None:
    connection = sqlite3.connect(":memory:")
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        connection.executescript((ROOT / "database" / "schema.sql").read_text(encoding="utf-8"))
        connection.executescript((ROOT / "database" / "seed.sql").read_text(encoding="utf-8"))

        for statement in _statements(ROOT / "database" / "tests" / "data-quality.sql"):
            assert connection.execute(statement).fetchall() == []
    finally:
        connection.close()
