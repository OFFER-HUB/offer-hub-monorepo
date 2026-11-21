# OpenAPI spec generator

Generates `public/openapi.json` — the OpenAPI 3.0 spec served by the docs site — from a
hand-authored, orchestrator-verified data file. This is the thing issue #1594 built: a real
spec instead of the 9 fictional operations the repo shipped with before.

## Source of truth

[`src/data/api-schema.ts`](../src/data/api-schema.ts) is the single source of truth. It's not
mock data — every endpoint in it cites the real orchestrator controller file/handler (and DTO
file, where one exists) it was verified against, in
[`OFFER-HUB/OFFER-HUB`](https://github.com/OFFER-HUB/OFFER-HUB). If a route, parameter, or
response shape changes in the orchestrator, update the matching entry in that file — don't hand-edit
`public/openapi.json` directly, it gets overwritten the next time someone regenerates.

## Usage

```bash
npm run generate:openapi   # writes public/openapi.json
npm run validate:openapi   # --check mode: fails if the committed file is stale or structurally broken
```

`generate-openapi.ts` turns each `src/data/api-schema.ts` entry into a full OpenAPI operation:
named `components.schemas` (via `$ref`, not a generic `{type: "object"}`), real per-operation
`security` with scopes, typed/enum parameters, and a shared `ApiError` schema whose `code` enum is
collected dynamically from every endpoint's own `errors[]` list (so it can't drift from what the
endpoints actually declare).

`--check` does two things, both required for the `OpenAPI Spec Staleness Check` CI job to pass:

1. Regenerates the spec and diffs it against the committed `public/openapi.json` (CRLF-normalized,
   so a Windows checkout doesn't report a false failure).
2. A structural health check: every path has at least one operation, and every operation has an
   `operationId` and at least one response.

## Adding or changing an endpoint

1. Edit the matching entry in `src/data/api-schema.ts` — update `description`, `pathParams`,
   `queryParams`, `requestBody`, `responses`, `errors`, or `security` to match what you verified in
   the orchestrator. Keep (or add) the `controllerFile`/`controllerHandler`/`dtoFile` citation.
2. Run `npm run generate:openapi` and commit the regenerated `public/openapi.json` alongside your
   `api-schema.ts` change.
3. `npm run validate:openapi` should pass locally before you push — it's exactly what CI runs.

## Verifying the output is valid OpenAPI

This repo doesn't depend on an OpenAPI linter — `--check` only validates staleness and the two
structural invariants above. Before a change that touches many endpoints at once, it's worth a
one-off check with a real linter, e.g.:

```bash
npx --yes @redocly/cli@latest lint public/openapi.json
```
