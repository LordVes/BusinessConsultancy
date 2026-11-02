"""TPRM Lifecycle Simulator - Streamlit app (fictional data only).

Run:  streamlit run app.py
"""

from __future__ import annotations

import pandas as pd
import streamlit as st

from tprm import export
from tprm.config import all_tasks
from tprm.engine import FACTOR_KEYS, Engine, GateError
from tprm.samples import load_samples

st.set_page_config(page_title="TPRM Lifecycle Simulator", page_icon="🛡️", layout="wide")


@st.cache_resource
def get_engine() -> Engine:
    return Engine()


eng = get_engine()
cfg = eng.cfg
STATE_ICON = {"Met": "✅ Met", "Open": "🔴 Open", "Upcoming": "⏳ Upcoming", "Unmapped": "⚠️ Unmapped"}
HEALTH_ICON = {"Healthy": "🟢", "Watch": "🟡", "At risk": "🟠", "Critical": "🔴"}


def stage_label(v: dict) -> str:
    return "Exited" if v["exited"] else f"{v['stage']}. {cfg['stages'][v['stage'] - 1]['name']}"


def clear_widget_state() -> None:
    for k in [k for k in st.session_state if k.startswith(("t_", "ev_"))]:
        del st.session_state[k]


# ---------------------------------------------------------------- sidebar
with st.sidebar:
    st.title("🛡️ TPRM Simulator")
    page = st.radio("Page", ["Dashboard", "Vendor workflow", "Regulatory map", "Audit log", "Setup"], label_visibility="collapsed")
    st.divider()
    st.metric("Simulated date", eng.today.isoformat())
    c1, c2, c3 = st.columns(3)
    for col, label, kw in ((c1, "+1 mo", {"months": 1}), (c2, "+6 mo", {"months": 6}), (c3, "+1 yr", {"months": 12})):
        if col.button(label, use_container_width=True, help="Move the simulated clock forward to test reassessment cycles"):
            eng.advance_time(**kw)
            st.rerun()
    st.caption(cfg["meta"]["disclaimer"].strip())


# ---------------------------------------------------------------- dashboard
def page_dashboard() -> None:
    st.header("Dashboard")
    vendors = eng.vendors()
    if not vendors:
        st.info("No vendors yet. Go to **Setup** to load fictional sample vendors, or create one in **Vendor workflow**.")
        return
    active = [v for v in vendors if not v["exited"]]
    m = st.columns(5)
    m[0].metric("Active vendors", len(active))
    m[1].metric("Tier 1", sum(v["tier"] == 1 for v in active))
    m[2].metric("Overdue reassessments", sum(v["overdue"] for v in active))
    m[3].metric("Open issues", sum(1 for v in active for e in v["events"] if e["closed_on"] is None))
    m[4].metric("Regulatory gaps (open)", sum(g["state"] == "Open" for v in active for g in v["gaps"]))

    left, right = st.columns(2)
    stage_names = [f"{s['id']:02d} {s['name']}" for s in cfg["stages"]]
    by_stage = pd.Series([stage_names[v["stage"] - 1] for v in active]).value_counts().reindex(stage_names, fill_value=0)
    left.subheader("Vendors by lifecycle stage")
    left.bar_chart(by_stage)
    by_tier = pd.Series([f"Tier {v['tier']}" for v in active]).value_counts().sort_index()
    right.subheader("Vendors by tier")
    right.bar_chart(by_tier)

    st.subheader("Vendor overview")
    df = pd.DataFrame([{
        "Vendor": v["name"], "Tier": v["tier"], "Stage": stage_label(v),
        "Residual": f"{v['residual_rating']} ({v['residual_score']:.2f})",
        "Health": f"{HEALTH_ICON[v['health']]} {v['health']}",
        "Next reassessment": v["next_due"].isoformat() + (" ⚠️ overdue" if v["overdue"] else ""),
        "Open gaps": sum(g["state"] == "Open" for g in v["gaps"]),
    } for v in vendors])
    st.dataframe(df, hide_index=True, use_container_width=True)
    st.download_button("Download DORA-style Register of Information (CSV, simplified)",
                       export.register_csv(eng), "register_of_information.csv", "text/csv")


# ---------------------------------------------------------------- vendor workflow
def new_vendor_form() -> None:
    with st.expander("➕ New vendor"):
        with st.form("new_vendor"):
            name = st.text_input("Vendor name (use fictional names)")
            c1, c2 = st.columns(2)
            vtype = c1.selectbox("Type", ["Claims TPA", "MGA / delegated authority", "Cloud / core system", "Offshore BPO",
                                          "Data provider", "Broker", "Other"])
            country = c2.text_input("Country", "UK")
            desc = st.text_area("Service description")
            flags = st.columns(2)
            ict = flags[0].checkbox("ICT service (DORA scope)")
            crit = flags[1].checkbox("Supports a critical or important function")
            regimes = st.multiselect("Regulatory regimes in scope", list(cfg["frameworks"]), format_func=lambda k: f"{k} - {cfg['frameworks'][k]}")
            factors = {}
            cols = st.columns(len(FACTOR_KEYS))
            for col, key in zip(cols, FACTOR_KEYS, strict=True):
                spec = cfg["scoring"]["factors"][key]
                factors[key] = col.slider(spec["label"], 1, 4, 2, help=spec["help"])
            if st.form_submit_button("Create vendor") and name.strip():
                vid = eng.create_vendor(name.strip(), vtype=vtype, country=country, description=desc, regimes=regimes,
                                        ict_service=ict, critical_function=crit, **factors)
                st.session_state["vendor_id"] = vid
                st.rerun()


def stage_tracker(v: dict) -> None:
    parts = []
    for s in cfg["stages"]:
        if v["exited"] or s["id"] < v["stage"]:
            parts.append(f"✅ {s['id']}. {s['name']}")
        elif s["id"] == v["stage"]:
            parts.append(f"**▶ {s['id']}. {s['name']}**")
        else:
            parts.append(f"⬜ {s['id']}. {s['name']}")
    st.markdown(" → ".join(parts))
    st.progress((len(cfg["stages"]) if v["exited"] else v["stage"] - 1) / len(cfg["stages"]))


def toggle_task(vid: int, tid: str, key: str) -> None:
    eng.set_task(vid, tid, st.session_state[key])


def tab_workflow(v: dict) -> None:
    vid = v["id"]
    if v["exited"]:
        st.success("Lifecycle complete - vendor has exited.")
    for stage in cfg["stages"]:
        tasks = [t for t in v["tasks"] if t["stage"] == stage["id"]]
        if not tasks:
            continue
        done = sum(t["done"] for t in tasks)
        current = stage["id"] == v["stage"] and not v["exited"]
        future = stage["id"] > v["stage"] and not v["exited"]
        flag = "▶ " if current else ("🔁 backfill " if done < len(tasks) and stage["id"] < v["stage"] else "")
        with st.expander(f"{flag}Stage {stage['id']}: {stage['name']}  ({done}/{len(tasks)})", expanded=current):
            st.caption(f"{stage['line']} - {stage['description']}")
            for t in tasks:
                label = t["text"] + (f"  ·  _requires residual ≥ {t['when_residual_at_least']}_" if t.get("when_residual_at_least") else "")
                if t["auto"]:
                    st.markdown(f"{'✅' if t['done'] else '⬜'} {label}  _(automatic)_")
                else:
                    key = f"t_{vid}_{t['id']}"
                    st.session_state[key] = t["done"]
                    st.checkbox(label, key=key, on_change=toggle_task, args=(vid, t["id"], key), disabled=future or v["exited"])
    st.divider()
    if v["exited"]:
        return
    last = v["stage"] == len(cfg["stages"])
    if v["blocking"]:
        st.warning(f"{len(v['blocking'])} task(s) block advancement (current and earlier stages).")
    if st.button("Complete lifecycle (exit vendor)" if last else "Advance to next stage ▶", type="primary", disabled=bool(v["blocking"])):
        try:
            eng.advance(vid)
        except GateError as exc:
            st.error(str(exc))
        else:
            st.rerun()


def tab_risk(v: dict) -> None:
    vid = v["id"]
    c1, c2, c3 = st.columns(3)
    c1.metric("Inherent score", f"{v['inherent']:.2f} / 4")
    c2.metric("Tier", v["tier"])
    c3.metric("Residual risk", f"{v['residual_rating']} ({v['residual_score']:.2f})",
              help="Inherent score reduced by completed due diligence, increased by open issues.")
    st.markdown("**Why this tier**")
    for r in v["tier_reasons"]:
        st.markdown(f"- {r}")
    st.markdown(f"Due diligence {v['dd_share']:.0%} complete · open issue points: {v['open_points']}")
    st.divider()
    st.subheader("Change risk factors (re-tiers the vendor)")
    with st.form(f"risk_{vid}"):
        cols = st.columns(len(FACTOR_KEYS))
        vals = {}
        for col, key in zip(cols, FACTOR_KEYS, strict=True):
            spec = cfg["scoring"]["factors"][key]
            vals[key] = col.slider(spec["label"], 1, 4, int(v[key]), help=spec["help"])
        f1, f2 = st.columns(2)
        ict = f1.checkbox("ICT service (DORA scope)", v["ict_service"])
        crit = f2.checkbox("Supports a critical or important function", v["critical_function"])
        regimes = st.multiselect("Regulatory regimes in scope", list(cfg["frameworks"]), default=v["regimes"])
        if st.form_submit_button("Re-score"):
            eng.update_risk(vid, ict_service=ict, critical_function=crit, regimes=regimes, **vals)
            st.rerun()


def tab_regulatory(v: dict) -> None:
    if not v["gaps"]:
        st.info("No regulatory regimes selected for this vendor. Add some on the Risk tab.")
        return
    counts = pd.Series([g["state"] for g in v["gaps"]]).value_counts()
    cols = st.columns(4)
    for col, state in zip(cols, ["Met", "Open", "Upcoming", "Unmapped"], strict=True):
        col.metric(STATE_ICON[state], int(counts.get(state, 0)))
    st.caption("Open = evidencing task is in the current or an earlier stage and not done. Upcoming = evidence due in a later stage.")
    df = pd.DataFrame([{
        "State": STATE_ICON[g["state"]], "Framework": g["framework"], "Ref": g["ref"], "Requirement": g["text"],
        "Evidenced by": "; ".join(f"{'✔' if t['done'] else '○'} {t['text']}" for t in g["tasks"]),
    } for g in v["gaps"]])
    flt = st.multiselect("Filter by framework", sorted({g["framework"] for g in v["gaps"]}))
    if flt:
        df = df[df["Framework"].isin(flt)]
    st.dataframe(df, hide_index=True, use_container_width=True)


def tab_monitoring(v: dict) -> None:
    vid = v["id"]
    months = cfg["monitoring"]["reassessment_months"][v["tier"]]
    c = st.columns(4)
    c[0].metric("Health", f"{HEALTH_ICON[v['health']]} {v['health']}")
    c[1].metric("Cadence", f"every {months} months")
    c[2].metric("Next reassessment", v["next_due"].isoformat(), "overdue" if v["overdue"] else None, delta_color="inverse")
    c[3].metric("Last assessed", v["last_assessed"])
    if v["reassessment_flag"]:
        st.warning("A recent event triggered an out-of-cycle reassessment.")
    if st.button("Record reassessment (resets clock and clears trigger)", key=f"re_{vid}"):
        eng.record_reassessment(vid)
        st.rerun()

    st.divider()
    st.subheader("Inject a test event")
    kinds = list(cfg["events"])
    kind = st.selectbox("Event", kinds, format_func=lambda k: f"{cfg['events'][k]['label']} (severity {cfg['events'][k]['severity']})", key=f"ev_kind_{vid}")
    note = st.text_input("Note (optional)", key=f"ev_note_{vid}")
    for n in eng.notifications_for(v, kind):
        st.caption(f"📣 {n['framework']}: {n['text']}" + (f" - within {n['deadline_hours']}h" if n["deadline_hours"] else ""))
    if st.button("Inject event", key=f"ev_go_{vid}"):
        eng.add_event(vid, kind, note)
        st.rerun()

    st.subheader("Issues")
    if not v["events"]:
        st.caption("No issues yet.")
    for e in reversed(v["events"]):
        open_ = e["closed_on"] is None
        with st.container(border=True):
            st.markdown(f"**{e['label']}** · opened {e['opened_on']} · severity {e['severity']} · "
                        + ("🔴 OPEN" if open_ else f"✅ {e['resolution']} on {e['closed_on']}"))
            if e["note"]:
                st.caption(e["note"])
            cols = st.columns(3)
            if e["notify_required"]:
                cols[0].checkbox("Supervisory notification made", value=e["notified"], key=f"ev_n_{e['id']}",
                                 on_change=lambda eid=e["id"]: eng.mark_notified(eid, st.session_state[f"ev_n_{eid}"]))
            if open_:
                if cols[1].button("Mark remediated", key=f"ev_r_{e['id']}"):
                    eng.close_event(e["id"], "Remediated")
                    st.rerun()
                if cols[2].button("Accept risk", key=f"ev_a_{e['id']}"):
                    eng.close_event(e["id"], "Risk accepted")
                    st.rerun()


def tab_report(v: dict) -> None:
    st.download_button("Download vendor report (Markdown)", export.vendor_report_md(eng, v["id"]),
                       f"tprm-vendor-{v['id']}.md", "text/markdown")
    st.download_button("Download vendor audit trail (CSV)", export.audit_csv(eng, v["id"]), f"audit-vendor-{v['id']}.csv", "text/csv")
    st.dataframe(pd.DataFrame(eng.audit_log(v["id"])), hide_index=True, use_container_width=True)
    with st.expander("Test tools"):
        if st.button("Fast-forward to Ongoing monitoring", key=f"ff_{v['id']}",
                     help="Ticks every manual task before monitoring - for quickly testing events and reassessment."):
            eng.jump_to_monitoring(v["id"])
            st.rerun()


def page_vendor() -> None:
    st.header("Vendor workflow")
    new_vendor_form()
    vendors = eng.vendors()
    if not vendors:
        st.info("No vendors yet - create one above or load samples in **Setup**.")
        return
    ids = [v["id"] for v in vendors]
    if st.session_state.get("vendor_id") not in ids:
        st.session_state["vendor_id"] = ids[0]
    by_id = {v["id"]: v for v in vendors}
    vid = st.selectbox("Vendor", ids, key="vendor_id", format_func=lambda i: f"{by_id[i]['name']} - Tier {by_id[i]['tier']}")
    v = by_id[vid]
    st.subheader(v["name"])
    st.caption(f"{v['vtype']} · {v['country']} · {v['description']}")
    k = st.columns(4)
    k[0].metric("Tier", v["tier"])
    k[1].metric("Stage", "Exited" if v["exited"] else f"{v['stage']} of {len(cfg['stages'])}", help=stage_label(v))
    k[2].metric("Residual risk", v["residual_rating"])
    k[3].metric("Health", f"{HEALTH_ICON[v['health']]} {v['health']}")
    stage_tracker(v)
    tabs = st.tabs(["Workflow", "Risk & tiering", "Regulatory coverage", "Monitoring & issues", "Report & audit"])
    for tab, fn in zip(tabs, (tab_workflow, tab_risk, tab_regulatory, tab_monitoring, tab_report), strict=True):
        with tab:
            fn(v)


# ---------------------------------------------------------------- reference pages
def page_regulatory_map() -> None:
    st.header("Regulatory map")
    st.caption(cfg["meta"]["disclaimer"].strip())
    task_by_req: dict[str, list[str]] = {}
    for t in all_tasks(cfg):
        for rid in t.get("satisfies", []):
            task_by_req.setdefault(rid, []).append(f"S{t['stage']}: {t['text']}")
    df = pd.DataFrame([{
        "Framework": r["framework"], "Ref": r["ref"], "Requirement": r["text"],
        "Tiers": ", ".join(map(str, r["tiers"])), "Needs flags": ", ".join(r.get("requires", [])) or "-",
        "Evidenced by tasks": " | ".join(task_by_req.get(r["id"], [])),
    } for r in cfg["requirements"]])
    flt = st.multiselect("Framework", list(cfg["frameworks"]), format_func=lambda k: f"{k} - {cfg['frameworks'][k]}")
    st.dataframe(df[df["Framework"].isin(flt)] if flt else df, hide_index=True, use_container_width=True)


def page_audit() -> None:
    st.header("Audit log")
    log = eng.audit_log()
    st.dataframe(pd.DataFrame(log), hide_index=True, use_container_width=True)
    st.download_button("Download audit log (CSV)", export.audit_csv(eng), "audit_log.csv", "text/csv")


def page_setup() -> None:
    st.header("Setup")
    st.markdown(f"Workflow rules live in `config/lifecycle.yaml` ({len(cfg['stages'])} stages, "
                f"{len(all_tasks(cfg))} tasks, {len(cfg['requirements'])} requirements). Data is stored in `{eng.store.path}`.")
    c1, c2 = st.columns(2)
    if c1.button("Load 4 fictional sample vendors"):
        load_samples(eng)
        clear_widget_state()
        st.success("Sample vendors loaded.")
    if c2.button("Reset all data", type="secondary"):
        eng.reset()
        clear_widget_state()
        st.session_state.pop("vendor_id", None)
        st.success("All data cleared.")
    st.subheader("Scoring model")
    st.dataframe(pd.DataFrame([{"Factor": f["label"], "Weight": f["weight"], "Scale": f["help"]}
                               for f in cfg["scoring"]["factors"].values()]), hide_index=True, use_container_width=True)
    th = cfg["scoring"]["tier_thresholds"]
    st.caption(f"Tier 1 ≥ {th['tier1']}, Tier 2 ≥ {th['tier2']}, otherwise Tier 3; overrides: "
               + "; ".join(r["reason"] for r in cfg["scoring"]["overrides"]))


{"Dashboard": page_dashboard, "Vendor workflow": page_vendor, "Regulatory map": page_regulatory_map,
 "Audit log": page_audit, "Setup": page_setup}[page]()
