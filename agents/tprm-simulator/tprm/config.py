"""Load and validate the workflow configuration."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import yaml

DEFAULT_CONFIG = Path(__file__).resolve().parent.parent / "config" / "lifecycle.yaml"
FLAGS = ("ict_service", "critical_function")
AUTO_TASKS = ("no_open_issues", "reassessment_current", "notifications_done")


@lru_cache(maxsize=4)
def _load(path: str) -> dict:
    with open(path, encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def load_config(path: str | Path | None = None) -> dict:
    """Return the parsed config (cached per path)."""
    return _load(str(path or DEFAULT_CONFIG))


def all_tasks(cfg: dict) -> list[dict]:
    """Flat list of tasks, each annotated with its stage id."""
    return [{**t, "stage": s["id"]} for s in cfg["stages"] for t in s["tasks"]]


def validate_config(cfg: dict) -> list[str]:
    """Return a list of problems found in the config (empty list = OK)."""
    errors: list[str] = []
    stage_ids = [s["id"] for s in cfg["stages"]]
    if stage_ids != list(range(1, len(stage_ids) + 1)):
        errors.append(f"Stage ids must be 1..N in order, got {stage_ids}")

    req_ids = [r["id"] for r in cfg["requirements"]]
    if len(req_ids) != len(set(req_ids)):
        errors.append("Duplicate requirement ids")
    for r in cfg["requirements"]:
        if r["framework"] not in cfg["frameworks"]:
            errors.append(f"Requirement {r['id']}: unknown framework {r['framework']}")
        for flag in r.get("requires", []):
            if flag not in FLAGS:
                errors.append(f"Requirement {r['id']}: unknown flag {flag}")

    tasks = all_tasks(cfg)
    task_ids = [t["id"] for t in tasks]
    if len(task_ids) != len(set(task_ids)):
        errors.append("Duplicate task ids")
    ratings = [r["name"] for r in cfg["scoring"]["residual"]["ratings"]]
    for t in tasks:
        for rid in t.get("satisfies", []):
            if rid not in req_ids:
                errors.append(f"Task {t['id']}: unknown requirement {rid}")
        for flag in t.get("requires", []):
            if flag not in FLAGS:
                errors.append(f"Task {t['id']}: unknown flag {flag}")
        if t.get("auto") and t["auto"] not in AUTO_TASKS:
            errors.append(f"Task {t['id']}: unknown auto rule {t['auto']}")
        if t.get("when_residual_at_least") and t["when_residual_at_least"] not in ratings:
            errors.append(f"Task {t['id']}: unknown rating {t['when_residual_at_least']}")

    weights = sum(f["weight"] for f in cfg["scoring"]["factors"].values())
    if abs(weights - 1.0) > 1e-9:
        errors.append(f"Scoring weights must sum to 1.0, got {weights}")
    for name, ev in cfg["events"].items():
        for n in ev.get("notify", []):
            if n["framework"] not in cfg["frameworks"]:
                errors.append(f"Event {name}: unknown framework {n['framework']}")
    return errors
