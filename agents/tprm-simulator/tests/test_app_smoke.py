"""Smoke test: every page renders without exceptions, driven through Streamlit's AppTest."""

from pathlib import Path

import pytest
import streamlit as st
from streamlit.testing.v1 import AppTest

APP = str(Path(__file__).resolve().parent.parent / "app.py")


@pytest.fixture
def at(tmp_path, monkeypatch):
    monkeypatch.setattr("tprm.store.DEFAULT_DB", tmp_path / "t.db")
    st.cache_resource.clear()
    app = AppTest.from_file(APP, default_timeout=30)
    app.run()
    return app


def goto(app, page):
    app.sidebar.radio[0].set_value(page).run()
    assert not app.exception, [e.value for e in app.exception]
    return app


def test_all_pages_render_empty(at):
    for page in ["Dashboard", "Vendor workflow", "Regulatory map", "Audit log", "Setup"]:
        goto(at, page)


def test_samples_then_vendor_page_and_advance(at):
    goto(at, "Setup")
    next(b for b in at.button if b.label.startswith("Load 4")).click().run()
    goto(at, "Dashboard")
    goto(at, "Vendor workflow")
    # tick every enabled checkbox in the current stage, then advance
    for cb in [c for c in at.checkbox if not c.disabled]:
        cb.check()
    at.run()
    assert not at.exception
