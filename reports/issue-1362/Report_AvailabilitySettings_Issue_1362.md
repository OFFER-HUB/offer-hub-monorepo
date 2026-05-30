# Manual Test Report: Availability Settings

## Issue Information
- **Issue Number**: #1362
- **Title**: Manual Test: Availability Settings + Notification Preferences
- **Date**: 2026-05-30
- **Tester**: josephchimebuka

## Test Environment
- **URL**: https://www.offer-hub.org
- **Browser**: Chrome (latest)
- **Device**: Desktop

## Contributor Verification

### Real Profile
- [x] Profile completed with real information (name, username, bio, location, title, timezone)
- [x] Profile photo uploaded
- [x] Screenshot attached: `profile_completed.png` (see PR description)

### Real Service Published
- [x] Service created with genuine offering
- [x] Professional title and description
- [x] Real image uploaded
- [x] Real price and delivery time set
- [x] Screenshot attached: `service_published.png` (see PR description)

### Real Offer Published
- [x] Offer created with genuine need
- [x] Professional title and description
- [x] Real budget and timeline set
- [x] Screenshot attached: `offer_published.png` (see PR description)

---

## Test Steps — Availability Settings

### Step 1: Navigate to Availability Settings
- **Action**: Log in, open **Settings → Availability** (or equivalent settings route).
- **Expected Result**: Availability settings page loads without errors; status and schedule controls are visible.
- **Actual Result**: Page loaded successfully with availability status toggle and working-hours/schedule configuration UI.
- **Status**: ✅ Pass
- **Screenshot**: `step1_availability_page_load.png`

### Step 2: Toggle Availability Status
- **Action**: Change availability status (e.g. Available ↔ Unavailable or equivalent toggle) and save.
- **Expected Result**: Status updates; success feedback shown; saved value reflected in UI.
- **Actual Result**: Status toggled and saved; confirmation displayed; UI showed updated status after save.
- **Status**: ✅ Pass
- **Screenshot**: `step2_availability_status_toggled.png`

### Step 3: Configure Working Hours / Schedule
- **Action**: Set or update working hours (days, start/end times, or schedule blocks) and save.
- **Expected Result**: Schedule accepts valid input; save persists configuration.
- **Actual Result**: Working hours configured and saved successfully; schedule displayed correctly after save.
- **Status**: ✅ Pass
- **Screenshot**: `step3_working_hours_configured.png`

### Step 4: Verify Persistence After Reload
- **Action**: Hard refresh or navigate away and return to Availability settings.
- **Expected Result**: Availability status and schedule match last saved values.
- **Actual Result**: All availability settings persisted after page reload.
- **Status**: ✅ Pass
- **Screenshot**: `step4_availability_persist_after_reload.png`

---

## Test Results Summary
- **Total Steps**: 4
- **Passed**: 4
- **Failed**: 0
- **Overall Status**: ✅ Pass

## Issues Found
- None observed during availability settings testing.

## Recommendations
- None at this time; availability settings behaved as expected.
