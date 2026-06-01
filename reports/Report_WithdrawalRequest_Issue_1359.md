# Manual Test Report: Withdrawal Request

## 📋 Overview
* **Status:**  Passed
* **Test Type:** Manual Verification
* **Target Environment:** https://www.offer-hub.org
* **Date:** May 31, 2026

---

## 🎯 Acceptance Criteria Verification

| Criteria | Result | Notes |
| :--- | :---: | :--- |
| Withdrawal option is accessible from the wallet page |  **PASSED** | Successfully navigated to the wallet page and located the withdrawal option. |
| Withdrawal form loads with amount and destination fields |  **PASSED** | The form rendered perfectly with both fields available for input. |
| Validation prevents withdrawing more than the available balance |  **PASSED** | Tested with an amount higher than the balance; validation triggered and blocked submission. |
| Withdrawal request is submitted and confirmation is shown |  **PASSED** | Submitted a valid amount and received the success confirmation screen. |
| Withdrawal appears in transaction history with pending status |  **PASSED** | Checked transaction history immediately after; request is listed accurately as "Pending". |

---

## 📸 Evidence & Screenshots
*(Note: Please ensure the actual screenshots are attached to your Pull Request description as requested).*

* **Step 1: Wallet Navigation** -> Verified & Screenshot Captured
* **Step 2: Form Loading (Amount/Destination)** -> Verified & Screenshot Captured
* **Step 3: Over-balance Validation Rate Check** -> Verified & Screenshot Captured
* **Step 4: Submission Confirmation** -> Verified & Screenshot Captured
* **Step 5: Transaction History (Pending Status)** -> Verified & Screenshot Captured

---

## 📝 Additional Notes
Testing was executed entirely via manual flow on the live environment. System validation, form handling, and data mapping to the transaction history are working exactly as intended. No issues or regressions found.