from __future__ import annotations

import asyncio
import random
import re
import time
import uuid
from email.utils import parsedate_to_datetime
from importlib.metadata import version
from typing import Any, Mapping
from urllib.parse import quote

import httpx

from .errors import StophyError

DEFAULT_BASE_URL = "https://api.stophy.dev"
MAX_RETRY_WAIT_SECONDS = 60
RETRYABLE_STATUS = {429, 500, 502, 503, 504}
JOB_STARTS = {"/v1/agent", "/v1/batch/scrape", "/v1/crawl"}
BROWSER_TASK_STATUS = "/v1/browser/task/status"
KEYLESS_READS = {"/v1/map", "/v1/parse", "/v1/scrape", "/v1/search"}
KEYED_POSTS = (
    JOB_STARTS
    | KEYLESS_READS
    | {
        BROWSER_TASK_STATUS,
        "/v1/browser/task",
        "/v1/extract",
    }
)
ENVELOPE_FIELDS = {
    "success",
    "error",
    "message",
    "code",
    "retryable",
    "retryAfterSeconds",
    "requestId",
}
USER_AGENT = f"stophy-python/{version('stophy')}"


def default_headers(api_key: str, headers: Mapping[str, str] | None) -> dict[str, str]:
    defaults = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    if api_key:
        defaults["Authorization"] = f"Bearer {api_key}"
    return {**defaults, **(headers or {})}


def request_args(method: str, path: str, values: Mapping[str, Any]) -> tuple[str, dict[str, Any]]:
    rest = dict(values)
    filled = re.sub(r"\{(\w+)\}", lambda match: quote(str(rest.pop(match[1])), safe=""), path)
    key = rest.pop("Idempotency-Key", None)
    args = {"json": rest} if method == "POST" else {"params": rest}
    return filled, {**args, "headers": {"Idempotency-Key": key}} if key else args


def camel_keys(values: Mapping[str, Any]) -> dict[str, Any]:
    return {re.sub(r"_([a-z0-9])", _upper, key): value for key, value in values.items()}


def _upper(match: re.Match[str]) -> str:
    return match[1].upper()


def _error_object(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        return {}
    nested = payload.get("error")
    return nested if isinstance(nested, dict) else payload


def _header_retry_after(response: httpx.Response) -> int | None:
    header = response.headers.get("retry-after")
    if not header:
        return None
    try:
        return int(float(header))
    except ValueError:
        try:
            return max(0, int(parsedate_to_datetime(header).timestamp() - time.time()))
        except (TypeError, ValueError, OSError):
            return None


def _payload(response: httpx.Response) -> Any:
    try:
        return response.json()
    except ValueError:
        return None


def _retry_after(response: httpx.Response, error: dict[str, Any]) -> int | None:
    seconds = error.get("retryAfterSeconds")
    if isinstance(seconds, bool) or not isinstance(seconds, int):
        return _header_retry_after(response)
    return seconds


def handle_response(response: httpx.Response) -> Any:
    payload = _payload(response)
    if response.is_success and isinstance(payload, dict):
        return payload
    raise _error_from(response, payload)


def _error_from(response: httpx.Response, payload: Any) -> StophyError:
    error = _error_object(payload)
    message = error.get("error")
    if not isinstance(message, str) or not message:
        message = error.get("message")
    if not isinstance(message, str) or not message:
        message = f"Stophy request failed with status {response.status_code}"
    code = error.get("code")
    retryable = error.get("retryable")
    request_id = error.get("requestId")
    return StophyError(
        message,
        status=response.status_code,
        code=code if isinstance(code, str) else None,
        retryable=retryable
        if isinstance(retryable, bool)
        else response.status_code in RETRYABLE_STATUS,
        retry_after_seconds=_retry_after(response, error),
        request_id=request_id
        if isinstance(request_id, str)
        else response.headers.get("x-request-id"),
        details={key: value for key, value in error.items() if key not in ENVELOPE_FIELDS},
    )


class _RetryConfig:
    def __init__(self, max_retries: int, retry_initial_delay: float) -> None:
        self.max_retries = max_retries
        self.retry_initial_delay = retry_initial_delay

    def backoff(self, attempt: int) -> float:
        window = self.retry_initial_delay * (2**attempt)
        return window / 2 + random.random() * (window / 2)

    def retry_after(
        self, response: httpx.Response, attempt: int, max_retries: int, call: _Call
    ) -> float | None:
        if response.status_code < 400 or attempt >= max_retries:
            return None
        error = _error_from(response, _payload(response))
        if not error.retryable or call.outcome_is_unknown(error):
            return None
        seconds = error.retry_after_seconds
        if seconds is not None and seconds > MAX_RETRY_WAIT_SECONDS:
            return None
        return self.backoff(attempt) if seconds is None else float(seconds)


def _may_have_run(error: StophyError) -> bool:
    return error.status == 408 or (error.status >= 500 and error.code != "busy")


def _answer_is_kept(path: str, body: Any) -> bool:
    if path in JOB_STARTS:
        return True
    body = body if isinstance(body, dict) else {}
    parts = [body, body.get("scrapeOptions"), body.get("options")]
    return not any(
        isinstance(part, dict) and part.get("zeroDataRetention") is True for part in parts
    )


SEND_AGAIN = (
    "Check before you send it again as a new call, or send it again with the same "
    "Idempotency-Key in details['idempotencyKey']."
)
NEVER_SENT = (httpx.ConnectError, httpx.ConnectTimeout, httpx.PoolTimeout)


class _Call:
    def __init__(
        self,
        client: httpx.Client | httpx.AsyncClient,
        method: str,
        path: str,
        kwargs: dict[str, Any],
    ) -> None:
        self.request = client.build_request(method, path, **kwargs)
        self.path = path
        has_api_key = "authorization" in self.request.headers
        keyed = method == "POST" and path in KEYED_POSTS and has_api_key
        if keyed and "idempotency-key" not in self.request.headers:
            self.request.headers["idempotency-key"] = str(uuid.uuid4())
        self.key = (
            self.request.headers.get("idempotency-key")
            if keyed and _answer_is_kept(path, kwargs.get("json"))
            else None
        )
        self.replayable = (
            method != "POST"
            or path == BROWSER_TASK_STATUS
            or (not has_api_key and path in KEYLESS_READS)
            or self.key is not None
        )
        self.earlier_send_lost = False

    def outcome_is_unknown(self, error: StophyError) -> bool:
        definite_scrape_failure = self.path == "/v1/scrape" and (error.status, error.code) in {
            (504, "sourceTimeout"),
            (503, "sourceUnavailable"),
        }
        return not self.replayable and _may_have_run(error) and not definite_scrape_failure

    def lost(self, error: httpx.TransportError, attempt: int, max_retries: int) -> None:
        may_have_left = not isinstance(error, NEVER_SENT)
        if may_have_left and not self.replayable:
            vars(error).update(outcome_unknown=True)
            raise error
        if attempt >= max_retries:
            if (may_have_left or self.earlier_send_lost) and self.key is not None:
                vars(error).update(idempotency_key=self.key)
            raise error
        self.earlier_send_lost = self.earlier_send_lost or may_have_left

    def finish(self, response: httpx.Response) -> Any:
        try:
            return handle_response(response)
        except StophyError as error:
            if self.outcome_is_unknown(error):
                error.outcome_unknown = True
            if self.key is None or not self.earlier_send_lost or not _may_have_run(error):
                raise
            raise StophyError(
                f"{error} An earlier send may still complete. {SEND_AGAIN}",
                status=error.status,
                code=error.code,
                retryable=error.retryable,
                retry_after_seconds=error.retry_after_seconds,
                request_id=error.request_id,
                details={**error.details, "idempotencyKey": self.key},
            ) from None


class SyncTransport(_RetryConfig):
    def __init__(
        self,
        client: httpx.Client,
        *,
        max_retries: int,
        retry_initial_delay: float,
    ) -> None:
        super().__init__(max_retries, retry_initial_delay)
        self.client = client

    def request(self, method: str, path: str, **kwargs: Any) -> Any:
        attempt = 0
        max_retries = 0 if method == "DELETE" else self.max_retries
        call = _Call(self.client, method, path, kwargs)
        while True:
            try:
                response = self.client.send(call.request)
            except httpx.TransportError as error:
                call.lost(error, attempt, max_retries)
                time.sleep(self.backoff(attempt))
                attempt += 1
                continue
            wait = self.retry_after(response, attempt, max_retries, call)
            if wait is None:
                return call.finish(response)
            time.sleep(wait)
            attempt += 1


class AsyncTransport(_RetryConfig):
    def __init__(
        self,
        client: httpx.AsyncClient,
        *,
        max_retries: int,
        retry_initial_delay: float,
    ) -> None:
        super().__init__(max_retries, retry_initial_delay)
        self.client = client

    async def request(self, method: str, path: str, **kwargs: Any) -> Any:
        attempt = 0
        max_retries = 0 if method == "DELETE" else self.max_retries
        call = _Call(self.client, method, path, kwargs)
        while True:
            try:
                response = await self.client.send(call.request)
            except httpx.TransportError as error:
                call.lost(error, attempt, max_retries)
                await asyncio.sleep(self.backoff(attempt))
                attempt += 1
                continue
            wait = self.retry_after(response, attempt, max_retries, call)
            if wait is None:
                return call.finish(response)
            await asyncio.sleep(wait)
            attempt += 1
