# QA session — Public marketplace, help pages and mobile navigation

- **Tester (GitHub user):** @aishagbadamosi
- **Issue:** #1778
- **Date:** 2026-11-24
- **Device, OS and browser:** Not recorded — no phone or recorded browser session was available in this environment
- **Wallet (only if used):** Not used
- **Recording(s):** Pending — tester must add the real recording URL(s) covering steps 1–10
- **Discussion thread:** Pending — paste the draft below into OFFER-HUB-Frontend → QA feedback, tick “I agree”, then add the published URL here

> **Coverage note:** This is a read-only verification report, not the recorded manual session required by the issue. Steps 5–6 were verified by HTTP content checks. All other steps are marked ❌ because they were not interactively or visually verified. No recording, phone testing, or consent has been fabricated.

## Step results

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Desktop: open home page, scroll fully, click every top-menu and footer link | ❌ | Static link audit of the rendered homepage found footer links `/about` and `/contact` returning HTTP 404. Manual click-through not recorded. |
| 2 | Marketplace → Services and Offers: search, filters, Load more | ❌ | Both pages respond, but content is client-rendered (“Searching...” skeleton in static HTML); search/filters/Load more not interactively verified. |
| 3 | Open a freelancer profile, then Portfolio and Reviews tabs | ❌ | No freelancer/profile/portfolio/review links exist in the static marketplace HTML; not verified in a browser. |
| 4 | /search for “design”, “python”, and a no-result term | ❌ | `/search?q=design` responds but only shows “Loading search…” in static HTML; interactive results not verified. |
| 5 | Open FAQ, Help, Status and Stats | ✅ | All four URLs respond and rendered text content is coherent in HTTP checks. Not visually or record-verified. |
| 6 | Open Terms and Privacy | ✅ | Both URLs respond and full policy text renders correctly in HTTP checks. Not visually or record-verified. |
| 7 | Phone: open site and register with email/password or Google | ❌ | Not executed — no phone/device access available. |
| 8 | Phone: onboarding, then menu → Dashboard, Profile, Marketplace, Settings | ❌ | Not executed — no phone/device access available. |
| 9 | Phone: edit name and picture, save, check overflow/cut-off | ❌ | Not executed — no phone/device access available. |
| 10 | Phone: rotate to landscape and back on two pages, then sign out | ❌ | Not executed — no phone/device access available. |

## Problems found

1. Footer “About” and “Contact” links → expected both to open real pages → `https://www.offer-hub.org/about` and `https://www.offer-hub.org/contact` both return HTTP 404 (verified 2026-11-24 by read-only HTTP request).

## Coverage gaps (not product defects)

- No screen recording covering steps 1–10 was produced.
- Steps 2–4 and 7–10 were not interactively or visually tested.
- No phone rotation, profile-edit, or sign-out verification was performed.
- No QA-feedback Discussion has been published and no “I agree” consent has been given.

## General impression

Public informational pages (FAQ, Help, Status, Stats, Terms, Privacy) render sensible content and respond successfully. The marketplace and search pages rely on client-side rendering, so their interactive state could not be judged from static responses. The confirmed broken footer links are the only concrete defect found in the checks performed.

## Discussion thread draft — paste into OFFER-HUB-Frontend → QA feedback

**Title:** `[QA] Public marketplace, help pages and mobile navigation - aishagbadamosi (#1778)`

**Scenarios:** Public marketplace, help pages and mobile navigation

**Order ids:** Not applicable (no orders with money)

**Recording link(s):** Pending — add real Loom/OBS/OS-recorder link(s) before publishing

**Step results:**

- Step 1: ❌ — footer `/about` and `/contact` return HTTP 404; manual click-through not recorded.
- Step 2: ❌ — marketplace pages load but client-rendered search/filters/Load more not verified.
- Step 3: ❌ — freelancer profile/Portfolio/Reviews not verified.
- Step 4: ❌ — `/search` results for “design”, “python” and a no-result term not verified.
- Step 5: ✅ — FAQ, Help, Status and Stats load with coherent content in HTTP checks.
- Step 6: ✅ — Terms and Privacy load with full content in HTTP checks.
- Step 7: ❌ — phone registration not performed.
- Step 8: ❌ — phone onboarding/menu navigation not performed.
- Step 9: ❌ — phone profile edit not performed.
- Step 10: ❌ — phone rotation and sign-out not performed.

**Problems found:**

1. Clicked footer “About” and “Contact” → expected working pages → both URLs return HTTP 404.

**Consent:** The tester must tick “I agree” personally before publishing.

## Pull request draft

**Title:** `docs(qa): QA session #1778 report`

**Description:**

```text
Closes #1778

Adds QA-1778-aishagbadamosi.md with the QA session report, verified HTTP findings, and drafts for the required Discussion thread.

Note: recording link and published Discussion URL are still pending and must be added before this can satisfy the acceptance criteria.
```
