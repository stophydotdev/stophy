import pytest

from helpers import make_client
from stophy import StophyError


def test_flat_error_body_becomes_stophy_error():
    client, _calls = make_client(
        {
            "status": 401,
            "headers": {"x-request-id": "req_err"},
            "json": {
                "success": False,
                "error": "Invalid API key",
                "code": "unauthorized",
            },
        }
    )
    with pytest.raises(StophyError) as info:
        client.scrape(url="https://example.com")
    err = info.value
    assert err.status == 401
    assert err.code == "unauthorized"
    assert str(err) == "Invalid API key"
    assert err.retryable is False
    assert err.request_id == "req_err"


def test_retry_after_comes_from_body_then_header():
    client, _calls = make_client(
        {
            "status": 429,
            "json": {
                "success": False,
                "error": "slow down",
                "code": "rateLimited",
                "retryAfterSeconds": 9,
            },
        }
    )
    with pytest.raises(StophyError) as info:
        client.usage()
    assert info.value.retry_after_seconds == 9
    assert info.value.retryable is True

    client, _calls = make_client(
        {
            "status": 429,
            "headers": {"retry-after": "4"},
            "json": {"success": False, "error": "slow down", "code": "rateLimited"},
        }
    )
    with pytest.raises(StophyError) as info:
        client.usage()
    assert info.value.retry_after_seconds == 4


def test_non_json_error_uses_the_status():
    client, _calls = make_client({"status": 502, "raw": "bad gateway"})
    with pytest.raises(StophyError) as info:
        client.usage()
    assert info.value.status == 502
    assert "502" in str(info.value)
    assert info.value.retryable is True
