import pytest

from stophy import Stophy, StophyError


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
