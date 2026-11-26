# QA session — Public marketplace, help pages and mobile navigation

- **Tester (GitHub user):** @aishagbadamosi
- **Issue:** #1778
- **Date:** 2026-11-24
- **Device, OS and browser:** Safari on phone; desktop browser and exact versions not recorded
- **Wallet (only if used):** Not used
- **Order ids:** Not applicable (no orders with money)
- **Recording(s):**
  1. Part 1: https://1drv.ms/v/c/a83a432737f8638c/IQC8XOQ36jJaR5o4yB8eX7_HAUdJcW97DjzkPfxpjYSEDG8?e=u6nXkv
  2. Part 2: https://1drv.ms/v/c/a83a432737f8638c/IQC1-ER10kQXQJ6sfLqxYu14Adl8dwN-PnmzlV9kU2PCuqI?e=YxSCpE
  3. Part 3: https://1drv.ms/v/c/a83a432737f8638c/IQBL9tgyftgdQr_Z5HLoWyxqAWV2vUkVj_I7VzMq4Lor5_8?e=ooQRZX
- **Discussion thread:** https://github.com/OFFER-HUB/OFFER-HUB-Frontend/discussions/596

## Step results

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Desktop: open home page, scroll fully, click every top-menu and footer link | ✅ | Home page scrolled fully and all top-menu and footer links opened as expected. |
| 2 | Marketplace → Services and Offers: search, filters, Load more | ✅ | Search, filters and Load more worked on both Services and Offers. |
| 3 | Open a freelancer profile, then Portfolio and Reviews tabs | ✅ | Profile opened and the Portfolio and Reviews tabs displayed correctly. |
| 4 | `/search` for “design”, “python”, and a no-result term | ✅ | Search results appeared for “design” and “python”; the no-result term showed a clear empty/no-results state. |
| 5 | Open FAQ, Help, Status and Stats | ✅ | All four pages loaded with content that made sense. |
| 6 | Open Terms and Privacy | ✅ | Both pages loaded with full content. |
| 7 | Phone: open site and register with email/password or Google | ✅ | Registration on the phone succeeded. |
| 8 | Phone: onboarding, then menu → Dashboard, Profile, Marketplace, Settings | ❌ | Onboarding and Profile, Marketplace and Settings worked, but the Dashboard layout was clipped and the menu completely disappeared, so it was not possible to return to the menu. |
| 9 | Phone: edit name and picture, save, check overflow/cut-off | ✅ | Name and picture were saved successfully and no overflow or cut-off was observed. |
| 10 | Phone: rotate to landscape and back on two pages, then sign out | ❌ | Rotation itself worked, but after rotating and switching pages the navigation disappeared, preventing movement to other pages. Sign-out still worked at the end. |

## Problems found

1. Opened **Dashboard** from the phone menu → expected the Dashboard layout to fit the screen and the menu to remain reachable → the Dashboard layout was clipped and the menu completely disappeared, so there was no way to return to the menu.
2. Rotated the phone to landscape and back, then switched pages on two pages → expected navigation to remain available after rotation → the navigation disappeared, preventing movement to other pages. Sign-out still worked.

## Notes

- Exact phone model, OS version, desktop browser and browser versions were not captured during the session.
- No money, paid orders, seed phrases, secret keys or sensitive personal documents were involved or shown.
- The QA-feedback Discussion was published with the “I agree” consent box ticked: https://github.com/OFFER-HUB/OFFER-HUB-Frontend/discussions/596

## General impression

Most public pages and marketplace interactions worked as expected on desktop, and phone registration, profile editing and sign-out worked. The main issue is mobile navigation: the menu can disappear after opening Dashboard or after rotating/switching pages, leaving the user unable to move to other pages.

## Discussion thread content (published)

**Consent:** “I agree” was ticked before publishing.

**Title:** `[QA] Public marketplace, help pages and mobile navigation - aishagbadamosi (#1778)`

**Scenarios:** Public marketplace, help pages and mobile navigation

**Order ids:** Not applicable (no orders with money)

**Recording link(s):**

- Part 1: https://1drv.ms/v/c/a83a432737f8638c/IQC8XOQ36jJaR5o4yB8eX7_HAUdJcW97DjzkPfxpjYSEDG8?e=u6nXkv
- Part 2: https://1drv.ms/v/c/a83a432737f8638c/IQC1-ER10kQXQJ6sfLqxYu14Adl8dwN-PnmzlV9kU2PCuqI?e=YxSCpE
- Part 3: https://1drv.ms/v/c/a83a432737f8638c/IQBL9tgyftgdQr_Z5HLoWyxqAWV2vUkVj_I7VzMq4Lor5_8?e=ooQRZX

**Step results:**

- Step 1: ✅ — Home page scrolled fully and all top-menu and footer links opened.
- Step 2: ✅ — Search, filters and Load more worked on Services and Offers.
- Step 3: ✅ — Freelancer profile, Portfolio and Reviews tabs displayed correctly.
- Step 4: ✅ — “design” and “python” returned results; the no-result term showed a clear empty state.
- Step 5: ✅ — FAQ, Help, Status and Stats loaded with sensible content.
- Step 6: ✅ — Terms and Privacy loaded with full content.
- Step 7: ✅ — Phone registration succeeded.
- Step 8: ❌ — Onboarding and most menu pages worked, but Dashboard was clipped and the menu disappeared so it could not be reopened.
- Step 9: ✅ — Phone profile name and picture saved with no overflow or cut-off.
- Step 10: ❌ — Rotation worked, but navigation disappeared after rotating/switching pages; sign-out still worked.

**Problems found:**

1. Opened Dashboard from the phone menu → expected the layout to fit and the menu to remain reachable → the layout was clipped and the menu completely disappeared.
2. Rotated the phone and switched pages → expected navigation to remain available → navigation disappeared and blocked movement to other pages.

## Pull request draft

**Title:** `docs(qa): QA session #1778 report`

**Description:**

```text
Closes #1778

Adds QA-1778-aishagbadamosi.md with the recorded session links, step results and problems found.

Recording(s):
- https://1drv.ms/v/c/a83a432737f8638c/IQC8XOQ36jJaR5o4yB8eX7_HAUdJcW97DjzkPfxpjYSEDG8?e=u6nXkv
- https://1drv.ms/v/c/a83a432737f8638c/IQC1-ER10kQXQJ6sfLqxYu14Adl8dwN-PnmzlV9kU2PCuqI?e=YxSCpE
- https://1drv.ms/v/c/a83a432737f8638c/IQBL9tgyftgdQr_Z5HLoWyxqAWV2vUkVj_I7VzMq4Lor5_8?e=ooQRZX

Discussion thread: https://github.com/OFFER-HUB/OFFER-HUB-Frontend/discussions/596
```
