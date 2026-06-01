# Manual Test Report — Browse Offers (Issue #1348)

- **Environment:** Production — https://www.offer-hub.org
- **Tester:** Victor Oladimeji (@Kingvic300)
- **GitHub:** @Kingvic300
- **Browser / OS:** Firefox / Linux (GNOME)
- **Date tested:** 2026-05-31

---

## Scope

Manually verify the **Offers** marketplace: listings load, filters/search work,
cards display correct information, and loading/empty states render correctly.

---

## Acceptance Criteria Checklist

| # | Criteria | Result |
|---|----------|--------|
| 1 | Offers marketplace loads and displays offer cards | ✅ Pass |
| 2 | Offers can be filtered or searched | ✅ Pass |
| 3 | Loading state displays correctly | ✅ Pass |
| 4 | Empty state displays correctly (no results) | ✅ Pass |
| 5 | Card information is accurate (title, budget, etc.) | ✅ Pass |

---

## Test Steps & Evidence

### Step 1 — Open the Offers marketplace
- **URL visited:** https://www.offer-hub.org/marketplace/offers
- **Expected:** Page loads; a grid of offer cards appears with the Filters sidebar and search bar.
- **Actual:** "Browse Offers" page loaded successfully. A search bar, a Filters panel (Category + Price Range), and a grid of offer cards rendered correctly.
- **Result:** ✅ Pass
- **Screenshot:** _Offers marketplace loaded — embedded in the PR description._

### Step 2 — Verify offer card contents
- **Fields checked:** title, category tag, description preview, budget, deadline/timeline, poster.
- **Expected:** Each card shows correct, non-placeholder data.
- **Actual:** Cards display real titles, category, a description preview, budget and timeline. No placeholder/lorem text observed.
- **Result:** ✅ Pass
- **Screenshot:** _Offer card detail — embedded in the PR description._

### Step 3 — Filter the offers
- **Filter(s) applied:** Category + Price Range from the Filters sidebar.
- **Expected:** List updates to match the filter.
- **Actual:** Applying a category/price filter narrowed the list to matching offers; counts updated accordingly.
- **Result:** ✅ Pass
- **Screenshot:** _Filtered offers — embedded in the PR description._

### Step 4 — Search the offers
- **Search term:** keyword matching an existing offer.
- **Expected:** Results match the query.
- **Actual:** Search returned offers matching the query; non-matching offers were excluded.
- **Result:** ✅ Pass
- **Screenshot:** _Search results — embedded in the PR description._

### Step 5 — Loading state
- **How triggered:** Page load / refresh of the offers marketplace.
- **Expected:** Skeleton/spinner shows while data loads.
- **Actual:** Loading skeletons rendered in place of cards while data was being fetched, then resolved to the populated grid.
- **Result:** ✅ Pass
- **Screenshot:** _Loading state — embedded in the PR description._

### Step 6 — Empty state
- **How triggered:** Searched a term with no matching offers.
- **Expected:** Friendly "no results" / empty message, no broken layout.
- **Actual:** An empty-state icon with a "no offers found — try adjusting your filters or search terms" message displayed; layout stayed intact.
- **Result:** ✅ Pass
- **Screenshot:** _Empty state — embedded in the PR description._

---

## Bugs / Observations

None. All offers marketplace flows (load, filter, search, loading, empty state) behaved as expected.

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

**Published real offer** (`/app/client/offers/ofr_mptg48ixbwitaewm904`)

- **Title:** Logistics Management Web Application Development
- **Status / category:** Active · Web Development
- **Budget:** $2,000
- **Deadline:** August 31, 2026
- **Screenshot:** _Published offer — embedded in the PR description._

---

## Summary

- **Overall result:** ✅ Pass
- **Notes:** The Offers marketplace loads correctly, displays accurate offer cards, and supports both filtering and search. Loading skeletons and the empty state render correctly. All acceptance criteria met with no issues found.
