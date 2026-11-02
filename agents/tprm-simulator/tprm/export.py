"""CSV / Markdown exports."""

from __future__ import annotations

import csv
import io

from .engine import Engine

REGISTER_COLUMNS = [
    "vendor_id", "provider_name", "country", "ict_service_type", "supports_critical_or_important_function",
    "tier", "lifecycle_stage", "last_assessed", "next_reassessment_due", "health", "residual_rating",
]


def register_csv(engine: Engine) -> str:
    """Simplified DORA-style Register of Information (NOT the official ITS template)."""
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=REGISTER_COLUMNS)
    w.writeheader()
    for v in engine.vendors():
        if not v["ict_service"]:
            continue
        w.writerow({
            "vendor_id": v["id"], "provider_name": v["name"], "country": v["country"], "ict_service_type": v["vtype"],
            "supports_critical_or_important_function": "yes" if v["critical_function"] else "no",
            "tier": v["tier"], "lifecycle_stage": "Exited" if v["exited"] else engine.cfg["stages"][v["stage"] - 1]["name"],
            "last_assessed": v["last_assessed"], "next_reassessment_due": v["next_due"].isoformat(),
            "health": v["health"], "residual_rating": v["residual_rating"],
        })
    return buf.getvalue()


def audit_csv(engine: Engine, vendor_id: int | None = None) -> str:
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=["id", "sim_date", "vendor_id", "action", "detail"])
    w.writeheader()
    w.writerows(engine.audit_log(vendor_id))
    return buf.getvalue()


def vendor_report_md(engine: Engine, vendor_id: int) -> str:
    v = engine.get(vendor_id)
    stage = "Exited" if v["exited"] else f"{v['stage']}. {engine.cfg['stages'][v['stage'] - 1]['name']}"
    lines = [
        f"# TPRM vendor report - {v['name']}", "",
        f"_{engine.cfg['meta']['disclaimer'].strip()}_", "",
        f"- Simulated date: {engine.today}", f"- Tier: {v['tier']} (inherent score {v['inherent']:.2f})",
        f"- Stage: {stage}", f"- Residual risk: {v['residual_rating']} ({v['residual_score']:.2f})",
        f"- Health: {v['health']}", f"- Next reassessment due: {v['next_due']}",
        f"- Regimes in scope: {', '.join(v['regimes']) or 'none'}", "", "## Tiering rationale",
        *[f"- {r}" for r in v["tier_reasons"]], "", "## Tasks",
        *[f"- [{'x' if t['done'] else ' '}] S{t['stage']} {t['text']}" for t in v["tasks"]], "",
        "## Regulatory coverage", "", "| Framework | Ref | State |", "|---|---|---|",
        *[f"| {g['framework']} | {g['ref']} | {g['state']} |" for g in v["gaps"]], "", "## Issues",
        *([f"- {e['opened_on']} {e['label']} - {e['resolution'] or 'OPEN'}" for e in v["events"]] or ["- none"]),
    ]
    return "\n".join(lines) + "\n"
