"""Tests for Saola Claude Sonnet 4.5 chat endpoint."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://wildlife-kingdom-1.preview.emergentagent.com").rstrip("/")

FALLBACK_MARKERS = [
    "The Saola hums quietly",
    "My voice grows thin tonight",
    "Replenish the Universal Key",
]


def _stream_saola(session_id: str, message: str, timeout=30) -> str:
    """POST and accumulate the streamed plaintext body."""
    resp = requests.post(
        f"{BASE_URL}/api/saola/chat",
        json={"session_id": session_id, "message": message},
        stream=True,
        timeout=timeout,
    )
    assert resp.status_code == 200, f"Status {resp.status_code}: {resp.text}"
    chunks = []
    for chunk in resp.iter_content(chunk_size=None, decode_unicode=True):
        if chunk:
            chunks.append(chunk)
    return "".join(chunks)


def test_saola_chat_returns_real_claude_response():
    text = _stream_saola("test-saola-real-1", "Tell me about the savanna in one sentence")
    assert text and len(text.strip()) > 20, f"Reply too short: {text!r}"
    for marker in FALLBACK_MARKERS:
        assert marker not in text, f"Fallback message detected ({marker!r}) in: {text!r}"


def test_saola_chat_streamed_response_session_2():
    text = _stream_saola("test-saola-real-2", "What is your favorite animal?")
    assert text and len(text.strip()) > 10
    for marker in FALLBACK_MARKERS:
        assert marker not in text


def test_root():
    r = requests.get(f"{BASE_URL}/api/", timeout=10)
    assert r.status_code == 200
    assert "animals" in r.json()


def test_poker_create_room():
    r = requests.post(f"{BASE_URL}/api/poker/create", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "code" in data and len(data["code"]) == 4
