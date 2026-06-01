# Manual Test Report — Edit Personal Profile
**Issue:** #1345  
**Feature:** Edit Personal Profile  
**URL:** https://www.offer-hub.org  
**Date:** <!-- e.g. 2026-06-01 -->  
**Tester:** <!-- Your full name or professional alias -->  
**Account:** <!-- Your username on offer-hub.org -->

---

## Environment

| Field | Value |
|-------|-------|
| Browser | <!-- e.g. Chrome 125 --> |
| OS | <!-- e.g. macOS 14.4 / Windows 11 --> |
| Screen resolution | <!-- e.g. 1920×1080 --> |

---

## Test Cases

### TC-01 — Profile form loads with existing data pre-filled

**Steps:**
1. Log in to https://www.offer-hub.org
2. Navigate to the profile edit page
3. Observe all form fields

**Expected:** All fields (first name, last name, username, date of birth, bio, phone, location, timezone, professional title) are pre-filled with the current account data.

**Result:** <!-- PASS / FAIL -->  
**Notes:** <!-- Any observations -->  
**Screenshot:** <!-- ![TC-01](./screenshots/tc01-profile-prefilled.png) -->

---

### TC-02 — Fields can be edited

**Steps:**
1. Clear and update each of the following fields:
   - First name
   - Last name
   - Username
   - Date of birth
   - Bio
   - Phone
   - Location
   - Timezone
   - Professional title
2. Verify each field accepts input

**Expected:** All fields accept new values without errors.

**Result:** <!-- PASS / FAIL -->  
**Notes:** <!-- Any field that behaved unexpectedly -->  
**Screenshot:** <!-- ![TC-02](./screenshots/tc02-fields-edited.png) -->

---

### TC-03 — Changes save successfully and persist after reload

**Steps:**
1. Edit one or more fields
2. Click the Save / Update button
3. Observe the success feedback
4. Reload the page
5. Verify the updated values are still shown

**Expected:** Changes persist after page reload.

**Result:** <!-- PASS / FAIL -->  
**Notes:** <!-- -->  
**Screenshot:** <!-- ![TC-03](./screenshots/tc03-saved-persisted.png) -->

---

## Profile Data Used for Testing

| Field | Value |
|-------|-------|
| First name | <!-- --> |
| Last name | <!-- --> |
| Username | <!-- --> |
| Date of birth | <!-- --> |
| Bio | <!-- --> |
| Phone | <!-- --> |
| Location | <!-- --> |
| Timezone | <!-- --> |
| Professional title | <!-- --> |

---

## Overall Result

<!-- PASS / FAIL / PARTIAL -->

## Bugs Found

<!-- List any bugs with steps to reproduce, or write "None" -->

---

## Attachments

<!-- List all screenshots attached to the PR -->
- [ ] TC-01 screenshot
- [ ] TC-02 screenshot
- [ ] TC-03 screenshot
- [ ] Completed profile screenshot
