# Report: Start Conversation — Issue #1360

**Tester:** Queen Esther Ajanaku  
**Username:** @sweetesty  
**GitHub:** [@estherolukorede](https://github.com/estherolukorede)  
**Date:** 2026-05-31  
**Environment:** Production — https://www.offer-hub.org  
**Issue:** [#1360 Manual Test: Start Conversation + Send & Receive Messages](https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1360)

---

## Profile Setup

| Field        | Value                                                                                                     |
|--------------|----------------------------------------------------------------------------------------------------------|
| Full Name    | Queen Esther Ajanaku                                                                                     |
| Username     | @sweetesty                                                                                               |
| Email        | estherolukorede12@gmail.com                                                                              |
| Professional Title | Full Stack Developer                                                                               |
| Location     | Remote                                                                                                   |
| Timezone     | UTC                                                                                                      |
| Phone        | 08166645592                                                                                              |
| Bio          | With 3 to 5 years of hands on experience in web and mobile development, I specialise in building responsive websites and cross platform mobile apps for iOS and Android. My skills cover UI/UX design, front end and back end development, user authentication, payment gateway integration and deployment. |
| GitHub       | estherolukorede12@gmail.com (connected)                                                                  |
| Profile Photo | Real personal photo uploaded ✅                                                                         |

**Screenshot — Completed Profile:** *(see PR description)*

---

## Published Service

| Field            | Value                                                                                                                                                                                         |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Title            | Website Development                                                                                                                                                                          |
| Category         | Web Development                                                                                                                                                                              |
| Description      | I design and build fully functional, high performance websites and web applications that look great and convert results. Whether you need a business website, a web app or a full e-commerce platform, I bring the technical skill and creative thinking to deliver something you will be proud of. |
| Price            | $700.00                                                                                                                                                                                      |
| Delivery Time    | 3 days                                                                                                                                                                                       |
| Status           | Active ✅                                                                                                                                                                                    |

**Screenshot — Published Service Page:** *(see PR description)*

---

## Published Offer

| Field       | Value                                          |
|-------------|------------------------------------------------|
| Title       | build a responsive landing page for my business |
| Category    | Web Development                                |
| Budget      | $100                                           |
| Status      | Active ✅                                      |
| Applicants  | 0                                              |

**Screenshot — Published Offer Page:** *(see PR description)*

---

## Test: Start a New Conversation

### Step 1 — Navigate to Chat / Conversations Page

- **Action:** Logged in and navigated to the Messages / Conversations section.
- **Expected:** Page loads with a list of existing conversations (or an empty state if none exist).
- **Result:** ✅ PASS / ❌ FAIL
- **Notes:** _(add observations here)_

**Screenshot:** *(see PR description)*

---

### Step 2 — Initiate a New Conversation

- **Action:** Located another registered user and clicked the "Message" / contact button on their profile. The browser navigated to `offer-hub.org/app/chat/usr_2mDFYtDaYz1TgT5XApph7Vrs4Nrgl0pk`.
- **Expected:** A new conversation thread opens (or a compose modal appears).
- **Result:** ❌ FAIL
- **Notes:** The chat page crashes immediately with a generic error screen: *"Oops! Something went wrong — An unexpected error has occurred."* The chat route `/app/chat/usr_[userID]` is broken and does not load.

**Screenshot:** *(see PR description)*

---

### Step 3 — Verify Conversation Appears in List

- **Action:** Could not complete — blocked by the chat page crash in Step 2.
- **Expected:** The new conversation appears at the top of the list with the correct recipient name.
- **Result:** ❌ FAIL (blocked)
- **Notes:** Dependent on Step 2 which failed.

---

## Summary

| Test Case                              | Result    | Notes                                      |
|----------------------------------------|-----------|--------------------------------------------|
| Conversations page loads               | ✅ PASS / ❌ FAIL | _(update after checking /app/chat directly)_ |
| New conversation can be started        | ❌ FAIL   | Chat page crashes at `/app/chat/usr_[id]`  |
| Conversation appears in the list       | ❌ FAIL   | Blocked — could not start a conversation   |

**Bugs / Issues Found:**

---

**BUG 1 — Application Submission Does Not Respond**
- **Steps to reproduce:**
  1. Navigate to another user's offer/service listing
  2. Fill in the application form
  3. Click the Submit button
- **Expected:** Application is submitted; confirmation message appears; conversation is initiated
- **Actual:** Nothing happens — no response, no error, no confirmation toast, no page change
- **Severity:** High — blocks the primary flow for starting a conversation via offer applications

---

**BUG 2 — Chat Page Crashes with "Something Went Wrong" Error**
- **URL:** `https://offer-hub.org/app/chat/usr_2mDFYtDaYz1TgT5XApph7Vrs4Nrgl0pk`
- **Steps to reproduce:**
  1. Navigate to another user's profile or service page
  2. Click the "Message" / contact button
  3. Browser redirects to `/app/chat/usr_[userID]`
- **Expected:** Chat thread opens and conversation can be started
- **Actual:** Page renders a full-screen error: *"Oops! Something went wrong — An unexpected error has occurred. Our team has been notified and is working to fix the issue."*
- **Severity:** Critical — the entire chat feature is inaccessible; no conversation can be started
- **Screenshot:** *(see PR description)*

---

## Environment Details

| Detail          | Value          |
|-----------------|----------------|
| Browser         | Chrome         |
| OS              | Windows 11     |
| Screen Size     | 1920×1080      |
| Network         | WiFi           |
