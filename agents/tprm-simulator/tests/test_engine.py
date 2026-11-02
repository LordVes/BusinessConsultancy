import pytest

from tprm import export
from tprm.engine import GateError
from tprm.samples import SAMPLES, load_samples


def complete_stage(engine, vid):
    for t in engine.get(vid)["blocking"]:
        if not t["auto"]:
            engine.set_task(vid, t["id"], True)


def test_gate_blocks_until_tasks_done(engine):
    vid = engine.create_vendor("Test Vendor", regimes=["GDPR"])
    with pytest.raises(GateError):
        engine.advance(vid)
    complete_stage(engine, vid)
    assert engine.advance(vid) == 2


def test_gate_includes_earlier_stages_after_tier_change(engine):
    vid = engine.create_vendor("Low risk", regimes=["GDPR"], data_sensitivity=1, criticality=1,
                               system_access=1, substitutability=1, regulatory_impact=1)
    assert engine.get(vid)["tier"] == 3
    complete_stage(engine, vid)
    engine.advance(vid)
    engine.update_risk(vid, criticality=4)  # now tier 1 -> new tier-1 tasks in stage 1/2 may apply
    v = engine.get(vid)
    assert v["tier"] == 1
    # a tier change must be written to the audit log
    assert any("Tier changed 3 -> 1" in a["detail"] for a in engine.audit_log(vid))


def test_full_lifecycle_and_exit(engine):
    vid = engine.create_vendor(**SAMPLES[2])
    for _ in range(len(engine.cfg["stages"])):
        for _ in range(3):  # ticking may unlock acceptance tasks as residual changes
            complete_stage(engine, vid)
        engine.advance(vid)
    assert engine.get(vid)["exited"]
    with pytest.raises(GateError):
        engine.advance(vid)


def test_breach_event_flow(engine):
    vid = engine.create_vendor(**SAMPLES[1])
    engine.jump_to_monitoring(vid)
    before = engine.get(vid)
    assert before["health"] == "Healthy" and not before["reassessment_flag"]
    eid = engine.add_event(vid, "breach", "Ransomware at vendor")
    after = engine.get(vid)
    assert after["health"] == "At risk" and after["reassessment_flag"]
    assert after["residual_score"] > before["residual_score"]
    assert any(t["id"] == "mon_reassess" and not t["done"] for t in after["tasks"])
    assert after["events"][0]["notify_required"]  # DORA / PRA-style deadline applies
    engine.close_event(eid, "Remediated")
    engine.record_reassessment(vid)
    final = engine.get(vid)
    assert final["health"] == "Healthy" and not final["reassessment_flag"]


def test_unnotified_incident_blocks_notifications_task(engine):
    vid = engine.create_vendor(**SAMPLES[1])
    eid = engine.add_event(vid, "breach")
    task = next(t for t in engine.get(vid)["tasks"] if t["id"] == "iss_notified")
    assert not task["done"]
    engine.mark_notified(eid)
    assert next(t for t in engine.get(vid)["tasks"] if t["id"] == "iss_notified")["done"]


def test_reassessment_becomes_overdue_with_time(engine):
    vid = engine.create_vendor(**SAMPLES[1])  # tier 1 -> 12 months
    assert not engine.get(vid)["overdue"]
    engine.advance_time(months=13)
    v = engine.get(vid)
    assert v["overdue"]
    assert any(t["id"] == "mon_reassess" and not t["done"] for t in v["tasks"])
    engine.record_reassessment(vid)
    assert not engine.get(vid)["overdue"]


def test_regulatory_gap_states(engine):
    vid = engine.create_vendor(**SAMPLES[1])
    gaps = {g["id"]: g["state"] for g in engine.get(vid)["gaps"]}
    assert gaps["dora_30_3"] == "Upcoming" and gaps["dora_28_4e"] == "Open"
    engine.jump_to_monitoring(vid)
    gaps = {g["id"]: g["state"] for g in engine.get(vid)["gaps"]}
    assert gaps["dora_30_3"] == "Met"


def test_dora_requirements_only_apply_to_ict_vendors(engine):
    non_ict = engine.create_vendor(**SAMPLES[0])
    assert all(g["framework"] != "DORA" for g in engine.get(non_ict)["gaps"])


def test_samples_tiers(engine):
    ids = load_samples(engine)
    assert [engine.get(i)["tier"] for i in ids] == [1, 1, 2, 3]


def test_register_csv_only_ict_vendors(engine):
    load_samples(engine)
    rows = export.register_csv(engine).strip().splitlines()
    assert len(rows) == 2 and "NimbusCore" in rows[1]
    assert "FICTIONAL" in export.vendor_report_md(engine, 1)
