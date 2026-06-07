# Manual Test Report: Skills Management
**Issue:** #1347
**Tester:** thebabalola

## 1. View Existing Skills
- **Action:** Navigated to the skills section (`/app/profile/edit` -> "Availability settings").
- **Expected:** Existing skills load and display correctly.
- **Result:** **Blocked** (Cannot add skills to view them).
- **Screenshot:** *(See Error Report Below)*

## 2. Add New Skill
- **Action:** Attempted to add a new skill manually and by clicking the "Popular skills" list.
- **Expected:** The new skill is successfully saved.
- **Result:** **FAIL** 
  - Clicking a popular skill does not populate the input box.
  - Clicking "Add" throws a `501 (Not Implemented)` error in the console at `POST https://www.offer-hub.org/api/profile/skills`.
  - The UI displays "An unexpected error occurred."
- **Screenshot:**
*(Please place `add_skill.png` in the `reports/issue-1347/screenshots` folder)*
![Add Skill Error](./screenshots/add_skill.png)

## 3. Delete Existing Skill
- **Action:** Attempted to delete an existing skill.
- **Expected:** The skill is successfully removed from the UI.
- **Result:** **Blocked** (Unable to create a skill to delete).

## 4. Persistence
- **Action:** Reloaded the page.
- **Expected:** Additions and deletions persist.
- **Result:** **Blocked** (Cannot save state).
