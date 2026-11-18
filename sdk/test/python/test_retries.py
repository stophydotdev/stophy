import httpx
import pytest

from helpers import body_of, make_client
from stophy import Stophy, StophyError

OK = {
    "json": {
        "success": True,
        "data": {"results": []},
        "costUsd": 0.001,
        "requestId": "req_1",
    }
}


def test_retries_a_429_then_succeeds():
    client, calls = make_client(
        [{"status": 429, "json": {"success": False}}, OK],
        max_retries=2,
        retry_initial_delay=0,
    )
    result = client.search(query="x")
    assert result["costUsd"] == 0.001
    assert len(calls) == 2


def test_retries_5xx_up_to_max_then_raises():
    client, calls = make_client(
        {
            "status": 503,
            "json": {
                "success": False,
                "error": "down",
                "code": "internalError",
            },
        },
        max_retries=2,
        retry_initial_delay=0,
    )
    with pytest.raises(StophyError) as info:
        client.search(query="x")
    assert info.value.status == 503
    assert info.value.code == "internalError"
    assert len(calls) == 3


def test_does_not_retry_when_max_retries_is_zero():
    client, calls = make_client({"status": 429, "json": {"success": False}})
    with pytest.raises(StophyError):
        client.search(query="x")
    assert len(calls) == 1


def test_does_not_retry_non_retryable_status():
    client, calls = make_client(
        {
            "status": 400,
            "json": {
                "success": False,
                "error": "bad",
                "code": "invalidRequest",
            },
        },
        max_retries=3,
        retry_initial_delay=0,
    )
    with pytest.raises(StophyError):
        client.search(query="x")
    assert len(calls) == 1


def test_retries_network_errors():
    calls = []

    def handler(request):
        calls.append(request)
        if len(calls) == 1:
            raise httpx.ConnectError("network down", request=request)
        return httpx.Response(200, json=OK["json"], request=request)

    client = Stophy(
        "st_test",
        transport=httpx.MockTransport(handler),
        max_retries=2,
        retry_initial_delay=0,
    )
    client.search(query="x")
    assert len(calls) == 2
    client.close()


def test_a_post_sends_the_key_the_caller_gives():
    client, calls = make_client(OK)
    client.scrape(url="https://example.com", idempotency_key="order-1")
    assert calls[0].headers["idempotency-key"] == "order-1"
    assert body_of(calls[0]) == {"url": "https://example.com"}


def test_honors_retry_after_header_seconds():
    client, calls = make_client(
        [
            {
                "status": 429,
                "headers": {"retry-after": "0"},
                "json": {"success": False},
            },
            OK,
        ],
        max_retries=1,
        retry_initial_delay=30,
    )
    client.search(query="x")
    assert len(calls) == 2


def test_raises_instead_of_waiting_more_than_60_seconds():
    client, calls = make_client(
        [
            {
                "status": 429,
                "headers": {"retry-after": "120"},
                "json": {"success": False, "error": "failed", "code": "rateLimited"},
            },
            OK,
        ],
        max_retries=2,
        retry_initial_delay=0,
    )
    with pytest.raises(StophyError) as info:
        client.search(query="x")
    assert info.value.retry_after_seconds == 120
    assert len(calls) == 1

    client, calls = make_client(
        [
            {
                "status": 429,
                "json": {
                    "success": False,
                    "error": "failed",
                    "code": "rateLimited",
                    "retryAfterSeconds": 3600,
                },
            },
            OK,
        ],
        max_retries=2,
        retry_initial_delay=0,
    )
    with pytest.raises(StophyError) as info:
        client.search(query="x")
    assert info.value.retry_after_seconds == 3600
    assert len(calls) == 1
