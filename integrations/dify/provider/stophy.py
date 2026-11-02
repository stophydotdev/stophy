from typing import Any

from dify_plugin import ToolProvider
from dify_plugin.errors.tool import ToolProviderCredentialValidationError
from stophy import Stophy, StophyError


class StophyProvider(ToolProvider):
    def _validate_credentials(self, credentials: dict[str, Any]) -> None:
        key = str(credentials.get("api_key") or "").strip()
        if not key:
            raise ToolProviderCredentialValidationError("Paste your Stophy API key.")
        try:
            with Stophy(key) as stophy:
                stophy.usage()
        except StophyError as error:
            raise ToolProviderCredentialValidationError(str(error)) from None
