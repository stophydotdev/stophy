from __future__ import annotations

from typing import Any


class StophyError(Exception):
    """Raised when a call fails. Read code, retryable and request_id to decide what to do.

    details holds the other fields of the error, such as billingUrl or signupUrl.
    """

    outcome_unknown = False

    def __init__(
        self,
        message: str,
        *,
        status: int,
        code: str | None = None,
        retryable: bool = False,
        retry_after_seconds: int | None = None,
        request_id: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.retryable = retryable
        self.retry_after_seconds = retry_after_seconds
        self.request_id = request_id
        self.details = details or {}
