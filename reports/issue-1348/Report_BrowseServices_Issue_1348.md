# Manual Test Report — Browse Services (Issue #1348)

- **Environment:** Production — https://www.offer-hub.org
- **Tester:** Victor Oladimeji (@Kingvic300)
- **GitHub:** @Kingvic300
- **Browser / OS:** Firefox / Linux (GNOME)
- **Date tested:** 2026-05-31

---

## Scope

Manually verify the **Services** marketplace: listings load, filters/search work,
cards display correct information, and loading/empty states render correctly.

---

## Acceptance Criteria Checklist

| # | Criteria | Result |
|---|----------|--------|
| 1 | Services marketplace loads and displays service cards | ✅ Pass |
| 2 | Services can be filtered or searched | ✅ Pass |
| 3 | Loading state displays correctly | ✅ Pass |
| 4 | Empty state displays correctly (no results) | ✅ Pass |
| 5 | Card information is accurate (title, price, delivery, etc.) | ✅ Pass |

---

## Test Steps & Evidence

### Step 1 — Open the Services marketplace
- **URL visited:** https://www.offer-hub.org/marketplace/services
- **Expected:** Page loads; a grid of service cards appears with the Filters sidebar and search bar.
- **Actual:** "Browse Services" page loaded ("Discover professional services from talented freelancers"). A search bar, Filters sidebar (Category + Price Range), and a 3-column grid of service cards rendered correctly.
- **Result:** ✅ Pass
- **Screenshot:** _Services marketplace loaded — embedded in the PR description._

### Step 2 — Verify service card contents
- **Fields checked:** seller avatar + name, service title, category tag, description, order count, delivery time, rating, price, "View Service" button.
- **Expected:** Each card shows correct, non-placeholder data.
- **Actual:** Cards show real seller names (e.g. Victor Oladimeji, PraiseGod Okorie, Tochukwu Anagbo), titles, category tags (Web Development, Design & Creative), order counts, delivery days, ratings, and prices ($1,000 / $200 / $600). No placeholder text.
- **Result:** ✅ Pass
- **Screenshot:** _Service card detail — embedded in the PR description._

### Step 3 — Filter the services
- **Filter(s) applied:** Category + Price Range ($0–$10,000) from the Filters sidebar.
- **Expected:** List updates to match the filter.
- **Actual:** Applying category/price filters narrowed the grid to matching services.
- **Result:** ✅ Pass
- **Screenshot:** _Filtered services — embedded in the PR description._

### Step 4 — Search the services
- **Search term:** keyword matching an existing service.
- **Expected:** Results match the query.
- **Actual:** Search returned services matching the query; non-matching services were excluded.
- **Result:** ✅ Pass
- **Screenshot:** _Search results — embedded in the PR description._

### Step 5 — Loading state
- **How triggered:** Page load / refresh of the services marketplace.
- **Expected:** Skeleton/spinner shows while data loads.
- **Actual:** Loading skeletons rendered in place of cards while data was being fetched, then resolved to the populated grid.
- **Result:** ✅ Pass
- **Screenshot:** _Loading state — embedded in the PR description._

### Step 6 — Empty state
- **How triggered:** Searched "blah blah" (no matching services).
- **Expected:** Friendly "no results" / empty message, no broken layout.
- **Actual:** An empty-state icon with "No services found. Try adjusting your filters or search terms" displayed; the Filters sidebar and layout stayed intact.
- **Result:** ✅ Pass
- **Screenshot:** _Empty state — embedded in the PR description._

---

## Bugs / Observations

None. All services marketplace flows (load, filter, search, loading, empty state) behaved as expected.

---

## Mandatory Real-Data Evidence (required by issue)

> These prove the production data created as part of this issue.

**Real profile** (`/app/profile`)

- **Name:** Victor Oladimeji
- **Username:** Kingvic300
- **Professional title:** Full stack developer
- **Location:** Lagos, Nigeria
- **Timezone:** UTC
- **Email:** oladimejivictor611@gmail.com
- **Profile photo:** uploaded ✅
- **Screenshot:** _Profile — embedded in the PR description._

**Published real service** (`/app/freelancer/services`)

- **Title:** Professional Website service
- **Status / category:** Active · Web Development
- **Price:** $1,000.00
- **Delivery time:** 7 days
- **Screenshot:** _Published service — embedded in the PR description._

---

## Summary

- **Overall result:** ✅ Pass
- **Notes:** The Services marketplace loads correctly, displays accurate service cards (seller, title, price, delivery, rating), and supports both filtering and search. Loading skeletons and the empty state ("No services found") render correctly. All acceptance criteria met with no issues found.
