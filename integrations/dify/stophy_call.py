from collections.abc import Callable, Generator, Mapping
from typing import Any
from urllib.parse import quote, urlencode

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage
from stophy import ParserName, Stophy, StophyError

PERIODS = {"pastWeek": "qdr:w", "pastMonth": "qdr:m", "pastYear": "qdr:y"}
REDDIT_SORTS = {
    "relevance": "relevance",
    "hot": "hot",
    "top": "top",
    "newest": "new",
    "mostComments": "comments",
}
AMAZON_SORTS = {
    "priceLow": "price-asc-rank",
    "priceHigh": "price-desc-rank",
    "avgCustomerReview": "review-rank",
    "newest": "date-desc-rank",
    "bestSelling": "exact-aware-popularity-rank",
}


def respond(
    tool: Tool, endpoint: Callable[[Stophy], Mapping[str, Any]]
) -> Generator[ToolInvokeMessage, None, None]:
    try:
        with Stophy(tool.runtime.credentials.get("api_key")) as stophy:
            data = endpoint(stophy).get("data") or {}
    except StophyError as error:
        raise ValueError(str(error)) from None
    yield tool.create_json_message(dict(data))


def respond_parsed(
    tool: Tool, parser: ParserName, url: str, **options: Any
) -> Generator[ToolInvokeMessage, None, None]:
    defined = {key: value for key, value in options.items() if value is not None}
    try:
        with Stophy(tool.runtime.credentials.get("api_key")) as stophy:
            data = stophy.parsed(parser, url, **defined)["data"].get("json") or {}
    except StophyError as error:
        raise ValueError(str(error)) from None
    yield tool.create_json_message(dict(data))


def page(base: str, **params: Any) -> str:
    query = urlencode({key: value for key, value in params.items() if value is not None})
    return f"{base}?{query}" if query else base


def segment(value: str) -> str:
    return quote(value, safe="")


def number(value: float | None) -> str | None:
    return None if value is None else f"{value:g}"


def text(value: Any) -> str | None:
    return str(value).strip() or None if value is not None else None


def whole(value: Any) -> int | None:
    return int(float(value)) if text(value) else None


def amount(value: Any) -> float | None:
    return float(value) if text(value) else None


def domains(value: Any) -> list[str] | None:
    names = [name.strip() for name in str(value or "").split(",") if name.strip()]
    return names or None
