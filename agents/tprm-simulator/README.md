# TPRM Lifecycle Simulator

Small Streamlit app to walk **fictional** vendors through a third-party risk management (TPRM) lifecycle
at a large insurer, with tiering, stage gates, regulatory mapping, event simulation and exports.

> Teaching model with fake data. Regulatory references are simplified paraphrases, **not legal advice**.
> Never enter real client or vendor data.

## What it does
- **10 lifecycle stages** with gate tasks: intake, tiering, due diligence, risk assessment, contracting, onboarding,
  reporting, monitoring, issue management, offboarding.
- **Inherent risk scoring** (5 weighted factors) -> Tier 1-3, with explainable overrides (e.g. critical function => Tier 1).
- **Residual risk** = inherent reduced by due diligence, raised by open issues.
- **Regulatory mapping**: DORA, Solvency II, EIOPA cloud, PRA SS2/21, NYDFS 500, NAIC #668, GDPR. Per-vendor view shows
  Met / Open / Upcoming requirements, driven by tier, ICT-service and critical-function flags.
- **Simulation**: move the clock forward to test reassessment cycles; inject breaches, outages, rating drops etc.
- **Exports**: simplified DORA-style Register of Information (CSV), vendor report (Markdown), audit trail (CSV).

## Run
```bash
cd agents/tprm-simulator
pip install -r requirements.txt
streamlit run app.py
```
Then open **Setup** -> *Load 4 fictional sample vendors*.

## Test and lint
```bash
python -m pytest        # logic, config consistency and UI smoke tests
ruff check .            # lint
```

## Change the workflow
Edit `config/lifecycle.yaml` (weights, tier thresholds, stages, tasks, events, regulatory requirements) and run the
tests; they fail if a requirement has no evidencing task in any tier/flag combination.

## Layout
- `app.py` - Streamlit UI
- `tprm/` - `config`, `scoring`, `workflow` (pure rules), `engine` (service), `store` (SQLite), `export`, `samples`
- `config/lifecycle.yaml` - all workflow rules
- `tests/` - pytest suite
- `data/` - local SQLite DB (git-ignored)

## Environment variables
- `TPRM_DB` (optional) - path of the SQLite file; default `data/tprm.db`. No API keys or secrets are used.
