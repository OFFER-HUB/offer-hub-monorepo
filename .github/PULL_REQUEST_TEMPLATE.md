 # Title

 Add GET /api/v1/wallets endpoint — list user wallets

 ## Summary

 This PR implements the GET /api/v1/wallets endpoint that returns all wallets for the authenticated user (both invisible and external). It follows the existing layered architecture (route → controller → service) and includes unit tests for the controller.

 ## Changes

 - Added `getWalletsHandler` in `backend/src/controllers/wallet.controller.ts`
 - Exposed `GET /api/v1/wallets` in `backend/src/routes/wallet.routes.ts` (JWT required)
 - Added unit tests: `backend/src/__tests__/controllers/wallet.controller.test.ts`
 - Ensured response excludes `encrypted_private_key` and orders results by `is_primary` DESC then `created_at` DESC

 ## Checklist

 - [x] Endpoint requires valid JWT authentication
 - [x] Returns all wallets for authenticated user
 - [x] Response fields: `id`, `public_key`, `type`, `provider`, `is_primary`, `created_at`
 - [x] Never includes `enc_private_key` / `encrypted_private_key`
 - [x] Results ordered by `is_primary` DESC, then `created_at` DESC
 - [x] Unit tests added for controller

 ## How to test locally

 ```bash
 # from repository root
 cd "./backend"
 npm test src/__tests__/controllers/wallet.controller.test.ts --runInBand
 ```

 ## Notes for reviewer

 - I ran the controller unit tests; they pass locally. Full test suite shows unrelated integration test failures in other modules (task/escrow) due to test env secrets; those are unchanged by this PR.

 ## Suggested PR title

 feat(wallets): add GET /wallets endpoint (list user wallets)

 ## Suggested PR description (short)

 Implements GET /api/v1/wallets for authenticated users to list their connected wallets (both system-invisible and external). Adds controller, route and unit tests. Response excludes private keys and orders primary wallets first.
