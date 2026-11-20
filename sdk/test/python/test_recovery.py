import asyncio
import json
import time

import httpx
import pytest

from stophy import AsyncStophy, Stophy, StophyError


@pytest.fixture(params=[False, True], ids=["sync", "async"])
def invoke(request):
    def send(handler, path="/v1/crawl", *, method="POST", body=None, **options):
        settings = {
            "api_key": "offline-key",
            "base_url": "http://stophy.test",
            "transport": httpx.MockTransport(handler),
            "max_retries": 2,
            "retry_initial_delay": 0,
            **options,
        }

        async def run():
            async with AsyncStophy(**settings) as client:
                return await client._request(method, path, body or {})

        if request.param:
            return asyncio.run(run())
        with Stophy(**settings) as client:
            return client._request(method, path, body or {})

    return send


@pytest.fixture(params=[False, True], ids=["sync", "async"])
def public_call(request):
    def send(handler, operation=None, **options):
        settings = {
            "api_key": "offline-key",
            "base_url": "http://stophy.test",
            "transport": httpx.MockTransport(handler),
            "max_retries": 2,
            "retry_initial_delay": 0,
            **options,
        }
        operation = operation or (lambda client: client.crawl(url="https://a.test"))

        async def run():
            async with AsyncStophy(**settings) as client:
                return await operation(client)

        if request.param:
            return asyncio.run(run())
        with Stophy(**settings) as client:
            return operation(client)

    return send


@pytest.mark.parametrize("status", [502, 504])
@pytest.mark.parametrize("last", [None, 429, 503, 400, "refused"])
def test_ambiguous_http_replies_keep_the_accepted_jobs_key(public_call, status, last):
    requests = []
    jobs = {}
    recovering = False

    def handler(request):
        requests.append(request)
        key = request.headers["idempotency-key"]
        if len(requests) == 1 or recovering:
            job = jobs.setdefault(key, f"job_{len(jobs) + 1}")
            if recovering:
                return httpx.Response(200, json={"success": True, "id": job})
        if len(requests) > 1 and last == "refused":
            raise httpx.ConnectError("Offline refusal", request=request)
        code = (
            {429: "rateLimited", 503: "busy", 400: "invalidRequest"}.get(last)
            if len(requests) > 1
            else None
        )
        return httpx.Response(
            last if len(requests) > 1 and last is not None else status,
            json={"error": "No answer", "code": code, "requestId": "reply-id"},
        )

    expected_error = httpx.ConnectError if last == "refused" else StophyError
    with pytest.raises(expected_error) as info:
        public_call(handler)
    error = info.value
    key = requests[0].headers["idempotency-key"]
    if last == "refused":
        recovery_key = error.idempotency_key
    else:
        recovery_key = error.details["idempotencyKey"]
        assert error.status == (last or status)
        assert error.request_id == "reply-id"
    assert recovery_key == key
    assert len(requests) == (2 if last == 400 else 3)
    recovering = True
    result = public_call(
        handler,
        lambda client: client.crawl(url="https://a.test", idempotency_key=recovery_key),
    )
    assert result["id"] == "job_1"
    assert len(jobs) == 1
    assert all(request.headers["idempotency-key"] == key for request in requests)
    assert all(request.content == requests[0].content for request in requests)


@pytest.mark.parametrize("status", [502, 504])
def test_an_ambiguous_http_reply_keeps_the_key_without_retries(public_call, status):
    requests = []

    def handler(request):
        requests.append(request)
        return httpx.Response(status, content=b"Bad gateway")

    with pytest.raises(StophyError) as info:
        public_call(handler, max_retries=0)
    assert info.value.status == status
    assert info.value.details == {
        "idempotencyKey": requests[0].headers["idempotency-key"]
    }
    assert len(requests) == 1


@pytest.mark.parametrize(
    ("status", "code"),
    [
        (429, "rateLimited"),
        (503, "busy"),
        (503, "sourceUnavailable"),
        (504, "sourceTimeout"),
    ],
)
def test_definite_rejections_do_not_claim_a_recovery_key(public_call, status, code):
    requests = []

    def handler(request):
        requests.append(request)
        return httpx.Response(status, json={"error": "Rejected", "code": code})

    with pytest.raises(StophyError) as info:
        public_call(handler, lambda client: client.scrape(url="https://a.test"))
    assert (info.value.status, info.value.code, info.value.retryable) == (
        status,
        code,
        True,
    )
    assert info.value.details == {}
    assert info.value.outcome_unknown is False
    assert len(requests) == 3


@pytest.mark.parametrize("max_retries", [0, 2])
def test_invalid_gzip_keeps_the_key_for_manual_recovery(public_call, max_retries):
    requests = []
    jobs = {}
    recovering = False

    def handler(request):
        requests.append(request)
        job = jobs.setdefault(
            request.headers["idempotency-key"], f"job_{len(jobs) + 1}"
        )
        if recovering:
            return httpx.Response(200, json={"success": True, "id": job})
        return httpx.Response(
            200,
            headers={"content-encoding": "gzip"},
            stream=httpx.ByteStream(b"invalid gzip"),
        )

    with pytest.raises(httpx.DecodingError) as info:
        public_call(handler, max_retries=max_retries)
    assert info.value.idempotency_key == requests[0].headers["idempotency-key"]
    assert len(requests) == max_retries + 1
    recovering = True
    result = public_call(
        handler,
        lambda client: client.crawl(
            url="https://a.test", idempotency_key=info.value.idempotency_key
        ),
    )
    assert result["id"] == "job_1"
    assert len(jobs) == 1
    assert all(request.content == requests[0].content for request in requests)


@pytest.mark.parametrize(
    "operation",
    [
        lambda client: client.scrape(url="https://a.test", zero_data_retention=True),
        lambda client: client.signup(),
    ],
    ids=["no-retention", "unsupported-write"],
)
def test_invalid_gzip_stops_an_unreplayable_write(public_call, operation):
    requests = []

    def handler(request):
        requests.append(request)
        return httpx.Response(
            200,
            headers={"content-encoding": "gzip"},
            stream=httpx.ByteStream(b"invalid gzip"),
        )

    with pytest.raises(httpx.DecodingError) as info:
        public_call(handler, operation)
    assert info.value.outcome_unknown is True
    assert not hasattr(info.value, "idempotency_key")
    assert len(requests) == 1


def test_invalid_gzip_retries_a_read_without_claiming_an_unknown_write(public_call):
    requests = []

    def handler(request):
        requests.append(request)
        return httpx.Response(
            200,
            headers={"content-encoding": "gzip"},
            stream=httpx.ByteStream(b"invalid gzip"),
        )

    with pytest.raises(httpx.DecodingError) as info:
        public_call(handler, lambda client: client.crawl.status(id="job_1"))
    assert not getattr(info.value, "outcome_unknown", False)
    assert not hasattr(info.value, "idempotency_key")
    assert len(requests) == 3


@pytest.mark.parametrize("parser_options", [{}, {"min_rating": 4.5}])
def test_parsed_recovers_with_the_request_key_and_unchanged_parser_options(
    public_call, parser_options
):
    requests = []
    jobs = {}
    recovering = False

    def handler(request):
        requests.append(request)
        key = request.headers["idempotency-key"]
        jobs.setdefault(key, f"result_{len(jobs) + 1}")
        if not recovering:
            raise httpx.ReadTimeout("Reply lost", request=request)
        return httpx.Response(200, json={"success": True, "data": {"json": jobs[key]}})

    def parsed(client, **options):
        return client.parsed(
            "google-maps", "https://a.test", **parser_options, **options
        )

    with pytest.raises(httpx.ReadTimeout) as info:
        public_call(handler, parsed)
    recovery_key = info.value.idempotency_key
    recovering = True
    result = public_call(
        handler, lambda client: parsed(client, idempotency_key=recovery_key)
    )
    assert result["data"]["json"] == "result_1"
    assert len(jobs) == 1
    assert all(
        request.headers["idempotency-key"] == recovery_key for request in requests
    )
    assert all(request.content == requests[0].content for request in requests)
    expected_format = {"type": "json", "parser": "google-maps"}
    if parser_options:
        expected_format["options"] = {"minRating": 4.5}
    assert json.loads(requests[-1].content) == {
        "url": "https://a.test",
        "formats": [expected_format],
    }


@pytest.mark.parametrize("header", ["inf", "-inf", "1e999", "NaN", "invalid"])
def test_invalid_retry_after_preserves_recovery_after_a_lost_send(public_call, header):
    requests = []

    def handler(request):
        requests.append(request)
        if len(requests) == 1:
            raise httpx.ReadTimeout("Accepted but reply lost", request=request)
        return httpx.Response(
            429,
            headers={"retry-after": header, "x-request-id": "later-request"},
            json={"error": "Rate limited", "code": "rateLimited"},
        )

    with pytest.raises(StophyError) as info:
        public_call(handler)
    error = info.value
    assert (error.status, error.code, error.retryable) == (429, "rateLimited", True)
    assert error.request_id == "later-request"
    assert error.retry_after_seconds is None
    assert error.details == {"idempotencyKey": requests[0].headers["idempotency-key"]}
    assert len(requests) == 3


@pytest.mark.parametrize(
    ("headers", "body"),
    [
        ({"retry-after": "-1"}, {}),
        ({"retry-after": "-0.5"}, {}),
        ({}, {"retryAfterSeconds": -1}),
    ],
    ids=["negative-header", "negative-fractional-header", "negative-body"],
)
def test_negative_retry_delay_uses_backoff_and_preserves_recovery(
    public_call, monkeypatch, headers, body
):
    requests = []
    jobs = {}
    waits = []
    recovering = False
    sync_sleep = time.sleep
    async_sleep = asyncio.sleep

    def sleep(delay):
        waits.append(delay)
        sync_sleep(delay)

    async def asleep(delay):
        waits.append(delay)
        await async_sleep(delay)

    monkeypatch.setattr("stophy.transport.time.sleep", sleep)
    monkeypatch.setattr("stophy.transport.asyncio.sleep", asleep)

    def handler(request):
        requests.append(request)
        key = request.headers["idempotency-key"]
        if len(requests) == 1 or recovering:
            job = jobs.setdefault(key, f"job_{len(jobs) + 1}")
            if recovering:
                return httpx.Response(200, json={"success": True, "id": job})
            raise httpx.ReadTimeout("Accepted but reply lost", request=request)
        return httpx.Response(
            429,
            headers={**headers, "x-request-id": "later-request"},
            json={"error": "Rate limited", "code": "rateLimited", **body},
        )

    with pytest.raises(StophyError) as info:
        public_call(handler, retry_initial_delay=0.002)
    error = info.value
    key = requests[0].headers["idempotency-key"]
    assert (error.status, error.code, error.retryable) == (429, "rateLimited", True)
    assert error.request_id == "later-request"
    assert error.retry_after_seconds is None
    assert error.details == {"idempotencyKey": key}
    assert len(requests) == 3
    assert len(waits) == 2
    assert 0.001 <= waits[0] <= 0.002
    assert 0.002 <= waits[1] <= 0.004
    recovering = True
    result = public_call(
        handler,
        lambda client: client.crawl(
            url="https://a.test", idempotency_key=error.details["idempotencyKey"]
        ),
    )
    assert result["id"] == "job_1"
    assert len(jobs) == 1
    assert all(request.headers["idempotency-key"] == key for request in requests)
    assert all(request.content == requests[0].content for request in requests)


@pytest.mark.parametrize(
    ("status", "code", "retryable", "wait"),
    [
        (429, "rateLimited", True, 120),
        (503, "busy", True, 0),
        (400, "invalidRequest", False, 0),
    ],
)
@pytest.mark.parametrize("key", [None, "caller-key"])
def test_a_later_rejection_keeps_the_accepted_crawls_recovery_key(
    invoke, status, code, retryable, wait, key
):
    requests = []
    jobs = {}
    recovering = False

    def handler(request):
        requests.append(request)
        sent_key = request.headers["idempotency-key"]
        if len(requests) == 1 or recovering:
            job = jobs.setdefault(sent_key, f"job_{len(jobs) + 1}")
            if not recovering:
                raise httpx.ReadTimeout("Accepted but reply lost", request=request)
            return httpx.Response(200, json={"success": True, "id": job})
        return httpx.Response(
            status,
            json={
                "error": "Later rejection",
                "code": code,
                "retryable": retryable,
                "retryAfterSeconds": wait,
                "requestId": "later-request",
                "requiredUsd": 0.5,
            },
        )

    body = {"url": "https://a.test"}
    if key is not None:
        body["Idempotency-Key"] = key
    with pytest.raises(StophyError) as info:
        invoke(handler, body=body)
    error = info.value
    original_key = requests[0].headers["idempotency-key"]
    assert original_key
    assert error.details == {"requiredUsd": 0.5, "idempotencyKey": original_key}
    assert (error.status, error.code, error.retryable) == (status, code, retryable)
    assert (error.request_id, error.retry_after_seconds) == ("later-request", wait)
    assert "same Idempotency-Key" in str(error)
    assert len(requests) == (3 if code == "busy" else 2)
    recovering = True
    result = invoke(
        handler, body={**body, "Idempotency-Key": error.details["idempotencyKey"]}
    )
    assert result["id"] == "job_1"
    assert len(jobs) == 1
    assert all(
        request.headers["idempotency-key"] == original_key for request in requests
    )
    assert all(request.content == requests[0].content for request in requests)


@pytest.mark.parametrize("content", [b"not json", b"[]", b"null", b'"text"', b""])
@pytest.mark.parametrize("key", [None, "caller-key"])
def test_a_malformed_success_keeps_the_key_for_manual_recovery(invoke, content, key):
    requests = []

    def handler(request):
        requests.append(request)
        if len(requests) == 1:
            return httpx.Response(
                201, content=content, headers={"x-request-id": "accepted"}
            )
        return httpx.Response(200, json={"success": True, "id": "job_1"})

    body = {"url": "https://a.test"}
    if key is not None:
        body["Idempotency-Key"] = key
    with pytest.raises(StophyError) as info:
        invoke(handler, body=body)
    error = info.value
    assert error.status == 201
    assert error.request_id == "accepted"
    assert error.details["idempotencyKey"] == requests[0].headers["idempotency-key"]
    assert len(requests) == 1
    result = invoke(
        handler, body={**body, "Idempotency-Key": error.details["idempotencyKey"]}
    )
    assert result["id"] == "job_1"
    assert (
        requests[1].headers["idempotency-key"] == requests[0].headers["idempotency-key"]
    )
    assert requests[1].content == requests[0].content


@pytest.mark.parametrize(
    ("path", "body"),
    [
        ("/v1/signup", {}),
        ("/v1/signup/poll", {"Idempotency-Key": "unsupported-key"}),
        ("/v1/scrape", {"url": "https://a.test", "zeroDataRetention": True}),
        ("/v1/extract", {"options": {"zeroDataRetention": True}}),
    ],
)
@pytest.mark.parametrize("content", [b"not json", b"[]"])
def test_a_malformed_success_marks_an_unreplayable_write_as_unknown(
    invoke, path, body, content
):
    requests = []

    def handler(request):
        requests.append(request)
        return httpx.Response(200, content=content)

    with pytest.raises(StophyError) as info:
        invoke(handler, path, body=body)
    assert info.value.outcome_unknown is True
    assert "idempotencyKey" not in info.value.details
    assert len(requests) == 1


def test_a_malformed_read_does_not_claim_an_unknown_write(invoke):
    with pytest.raises(StophyError) as info:
        invoke(
            lambda _: httpx.Response(200, content=b"not json"),
            "/v1/crawl/job_1",
            method="GET",
        )
    assert info.value.outcome_unknown is False
    assert info.value.details == {}


def test_a_later_transport_failure_keeps_its_type_identity_and_recovery_key(invoke):
    requests = []
    refused = httpx.ConnectError("Offline refusal")

    def handler(request):
        requests.append(request)
        if len(requests) == 1:
            raise httpx.ReadTimeout("Accepted but reply lost", request=request)
        raise refused

    with pytest.raises(httpx.ConnectError) as info:
        invoke(handler)
    assert info.value is refused
    assert info.value.idempotency_key == requests[0].headers["idempotency-key"]
    assert len(requests) == 3
