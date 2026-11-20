from __future__ import annotations

import asyncio
import time
from typing import Any, AsyncIterator, Awaitable, Callable, Iterator

from .errors import StophyError

START = "ck_start"
ENDED = frozenset({"completed", "failed", "cancelled"})
DEFAULT_POLL_SECONDS = 2.0
DEFAULT_TIMEOUT_SECONDS = 15 * 60.0

OnCheckpoint = Callable[[str], None]


def _checked(page: Any) -> str:
    checkpoint = page.get("checkpoint")
    if checkpoint is None:
        raise StophyError(
            "The job's answer carried no checkpoint to resume from.",
            status=0,
            code="checkpointMissing",
        )
    return checkpoint


def _timeout(checkpoint: str) -> StophyError:
    return StophyError(
        "Gave up waiting for more results. Resume with the checkpoint.",
        status=0,
        code="resultsTimeout",
        retryable=True,
        details={"checkpoint": checkpoint},
    )


def checkpoint_results(
    read_page: Callable[[str], Any],
    *,
    checkpoint: str | None = None,
    poll_interval: float = DEFAULT_POLL_SECONDS,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
    on_checkpoint: OnCheckpoint | None = None,
) -> Iterator[Any]:
    """Yields a job's results one at a time, reading one status page per pull.

    read_page takes a checkpoint and returns the job's status answer. The loop
    ends once the job has ended and no result is left. on_checkpoint gets the
    checkpoint after every result of a page was taken: keep it to resume later.
    """
    deadline = time.monotonic() + timeout
    current = checkpoint or START
    while True:
        page = read_page(current)
        next_checkpoint = _checked(page)
        results = page.get("data") or []
        yield from results
        current = next_checkpoint
        if on_checkpoint:
            on_checkpoint(current)
        if results:
            continue
        if page.get("status") in ENDED:
            return
        if time.monotonic() + poll_interval > deadline:
            raise _timeout(current)
        time.sleep(poll_interval)


async def async_checkpoint_results(
    read_page: Callable[[str], Awaitable[Any]],
    *,
    checkpoint: str | None = None,
    poll_interval: float = DEFAULT_POLL_SECONDS,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
    on_checkpoint: OnCheckpoint | None = None,
) -> AsyncIterator[Any]:
    """The async form of checkpoint_results. Cancel the task to stop waiting."""
    deadline = time.monotonic() + timeout
    current = checkpoint or START
    while True:
        page = await read_page(current)
        next_checkpoint = _checked(page)
        results = page.get("data") or []
        for result in results:
            yield result
        current = next_checkpoint
        if on_checkpoint:
            on_checkpoint(current)
        if results:
            continue
        if page.get("status") in ENDED:
            return
        if time.monotonic() + poll_interval > deadline:
            raise _timeout(current)
        await asyncio.sleep(poll_interval)
