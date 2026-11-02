"""Service layer: combines the store, config and rules into vendor workflows."""

from __future__ import annotations

from datetime import date

from . import scoring, workflow
from .config import load_config, validate_config
from .store import Store

FACTOR_KEYS = ("data_sensitivity", "criticality", "system_access", "substitutability", "regulatory_impact")


class GateError(Exception):
    """Raised when a stage cannot be advanced."""


class Engine:
    def __init__(self, store: Store | None = None, cfg: dict | None = None):
        self.cfg = cfg or load_config()
        problems = validate_config(self.cfg)
        if problems:
            raise ValueError("Invalid config: " + "; ".join(problems))
        self.store = store or Store()

    # ---- clock -------------------------------------------------------
    @property
    def today(self) -> date:
        return date.fromisoformat(self.store.get_meta("sim_date") or date.today().isoformat())

    def advance_time(self, months: int = 0, days: int = 0) -> date:
        new = workflow.add_months(self.today, months)
        new = date.fromordinal(new.toordinal() + days)
        self.store.set_meta("sim_date", new.isoformat())
        self.log(None, "Clock advanced", f"Simulated date is now {new.isoformat()}")
        return new

    def reset(self) -> None:
        self.store.reset()

    def log(self, vendor_id: int | None, action: str, detail: str = "") -> None:
        self.store.execute(
            "INSERT INTO audit(sim_date, vendor_id, action, detail) VALUES (?,?,?,?)",
            (self.today.isoformat(), vendor_id, action, detail),
        )

    # ---- vendors -----------------------------------------------------
    def create_vendor(self, name: str, **fields) -> int:
        v = {
            "vtype": "Other", "description": "", "country": "", "regimes": [],
            "ict_service": False, "critical_function": False,
            **{k: 2 for k in FACTOR_KEYS}, **fields,
        }
        tier, score, reasons = scoring.assign_tier(self.cfg, v)
        vid = self.store.execute(
            """INSERT INTO vendors(name, vtype, description, country, regimes, ict_service, critical_function,
               data_sensitivity, criticality, system_access, substitutability, regulatory_impact,
               tier, inherent, stage, created_on, last_assessed) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)""",
            (name, v["vtype"], v["description"], v["country"], ",".join(v["regimes"]),
             int(v["ict_service"]), int(v["critical_function"]),
             *(int(v[k]) for k in FACTOR_KEYS), tier, score,
             self.today.isoformat(), self.today.isoformat()),
        )
        self.log(vid, "Vendor created", f"{name}; " + " | ".join(reasons))
        return vid

    def vendors(self) -> list[dict]:
        return [self._hydrate(v) for v in self.store.query("SELECT * FROM vendors ORDER BY id")]

    def get(self, vendor_id: int) -> dict:
        row = self.store.one("SELECT * FROM vendors WHERE id=?", (vendor_id,))
        if row is None:
            raise KeyError(vendor_id)
        return self._hydrate(row)

    def _hydrate(self, row: dict) -> dict:
        v = dict(row)
        v["regimes"] = [r for r in v["regimes"].split(",") if r]
        v["ict_service"], v["critical_function"] = bool(v["ict_service"]), bool(v["critical_function"])
        v["reassessment_flag"], v["exited"] = bool(v["reassessment_flag"]), bool(v["exited"])
        events = self.events(v["id"])
        done = {r["task_id"] for r in self.store.query("SELECT task_id FROM tasks_done WHERE vendor_id=?", (v["id"],))}
        # task applicability depends on residual rating, which depends on due-diligence share: iterate to a fixpoint
        points = sum(e["severity"] for e in events if e["closed_on"] is None)
        rating = scoring.rating_for(self.cfg, v["inherent"])
        for _ in range(4):
            statuses = workflow.task_status(self.cfg, v, done, events, rating, self.today)
            share = workflow.dd_share(statuses)
            res_score, new_rating = scoring.residual(self.cfg, v["inherent"], share, points)
            if new_rating == rating:
                break
            rating = new_rating
        v.update(
            events=events, tasks=statuses, dd_share=share, open_points=points,
            residual_score=res_score, residual_rating=rating,
            health=scoring.health_for(self.cfg, points),
            next_due=workflow.next_reassessment(self.cfg, v),
            blocking=workflow.gate_check(statuses, v["stage"]),
            gaps=workflow.regulatory_gaps(self.cfg, v, statuses),
        )
        v["overdue"] = v["next_due"] < self.today
        v["tier_reasons"] = scoring.assign_tier(self.cfg, v)[2]
        return v

    # ---- risk factors ------------------------------------------------
    def update_risk(self, vendor_id: int, **fields) -> None:
        cur = self.get(vendor_id)
        merged = {**cur, **fields}
        tier, score, reasons = scoring.assign_tier(self.cfg, merged)
        self.store.execute(
            """UPDATE vendors SET data_sensitivity=?, criticality=?, system_access=?, substitutability=?,
               regulatory_impact=?, ict_service=?, critical_function=?, regimes=?, tier=?, inherent=? WHERE id=?""",
            (*(int(merged[k]) for k in FACTOR_KEYS), int(merged["ict_service"]), int(merged["critical_function"]),
             ",".join(merged["regimes"]), tier, score, vendor_id),
        )
        detail = " | ".join(reasons)
        if tier != cur["tier"]:
            detail = f"Tier changed {cur['tier']} -> {tier}. " + detail
        self.log(vendor_id, "Risk factors updated", detail)

    # ---- tasks and stages --------------------------------------------
    def set_task(self, vendor_id: int, task_id: str, done: bool) -> None:
        if done:
            self.store.execute("INSERT OR REPLACE INTO tasks_done VALUES (?,?,?)", (vendor_id, task_id, self.today.isoformat()))
        else:
            self.store.execute("DELETE FROM tasks_done WHERE vendor_id=? AND task_id=?", (vendor_id, task_id))
        self.log(vendor_id, "Task " + ("completed" if done else "reopened"), task_id)

    def advance(self, vendor_id: int) -> int:
        v = self.get(vendor_id)
        if v["exited"]:
            raise GateError("Vendor has already exited.")
        if v["blocking"]:
            raise GateError("Open tasks: " + "; ".join(t["text"] for t in v["blocking"]))
        last = len(self.cfg["stages"])
        if v["stage"] >= last:
            self.store.execute("UPDATE vendors SET exited=1 WHERE id=?", (vendor_id,))
            self.log(vendor_id, "Vendor exited", "Lifecycle complete")
            return v["stage"]
        new = v["stage"] + 1
        self.store.execute("UPDATE vendors SET stage=? WHERE id=?", (new, vendor_id))
        self.log(vendor_id, "Stage advanced", f"{v['stage']} -> {new}: {self.cfg['stages'][new - 1]['name']}")
        return new

    def jump_to_monitoring(self, vendor_id: int) -> None:
        """Test shortcut: tick every applicable manual task up to Reporting and land in Monitoring."""
        v = self.get(vendor_id)
        target = next(s["id"] for s in self.cfg["stages"] if s["name"] == "Ongoing monitoring")
        for t in v["tasks"]:
            if t["stage"] < target and not t.get("auto"):
                self.set_task(vendor_id, t["id"], True)
        # tiering may unlock acceptance tasks once residual is recalculated
        for t in self.get(vendor_id)["tasks"]:
            if t["stage"] < target and not t.get("auto") and not t["done"]:
                self.set_task(vendor_id, t["id"], True)
        self.store.execute("UPDATE vendors SET stage=? WHERE id=?", (target, vendor_id))
        self.log(vendor_id, "Fast-forwarded", "Test shortcut to Ongoing monitoring")

    # ---- monitoring --------------------------------------------------
    def notifications_for(self, vendor: dict, kind: str) -> list[dict]:
        out = []
        for n in self.cfg["events"][kind].get("notify", []):
            if n["framework"] not in vendor["regimes"]:
                continue
            if n["framework"] == "DORA" and not vendor["ict_service"]:
                continue
            out.append(n)
        return out

    def add_event(self, vendor_id: int, kind: str, note: str = "") -> int:
        v = self.get(vendor_id)
        spec = self.cfg["events"][kind]
        notes = self.notifications_for(v, kind)
        required = int(any(n["deadline_hours"] > 0 for n in notes))
        eid = self.store.execute(
            "INSERT INTO events(vendor_id, kind, severity, note, opened_on, notify_required) VALUES (?,?,?,?,?,?)",
            (vendor_id, kind, spec["severity"], note, self.today.isoformat(), required),
        )
        if spec["reassessment"]:
            self.store.execute("UPDATE vendors SET reassessment_flag=1 WHERE id=?", (vendor_id,))
        self.log(vendor_id, "Event injected", f"{spec['label']} (severity {spec['severity']})")
        return eid

    def events(self, vendor_id: int) -> list[dict]:
        rows = self.store.query("SELECT * FROM events WHERE vendor_id=? ORDER BY id", (vendor_id,))
        for r in rows:
            r["label"] = self.cfg["events"][r["kind"]]["label"]
            r["notified"], r["notify_required"] = bool(r["notified"]), bool(r["notify_required"])
        return rows

    def close_event(self, event_id: int, resolution: str) -> None:
        if resolution not in ("Remediated", "Risk accepted"):
            raise ValueError(resolution)
        row = self.store.one("SELECT vendor_id, kind FROM events WHERE id=?", (event_id,))
        self.store.execute("UPDATE events SET closed_on=?, resolution=? WHERE id=?",
                           (self.today.isoformat(), resolution, event_id))
        self.log(row["vendor_id"], "Issue closed", f"{row['kind']}: {resolution}")

    def mark_notified(self, event_id: int, notified: bool = True) -> None:
        row = self.store.one("SELECT vendor_id, kind FROM events WHERE id=?", (event_id,))
        self.store.execute("UPDATE events SET notified=? WHERE id=?", (int(notified), event_id))
        self.log(row["vendor_id"], "Supervisor notification " + ("recorded" if notified else "cleared"), row["kind"])

    def record_reassessment(self, vendor_id: int) -> None:
        self.store.execute("UPDATE vendors SET last_assessed=?, reassessment_flag=0 WHERE id=?",
                           (self.today.isoformat(), vendor_id))
        self.log(vendor_id, "Reassessment recorded", f"Next due {self.get(vendor_id)['next_due']}")

    # ---- reporting ---------------------------------------------------
    def audit_log(self, vendor_id: int | None = None) -> list[dict]:
        if vendor_id is None:
            return self.store.query("SELECT * FROM audit ORDER BY id DESC")
        return self.store.query("SELECT * FROM audit WHERE vendor_id=? ORDER BY id DESC", (vendor_id,))
