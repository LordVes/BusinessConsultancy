"""Pure workflow rules: which tasks apply, stage gates and regulatory gap analysis."""

from __future__ import annotations

from datetime import date

from .config import all_tasks
from .scoring import rating_rank


def task_applies(cfg: dict, task: dict, vendor: dict, residual_rating: str) -> bool:
    if vendor["tier"] not in task["tiers"]:
        return False
    if any(not vendor.get(flag) for flag in task.get("requires", [])):
        return False
    need = task.get("when_residual_at_least")
    return not (need and rating_rank(cfg, residual_rating) < rating_rank(cfg, need))


def add_months(d: date, months: int) -> date:
    y, m = divmod(d.month - 1 + months, 12)
    year, month = d.year + y, m + 1
    last = [31, 29 if year % 4 == 0 and (year % 100 or year % 400 == 0) else 28,
            31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
    return date(year, month, min(d.day, last))


def next_reassessment(cfg: dict, vendor: dict) -> date:
    months = cfg["monitoring"]["reassessment_months"][vendor["tier"]]
    return add_months(date.fromisoformat(vendor["last_assessed"]), months)


def auto_task_done(rule: str, cfg: dict, vendor: dict, events: list[dict], today: date) -> bool:
    if rule == "no_open_issues":
        return not any(e["closed_on"] is None for e in events)
    if rule == "reassessment_current":
        return not vendor["reassessment_flag"] and next_reassessment(cfg, vendor) >= today
    if rule == "notifications_done":
        return all(e["notified"] for e in events if e["notify_required"])
    raise ValueError(rule)


def task_status(cfg: dict, vendor: dict, done_ids: set[str], events: list[dict],
                residual_rating: str, today: date) -> list[dict]:
    """Every applicable task with its done flag (auto tasks are computed)."""
    out = []
    for t in all_tasks(cfg):
        if not task_applies(cfg, t, vendor, residual_rating):
            continue
        auto = t.get("auto")
        done = auto_task_done(auto, cfg, vendor, events, today) if auto else t["id"] in done_ids
        out.append({**t, "done": done, "auto": auto})
    return out


def gate_check(statuses: list[dict], current_stage: int) -> list[dict]:
    """Tasks blocking advancement: anything incomplete in the current or earlier stages."""
    return [t for t in statuses if t["stage"] <= current_stage and not t["done"]]


def dd_share(statuses: list[dict], dd_stage: int = 3) -> float:
    dd = [t for t in statuses if t["stage"] == dd_stage]
    return sum(t["done"] for t in dd) / len(dd) if dd else 0.0


def requirement_applies(req: dict, vendor: dict) -> bool:
    return (
        req["framework"] in vendor["regimes"]
        and vendor["tier"] in req["tiers"]
        and all(vendor.get(flag) for flag in req.get("requires", []))
    )


def regulatory_gaps(cfg: dict, vendor: dict, statuses: list[dict]) -> list[dict]:
    """Per applicable requirement: Met / Open / Upcoming / Unmapped, with the evidencing tasks."""
    out = []
    for req in cfg["requirements"]:
        if not requirement_applies(req, vendor):
            continue
        tasks = [t for t in statuses if req["id"] in t.get("satisfies", [])]
        if not tasks:
            state = "Unmapped"
        elif all(t["done"] for t in tasks):
            state = "Met"
        elif any(not t["done"] and t["stage"] <= vendor["stage"] for t in tasks):
            state = "Open"
        else:
            state = "Upcoming"
        out.append({**req, "state": state, "tasks": tasks})
    return out
