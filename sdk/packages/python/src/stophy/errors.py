from __future__ import annotations


class StophyError(Exception):
    """Raised when a call fails. Read code, retryable and request_id to decide what to do."""

    def __init__(
        self,
        message: str,
        *,
        status: int,
        code: str | None = None,
        retryable: bool = False,
        retry_after_seconds: int | None = None,
        request_id: str | None = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.retryable = retryable
        self.retry_after_seconds = retry_after_seconds
        self.request_id = request_id
