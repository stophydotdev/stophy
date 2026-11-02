from collections.abc import Callable, Generator, Mapping
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage
from stophy import Stophy, StophyError


def respond(
    tool: Tool, endpoint: Callable[[Stophy], Mapping[str, Any]]
) -> Generator[ToolInvokeMessage, None, None]:
    try:
        with Stophy(tool.runtime.credentials.get("api_key")) as stophy:
            data = endpoint(stophy)["data"]
    except StophyError as error:
        raise ValueError(str(error)) from None
    yield tool.create_json_message(dict(data))


def text(value: Any) -> str | None:
    return str(value).strip() or None if value is not None else None


def whole(value: Any) -> int | None:
    return int(float(value)) if text(value) else None


def amount(value: Any) -> float | None:
    return float(value) if text(value) else None


def domains(value: Any) -> list[str] | None:
    names = [name.strip() for name in str(value or "").split(",") if name.strip()]
    return names or None
