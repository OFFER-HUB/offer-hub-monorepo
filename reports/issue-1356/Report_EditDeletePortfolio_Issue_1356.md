# Manual Test Report: Edit / Delete Portfolio Project

## Scope

- Site: https://www.offer-hub.org
- Issue: #1356
- Flow: Edit an existing portfolio project and delete it afterward.
- Branch: manual-test-portfolio-project-flow
- Tester: OlaBakare
- Test date: May 31, 2026

## Execution Status

Passed for the edit/delete portfolio project flow.

The edit/delete flow was manually tested on https://www.offer-hub.org using the project created during the add-portfolio test. Screenshots should be attached to the PR description so they are hosted by GitHub and are not committed to the repository.

## Required Starting State

- A real account is signed in.
- The account has a completed real profile.
- The account has a published real service and a published real offer.
- At least one portfolio project exists, preferably the project created during the add-portfolio test.

## Test Steps

| Step | Expected Result | Status | PR Screenshot |
| --- | --- | --- | --- |
| Open the portfolio page. | Portfolio page loads with existing projects. | Passed | `saved-project-visible.png` |
| Select an existing project to edit. | Edit controls or edit form are available. | Passed | `edit-project-form-updated.png` |
| Update the project title, description, and/or image with real professional content. | Edited values are accepted and image changes are reflected. | Passed | `edit-project-form-updated.png` |
| Save the edited project. | Changes are saved without errors. | Passed | `updated-project-visible.png` |
| Reopen or refresh the portfolio page. | Edited project displays the updated content. | Passed | `updated-project-visible.png` |
| Delete the project. | Delete confirmation or delete action completes successfully. | Passed | `delete-confirmation.png` |
| Return to the portfolio list/page. | Deleted project no longer appears in the list. | Passed | `deleted-project-empty-portfolio.png` |

## Result

Passed. The created project was edited successfully and then deleted successfully.

## Required Evidence

- Portfolio page before edit: `saved-project-visible.png`
- Edit form populated with changes: `edit-project-form-updated.png`
- Updated project visible after save: `updated-project-visible.png`
- Delete confirmation/action: `delete-confirmation.png`
- Portfolio page after deletion showing project removed: `deleted-project-empty-portfolio.png`

## Notes

The project title was changed from `Offer Hub Portfolio Flow QA Test` to `Offer Hub Portfolio Flow QA Test - Edited` before saving. The deleted project no longer appeared on the portfolio page after deletion.
