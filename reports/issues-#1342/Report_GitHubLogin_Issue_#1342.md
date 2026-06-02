# GitHub OAuth Login Test Report

## Environment
- URL: https://www.offer-hub.org
- Date: 2026-06-01
- Tester: EmeditWeb
- Email: itighiseemmanuele@gmail.com

---

## Phase 1: Profile Setup

### Steps Taken
1. Registered on https://www.offer-hub.org using a real email address
2. Filled in full name, professional username, bio, location, professional title, and timezone
3. Uploaded a profile photo
4. Saved and verified the completed profile

### Result: ✅ PASS

### Screenshots
- profile-1.png — Completed profile page

---

## Phase 2: Service Creation

### Steps Taken
1. Navigated to Services → Create New Service
2. Entered title: "Full-Stack Web Development with React & Node.js"
3. Selected category: Web Development
4. Wrote a detailed professional description covering deliverables and stack
5. Set price: $150 and delivery time: 5 days
6. Published the service and confirmed it appeared in the marketplace

### Result: ✅ PASS

### Screenshots
- service-1.png — Service creation form filled
- service-2.png — Published service page

---

## Phase 3: Offer Creation

### Steps Taken
1. Navigated to Offers → Create New Offer
2. Entered title: "Build a Landing Page for a SaaS Product"
3. Selected category: Web Development
4. Wrote a detailed description covering requirements and deliverables
5. Set budget: $200 and deadline: 2026-06-15
6. Uploaded a reference image attachment
7. Published the offer and confirmed it appeared in the listings

### Result: ✅ PASS

### Screenshots
- offer-1.png — Offer creation form filled
- offer-2.png — Published offer page

---

## Phase 4: GitHub OAuth Login Test

### Steps Taken
1. Logged out of the platform
2. Clicked "Continue with GitHub" on the login page
3. Redirected to GitHub authorization page
4. Authorized the app on GitHub
5. Redirected back to offer-hub.org and logged in successfully
6. Refreshed the page — session persisted and user remained logged in

### Result: ✅ PASS

### Screenshots
- github-oauth-1.png — Login page with GitHub button
- github-oauth-2.png — GitHub authorization page
- github-oauth-3.png — Successful redirect and logged-in state
- github-oauth-4.png — Session persisted after page refresh
