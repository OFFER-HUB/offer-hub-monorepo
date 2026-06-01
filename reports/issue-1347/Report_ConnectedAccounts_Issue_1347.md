# Manual Test Report: Connected Accounts
**Issue:** #1347
**Tester:** thebabalola

## 1. Connected Accounts Visibility
- **Action:** Navigated to the profile section to view connected OAuth accounts.
- **Expected:** The UI displays linked GitHub or Google accounts correctly.
- **Result:** Pass
- **Screenshot:**
*(Please place `connected_accounts.png` in the `reports/issue-1347/screenshots` folder)*
![Connected Accounts Visibility](./screenshots/connected_accounts.png)

## 2. Unlinking an OAuth Account
- **Action:** Clicked to unlink a connected OAuth account.
- **Expected:** The UI reflects that the account has been successfully unlinked.
- **Result:** Pass
- **Screenshot:**
*(Please place `unlinking_account.png` in the `reports/issue-1347/screenshots` folder)*
![Unlinking Account](./screenshots/unlinking_account.png)

## 3. Persistence
- **Action:** Reloaded the page after unlinking the account.
- **Expected:** The unlinked state persists on reload.
- **Result:** Pass
- **Screenshot:**
*(Please place `persistence_unlinked.png` in the `reports/issue-1347/screenshots` folder)*
![Persistence](./screenshots/persistence_unlinked.png)

---

## Mandatory Real-Data Requirements
*(As per maintainer requirements, these three screenshots are strictly required for the PR)*

- **Real Profile Screenshot:**
*(Please place `real_profile.png` in the `reports/issue-1347/screenshots` folder)*
![Real Profile](./screenshots/real_profile.png)

- **Published Service Screenshot:**
*(Please place `published_service.png` in the `reports/issue-1347/screenshots` folder)*
![Published Service](./screenshots/published_service.png)

- **Published Offer Screenshot:**
*(Please place `published_offer.png` in the `reports/issue-1347/screenshots` folder)*
![Published Offer](./screenshots/published_offer.png)
