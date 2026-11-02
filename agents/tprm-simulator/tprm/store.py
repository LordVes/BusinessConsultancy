"""SQLite persistence. Fake data only; the DB file is git-ignored."""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path

DEFAULT_DB = Path(os.environ.get("TPRM_DB", Path(__file__).resolve().parent.parent / "data" / "tprm.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, vtype TEXT, description TEXT, country TEXT,
  regimes TEXT NOT NULL DEFAULT '',
  ict_service INTEGER NOT NULL DEFAULT 0, critical_function INTEGER NOT NULL DEFAULT 0,
  data_sensitivity INTEGER, criticality INTEGER, system_access INTEGER,
  substitutability INTEGER, regulatory_impact INTEGER,
  tier INTEGER, inherent REAL, stage INTEGER NOT NULL DEFAULT 1, exited INTEGER NOT NULL DEFAULT 0,
  created_on TEXT, last_assessed TEXT, reassessment_flag INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tasks_done (
  vendor_id INTEGER, task_id TEXT, done_on TEXT, PRIMARY KEY (vendor_id, task_id)
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, vendor_id INTEGER, kind TEXT, severity INTEGER, note TEXT,
  opened_on TEXT, closed_on TEXT, resolution TEXT,
  notify_required INTEGER NOT NULL DEFAULT 0, notified INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, sim_date TEXT, vendor_id INTEGER, action TEXT, detail TEXT
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
"""


class Store:
    def __init__(self, path: str | Path | None = None):
        self.path = str(path or DEFAULT_DB)
        if self.path != ":memory:":
            Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(self.path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)

    def query(self, sql: str, params: tuple = ()) -> list[dict]:
        return [dict(r) for r in self.conn.execute(sql, params).fetchall()]

    def one(self, sql: str, params: tuple = ()) -> dict | None:
        rows = self.query(sql, params)
        return rows[0] if rows else None

    def execute(self, sql: str, params: tuple = ()) -> int:
        cur = self.conn.execute(sql, params)
        self.conn.commit()
        return cur.lastrowid or 0

    def get_meta(self, key: str, default: str | None = None) -> str | None:
        row = self.one("SELECT value FROM meta WHERE key=?", (key,))
        return row["value"] if row else default

    def set_meta(self, key: str, value: str) -> None:
        self.execute("INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)", (key, value))

    def reset(self) -> None:
        for table in ("vendors", "tasks_done", "events", "audit", "meta"):
            self.conn.execute(f"DELETE FROM {table}")  # noqa: S608 - fixed table names
        self.conn.commit()
