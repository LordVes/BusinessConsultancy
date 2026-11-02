from tprm import scoring
from tprm.config import load_config

CFG = load_config()
BASE = dict(data_sensitivity=1, criticality=1, system_access=1, substitutability=1, regulatory_impact=1)


def test_low_risk_is_tier3():
    tier, score, _ = scoring.assign_tier(CFG, BASE)
    assert (tier, score) == (3, 1.0)


def test_high_scores_are_tier1():
    v = {k: 4 for k in BASE}
    assert scoring.assign_tier(CFG, v)[0] == 1


def test_mid_scores_are_tier2():
    v = {**BASE, "data_sensitivity": 3, "criticality": 3, "system_access": 2, "substitutability": 2, "regulatory_impact": 2}
    assert scoring.assign_tier(CFG, v)[0] == 2


def test_overrides_force_tier():
    assert scoring.assign_tier(CFG, {**BASE, "criticality": 4})[0] == 1
    assert scoring.assign_tier(CFG, {**BASE, "critical_function": True})[0] == 1
    assert scoring.assign_tier(CFG, {**BASE, "data_sensitivity": 4, "system_access": 3})[0] == 1
    tier, _, reasons = scoring.assign_tier(CFG, {**BASE, "ict_service": True})
    assert tier == 2 and any("ict_service_floor" in r for r in reasons)


def test_residual_drops_with_due_diligence_and_rises_with_issues():
    base, _ = scoring.residual(CFG, 3.0, 0.0, 0)
    with_dd, _ = scoring.residual(CFG, 3.0, 1.0, 0)
    with_issue, _ = scoring.residual(CFG, 3.0, 1.0, 3)
    assert with_dd < base < 3.01 and with_issue > with_dd
    assert scoring.residual(CFG, 4.0, 0.0, 99)[0] == 4.0


def test_health_bands():
    assert [scoring.health_for(CFG, p) for p in (0, 1, 3, 4)] == ["Healthy", "Watch", "At risk", "Critical"]
