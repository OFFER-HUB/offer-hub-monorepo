# Manual Test Report: Forgot Password Flow
**Issue:** #1343  
**Tester:** Hope Odidi  
**Test Date:** May 31, 2026  
**Status:** ❌ FAILED (Backend API Bug & Account Lock-in)

## 1. Test Objective
To verify that the "Forgot Password" form handles user input correctly, securely communicates with the backend, and triggers the password recovery email initialization.

## 2. Test Execution Details & Edge Cases Checked

### Case A: OAuth/Google Account Behavior & Deletion Trap (Critical UX/Security Bug)
* **Action:** Attempted to trigger a password reset for an account created via Google OAuth. Upon realizing third-party providers handle authentication differently, an attempt was made to delete the duplicate Google-linked account to clear the environment.
* **Result:** The account deletion process failed. The system required a password confirmation to execute the deletion route. Because OAuth accounts do not possess a traditional database password string, the user is locked into a catch-22: they cannot provide a password to delete the account, and they cannot use the "Forgot Password" flow to create one.
* **Fix/Recommendation:** 
  1. The UI must recognize OAuth authentication states and bypass the password-reauthentication step for account deletion, replacing it with a OAuth re-handshake or a simple confirmation modal.
  2. The Forgot Password form should gracefully reject OAuth emails with an explicit notice: *"This email is linked to Google Sign-In."*

### Case B: Standard Email Account Behavior (System Bug)
* **Action:** Created a brand-new credentials-based account using a real, verified email address to test the clean flow. Logged out and attempted the recovery process.
* **Expected Result:** Form submits, triggers a success UI state, and fires the SMTP dispatch.
* **Actual Result:** The frontend submission failed to trigger the email. Inspection of the browser Developer Tools Network tab revealed that the backend API recovery initialization endpoint responded with a **403 Forbidden** status code.

## 3. Evidence & Screenshots

### Developer Tools Network Log (403 Forbidden)
![DevTools 403 Error Log](https://github.com/user-attachments/assets/e9aef61d-6ed1-45d5-ae39-02deab5c07f9)

## 4. Technical Analysis & Potential Cause
The **403 Forbidden** error on a public password-reset request endpoint typically points to one of three backend architectural issues:
1. **CSRF Token Mismatch:** The password recovery endpoint might be strictly validating Cross-Site Request Forgery (CSRF) tokens, and the token was either missing, expired, or failed verification during the unauthenticated state.
2. **Rate Limiting / IP Throttling:** Strict security middleware or rate-limiting guards (e.g., cloud firewalls, Upstash, or built-in Next.js/Supabase rate limiters) might be overly aggressive, flagging the request as forbidden.
3. **CORS / Route Access Misconfiguration:** The backend route configuration or Supabase Auth SMTP configuration might be restricting requests based on origin or missing the required public access permissions for unauthenticated users.