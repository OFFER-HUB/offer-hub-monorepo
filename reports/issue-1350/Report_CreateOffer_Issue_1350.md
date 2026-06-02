# Report: Create Offer — Issue #1350

**Tester:** Excellence Komolafe (Extolkom)
**Date:** June 1, 2026
**Platform:** https://www.offer-hub.org
**Browser:** Chrome

---

## ✅ Test Results

### 1. Create Offer Form Loads with All Required Fields
- Navigated to Manage Offers > Create Offer as a Client
- Form loaded successfully with all required fields: Title, Category, Description, Budget, Deadline, Attachments
- **Result: PASS**

### 2. Offer Created Successfully and Appears in Marketplace
- Created offer: "Frontend Developer Needed for React Web App"
- Category: Web Development
- Budget: $200
- Deadline: June 4, 2026
- Description: Full project brief included
- Offer appeared in Manage Offers with status: Active
- **Result: PASS**

### 3. Validation Errors Show for Missing or Invalid Fields
- Attempted to publish offer without attaching an image
- Error displayed: "At least one image is required to publish an offer"
- Form correctly blocked submission
- **Result: PASS**

---

## 📸 Screenshots

### Profile Setup
![Profile](./screenshots/profile.png)

### Create Offer Form
![Create Offer](./screenshots/create-offer.png)

### Offer Published
![Offer Published](./screenshots/offer-published.png)

### Validation Error
![Validation Error](./screenshots/validation-error.png)