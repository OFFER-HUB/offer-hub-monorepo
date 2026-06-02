# Reports Directory

This directory contains manual test reports for the Offer Hub project.

## Report Naming Convention

Reports should be named following this pattern:

```
Report_[FeatureName]_Issue_[Number].md
```


Example: `Report_AvailabilitySettings_Issue_1362.md`

Reports for a given issue live under `reports/issue-[number]/`.


## Report Template

```markdown
# Manual Test Report: [Feature Name]

## Issue Information
- **Issue Number**: #[Number]
- **Title**: [Issue Title]
- **Date**: [YYYY-MM-DD]
- **Tester**: [Your Name/Username]

## Test Environment
- **URL**: https://www.offer-hub.org
- **Browser**: [Browser Name and Version]
- **Device**: [Desktop/Mobile/Tablet]

## Contributor Verification
### Real Profile
- [ ] Profile completed with real information
- [ ] Profile photo uploaded
- [ ] Screenshot attached: [filename]

### Real Service Published
- [ ] Service created with genuine offering
- [ ] Professional title and description
- [ ] Real image uploaded
- [ ] Real price and delivery time set
- [ ] Screenshot attached: [filename]

### Real Offer Published
- [ ] Offer created with genuine need
- [ ] Professional title and description
- [ ] Real budget and timeline set
- [ ] Screenshot attached: [filename]

## Test Steps

### Step 1: [Step Description]
- **Action**: [What was done]
- **Expected Result**: [What should happen]
- **Actual Result**: [What actually happened]
- **Status**: ✅ Pass / ❌ Fail
- **Screenshot**: [filename]

## Test Results Summary
- **Total Steps**: [Number]
- **Passed**: [Number]
- **Failed**: [Number]
- **Overall Status**: ✅ Pass / ❌ Fail

## Issues Found
- [Description of any issues found during testing]

## Recommendations
- [Any recommendations for improvements]
```

## Screenshots

All screenshots should be:
- Clear and readable
- Named descriptively (e.g., `step1_availability_page.png`)
- Attached to the PR description
- Referenced in the report
