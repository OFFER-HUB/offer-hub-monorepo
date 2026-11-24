# QA session — Account lifecycle: sign up, email confirmation, password reset, onboarding and notifications

- **Tester (GitHub user):** @samjay8
- **Issue:** #1787
- **Date:** 2026-11-24
- **Device, OS and browser:** Windows 11 desktop, Google Chrome (driven with Playwright), 1280x800 viewport
- **Wallet (only if used):** None
- **Recording(s):**
  - Client account (about 10 min), steps 1–6, 9, 10: https://github.com/samjay8/offer-hub-monorepo/blob/qa-1787-evidence/qa-1787/client-session.mp4
  - Freelancer account (about 7 min), steps 1, 2, 4, 7–10: https://github.com/samjay8/offer-hub-monorepo/blob/qa-1787-evidence/qa-1787/freelancer-session.mp4
  - Screenshots: [client](https://github.com/samjay8/offer-hub-monorepo/tree/qa-1787-evidence/qa-1787/client-shots) · [freelancer](https://github.com/samjay8/offer-hub-monorepo/tree/qa-1787-evidence/qa-1787/freelancer-shots)
- **Discussion thread:** https://github.com/OFFER-HUB/OFFER-HUB-Frontend/discussions/597

How this session was run: both accounts (a Client and a Freelancer, both registered as Samuel Ojetunde) were driven through the live site in a real Chrome browser by an automated script that types and clicks at a human pace, with the screen recorded without cuts from the first page load to the sign-out check. A short clip of the profile page showing the name is appended at the end of each recording.

## Step results

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Register with bad input | ✅ | Wrong email shows only the browser's own tooltip ("Please include an '@'…"), no in-app message. Short password: "Password must be at least 8 characters". Mismatch: "Passwords do not match". |
| 2 | Register as Client, confirm email | ✅ | Verification email arrived 4–6 s after submit. The link opened "Email Verified!" and redirected into the app. |
| 3 | Onboarding and Dashboard | ❌ | Chose **Client** (the default), finished onboarding and landed on `/app/freelancer/dashboard` ("Finding work", Freelancer sidebar, "My Services"). The Client view is one click away on the toggle. A brand-new account is also greeted with "Welcome back". |
| 4 | Notifications | ❌ | The bell shows "You're all caught up / No notifications yet", but the request behind it, `GET /notifications?limit=15` on the API host, returns **404** (missing the `/api/v1` prefix), so the empty state hides a failed request. "View all notifications" goes to `/app/notifications`, which is a **404 page**. |
| 5 | Forgot password | ❌ | The reset email arrived in about 5 s. Opening its link immediately shows **"Reset link expired"**, and the page's request `POST /api/v1/auth/password-reset/validate` returns **404**. A fresh, valid link therefore cannot be used and the password cannot be reset, so the "old password" check could not be run. |
| 6 | Wrong password three times | ✅ | Every attempt, and an unknown email, shows the same "Invalid email or password", so the email's existence is not revealed. There is no lockout or slow-down after three failures: the correct password still signs in immediately. |
| 7 | Freelancer registration and onboarding | ✅ | Two steps with clear field messages ("Enter your first name to continue", "Write at least 20 characters describing your work"). Step 2 only asks for a professional title and bio, with no skills or rate fields. In an earlier practice run (not in the final recording) reusing a phone number gave "That phone number is already linked to another account" and sent me back to step 1. |
| 8 | Settings | ❌ | Display name changed to "Samuel A.", saved and still there after reload ✅. There is **no notification-preferences setting**: Settings only offers Preferences (time zone and date format), Security, Sessions and Account. |
| 9 | Role pages | ❌ | Signed in as the freelancer, `/app/client/offers/new` shows the full "Create Job Offer" page. Signed in as the client, `/app/freelancer/services/new` shows the full "Create New Service" page. Neither is blocked or redirected. This may be intended for dual-role accounts, but both accounts were created with a single role. |
| 10 | Sign out, Back button | ✅ | After sign-out, Back lands on `/login`, and opening `/app/profile` directly redirects to `/login`. No private page was visible. |

## Problems found

1. **Password reset cannot be completed.** Requested a reset, opened the emailed link within seconds, expected a "choose a new password" form, got "Reset link expired". The browser calls `POST /api/v1/auth/password-reset/validate`, which returns 404 `Cannot POST /api/v1/auth/password-reset/validate`. Video: client session, near the end (before the final sign-out check). Screenshot `18-reset-link-expired.png`.
2. **Notifications bell hides a 404.** Opened the bell on a new account, expected the real (empty) list. It shows "No notifications yet" while `GET /notifications?limit=15` returns 404 on the API host (path lacks `/api/v1`). Screenshot `09-notifications-panel.png`.
3. **"View all notifications" leads to a 404 page.** Clicked the link in the bell panel, expected a notifications page, got "The page you're looking for doesn't exist" at `/app/notifications`. Screenshot `10-view-all-404.png`.
4. **Choosing Client in onboarding lands on the Freelancer dashboard.** Finished onboarding as Client and expected `/app/client/dashboard`; landed on `/app/freelancer/dashboard`. Screenshot `07-dashboard.png` in the client folder.
5. **Role-specific pages are open to both roles.** A single-role account can open the other role's creation pages and gets the full form. Screenshot `14-cross-role-page.png` in both folders.
6. **No notification preferences in Settings**, although the settings page describes account and notification control. Screenshot `11-settings.png` in the freelancer folder.
7. **Minor:** a wrong email format gets only the browser's native tooltip, not the app's own error styling used for the password fields; a new account sees "Welcome back"; there is no failed-login throttling after three bad passwords.

## General impression

Sign-up, the verification email (fast, 4–6 s) and sign-out are solid, and the login error does not reveal whether an email exists. The account-recovery and notifications paths are the weak spots: both rely on API routes that return 404 (`password-reset/validate` and `/notifications`), which blocks password recovery completely. The role handling after onboarding feels inconsistent, because the chosen role is not respected and the role-only pages are not protected.
