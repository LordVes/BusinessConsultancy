import itertools
from datetime import date

from tprm import workflow
from tprm.config import load_config, validate_config


def test_config_is_valid():
    assert validate_config(load_config()) == []


def test_every_requirement_has_a_task_in_every_scenario():
    """For any tier / flag combination, no applicable requirement may be left without an evidencing task."""
    cfg = load_config()
    frameworks = list(cfg["frameworks"])
    for tier, ict, crit in itertools.product([1, 2, 3], [False, True], [False, True]):
        vendor = {"tier": tier, "ict_service": ict, "critical_function": crit, "regimes": frameworks, "stage": 10,
                  "reassessment_flag": False, "last_assessed": "2026-01-01"}
        statuses = workflow.task_status(cfg, vendor, set(), [], "Critical", today=date(2026, 1, 1))
        unmapped = [g["id"] for g in workflow.regulatory_gaps(cfg, vendor, statuses) if g["state"] == "Unmapped"]
        assert not unmapped, f"tier={tier} ict={ict} critical={crit}: {unmapped}"
