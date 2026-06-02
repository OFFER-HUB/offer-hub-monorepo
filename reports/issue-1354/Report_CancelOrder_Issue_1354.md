# Manual Test Report: Cancel Order
**Issue #1354**
**Date:** 2026-06-02
**Tester:** Keshinro Tanitoluwa Joseph
**Environment:** https://www.offer-hub.org

> **Note:** Screenshots for each test step are embedded in the PR description.

---

## Test Execution Summary
❌ **PARTIAL PASS — 3 STEPS FAILED**

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

**Service Title:** Full Stack Developer
**Category:** Mobile Development
**Description:** I offer premium looks, minimalistic designs and good code quality
**Price:** $500
**Delivery Time:** 10 days
**Status:** Active
**Screenshot:** *[service_screenshot.png — attach to PR]*

---

## Real Offer Published

**Offer Title:** I need a minimalistic, premium design for my work
**Category:** Mobile Development
**Description:** it's a gaming app and i need a gamey design for it. the idea is a flying squirrel 
let's talk more after you've accepted the offer
**Budget:** $500
**Timeline:** 27 days
**Status:** Active
**Screenshot:** *[offer_screenshot.png — attach to PR]*

---

## Prerequisites

An active order in **Created** or **Confirmed** status (before completion) must exist. The order used for this test:

- **Order ID:** #pn3raxgb
- **Service:** Software development
- **Amount:** $300
- **Seller:** Afolami Anu
- **Client:** Keshinro Tanitoluwa
- **Status at Test Start:** In Progress

---

## Test Steps & Results

### ✅ Step 1: Navigate to Order Detail Page
**Action:** Logged in and navigated to Dashboard → My Orders, then opened the active order.

**Order Details Shown:**
- Order ID: #pn3raxgb
- Service: Software development
- Amount: $300
- Current Status: In progress

**Expected Result:** Order detail page loads with a "Cancel Order" button visible.
**Actual Result:** Order detail page actually loads with a "cancel order" button
**Status:** ✅ Pass
**Screenshot:** *[step1_order_detail.png — attach to PR]*

---

### ✅ Step 2: Click "Cancel Order" Button
**Action:** Clicked the "Cancel Order" button on the order detail page.

**Expected Result:** A confirmation dialog or modal appears asking the user to confirm cancellation before proceeding.
**Actual Result:** An alert message popped up asking if I actually wanted to cancel the order
**Status:** ✅ Pass
**Screenshot:** *[step2_cancel_button_clicked.png — attach to PR]*

---

### ❌ Step 3: Confirm Cancellation in Dialog
**Action:** Clicked the confirm/yes button inside the cancellation dialog.

**Expected Result:** Cancellation is processed and a success message appears (e.g. "Order cancelled successfully").
**Actual Result:** It was an alert message so i clicked okay. After that, a review page popped up instead of a success message.
**Status:** ❌ Fail 
**Screenshot:** *[step3_confirm_dialog.png — attach to PR]*

---

### ❌ Step 4: Order Status Updates to "Cancelled"
**Action:** Observed the order detail page after confirming cancellation.

**Expected Result:** Order status changes to "Cancelled" and the progress timeline or status badge reflects it.
**Actual Result:** while it does show that the order has been cancelled successfully, it updates to completed instead of cancelled.
**Status:** ❌ Fail
**Screenshot:** *[step4_cancelled_status.png — attach to PR]*

---

### ❌ Step 5: Cancelled Order Appears Correctly in Orders List
**Action:** Navigated to Dashboard → My Orders list.

**Expected Result:** The order is listed with status "Cancelled" and no further action buttons visible (e.g. no Complete or Cancel button).
**Actual Result:** The order is listed with the status "closed" from the list and after clicking on the issue itself, the order progress UI is labelled with "complete".
**Status:** ❌ Fail
**Screenshot:** *[step5_orders_list.png — attach to PR]*

---

### ✅ Step 6 (Edge Case): Attempt Cancellation After Order is Completed
**Action:** Opened a completed order and checked whether the Cancel Order button is present.

**Expected Result:** Cancel button is not visible or is disabled on a completed order.
**Actual Result:** Cancel button is not visible on a completed order.
**Status:** ✅ Pass
**Screenshot:** *[step6_no_cancel_on_completed.png — attach to PR]*

---

## Acceptance Criteria Results

| Criterion | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Order can be cancelled before completion | "Cancel Order" button visible on active orders | Cancel Order button was present and clickable on the active order | ✅ |
| Cancellation confirmation is requested before proceeding | A dialog/modal prompts the user to confirm | A browser alert appeared asking for confirmation before proceeding | ✅ |
| Cancelled order status is reflected correctly | Status changes to "Cancelled" and UI updates | Order status updated to "completed" instead of "cancelled"; orders list shows "closed" | ❌ |

---

## Issues Found
- The cancelled order status is not reflecting in the order progress UI

## Recommendations
- I don't know how hard it might be to work on but a cancelled order status in the order progress UI would be nice.

---

## Summary
The Cancel Order flow partially passed. The cancel button was correctly visible on active orders, and a confirmation alert appeared before proceeding — both working as expected. However, three issues were found: after confirming cancellation, a review page appeared instead of a success message; the order status updated to "completed" rather than "cancelled"; and the orders list displayed the status as "closed" instead of "cancelled". The core cancellation confirmation requirement is met, but the status handling after cancellation is incorrect.

**Overall Test Result:** ❌ **PARTIAL PASS — 3 STEPS FAILED**
