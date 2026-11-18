import pytest
import asyncio

from stophy import AsyncStophy, Stophy

ACCEPTED = {
    "success": True,
    "id": "job_1",
    "url": "https://api.stophy.dev/v1/batch/scrape/job_1",
}


def lost_first_answer(jobs):
    def answer(key, count):
        job = jobs.setdefault(key, ACCEPTED)
        return "drop" if count == 1 else (200, job)

    return answer


def test_a_batch_whose_answer_was_lost_is_accepted_once_with_the_same_key(serve):
    jobs = {}
    api = serve(lost_first_answer(jobs))
    with Stophy(
        "k", base_url=api.base_url, max_retries=2, retry_initial_delay=0
    ) as client:
        client.batch.scrape(urls=["https://a.test"])
    assert len(api.keys) == 2
    assert api.keys[0] and api.keys[1] == api.keys[0]
    assert len(jobs) == 1


def test_the_async_client_sends_the_lost_batch_once_with_the_same_key(serve):
    jobs = {}
    api = serve(lost_first_answer(jobs))

    async def run():
        async with AsyncStophy(
            "k", base_url=api.base_url, max_retries=2, retry_initial_delay=0
        ) as client:
            await client.batch.scrape(urls=["https://a.test"])

    asyncio.run(run())
    assert len(api.keys) == 2
    assert api.keys[0] and api.keys[1] == api.keys[0]
    assert len(jobs) == 1


def test_two_submits_get_two_keys_and_a_key_the_caller_sets_is_kept(serve):
    api = serve(lambda key, count: (200, ACCEPTED))
    with Stophy("k", base_url=api.base_url) as client:
        client.crawl(url="https://a.test")
        client.crawl(url="https://a.test")
    assert api.keys[0] != api.keys[1]
    with Stophy("k", base_url=api.base_url, headers={"Idempotency-Key": "mine"}) as own:
        own.crawl(url="https://a.test")
    assert api.keys[2] == "mine"


def test_reads_carry_no_key_and_are_retried_after_a_lost_answer(serve):
    api = serve(
        lambda key, count: (
            "drop" if count == 1 else (200, {"success": True, "data": {}})
        )
    )
    with Stophy(
        "k", base_url=api.base_url, max_retries=2, retry_initial_delay=0
    ) as client:
        client.search(query="x")
    assert api.keys == [None, None]


def test_cancelling_the_async_client_during_the_wait_stops_at_once(serve):
    api = serve(
        lambda key, count: (
            429,
            {
                "success": False,
                "error": "slow",
                "code": "rateLimited",
                "retryable": True,
                "retryAfterSeconds": 30,
            },
        )
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
