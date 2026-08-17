# Security policy

ChatGPT Exporter processes conversation data that can be sensitive. Do not open public issues containing chats, access tokens, cookies, endpoints with credentials, or personal data.

## Reporting a vulnerability

Use GitHub's private security advisory for this repository when it is available. Otherwise contact the repository owner through the email address listed on the GitHub profile and include:

- a concise description and impact;
- reproducible steps or a minimal proof of concept;
- affected version and browser;
- a safe contact method for follow-up.

Please allow reasonable time for acknowledgement and a fix before public disclosure.

## Security boundaries

- Chat data remains local unless the user explicitly sends it to a configured HTTP endpoint.
- The extension requests download and endpoint permissions only when the related feature is used.
- The ChatGPT web adapter depends on undocumented web-app endpoints and may require maintenance after ChatGPT changes.

See [docs/SECURITY_AND_PRIVACY.md](./docs/SECURITY_AND_PRIVACY.md) for the complete data-flow and permission documentation.
