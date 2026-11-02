# Privacy policy

This policy covers the Stophy plugin for Dify.

## Data sent to Stophy

When a tool runs, the plugin sends its inputs (search queries, locations, URLs and filters) to the Stophy API at `https://api.stophy.dev` over HTTPS. Your Stophy API key goes in the `Authorization` header. Stophy uses the inputs to fetch the pages and results you asked for and returns them to Dify.

Stophy's handling of this data is described in the [Stophy privacy policy](https://stophy.dev/privacy).

## Data stored by the plugin

None. The plugin does not store or log your inputs, results or API key. It sends data to no one but the Stophy API, and it has no analytics or telemetry.

Dify stores your API key as a secret credential and may keep workflow inputs, outputs and logs under your workspace settings. Dify handles that, not the plugin.

## Your responsibilities

Only read pages you are allowed to access. Do not put passwords, tokens or sensitive personal data in tool inputs. To stop the plugin from using your account, remove the credential in Dify or revoke the key at [stophy.dev](https://stophy.dev).

## Contact

support@stophy.dev
