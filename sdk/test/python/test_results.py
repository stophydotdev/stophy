import asyncio

import httpx
import pytest

from helpers import make_client, query_of
from stophy import AsyncStophy, StophyError

CK_A = "ck_aaaaaaaaaaaaaaaaaaaa"
CK_B = "ck_bbbbbbbbbbbbbbbbbbbb"


def page(status, checkpoint, urls=()):
    return {
        "json": {
            "success": True,
            "status": status,
            "checkpoint": checkpoint,
            "data": [{"markdown": url} for url in urls],
        }
    }


def sent(calls):
    return [query_of(call)["checkpoint"] for call in calls]


def test_reads_from_ck_start_and_follows_each_checkpoint_to_the_end():
    client, calls = make_client(
        [
            page("scraping", CK_A, ["https://a.test/"]),
            page("completed", CK_B, ["https://b.test/"]),
            page("completed", CK_B),
        ]
    )
    items = list(client.crawl_results("job_1"))
    assert [item["markdown"] for item in items] == [
        "https://a.test/",
        "https://b.test/",
    ]
    assert sent(calls) == ["ck_start", CK_A, CK_B]
    assert calls[0].url.path == "/v1/crawl/job_1"


def test_batch_results_read_the_batch_route():
    client, calls = make_client(page("completed", CK_A))
    list(client.batch_scrape_results("job_2"))
    assert calls[0].url.path == "/v1/batch/scrape/job_2"


def test_at_the_live_tail_it_polls_again_with_the_same_checkpoint():
    client, calls = make_client(
        [
            page("scraping", CK_A),
            page("scraping", CK_A),
            page("scraping", CK_B, ["https://a.test/"]),
            page("completed", CK_B),
        ]
    )
    items = list(client.crawl_results("job_1", poll_interval=0.001))
    assert len(items) == 1
    assert sent(calls) == ["ck_start", CK_A, CK_A, CK_B]


def test_a_reconnect_resumes_from_the_kept_checkpoint():
    client, calls = make_client(page("completed", CK_B))
    list(client.crawl_results("job_1", checkpoint=CK_A))
    assert sent(calls) == [CK_A]


def test_distinct_records_with_one_final_url_are_all_delivered():
    client, _ = make_client(
        [
            page("completed", CK_A, ["https://a.test/", "https://a.test/"]),
            page("completed", CK_A),
        ]
    )
    assert len(list(client.crawl_results("job_1"))) == 2


def test_stopping_early_asks_for_nothing_more():
    client, calls = make_client(
        page("scraping", CK_A, ["https://a.test/", "https://b.test/"])
    )
    seen = []
    for item in client.crawl_results("job_1", on_checkpoint=seen.append):
        break
    assert len(calls) == 1
    assert seen == []


def test_gives_up_at_the_time_limit_with_the_checkpoint_to_resume_from():
    client, _ = make_client(page("scraping", CK_A))
    with pytest.raises(StophyError) as error:
        list(client.crawl_results("job_1", poll_interval=0.005, timeout=0.02))
    assert error.value.code == "resultsTimeout"
    assert error.value.retryable is True
    assert error.value.details == {"checkpoint": CK_A}


def test_an_expired_job_raises_the_api_error_with_its_request_id():
    client, _ = make_client(
        {
            "status": 404,
            "headers": {"x-request-id": "req-expired"},
            "json": {
                "success": False,
                "error": "The job expired.",
                "code": "notFound",
                "retryable": False,
            },
        }
    )
    with pytest.raises(StophyError) as error:
        list(client.crawl_results("job_1"))
    assert error.value.status == 404
    assert error.value.request_id == "req-expired"


def test_an_answer_without_a_checkpoint_stops_instead_of_replaying():
    client, _ = make_client(
        {"json": {"success": True, "status": "scraping", "data": [{"markdown": "x"}]}}
    )
    with pytest.raises(StophyError) as error:
        list(client.crawl_results("job_1"))
    assert error.value.code == "checkpointMissing"


def test_async_client_reads_every_result():
    answers = [page("scraping", CK_A, ["https://a.test/"]), page("completed", CK_A)]
    calls = []

    def handler(request):
        calls.append(request)
        return httpx.Response(
            200, json=answers[min(len(calls), len(answers)) - 1]["json"]
        )

    async def run():
        client = AsyncStophy(
            api_key="st_test", max_retries=0, transport=httpx.MockTransport(handler)
        )
        items = [item async for item in client.crawl_results("job_1")]
        await client.close()
        return items

    items = asyncio.run(run())
    assert [item["markdown"] for item in items] == ["https://a.test/"]
    assert sent(calls) == ["ck_start", CK_A]
