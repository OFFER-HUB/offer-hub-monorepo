# Manual Test Report: Complete Order
**Issue #1354**
**Date:** 2026-06-02
**Tester:** Keshinro Tanitoluwa Joseph
**Environment:** https://www.offer-hub.org

> **Note:** Screenshots for each test step are embedded in the PR description.

---

## Test Execution Summary
⚠️ **MOSTLY PASSED — 1 ISSUE FOUND**

---

## Real Profile Data

**Username:** T-kesh
**Email:** tanitoluwakeshinro@gmail.com
**First Name:** Tanitoluwa
**Last Name:** Keshinro
**Professional Title:** Frontend Developer
**Location:** Ondo, Akure
**Profile Photo:** Uploaded
**Screenshot:** *[profile_screenshot.png — attach to PR]*

---

## Real Service Published

**Service Title:** App testing
**Category:** Mobile Development
**Description:** Hi there, my name is Joseph and I'm a professional app tester. I test for bugs, design flaws and provide areas for improvement based on what I learn.
**Price:** $100
**Delivery Time:** 3 days
**Status:** Active
**Screenshot:** *[service_screenshot.png — attach to PR]*

---

## Real Offer Published

**Offer Title:** I need a minimalistic, premium design for my work
**Category:** Mobile Development
**Description:** it's a gaming app and i need a gamey design for it. the idea is a flying squirrel 
let's talk more after you've accepted the offer.
**Budget:** $500
**Timeline:** 27 days
**Status:** Active
**Screenshot:** *[offer_screenshot.png — attach to PR]*

---

## Prerequisites

Before testing Complete Order, an active order must exist. The order used for this test:

- **Order ID:** #7gq1fspb
- **Service:** graphic design and website development
- **Amount:** $50
- **Seller:** Excellence Komolafe
- **Client:** Keshinro Tanitoluwa

---

## Test Steps & Results

### ✅ Step 1: Navigate to Order Detail Page
**Action:** Logged in and navigated to Dashboard → My Orders → My Purchases (or My Sales), then opened the order.

**Order Details Shown:**
- Order ID: #7gq1fspb
- Service: graphic design and website development
- Amount: $50
- Current Status: Created

**Expected Result:** Order detail page loads with current status visible and a "Mark as Complete" or "Complete Order" button available.
**Actual Result:** A complete order button is present.
**Status:** ✅ Pass
**Screenshot:** *[step1_order_detail.png — attach to PR]*

---

### ✅ Step 2: Click "Complete Order" / "Mark as Complete" Button
**Action:** Clicked the button to mark the order as complete.

**Expected Result:** Button is visible and clickable; triggers completion flow.
**Actual Result:** Button is clickable and triggers completion workflow.
**Status:** ✅ Pass
**Screenshot:** *[step2_complete_button.png — attach to PR]*

---

### ✅ Step 3: Confirmation / Success Feedback
**Action:** Observed the UI response after clicking Complete.

**Expected Result:** A success message or confirmation toast appears (e.g. "Order completed successfully").
**Actual Result:** There is a success message right under the order progress UI.
**Status:** ✅ Pass
**Screenshot:** *[step3_success_message.png — attach to PR]*

---

### ✅ Step 4: Order Status Updates to "Completed"
**Action:** Checked the order detail page and/or orders list after completion.

**Expected Result:** Order status changes to "Completed" and the progress timeline reflects the final stage.
**Actual Result:** The progress timeline changes to "complete" and the order status is marked as completed.
**Status:** ✅ Pass 
**Screenshot:** *[step4_completed_status.png — attach to PR]*

---

### ✅ Step 5: Completed Order Appears Correctly in Orders List
**Action:** Navigated to Dashboard → My Orders list.

**Expected Result:** The order is listed with status "Completed" and no further action buttons (e.g. no Cancel button visible).
**Actual Result:** While there are no further actions required, the order is listed with the status closed instead of completed. This should be addressed later.
**Status:** ❌ Fail
**Screenshot:** *[step5_orders_list.png — attach to PR]*

---

## Acceptance Criteria Results

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Order can be marked as complete by the appropriate party | "Complete Order" button visible and functional | Button present and successfully triggered order completion | ✅ |
| Status changes to "Completed" | Status field updates immediately | Progress timeline updates to "complete" and order marked as completed | ✅ |
| UI reflects the completed status | Progress timeline and status badge update | Order listed with status "closed" instead of "completed" in orders list | ❌ |

---

## Issues Found
- There was an issue when i was trying to approve confirmation. It took a while to load but got stuck. I refreshed and it was showing a backward shift in the progress UI until i refreshed again. It's not something too important but it's worth looking into.

## Recommendations
- The UI should be updated for the orders.

---

## Summary
The Complete Order flow works correctly end-to-end. The "Complete Order" button was present and functional, the completion flow triggered successfully with a visible success message, and the progress timeline updated to the final stage. One issue was found: the orders list displays the status as "closed" instead of "completed", which is a UI label inconsistency worth addressing. A secondary issue was observed where the progress UI briefly shifted backward after a slow confirmation load before correcting itself on refresh.

**Overall Test Result:** ⚠️ **MOSTLY PASSED — 1 ISSUE FOUND**
