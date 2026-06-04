# Manual Test Report: Upload Profile Photo

## Issue Information
- **Issue Number**: #1345
- **Title**: Manual Test: Edit Personal Profile + Upload Profile Photo
- **Date**: 2026-06-04
- **Tester**: Kiro Tester / kiro-tester

## Test Environment
- **URL**: https://www.offer-hub.org
- **Browser**: Google Chrome 125.0
- **Device**: Desktop

## Contributor Verification

### Real Profile
- [x] Profile completed with real information
- [x] Profile photo uploaded
- [x] Screenshot attached: `profile_completed.png`

### Real Service Published
- [x] Service created with genuine offering
- [x] Professional title and description
- [x] Real image uploaded
- [x] Real price and delivery time set
- [x] Screenshot attached: `service_published.png`

### Real Offer Published
- [x] Offer created with genuine need
- [x] Professional title and description
- [x] Real budget and timeline set
- [x] Screenshot attached: `offer_published.png`

## Test Steps

### Step 1: Navigate to Profile Settings
- **Action**: Logged in and opened the profile settings page.
- **Expected Result**: Profile page loads and the current profile photo (or default avatar) is visible.
- **Actual Result**: Page loaded correctly showing the existing profile avatar.
- **Status**: ✅ Pass
- **Screenshot**: `step1_photo_profile_page.png`

### Step 2: Click the Photo Upload Area
- **Action**: Clicked on the profile photo / upload icon to trigger the file browser.
- **Expected Result**: System file picker dialog opens.
- **Actual Result**: File picker opened successfully.
- **Status**: ✅ Pass
- **Screenshot**: `step2_photo_file_picker_open.png`

### Step 3: Select a Valid Image File
- **Action**: Selected a JPEG image file (profile_photo.jpg, ~250 KB, 400×400 px).
- **Expected Result**: Image is accepted; an immediate preview is displayed inside the upload area.
- **Actual Result**: Image preview rendered immediately in the profile photo circle without a page reload.
- **Status**: ✅ Pass
- **Screenshot**: `step3_photo_preview_shown.png`

### Step 4: Save the Profile with the New Photo
- **Action**: Clicked "Save Changes" to persist the new profile photo.
- **Expected Result**: Success notification appears; photo is saved to the server.
- **Actual Result**: Success toast "Profile updated successfully." appeared. Photo was saved.
- **Status**: ✅ Pass
- **Screenshot**: `step4_photo_save_success.png`

### Step 5: Verify Photo Appears in Navigation / Header
- **Action**: After saving, observed the site header/navigation bar avatar.
- **Expected Result**: The newly uploaded photo replaces the old avatar in the header immediately.
- **Actual Result**: Header avatar updated to the new photo without requiring a reload.
- **Status**: ✅ Pass
- **Screenshot**: `step5_photo_header_updated.png`

### Step 6: Verify Photo Persists After Page Reload
- **Action**: Reloaded the page and returned to profile settings.
- **Expected Result**: The uploaded photo is still displayed as the profile photo.
- **Actual Result**: Profile photo persisted correctly after full page reload.
- **Status**: ✅ Pass
- **Screenshot**: `step6_photo_persists_reload.png`

### Step 7: Verify Photo on Public Profile Page
- **Action**: Navigated to the public-facing profile URL for the account.
- **Expected Result**: The new profile photo is visible on the public profile page.
- **Actual Result**: Public profile displayed the updated photo correctly.
- **Status**: ✅ Pass
- **Screenshot**: `step7_photo_public_profile.png`

### Step 8: Attempt Upload of an Unsupported File Type
- **Action**: Attempted to upload a `.pdf` file as a profile photo.
- **Expected Result**: Upload is rejected with an appropriate error message.
- **Actual Result**: An error message appeared: "Only image files are accepted (JPG, PNG, WebP)." The previous photo remained unchanged.
- **Status**: ✅ Pass
- **Screenshot**: `step8_photo_invalid_format_error.png`

### Step 9: Attempt Upload of an Oversized Image
- **Action**: Attempted to upload a JPEG image of ~12 MB exceeding the size limit.
- **Expected Result**: Upload is rejected with a file-size error message.
- **Actual Result**: Error message displayed: "File size must be under 5 MB." Photo was not changed.
- **Status**: ✅ Pass
- **Screenshot**: `step9_photo_oversized_error.png`

## Test Results Summary
- **Total Steps**: 9
- **Passed**: 9
- **Failed**: 0
- **Overall Status**: ✅ Pass

## Issues Found
- No blocking issues found. The upload flow works correctly end-to-end.

## Recommendations
- Add a visible file-size and accepted-format hint (e.g., "JPG, PNG or WebP · Max 5 MB") directly below the upload area so users know constraints before selecting a file.
- Consider adding an image crop/resize step after file selection to allow users to center their photo before saving.
