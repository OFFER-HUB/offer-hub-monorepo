# Manual Test Report: Change Password

**Issue:** #1346
**Tester:** Okorie Chigozie
**Date:** May 31, 2026
**Environment:** Production (https://www.offer-hub.org)
**Browser:** Chrome (latest)
**OS:** Windows

---

## Test Setup

- Logged into real test account (Okorie Chigozie)
- Navigated to Account Settings > Security section
- Located Change Password form

---

## Test Steps

1. Entered current password
2. Entered new password (8+ characters, meeting strength requirements)
3. Confirmed new password (matching entry)
4. Clicked "Change Password" button

---

## Expected Behavior

- ✅ Form accepts matching new passwords
- ✅ Form rejects mismatched passwords
- ✅ Form rejects incorrect current password
- ✅ Password successfully changes
- ✅ User can login with new password
- ✅ User cannot login with old password

---

## Actual Result: ❌ FAILED

**Error Message:** `"currentPassword, newPassword, and confirmPassword are required"`

**Issue:** Despite filling all required fields with valid values that meet the requirements, the system returned an error indicating the form inputs were not being properly captured or transmitted to the backend.

---

## Error Scenario Tests

### Test: Wrong Current Password ❌

- **Input:** Correct username, incorrect current password, valid new password
- **Expected:** "Current password is incorrect"
- **Result:** ❌ Generic error returned — same message regardless of input

### Test: Password Too Short ❌

- **Input:** Valid current password, new password < 8 characters
- **Expected:** "Password must be at least 8 characters"
- **Result:** ❌ Same generic error message (indistinguishable from field capture issue)
- **Note:** Error message is the same as when fields aren't captured

---

## Root Cause Analysis

- Form inputs (`currentPassword`, `newPassword`, `confirmPassword`) are not being captured or transmitted to the backend
- Error message suggests backend never receives the data
- Possible causes: Form serialization issue, missing form submission handler, or API endpoint mismatch

---

## Screenshots

Screenshots are embedded in the PR description: https://github.com/OFFER-HUB/offer-hub-monorepo/pull/1373

---

## Summary

| Test Case               | Status    | Notes                                   |
| ----------------------- | --------- | --------------------------------------- |
| Change Password (valid) | ❌ FAILED | Form inputs not captured/transmitted    |
| Wrong current password  | ❌ FAILED | Cannot test due to form capture issue   |
| Password too short      | ❌ FAILED | Same generic error — cannot distinguish |

---

## Recommendations

- [ ] Investigate form data serialization in Change Password component
- [ ] Debug API endpoint to verify it receives all required fields
- [ ] Implement specific, actionable error messages for each validation failure
- [ ] Add logging to determine where requests fail (client-side vs server-side)
- [ ] Add email confirmation for password changes (security improvement)

---

## Sign-off

**Tester:** Okorie Chigozie
**Date:** May 31, 2026
**Status:** ❌ CRITICAL — Change Password feature non-functional
