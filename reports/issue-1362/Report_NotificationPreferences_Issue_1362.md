# Manual Test Report: Notification Preferences

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

See [Report_AvailabilitySettings_Issue_1362.md](./Report_AvailabilitySettings_Issue_1362.md) for real profile, service, and offer verification (shared across both reports for this issue).

---

## Test Steps — Notification Preferences

### Step 1: Navigate to Notification Preferences
- **Action**: From Settings, open **Notification Preferences** (or Notifications section).
- **Expected Result**: Page loads with all notification type options visible (e.g. email, in-app, order/messages/marketing categories as applicable).
- **Actual Result**: Notification preferences page loaded with all expected toggle options displayed.
- **Status**: ✅ Pass
- **Screenshot**: `step1_notification_preferences_page.png`

### Step 2: Review All Notification Options
- **Action**: Scroll through the page and confirm each notification category/type is listed.
- **Expected Result**: All notification types are present and individually controllable.
- **Actual Result**: All notification options were visible and accessible.
- **Status**: ✅ Pass
- **Screenshot**: `step2_all_notification_options.png`

### Step 3: Toggle Individual Notification Types
- **Action**: Turn off one or more notification types, save, then turn others on/off and save again.
- **Expected Result**: Each toggle updates independently; save applies changes without error.
- **Actual Result**: Individual toggles worked correctly; changes saved successfully.
- **Status**: ✅ Pass
- **Screenshot**: `step3_notification_toggles_changed.png`

### Step 4: Verify Persistence After Reload
- **Action**: Reload the page or leave settings and return to Notification Preferences.
- **Expected Result**: Toggle states match last saved preferences.
- **Actual Result**: All notification preferences persisted after page reload.
- **Status**: ✅ Pass
- **Screenshot**: `step4_notification_persist_after_reload.png`

---

## Test Results Summary
- **Total Steps**: 4
- **Passed**: 4
- **Failed**: 0
- **Overall Status**: ✅ Pass

## Issues Found
- None observed during notification preferences testing.

## Recommendations
- None at this time; notification preferences behaved as expected.
