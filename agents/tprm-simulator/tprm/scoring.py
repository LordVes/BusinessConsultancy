"""Inherent risk scoring, tiering, residual risk and vendor health."""

from __future__ import annotations


def inherent_score(cfg: dict, factors: dict) -> float:
    """Weighted average of factor scores (1.0 - 4.0)."""
    spec = cfg["scoring"]["factors"]
    return round(sum(spec[k]["weight"] * float(factors[k]) for k in spec), 2)


def _override_matches(rule_when: dict, vendor: dict) -> bool:
    for key, expected in rule_when.items():
        if key.endswith("_gte"):
            if float(vendor.get(key[:-4], 0)) < expected:
                return False
        elif bool(vendor.get(key)) != bool(expected):
            return False
    return True


def assign_tier(cfg: dict, vendor: dict) -> tuple[int, float, list[str]]:
    """Return (tier, inherent score, human-readable reasons)."""
    score = inherent_score(cfg, vendor)
    th = cfg["scoring"]["tier_thresholds"]
    if score >= th["tier1"]:
        tier = 1
    elif score >= th["tier2"]:
        tier = 2
    else:
        tier = 3
    reasons = [f"Weighted inherent score {score:.2f} -> Tier {tier} (Tier 1 >= {th['tier1']}, Tier 2 >= {th['tier2']})"]
    for rule in cfg["scoring"]["overrides"]:
        if _override_matches(rule["when"], vendor) and tier > rule["min_tier"]:
            tier = rule["min_tier"]
            reasons.append(f"Override '{rule['id']}': raised to Tier {tier} - {rule['reason']}")
    return tier, score, reasons


def rating_for(cfg: dict, score: float) -> str:
    for r in cfg["scoring"]["residual"]["ratings"]:
        if score < r["below"]:
            return r["name"]
    return cfg["scoring"]["residual"]["ratings"][-1]["name"]


def rating_rank(cfg: dict, name: str) -> int:
    return [r["name"] for r in cfg["scoring"]["residual"]["ratings"]].index(name)


def residual(cfg: dict, inherent: float, dd_share: float, open_points: int) -> tuple[float, str]:
    """Residual score after due-diligence mitigation plus open-issue penalties (capped at 4)."""
    res = cfg["scoring"]["residual"]
    score = inherent * (1 - res["dd_mitigation_max"] * dd_share)
    score += res["residual_per_severity_point"] * open_points
    score = round(min(score, 4.0), 2)
    return score, rating_for(cfg, score)


def health_for(cfg: dict, open_points: int) -> str:
    for h in cfg["monitoring"]["health"]:
        if open_points <= h["max_points"]:
            return h["name"]
    return cfg["monitoring"]["health"][-1]["name"]
