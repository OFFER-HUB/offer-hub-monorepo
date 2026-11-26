# QA session — Wallet login, wallet page and account settings

- **Tester (GitHub user):** @tek-lizzy
- **Issue:** #1777
- **Date:** 2026-11-25
- **Device, OS and browser:** PC, Windows 11 Pro, Google Chrome (recorded with OBS Studio)
- **Wallet (only if used):** Lobstr (Mainnet / Public network)
- **Order ids:** Not applicable (no orders with money)
- **Recording(s):** https://drive.google.com/file/d/1giJfcA2A91u1Z0WQG5CrEcGWLIEtWXiv/view?usp=sharing
- **Discussion thread:** https://github.com/OFFER-HUB/OFFER-HUB-Frontend/discussions/611

## Step results

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Install Freighter, Lobstr or xBull in desktop browser; create/open wallet on Mainnet / Public network | ✅ | Freighter and xBull were not connecting, so used Lobstr on Mainnet/Public network. |
| 2 | Open https://www.offer-hub.org, click Register → Connect wallet, pick wallet, approve & sign message | ✅ | Successfully connected and signed the message; repeatedly requested connection permissions during connection. |
| 3 | Complete onboarding with any role | ✅ | Onboarding completed successfully and role was selected. |
| 4 | Open Wallet and check the address shown matches your wallet | ✅ | Wallet address displayed in the platform correctly matched the connected Lobstr wallet address. |
| 5 | Open Wallet → Transactions and write down what you see | ✅ | Transactions page opened; displayed an empty list as expected for a new wallet account. |
| 6 | Open Settings → Account and update one field. Save and reload | ✅ | Updated an account field, saved changes, and verified they persisted after page reload. |
| 7 | Open Settings → Preferences: change date & time format, save, verify, revert | ✅ | Successfully changed date and time formats, verified the formatting updated across the app, and reverted back to original settings. |
| 8 | Open Settings → Security and Settings → Sessions | ✅ | Current active session was listed with accurate device and date details. |
| 9 | Sign out. Click Login → Connect wallet again, verify same account | ✅ | Successfully logged back in using the same wallet without duplicate registration. |
| 10 | Sign out, attempt wallet login and reject signature on purpose | ✅ | Rejected signature in the wallet; displayed message: "Connection cancelled. You closed or declined the request in your wallet." User remained signed out. |
| 11 | Sign in again and try Disconnect wallet from the wallet menu | ✅ | Selected disconnect wallet from the wallet menu; automatically logged out. |

## Problems found

1. **Freighter and xBull wallet connection issues:** Attempted to connect using Freighter and xBull extensions, but neither connected properly. Switched to Lobstr wallet extension, which connected successfully.
2. **Repeated connection permission prompts:** During wallet authentication, the platform repeatedly requested connection permissions before the connection was completed.

## General impression

The wallet onboarding and account management workflows are clean and functional. Once connected via Lobstr, the authentication flow, settings updates (Account and Preferences persistence), session tracking, and error handling when rejecting wallet signatures worked as expected. Disconnecting the wallet appropriately terminates the active session.
