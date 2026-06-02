# Report: Send & Receive Messages — Issue #1360

**Tester:** Queen Esther Ajanaku  
**Username:** @sweetesty  
**GitHub:** [@sweetesty](https://github.com/sweetesty)  
**Date:** 2026-05-31  
**Environment:** Production — https://www.offer-hub.org  
**Issue:** [#1360 Manual Test: Start Conversation + Send & Receive Messages](https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1360)

---

## Prerequisites

- Logged in as: `sweetesty` (estherolukorede12@gmail.com)
- Second test account used: _(add username/email of the other participant)_
- Conversation already started (see `Report_StartConversation_Issue_1360.md`)

> **NOTE:** All message tests below were **blocked** because the chat page crashes before any conversation can be opened. See BUG 2 in `Report_StartConversation_Issue_1360.md`.  
> URL: `https://offer-hub.org/app/chat/usr_2mDFYtDaYz1TgT5XApph7Vrs4Nrgl0pk` → *"Oops! Something went wrong"*

---

## Test: Send a Message

### Step 1 — Open an Existing Conversation

- **Action:** Attempted to open a conversation via the chat URL `/app/chat/usr_[userID]`.
- **Expected:** Chat view opens showing the message history (or empty if no prior messages).
- **Result:** ❌ FAIL
- **Notes:** Page crashed with "Oops! Something went wrong" error. Chat is inaccessible.

**Screenshot:** *(see PR description)*

---

### Step 2 — Type and Send a Message

- **Action:** Typed a message in the input field (e.g., "Hello! I'm interested in your service.") and pressed Send / Enter.
- **Expected:** Message is sent and appears immediately in the chat without a page refresh.
- **Result:** ✅ PASS / ❌ FAIL
- **Notes:** _(add observations here)_

**Screenshot:**  
![Message Sent](./screenshots/message-sent.png)

---

### Step 3 — Verify Sent Message Display

- **Action:** Verified that the sent message appears on the right side (or with a "sent" indicator) in the chat thread.
- **Expected:** Sent message is displayed immediately with correct content, timestamp, and sender attribution.
- **Result:** ✅ PASS / ❌ FAIL
- **Notes:** _(add observations here)_

**Screenshot:**  
![Sent Message Display](./screenshots/sent-message-display.png)

---

## Test: Receive a Message

### Step 4 — Receive a Reply Without Page Refresh

- **Action:** Using the second test account (in a separate browser/device), sent a reply message to the conversation. Observed the first account's chat view.
- **Expected:** The incoming reply appears in real time without requiring a page refresh.
- **Result:** ✅ PASS / ❌ FAIL
- **Notes:** _(add observations here — note any delay if observed)_

**Screenshot:**  
![Message Received](./screenshots/message-received.png)

---

### Step 5 — Unread Message Count Updates

- **Action:** While the first account had the conversation closed (on the conversations list or another page), the second account sent a new message. Checked the unread badge/count.
- **Expected:** The unread message count or badge updates correctly to reflect the new unread message, without a page refresh.
- **Result:** ✅ PASS / ❌ FAIL
- **Notes:** _(add observations here)_

**Screenshot:**  
![Unread Count](./screenshots/unread-count.png)

---

### Step 6 — Mark as Read

- **Action:** Opened the conversation thread on the first account.
- **Expected:** The unread badge/count resets to zero (or disappears) once the conversation is opened.
- **Result:** ✅ PASS / ❌ FAIL
- **Notes:** _(add observations here)_

**Screenshot:**  
![Mark as Read](./screenshots/mark-as-read.png)

---

## Summary

| Test Case                                    | Result      | Notes                                              |
|----------------------------------------------|-------------|----------------------------------------------------|
| Conversation opens correctly                 | ❌ FAIL     | Chat page crashes at `/app/chat/usr_[id]`          |
| Message typed and sent successfully          | ❌ BLOCKED  | Cannot reach chat UI                               |
| Sent message appears immediately             | ❌ BLOCKED  | Cannot reach chat UI                               |
| Incoming message appears without page refresh | ❌ BLOCKED | Cannot reach chat UI                               |
| Unread count updates in real time            | ❌ BLOCKED  | Cannot reach chat UI                               |
| Unread count clears on conversation open     | ❌ BLOCKED  | Cannot reach chat UI                               |

**Bugs / Issues Found:**

**BUG — Chat Page Crashes When Opening a Conversation**
- **URL:** `https://offer-hub.org/app/chat/usr_2mDFYtDaYz1TgT5XApph7Vrs4Nrgl0pk`
- **Steps to reproduce:**
  1. Click "Message" on another user's profile or service
  2. Browser navigates to `/app/chat/usr_[userID]`
- **Expected:** Chat thread opens
- **Actual:** Full-page error — *"Oops! Something went wrong"*
- **Severity:** Critical — all send/receive message tests are blocked
- **Screenshot:** *(see PR description)*

---

## Real-Time Behavior Notes

All real-time tests (WebSocket delivery, unread counts, live updates) could not be evaluated due to the critical chat page crash. Testing must be re-run once the `/app/chat/usr_[id]` route is fixed.

---

## Environment Details

| Detail          | Value          |
|-----------------|----------------|
| Browser         | Chrome         |
| OS              | Windows 11     |
| Screen Size     | 1920×1080      |
| Network         | WiFi           |
