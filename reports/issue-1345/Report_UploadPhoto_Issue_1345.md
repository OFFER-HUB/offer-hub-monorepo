# Manual Test Report — Upload Profile Photo
**Issue:** #1345  
**Feature:** Upload Profile Photo  
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
| Image used | <!-- filename, format, size — e.g. avatar.jpg, JPEG, 250 KB --> |

---

## Test Cases

### TC-04 — Profile photo can be uploaded and previewed immediately

**Steps:**
1. Log in to https://www.offer-hub.org
2. Navigate to the profile edit page
3. Click the profile photo upload area / button
4. Select a local image file (personal photo, avatar, or representative image)
5. Observe the preview

**Expected:** The selected image is displayed as a preview immediately after selection, before saving.

**Result:** <!-- PASS / FAIL -->  
**Notes:** <!-- Accepted formats, size limits observed, any errors -->  
**Screenshot:** <!-- ![TC-04](./screenshots/tc04-photo-preview.png) -->

---

### TC-05 — Uploaded photo is saved and appears on next visit

**Steps:**
1. Upload a photo (as in TC-04)
2. Save the profile
3. Observe the success feedback
4. Log out (or open a new browser tab / incognito window)
5. Log back in and navigate to the profile page
6. Verify the uploaded photo is still displayed

**Expected:** The uploaded photo persists across sessions and appears in the profile header / avatar area.

**Result:** <!-- PASS / FAIL -->  
**Notes:** <!-- -->  
**Screenshot:** <!-- ![TC-05](./screenshots/tc05-photo-persisted.png) -->

---

### TC-06 — Uploaded photo appears across the UI

**Steps:**
1. After saving the photo, navigate to at least two other pages that display the user avatar (e.g. dashboard, navbar, public profile)
2. Verify the photo is consistent across all locations

**Expected:** The new photo is shown everywhere the user avatar appears.

**Result:** <!-- PASS / FAIL -->  
**Notes:** <!-- List pages checked -->  
**Screenshot:** <!-- ![TC-06](./screenshots/tc06-photo-ui-consistency.png) -->

---

## Photo Details

| Field | Value |
|-------|-------|
| File name | <!-- --> |
| Format | <!-- JPEG / PNG / WebP / other --> |
| File size | <!-- e.g. 180 KB --> |
| Dimensions | <!-- e.g. 400×400 px --> |
| Description | <!-- Brief description of the image content --> |

---

## Overall Result

<!-- PASS / FAIL / PARTIAL -->

## Bugs Found

<!-- List any bugs with steps to reproduce, or write "None" -->

---

## Attachments

<!-- List all screenshots attached to the PR -->
- [ ] TC-04 screenshot (photo preview)
- [ ] TC-05 screenshot (photo persisted after re-login)
- [ ] TC-06 screenshot (photo visible across UI)
- [ ] Completed profile with photo screenshot
