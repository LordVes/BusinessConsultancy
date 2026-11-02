"""Build the single-file web version: injects config/lifecycle.yaml into web/template.html.

Usage (from agents/tprm-simulator/):  python web/build.py
Output: ../../output/tprm-simulator.html
"""

import json
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = ROOT.parent.parent / "output" / "tprm-simulator.html"

cfg = yaml.safe_load((ROOT / "config" / "lifecycle.yaml").read_text(encoding="utf-8"))
html = (HERE / "template.html").read_text(encoding="utf-8")
assert "/*CONFIG*/" in html
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(html.replace("/*CONFIG*/", json.dumps(cfg, ensure_ascii=False)), encoding="utf-8")
print("wrote", OUT, OUT.stat().st_size, "bytes")
