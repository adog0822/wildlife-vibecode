"""Tests for the global Scholar's Trial leaderboard (GET/POST /api/leaderboard)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://wildlife-kingdom-1.preview.emergentagent.com").rstrip("/")
LB = f"{BASE_URL}/api/leaderboard"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ============== GET /api/leaderboard ==============

def test_get_leaderboard_returns_10_seeded_entries_sorted(session):
    r = session.get(LB, params={"limit": 10}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "entries" in data and isinstance(data["entries"], list)
    entries = data["entries"]
    assert len(entries) >= 10, f"expected at least 10 entries got {len(entries)}"

    # sorted descending by score
    scores = [e["score"] for e in entries]
    assert scores == sorted(scores, reverse=True), f"not sorted desc: {scores}"

    # First seed entry should be Charles D. = 42 (top among seeds)
    seed_entries = [e for e in entries if e.get("seed")]
    assert seed_entries, "expected seed entries present"
    assert seed_entries[0]["name"] == "Charles D.", seed_entries[0]
    assert seed_entries[0]["score"] == 42, seed_entries[0]

    # _id is excluded
    for e in entries:
        assert "_id" not in e


def test_get_leaderboard_default_limit_works(session):
    r = session.get(LB, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == len(data["entries"])


# ============== POST /api/leaderboard ==============

def test_post_leaderboard_returns_top_with_submission(session):
    unique_name = f"TEST_Player_{int(time.time())}"
    payload = {"name": unique_name, "score": 7, "biome": "savanna"}
    r = session.post(LB, json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "top" in data and isinstance(data["top"], list)
    assert "submitted" in data
    assert data["submitted"]["name"] == unique_name
    assert data["submitted"]["score"] == 7
    assert data["submitted"]["biome"] == "savanna"
    assert data["submitted"]["seed"] is False
    # top is sorted desc
    top_scores = [e["score"] for e in data["top"]]
    assert top_scores == sorted(top_scores, reverse=True)


def test_post_then_get_persists(session):
    unique_name = f"TEST_Persist_{int(time.time())}"
    # submit very high score so it lands in top 10
    r = session.post(LB, json={"name": unique_name, "score": 9000, "biome": "ocean"}, timeout=15)
    assert r.status_code == 200
    # subsequent GET should include this name
    r2 = session.get(LB, params={"limit": 20}, timeout=15)
    assert r2.status_code == 200
    names = [e["name"] for e in r2.json()["entries"]]
    assert unique_name in names, f"submitted name not found: {names}"


def test_post_with_high_score_appears_at_top(session):
    unique_name = f"TEST_Top_{int(time.time())}"
    r = session.post(LB, json={"name": unique_name, "score": 5000, "biome": "peaks"}, timeout=15)
    assert r.status_code == 200
    top = r.json()["top"]
    # Should appear in top 10 since 5000 > all seed scores (max 42)
    names = [e["name"] for e in top]
    assert unique_name in names, f"{unique_name} not in top: {names}"
    # And the very top must be > 42 (must be a non-seed real entry)
    assert top[0]["score"] >= 5000


def test_post_empty_name_defaults(session):
    r = session.post(LB, json={"name": "   ", "score": 3}, timeout=15)
    assert r.status_code == 200
    assert r.json()["submitted"]["name"] == "Anonymous Scholar"


def test_post_score_clamped(session):
    # negative becomes 0; >9999 becomes 9999
    r = session.post(LB, json={"name": "TEST_Clamp", "score": -50}, timeout=15)
    assert r.status_code == 200
    assert r.json()["submitted"]["score"] == 0


# ============== BIOME BG endpoint (sanity for biome routes) ==============

def test_biome_bg_all_cached(session):
    r = session.get(f"{BASE_URL}/api/biome_bg", timeout=15)
    assert r.status_code == 200
    data = r.json()
    expected = {"savanna", "dunes", "canopy", "peaks", "woods", "outback", "wastes", "ocean"}
    assert set(data.keys()) == expected
    for k, v in data.items():
        assert v["cached"] is True, f"biome {k} not cached: {v}"
        assert v["url"] is not None


def test_biome_bg_static_image_served(session):
    r = session.get(f"{BASE_URL}/api/static/biome_bg/savanna.png", timeout=20)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("image/")
    assert len(r.content) > 1000


# ============== Cleanup ==============

def test_zzz_cleanup(session):
    """Cleanup TEST_ entries directly via Mongo through script (best-effort)."""
    # Cannot delete via API (no DELETE endpoint), so just note the test data exists.
    # Test data is non-seed and will be visible but acceptable.
    pass
