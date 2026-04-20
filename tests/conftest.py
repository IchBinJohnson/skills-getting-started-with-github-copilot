import copy

import pytest
from fastapi.testclient import TestClient

from src import app as app_module


@pytest.fixture
def client():
    return TestClient(app_module.app)


@pytest.fixture
def fresh_activities(monkeypatch):
    original = copy.deepcopy(app_module.activities)
    monkeypatch.setattr(app_module, "activities", original)
    return original
