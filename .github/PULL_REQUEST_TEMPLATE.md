# 📝 Pull Request

## 🔧 Title

`docs(auth-wallet): document credential kinds and the wallet flow`

## 🛠️ Issue

- Closes #<issue-ID> — replace with the issue number for this work.

## 📚 Description

This PR adds public and engineering guidance for the three OFFER-HUB credential kinds and the complete wallet flow:

- `authentication.mdx` explains API keys, short-lived API-key tokens, and 7-day user-session JWTs, including scopes, Bearer usage, sign-in paths, and security expectations.
- `auth.mdx` provides the endpoint inventory and request/response fields for API-key administration, wallet and email sign-in, sessions, OAuth linking, marketplace user creation, and the 7-day JWT lifecycle.
- `wallets.mdx` explains supported Stellar wallets, JWT-authenticated wallet endpoints, external versus sandbox-invisible wallet models, client-side signing, the testnet-only 90-day claim window, and the SDK 3.0.0 usage pattern.
- `docs/guides/wallets.md` is the internal engineering counterpart: it covers the wallet endpoint inventory, signing responsibilities, connection lifecycle, testnet sandbox behavior, SDK calls, and links to the public reference pages.

Endpoint paths, HTTP methods, authentication requirements, request/response fields, supported SDK methods, and lifetimes come from the documentation set and SDK-published interfaces already represented in this repository. The credential and wallet lifetime statements are deliberately distinguished: API keys are long-lived, API-key tokens expire after 1 hour, user-session JWTs expire after 7 days, and the sandbox wallet claim window lasts 90 days.

## ✅ Changes applied

- `content/docs/api-reference/authentication.mdx` — added a credential model, API-key minting flow, signed-in user-session guidance, wallet/email sign-in overview, scopes, supported Stellar wallets, and security guidance.
- `content/docs/api-reference/auth.mdx` — added credential, API-key endpoint, sign-in, session, OAuth, and marketplace-user inventories with request/response fields and a wallet sign-in sequence diagram.
- `content/docs/guide/wallets.mdx` — added public wallet authentication, endpoint, wallet-type, signing, testnet sandbox, SDK, and user-type documentation.
- `docs/guides/wallets.md` — added the internal engineering wallet reference, including endpoint inventory, signing model, connection lifecycle, platform-signing boundary, sandbox behavior, SDK examples, and related-document links.

## 🔍 Evidence

### Validation

| Check | Result |
|---|---|
| `npm run lint` | **Not run:** Node.js/npm are unavailable in the current environment PATH, so the command could not be executed. |
| `npm run lint:classes` | **Not run:** Node.js/npm are unavailable in the current environment PATH, so the command could not be executed. |
| `npm test` | **Not run:** Node.js/npm are unavailable in the current environment PATH, so the command could not be executed. |
| `npm run build` | **Not run:** Node.js/npm are unavailable in the current environment PATH, so the command could not be executed. |

Before merging, run all four commands in the repository environment and replace the Not run entries with the actual outcomes.

### Screenshots / media

- Not applicable: this PR changes documentation content and uses existing MDX/Markdown page components; it does not introduce custom layout or styling changes.
- Add rendered-page screenshots here if maintainers require visual evidence or if the documentation layout is customized after this template is merged.