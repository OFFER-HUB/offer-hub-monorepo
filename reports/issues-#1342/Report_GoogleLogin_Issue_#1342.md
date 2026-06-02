# Google OAuth Login Test Report

## Environment
- URL: https://www.offer-hub.org
- Date: 2026-06-01
- Tester: EmeditWeb
- Email: itighiseemmanuele@gmail.com

---

## Phase 1: Google Login Navigation

### Steps Taken
1. Navigated to the login page at https://www.offer-hub.org/login
2. Clicked "Continue with Google" on the login screen
3. Confirmed redirection to the Google sign-in page
4. Selected the Google account and approved the requested permissions
5. Completed the Google sign-in flow and was redirected back to the platform

### Result: ✅ PASS

### Screenshots
- google-oauth-1.png — Login page with Google button
- google-oauth-2.png — Google sign-in page

---

## Phase 2: Profile Verification

### Steps Taken
1. Confirmed the user was signed in after returning from Google OAuth
2. Verified the profile page displayed the correct Google account information
3. Checked the profile photo, name, and email details for consistency
4. Confirmed the profile section loaded without errors

### Result: ✅ PASS

### Screenshots
- google-profile-1.png — Profile page showing Google account details

---

## Phase 3: Service Access

### Steps Taken
1. Navigated to the Services section after successful login
2. Confirmed the service list loaded correctly for the authenticated user
3. Opened an existing service to verify details and access
4. Ensured the service creation and marketplace pages were reachable

### Result: ✅ PASS

### Screenshots
- google-services-1.png — Services page after Google login
- google-services-2.png — Service details page

---

## Phase 4: Offer Access

### Steps Taken
1. Navigated to the Offers section after Google login
2. Confirmed the offer listings loaded successfully
3. Opened an offer detail page to verify content and access controls
4. Confirmed the offer creation and offer view pages were accessible

### Result: ✅ PASS

### Screenshots
- google-offers-1.png — Offers page after Google login
- google-offers-2.png — Offer detail page
