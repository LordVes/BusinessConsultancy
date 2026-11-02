import pytest

from tprm.engine import Engine
from tprm.store import Store


@pytest.fixture
def engine():
    return Engine(store=Store(":memory:"))
