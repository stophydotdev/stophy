import asyncio

import httpx
import pytest

from stophy import AsyncStophy, Stophy, StophyError


def flat(code, retryable, **extra):
    return {
        "success": False,
        "error": f"{code} message",
        "code": code,
        "retryable": retryable,
        "requestId": "body-request-id",
        **extra,
    }


def test_a_permanent_source_changed_is_tried_once_and_keeps_its_fields(serve):
    api = serve(lambda key, count: (502, flat("sourceChanged", False)))
    with Stophy(
        "k", base_url=api.base_url, max_retries=3, retry_initial_delay=0
    ) as client:
        with pytest.raises(StophyError) as info:
            client.scrape(url="https://a.test")
    assert len(api.keys) == 1
    assert (info.value.code, info.value.retryable, info.value.request_id) == (
        "sourceChanged",
        False,
        "body-request-id",
    )


def test_a_profile_busy_409_is_retryable_and_is_sent_again(serve):
    api = serve(
        lambda key, count: (
            (409, flat("profileBusy", True, retryAfterSeconds=0))
            if count == 1
            else (200, {"success": True, "data": {}})
        )
    )
    with Stophy(
        "k", base_url=api.base_url, max_retries=2, retry_initial_delay=0
    ) as client:
        client.scrape(url="https://a.test")
    assert len(api.keys) == 2


@pytest.mark.parametrize("async_client", [False, True])
@pytest.mark.parametrize("nested", [False, True])
def test_a_retryable_profile_refusal_prefers_body_fields(async_client, nested):
    body = flat("profileBusy", True, retryAfterSeconds=2)
    if nested:
        message = body.pop("error")
        body.pop("success")
        body = {"success": False, "error": {"message": message, **body}}

    def answer(_request):
        return httpx.Response(
            409,
            json=body,
            headers={"x-request-id": "header-request-id", "retry-after": "0"},
        )

    options = {
        "api_key": "k",
        "base_url": "http://127.0.0.1",
        "transport": httpx.MockTransport(answer),
        "max_retries": 0,
    }

    async def run():
        async with AsyncStophy(**options) as client:
            await client.scrape(url="https://a.test")

    with pytest.raises(StophyError) as info:
        if async_client:
            asyncio.run(run())
        else:
            with Stophy(**options) as client:
                client.scrape(url="https://a.test")

    assert (info.value.code, info.value.retryable, info.value.request_id) == (
        "profileBusy",
        True,
        "body-request-id",
    )
    assert info.value.retry_after_seconds == 2


def test_billing_fields_of_an_error_stay_on_details(serve):
    api = serve(
        lambda key, count: (402, flat("insufficientCredits", False, requiredUsd=0.5))
    )
    with Stophy("k", base_url=api.base_url) as client:
        with pytest.raises(StophyError) as info:
            client.scrape(url="https://a.test")
    assert info.value.details == {"requiredUsd": 0.5}


def test_a_legacy_nested_error_still_gives_its_code_and_retryability(serve):
    nested = {
        "success": False,
        "error": {"code": "busy", "message": "Busy.", "retryable": True},
    }
    api = serve(lambda key, count: (503, nested))
    with Stophy("k", base_url=api.base_url) as client:
        with pytest.raises(StophyError) as info:
            client.scrape(url="https://a.test")
    assert (info.value.code, str(info.value), info.value.retryable) == (
        "busy",
        "Busy.",
        True,
    )
