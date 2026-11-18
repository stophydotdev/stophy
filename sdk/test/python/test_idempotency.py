import asyncio

import httpx
import pytest

from fake_api import accept_jobs
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


def sync_client(api, **options):
    return Stophy(
        "k", base_url=api.base_url, max_retries=2, retry_initial_delay=0, **options
    )


def test_a_crawl_whose_answer_was_lost_runs_and_is_charged_once_with_the_same_key(
    serve,
):
    answer, charges = accept_jobs()
    api = serve(answer)
    with sync_client(api) as client:
        assert client.crawl(url="https://a.test")["id"] == "job_1"
    assert len(api.keys) == 2
    assert api.keys[0] and api.keys[1] == api.keys[0]
    assert len(charges) == 1


def test_the_async_client_runs_a_lost_batch_once_even_when_it_keeps_no_data(serve):
    answer, charges = accept_jobs()
    api = serve(answer)

    async def run():
        async with AsyncStophy(
            "k", base_url=api.base_url, max_retries=2, retry_initial_delay=0
        ) as client:
            await client.batch.scrape(urls=["https://a.test"], zero_data_retention=True)

    asyncio.run(run())
    assert len(api.keys) == 2
    assert api.keys[0] and api.keys[1] == api.keys[0]
    assert len(charges) == 1


def test_every_post_carries_a_fresh_key_and_the_same_key_on_each_retry(serve):
    answer, _ = accept_jobs(["drop"])
    api = serve(answer)
    with sync_client(api) as client:
        client.scrape(url="https://a.test")
        client.extract(urls=["https://a.test"], prompt="price")
    first, retry, second = api.keys
    assert first and retry == first and second != first


def test_a_key_set_in_the_client_headers_is_kept_so_the_same_body_returns_the_first_job(
    serve,
):
    answer, _ = accept_jobs([])
    api = serve(answer)
    with sync_client(api, headers={"Idempotency-Key": "mine"}) as client:
        first = client.crawl(url="https://a.test")
        second = client.crawl(url="https://a.test")
    assert [first["id"], second["id"]] == ["job_1", "job_1"]
    assert api.keys == ["mine", "mine"]


def test_a_charged_call_that_keeps_no_data_is_not_sent_again_after_a_lost_answer(serve):
    answer, _ = accept_jobs()
    api = serve(answer)
    with sync_client(api) as client:
        with pytest.raises(httpx.TransportError) as info:
            client.scrape(url="https://a.test", zero_data_retention=True)
    assert info.value.outcome_unknown is True
    assert len(api.keys) == 1


def test_a_crawl_that_times_out_is_sent_again_with_the_same_key_and_runs_once(serve):
    answer, charges = accept_jobs(["hang"])
    api = serve(answer)
    with sync_client(api, timeout=0.1) as client:
        client.crawl(url="https://a.test")
    assert len(api.keys) == 2 and api.keys[1] == api.keys[0]
    assert len(charges) == 1


def test_a_call_still_running_on_the_server_ends_with_an_error_that_carries_its_key(
    serve,
):
    api = serve(
        lambda key, count: (
            "drop"
            if count == 1
            else (503, flat("internalError", True, retryAfterSeconds=0))
        )
    )
    with sync_client(api) as client:
        with pytest.raises(StophyError) as info:
            client.crawl(url="https://a.test")
    assert (info.value.status, info.value.code, info.value.retryable) == (
        503,
        "internalError",
        True,
    )
    assert "may still complete" in str(info.value)
    assert info.value.details["idempotencyKey"] == api.keys[0]
    assert len(api.keys) == 3


def test_an_ordinary_5xx_the_server_finished_keeps_its_retryable_and_carries_no_key(
    serve,
):
    api = serve(
        lambda key, count: (504, flat("sourceTimeout", True, retryAfterSeconds=0))
    )
    with sync_client(api) as client:
        with pytest.raises(StophyError) as info:
            client.search(query="x")
    assert (info.value.status, info.value.code, info.value.retryable) == (
        504,
        "sourceTimeout",
        True,
    )
    assert info.value.details == {} and "may still complete" not in str(info.value)
    assert len(api.keys) == 3


def test_a_busy_503_after_a_lost_send_is_not_marked_as_possibly_running(serve):
    api = serve(
        lambda key, count: (
            "drop" if count == 1 else (503, flat("busy", True, retryAfterSeconds=0))
        )
    )
    with sync_client(api) as client:
        with pytest.raises(StophyError) as info:
            client.crawl(url="https://a.test")
    assert info.value.details == {} and info.value.retryable


def test_a_crawl_whose_every_attempt_times_out_raises_the_same_httpx_error_with_its_key(
    serve,
):
    api = serve(lambda key, count: "hang")
    with sync_client(api, timeout=0.05) as client:
        with pytest.raises(httpx.TimeoutException) as info:
            client.crawl(url="https://a.test")
    assert not isinstance(info.value, StophyError)
    assert info.value.idempotency_key == api.keys[0]
    assert len(api.keys) == 3


def test_a_crawl_the_server_took_before_it_went_away_ends_with_its_key_on_the_refused_error(
    serve,
):
    api = serve(lambda key, count: "drop-then-refuse")
    with sync_client(api) as client:
        with pytest.raises(httpx.ConnectError) as info:
            client.crawl(url="https://a.test")
    assert info.value.idempotency_key == api.keys[0]
    assert len(api.keys) == 1


def test_a_refused_connection_is_retried_as_before_and_says_nothing_about_a_call_that_ran(
    serve,
):
    api = serve(lambda key, count: "drop")
    refused = api.base_url
    api.close()
    with Stophy("k", base_url=refused, max_retries=2, retry_initial_delay=0) as client:
        with pytest.raises(httpx.ConnectError):
            client.scrape(url="https://a.test", zero_data_retention=True)
    assert api.keys == []


def test_reads_carry_no_key_and_are_retried_after_a_lost_answer(serve):
    api = serve(
        lambda key, count: (
            "drop" if count == 1 else (200, {"success": True, "data": {}})
        )
    )
    with sync_client(api) as client:
        client.crawl.status(id="job_1")
    assert api.keys == [None, None]


def test_cancelling_the_async_client_during_the_wait_stops_at_once(serve):
    api = serve(
        lambda key, count: (429, flat("rateLimited", True, retryAfterSeconds=30))
    )

    async def run():
        async with AsyncStophy("k", base_url=api.base_url, max_retries=2) as client:
            task = asyncio.create_task(client.search(query="x"))
            await asyncio.sleep(0.3)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task

    asyncio.run(asyncio.wait_for(run(), 5))
    assert len(api.keys) == 1
