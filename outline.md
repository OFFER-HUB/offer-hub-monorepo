markdown
# Manual Test: Email Login + User Registration
**Version:** 3.0 (Production Quality)
**Target:** https://www.offer-hub.org  
**Status:** Approved for Execution  
**Document Owner:** QA Engineering  
**Last Updated:** 2025-04-02  

---

## Table of Contents
- [1. Scope & Objectives](#1-scope--objectives)
- [2. Mandatory Real‑Data Setup](#2-mandatory-real-data-setup)
  - [2.1 Profile Requirements](#21-profile-requirements)
  - [2.2 Service Creation (Post‑Login)](#22-service-creation-post-login)
  - [2.3 Offer Creation (Tied to Service)](#23-offer-creation-tied-to-service)
- [3. Test Environment & Configuration](#3-test-environment--configuration)
- [4. Test Cases](#4-test-cases)
  - [4.1 TC-01: Successful Login](#41-tc-01-successful-login)
  - [4.2 TC-02: Invalid Credentials – Error Message](#42-tc-02-invalid-credentials--error-message)
  - [4.3 TC-03: Successful User Registration](#43-tc-03-successful-user-registration)
  - [4.4 TC-04: Registration Validation Errors](#44-tc-04-registration-validation-errors)
  - [4.5 TC-05: Post‑Registration Redirect / Success State](#45-tc-05-post-registration-redirect--success-state)
  - [4.6 TC-06: Compatibility & Documentation](#46-tc-06-compatibility--documentation)
- [5. Error Handling, Logging & Security Protocols](#5-error-handling-logging--security-protocols)
- [6. Performance Optimization Checklist](#6-performance-optimization-checklist)
- [7. Reporting & Screenshot Requirements](#7-reporting--screenshot-requirements)
- [8. Appendix A: Field Validation Reference](#8-appendix-a-field-validation-reference)
- [9. Appendix B: API Contract Definitions](#9-appendix-b-api-contract-definitions)

---

## 1. Scope & Objectives

**Scope**  
- Manual verification of email/password login and new user registration on `https://www.offer-hub.org`.  
- End‑to‑end flows including error states, validation, and success redirects.

**Objectives**  
1. Validate that authenticated users can log in with correct credentials.  
2. Confirm that incorrect credentials produce user‑facing error messages without leaking security info.  
3. Ensure registration creates an account with real, valid data and proper redirects.  
4. Verify client‑side validation blocks invalid input before submission.  
5. Maintain backward compatibility with existing API contracts and UI components.  

**Out of Scope**  
- Social login (Google, GitHub, etc.)  
- Password reset flow  
- Mobile responsive layout  

---

## 2. Mandatory Real‑Data Setup

> **Rationale:** All data entered must be real, verifiable, and non‑disposable.  
> Failure to satisfy any prerequisite in §2.1 → abort all tests → log `ERROR: Prerequisite <field> failed` → generate blocker report.

### 2.1 Profile Requirements

Each field must pass validation before proceeding. Use the table below for constraints.

| Field               | Type Constraint                                          | Validation Rule                                                                 | Log Level on Success | Log Level on Failure |
|---------------------|----------------------------------------------------------|---------------------------------------------------------------------------------|----------------------|----------------------|
| **Email**           | `string` / format `local@domain.tld`                    | Regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`; MX record resolves; domain not in disposable list | `INFO`               | `ERROR`              |
| **First Name**      | `string` / length 2–50, alpha only (A-Z, a-z)           | `re.match(r'^[a-zA-Z]{2,50}$')`                                                | `INFO`               | `ERROR`              |
| **Last Name**       | `string` / length 2–50, alpha only                       | Same as above                                                                   | `INFO`               | `ERROR`              |
| **Username**        | `string` / must match GitHub public alias                | Case‑sensitive match via `https://api.github.com/users/{username}` (must exist and active) | `INFO`               | `WARN` (mismatch) or `ERROR` (non‑existent) |
| **Profile Photo**   | `image/png` or `image/jpeg` / max 2 MB / min 300×300 px | Check file size (<= 2 MB), dimensions (>= 300 px each side), EXIF data – no placeholder/default initials | `INFO` after upload  | `ERROR` (if size/format/dimension fail) |
| **Bio**             | `string` / min 10 characters                             | Length >= 10; no HTML tags (strip via `html.escape` or reject)                  | `INFO`               | `ERROR`              |
| **Location**        | `string` / min 10 characters                             | Length >= 10; must contain at least one comma or recognizable city/country substring | `INFO`               | `ERROR`              |
| **Professional Headline** | `string` / min 10 characters                        | Length >= 10; no markdown or HTML                                              | `INFO`               | `ERROR`              |

**Error Handling for Setup**  
- If any validation fails → abort all tests → log formatted `ERROR: Prerequisite <field> failed: <reason>` → include screenshot of error state.  
- If profile photo upload fails due to size/format → attempt automatic resize/convert using `PIL` (Python) or `sharp` (Node) locally; if still fails → abort.  
- If GitHub API is unreachable → log `WARN: GitHub API timeout – skipping username verification, but continue with caution`.

### 2.2 Service Creation (Post‑Login)

After successful login (TC‑01), create at least one service to support offer testing.

| Field         | Constraints                       | Validation                                                      | Log Output (Success)          |
|---------------|-----------------------------------|----------------------------------------------------------------|-------------------------------|
| **Title**     | 5–100 characters                  | Length check; no profanity (optional regex)                     | `INFO: Service title: <title>` |
| **Description** | 50–2000 characters               | Length; no `<script>` tags (strip or reject)                    | `INFO: Description length: <len>` |
| **Category**  | Must exist in taxonomy            | `GET /api/categories` → verify returned options                 | `INFO: Category <name> selected` |
| **Pricing**   | Decimal >= 0.01, 2 decimal places | Regex `^\d+(\.\d{1,2})?$`; numeric >= 0.01                     | `INFO: Price: <amount>`       |

**Error Handling**  
- Category not in taxonomy → log `WARN: Category <name> invalid, fallback to first valid category`.  
- Pricing with more than 2 decimals → truncate to 2 decimal places; log `WARN: Price truncated to 2 decimals`.  
- Service creation API returns 4xx/5xx → retry up to 2 times, 5 sec interval; if still fails → log `ERROR: Service creation failed` → mark TC‑03‑05 as blocked.

### 2.3 Offer Creation (Tied to Service)

Create at least one offer for the service under test.

| Field                | Constraints                               | Validation                                                | Log Output (Success)     |
|----------------------|-------------------------------------------|-----------------------------------------------------------|--------------------------|
| **Availability Start**| `datetime` must be in the future          | `datetime.utcnow() < start`                                | `INFO: Start: <iso>`     |
| **Availability End**  | After start, in future                     | `start < end`                                              | `INFO: End: <iso>`       |
| **Terms**            | 10–500 characters                          | Length; no executable code (e.g., `eval`, `Function`)      | `INFO: Terms accepted`   |

**Error Handling**  
- Overlap with existing offer for same service → block creation; log `ERROR: Time overlap with offer ID <id>`. Manual adjustment required; if cannot resolve → skip offer creation and note in report.  

---

## 3. Test Environment & Configuration

| Component          | Specification                                                                 |
|--------------------|-------------------------------------------------------------------------------|
| **Browser**        | Chrome 124+, Firefox 124+, or Edge 124+                                      |
| **Network**        | Stable internet (>= 10 Mbps)                                                  |
| **Screen Resolution** | 1920×1080 (minimum)                                                         |
| **Developer Tools**| Console (no errors), Network (monitor requests/responses), Performance (timing) |
| **API Verification**| Postman / cURL optional for quick API checks                                  |
| **Timeouts**       | Page load < 3s, API call < 5s, email delivery < 2 min                         |
| **Logging Level**  | Set console filter to `verbose` to capture all `INFO`, `WARN`, `ERROR` logs.  |
| **Screenshots**    | Use browser’s built‑in screenshot tool or extension (e.g., Full Page Screen Capture) |

---

## 4. Test Cases

### 4.1 TC-01: Successful Login

**Preconditions:**  
- Valid credentials from §2.1.  
- Login page accessible (`https://www.offer-hub.org/login`).  
- No pending 2FA (disabled for test account).

**Expected Result:** User lands on dashboard with avatar visible, no console errors.

| Step | Action                                                                 | Expected Behaviour                                                                 | Validation Criteria                                                                                          | Error Handling                                                                                             | Log Output                                                                 | Screenshot Filename          |
|------|------------------------------------------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-------------------------------|
| 1    | Navigate to `/login`                                                   | Page loads within 3s (First Contentful Paint ≤ 2s)                               | Using `performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart <= 3000`              | If page unreachable (HTTP 500/504) → retry after 10s, max 2 retries; else `ERROR: Login page unreachable` → abort | `INFO: Login page loaded in {ms} ms`                                        | `tc01-login-page-loaded.png`  |
| 2    | Enter valid email in `input[type="email"]`                              | No red validation error border or message                                         | `document.querySelector('input[type="email"]').classList.contains('error')` === `false`                       | If client‑side validation fails for valid email → log `ERROR: Validation false negative` → block test | `INFO: Email entered: <email>`                                              | `tc01-email-filled.png`      |
| 3    | Enter valid password (≥8 characters) in `input[type="password"]`       | No validation error                                                               | Input value length >= 8; no error class                                                                      | Same as above                                                                                               | `INFO: Password entered (masked)`                                           | `tc01-password-filled.png`    |
| 4    | Click “Log In” button                                                   | No client‑side JavaScript errors                                                  | `window.onerror` not triggered; Network tab sees `POST /api/login` (2xx)                                     | If 4xx/5xx response → parse error message; if “Invalid credentials” → log `WARN` and continue to TC‑02 | `INFO: Login button clicked; response status: 200`                          | `tc01-login-submitted.png`   |
| 5    | Observe redirect                                                        | URL changes to `/dashboard` or `/`                                                | `window.location.href` matches expected                                                                      | If redirect does not happen within 5s → log `WARN: Redirect delayed`; check network for pending calls | `INFO: Redirected to <href>`                                                | `tc01-post-login-redirect.png` |
| 6    | Dashboard elements: verify avatar and no stack trace on console        | Avatar visible (e.g., `img[data-testid="avatar"]`); console empty of errors       | `document.querySelector('[data-testid="avatar"]')` not null; `console.log.success` = 0                      | If avatar missing → log `WARN: Avatar element not found, possibly dashboard layout changed`              | `INFO: Dashboard loaded with avatar; console errors: {count}`               | `tc01-dashboard-avatar.png`  |

**Performance Measurement:**  
- Record time to dashboard fully loaded (Largest Contentful Paint).  
- If total login process > 5s → log `PERF: Login process took {ms} ms – investigate`.

---

### 4.2 TC-02: Invalid Credentials – Error Message

**Preconditions:**  
- Login page loaded.  
- Paste valid email and wrong password ready.

**Expected Result:** Clear error message (“Invalid email or password”) shown inline, no server‑side enumeration.

| Step | Action                                                                 | Expected Behaviour                                                                 | Validation Criteria                                                                                          | Error Handling                                                                                             | Log Output                                                                 | Screenshot Filename          |
|------|------------------------------------------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-------------------------------|
| 1    | Enter invalid email `"notanemail"`                                     | Client‑side validation: “Please enter a valid email address” appears below input  | Error element visible (e.g., `div.error-message`); input gets `class="error"`                                | If no client‑side validation → log `ERROR: Missing client‑side email validation` → fail test            | `INFO: Invalid email format detected; message: <text>`                      | `tc02-invalid-email.png`     |
| 2    | Enter valid password (≥8 chars)                                        | No error on password field                                                        | Same as step 2 of TC‑01                                                                                      | —                                                                                                          | `INFO: Password entered (masked)`                                           | `tc02-password-valid.png`    |
| 3    | Click “Log In”                                                         | Error message shown (e.g., “Invalid email or password”)                           | Network response includes generic error; no `400` or `401` in console; error div visible                     | If no error message appears → log `ERROR: Silent failure – form submits without feedback` → block       | `WARN: Login failed – invalid email format (client)`                       | `tc02-client-error.png`      |
| 4    | Repeat step 4 of TC‑02, but now use valid email + wrong password       | Same error message (identical text)                                               | Compare text content of error element; must match previous                                                   | If server returns different messages (e.g., “Email not found” vs “Wrong password”) → log `WARN: Security risk – error message enumeration` | `WARN: Login failed – wrong password; error message matches generic`        | `tc02-wrong-password.png`    |

**Security Check**  
- Inspect Network tab response body; if it contains field‑level hints → report as vulnerability.

---

### 4.3 TC-03: Successful User Registration

**Preconditions:**  
- A **new** real email (not previously registered).  
- All data from §2.1 is ready.

**Expected Result:** Account created, confirmation email received within 2 min, redirect to success page.

| Step | Action                                                                 | Expected Behaviour                                                                 | Validation Criteria                                                                                          | Error Handling                                                                                             | Log Output                                                                 | Screenshot Filename          |
|------|------------------------------------------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-------------------------------|
| 1    | Navigate to `/register`                                                | Page loads within 3s                                                              | Same as TC-01 step 1                                                                                         | Retry 2 times; else log `ERROR` and abort                                                                 | `INFO: Registration page loaded in {ms} ms`                                | `tc03-register-page.png`     |
| 2    | Fill all fields with real data (per §2.1)                              | No client‑side validation errors                                                  | Each input passes its regex/length; error count for `input:invalid` = 0                                      | If validation fails → log `ERROR: Field <name> failed validation`; pause and correct                  | `INFO: Form fields completed with real data`                               | `tc03-form-filled.png`       |
| 3    | Click “Register”                                                       | Account created; no 5xx; Network tab: `POST /api/register` returns 2xx            | `response.status` in [200, 201, 204]; response body contains `{ success: true }` or similar                  | If response is 409 Conflict (duplicate email) → log `WARN: Email already registered`; use alternative email | `INFO: Registration submitted – status {code}`                             | `tc03-register-submit.png`   |
| 4    | After redirect                                                         | URL changes to `/welcome`, `/dashboard`, or `/confirm-email`                      | `window.location.href` not `/register`; check for success message element                                      | If still on `/register` after 5s → log `ERROR: Redirect did not occur` → fail                           | `INFO: Registration successful; redirect to <href>`                        | `tc03-registration-success.png`|
| 5    | Check email inbox                                                      | Confirmation email received within 2 min                                          | IMAP poll (or manual view); subject line confirms registration                                               | If email not received in 2 min → log `WARN: Email delivery delayed`; wait additional 3 min           | `INFO: Email confirmation received after {s} seconds`                     | `tc03-confirmation-email.png`|

**Performance:**  
- Total registration process (click → redirect) should be < 5s.  
- If > 5s, log `PERF: Slow registration – {ms} ms`.

---

### 4.4 TC-04: Registration Validation Errors

**Preconditions:**  
- Registration page loaded.

**Expected Result:** All missing/invalid fields show error text; form cannot be submitted until fixed.

| Step | Action                                                                 | Expected Behaviour                                                                 | Validation Criteria                                                                                          | Error Handling                                                                                             | Log Output                                                                 | Screenshot Filename          |
|------|------------------------------------------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-------------------------------|
| 1    | Leave all fields empty; click “Register”                               | Multiple validation messages shown                                                | Each required input shows error; form’s `checkValidity()` returns `false`; no submit                          | If form submits despite invalid → log `ERROR: Form submitted with empty fields – bypass validation`       | `INFO: Empty fields – validation errors triggered`                         | `tc04-empty-fields.png`      |
| 2    | Enter invalid email `"notanemail"`; valid other fields                  | Email field shows “Please enter a valid email”                                    | Email input `:invalid` gets error message                                                                    | —                                                                                                          | `INFO: Invalid email – error shown`                                        | `tc04-invalid-email.png`     |
| 3    | Enter weak password `< 8 chars`                                        | Password field shows “Password must be at least 8 characters”                     | Similar to above                                                                                             | —                                                                                                          | `INFO: Weak password – error shown`                                        | `tc04-weak-password.png`     |
| 4    | Enter mismatched passwords (if confirm password exists)                 | “Passwords do not match” error                                                    | Confirmation input error visible                                                                             | —                                                                                                          | `INFO: Passwords mismatch – error shown`                                   | `tc04-password-mismatch.png` |
| 5    | Correct all errors; submit                                             | Successful registration (as TC‑03)                                                 | —                                                                                                            | —                                                                                                          | `INFO: Validation clear – registration proceeds`                          | `tc04-corrected-submit.png`  |

---

### 4.5 TC-05: Post‑Registration Redirect / Success State

**Preconditions:**  
- Fresh registration completed (TC‑03) or confirmed user.

**Expected Result:** User is redirected to a success page or shown a confirmation banner with instructions.

| Step | Action                                                                 | Expected Behaviour                                                                 | Validation Criteria                                                                                          | Error Handling                                                                                             | Log Output                                                                 | Screenshot Filename          |
|------|------------------------------------------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-------------------------------|
| 1    | Navigate to `/login` (if not already logged in)                        | Login page loads                                                                  | —                                                                                                            | —                                                                                                          | `INFO: Login page loaded`                                                  | —                             |
| 2    | Log in with newly registered credentials                               | Login successful                                                                  | Same as TC‑01 validation                                                                                     | If login fails → log `ERROR: New account cannot log in` → investigate                                   | `INFO: New account login successful`                                       | `tc05-login-new-account.png` |
| 3    | Check dashboard for welcome banner                                     | Banner: “Welcome <name>! Check your email to confirm.” or similar                 | Element with text containing “welcome” or “confirm your email” visible                                        | If no banner → log `WARN: Welcome banner missing; check UI state`                                     | `INFO: Welcome banner visible`                                             | `tc05-welcome-banner.png`    |
| 4    | Verify email confirmation link works (optional)                        | Click link from confirmation email → marks email as confirmed; no error            | `GET /confirm-email?token=...` returns 2xx; UI shows “Email confirmed”                                       | If token expired → log `ERROR: Confirmation link expired`; generate new                                  | `INFO: Email confirmed successfully`                                       | `tc05-email-confirmed.png`   |
| 5    | After confirmation, reload dashboard                                   | Dashboard shows all features enabled (create service, offers, etc.)                | No restriction flags on UI elements                                                                          | If features missing → log `WARN: Post‑confirmation features not available`                             | `INFO: Full access confirmed`                                              | `tc05-dashboard-full.png`    |

---

### 4.6 TC-06: Compatibility & Documentation

**Preconditions:**  
- All previous tests completed or at least logged status.

**Expected Result:** No breaking changes to existing contract interfaces; documentation updated as needed.

| Step | Action                                                                 | Expected Behaviour                                                                 | Validation Criteria                                                                                          | Error Handling                                                                                             | Log Output                                                                 | Screenshot Filename          |
|------|------------------------------------------------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-------------------------------|
| 1    | Compare current API responses (`/api/login`, `/api/register`) with documented contracts in `docs/` | Responses match expected fields (no missing/extra fields)                         | JSON schemas match; no `403` or `500` for existing user                                                     | If contract mismatch → log `ERROR: API contract violation – field <field> changed`; update docs      | `INFO: API responses match contracts`                                      | `tc06-api-response.png`      |
| 2    | Check UI components (form fields, buttons) against design system       | No visual regression: same classes, ids, data‑testids                             | Use screenshot diff (e.g., pixelmatch) with reference images if available                                    | If differences → log `WARN: UI component changed – update test selectors`                           | `INFO: UI components stable`                                               | `tc06-ui-components.png`     |
| 3    | Update documentation if any change discovered                          | PR includes updated doc files                                                     | Git diff shows relevant markdown changes                                                                     | —                                                                                                          | `INFO: Documentation updated: <files>`                                     | —                             |

---

## 5. Error Handling, Logging & Security Protocols

### 5.1 Error Handling Conventions
- All API calls must have timeout (5s) and retry (max 2, 10s apart).  
- Client‑side errors (e.g., `Uncaught TypeError`) immediately log `ERROR` and fail the enclosing test case.  
- Network errors (DNS, connection refused) log `FATAL` and abort all further tests.  
- For validation failures, log the specific constraint violated and block further steps until corrected.

### 5.2 Logging Levels & Format
| Level   | Usage                                                                 | Example Output                                                                                  |
|---------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `INFO`  | Normal flow events (page loads, successful steps)                     | `2025-04-02 10:00:00,123 [INFO] tc01: Login page loaded in 1240 ms`                            |
| `WARN`  | Non‑critical deviations (slow responses, minor UI changes)            | `2025-04-02 10:00:05,456 [WARN] tc01: Redirect delayed – took 4.1s`                            |
| `ERROR` | Test‑blocking issues (validation failure, API 500, contract violation)| `2025-04-02 10:00:10,789 [ERROR] tc01: Prerequisite email validation failed: MX record not found` |
| `FATAL` | Unrecoverable environment failures (site down, browser crash)         | `2025-04-02 10:00:15,012 [FATAL] Target unreachable – aborting all tests`                      |
| `PERF`  | Performance metrics exceeding threshold                               | `2025-04-02 10:00:20,345 [PERF] tc03: Registration process took 6.2s (threshold 5s)`           |

### 5.3 Security Checks
- **Error Message Enumeration:** If server returns different text for “email not found” vs “wrong password” → log `WARN` and report.  
- **CSRF:** Verify that all POST requests include a CSRF token (check headers or hidden input).  
- **Session Management:** After login, session cookie should be `HttpOnly`, `Secure`, `SameSite=Strict`.  
- **Password Masking:** Input type `password` must mask characters; no plaintext exposure in DOM/network.  
- **Rate Limiting:** After 5 failed login attempts, account should be temporarily locked (observe through UI).  

---

## 6. Performance Optimization Checklist

| Check                                    | Acceptable Threshold         | Measurement Method                          |
|-------------------------------------------|------------------------------|---------------------------------------------|
| Login page load time                      | < 3s                         | `performance.timing.domComplete`            |
| Registration page load time               | < 3s                         | Same as above                               |
| Login API response time                   | < 2s                         | Network tab / `responseTime`               |
| Registration API response time            | < 3s                         | Network tab                                 |
| Full login process (click → dashboard)    | < 5s                         | Manual timer (or automation)               |
| Full registration process (click → redirect)| < 5s                       | Same as above                               |
| Email delivery time                       | < 2 min                      | IMAP poll or manual                          |
| Client‑side validation delay              | < 100 ms after field blur    | Console timer                               |

**If any threshold is exceeded, log `PERF` with the actual value and investigate.**

---

## 7. Reporting & Screenshot Requirements

### 7.1 Report Structure
Create file `reports/Report_EmailLogin_Registration_Issue_#.md` with: