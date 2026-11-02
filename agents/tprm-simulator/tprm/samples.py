"""Clearly fictional sample vendors (no real companies or client data)."""

from __future__ import annotations

from .engine import Engine

SAMPLES = [
    dict(name="Acme Claims TPA Ltd (FICTIONAL)", vtype="Claims TPA", country="UK",
         description="Third-party administrator handling motor claims intake and payments.",
         regimes=["PRA", "GDPR"], ict_service=False, critical_function=False,
         data_sensitivity=4, criticality=3, system_access=3, substitutability=2, regulatory_impact=3),
    dict(name="NimbusCore Cloud GmbH (FICTIONAL)", vtype="Cloud / core system", country="DE",
         description="Hosts the policy administration platform used for all lines of business.",
         regimes=["DORA", "SII", "EIOPA", "GDPR"], ict_service=True, critical_function=True,
         data_sensitivity=4, criticality=4, system_access=4, substitutability=4, regulatory_impact=4),
    dict(name="Bluebird BPO Services (FICTIONAL)", vtype="Offshore BPO", country="PH",
         description="Back-office document indexing and customer-service overflow.",
         regimes=["NYDFS", "NAIC", "GDPR"], ict_service=False, critical_function=False,
         data_sensitivity=3, criticality=2, system_access=2, substitutability=2, regulatory_impact=2),
    dict(name="Quill Actuarial Data Inc (FICTIONAL)", vtype="Data provider", country="US",
         description="Licensed mortality and catastrophe data feed.",
         regimes=["NAIC"], ict_service=False, critical_function=False,
         data_sensitivity=1, criticality=2, system_access=1, substitutability=3, regulatory_impact=1),
]


def load_samples(engine: Engine) -> list[int]:
    return [engine.create_vendor(**s) for s in SAMPLES]
