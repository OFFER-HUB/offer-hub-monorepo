# Account Security Features Testing Guide

## Overview

This guide outlines the manual testing requirements for the new account security features: **Change Password** and **Delete Account**.

These features are critical for user account security and GDPR compliance. All testing must be completed with real user data as per the [Mandatory Real-Data Requirements](../README.md).

## Features Implemented

### 1. Change Password

- **Endpoint**: `POST /api/auth/change-password`
- **Access**: Authenticated users only (Bearer token required)
- **Validation**:
  - Current password must be correct
  - New password must be at least 8 characters
  - Confirmation password must match new password
- **Response**: Success message or detailed error

### 2. Delete Account

- **Endpoint**: `POST /api/auth/delete-account`
- **Access**: Authenticated users only (Bearer token required)
- **Validation**:
  - Password verification required
  - Confirmation text must match "DELETE MY ACCOUNT" exactly
  - GDPR Article 17 (Right to Erasure) compliant
- **Response**: Account permanently deleted, user logged out

### 3. Settings Page

- **URL**: `/settings`
- **Access**: Authenticated users only
- **Sections**:
  - Security: Change Password form with validation
  - Danger Zone: Delete Account with multi-step confirmation
  - Security Best Practices: Educational information
  - Important Information: Warnings about account deletion

## Before You Start

### Prerequisites

1. ✓ A real email address you own
2. ✓ Real profile information (first name, last name, username)
3. ✓ A real profile photo/avatar
4. ✓ A service offering something you genuinely provide
5. ✓ An offer for something you genuinely need
6. ✓ Screenshots of all above

### Authentication Setup

1. Register a new account on https://www.offer-hub.org
2. Complete your profile with real data
3. Publish a real service
4. Publish a real offer
5. Ensure you can log in and access settings

## Testing Workflow

### Step 1: Navigate to Settings

1. Log in to your account
2. Go to `/settings` (or find the Settings link in your account menu)
3. Verify the settings page loads correctly

### Step 2: Test Change Password

Follow the test cases in [Report_ChangePassword_DeleteAccount.md](./Report_ChangePassword_DeleteAccount.md)

**Key Test Scenarios**:

- ✓ Valid password change
- ✗ Wrong current password
- ✗ Mismatched confirmation passwords
- ✗ Password too short

### Step 3: Test Delete Account

Follow the test cases in [Report_ChangePassword_DeleteAccount.md](./Report_ChangePassword_DeleteAccount.md)

**Key Test Scenarios**:

- ✓ Valid account deletion
- ✗ Wrong password
- ✗ Wrong confirmation text
- ✓ Cannot login after deletion

## Reporting Issues

When reporting test failures, include:

1. **Exact Steps to Reproduce**: Step-by-step instructions
2. **Expected vs Actual**: What should happen vs what actually happened
3. **Error Message**: Any error messages shown
4. **Screenshot**: Visual evidence of the issue
5. **Browser/OS**: What you're testing on

## File Structure

```
reports/
├── Report_ChangePassword_DeleteAccount.md  # Testing checklist and results
├── README.md                               # This file
└── issue-#/                                # Issue-specific reports
    ├── Report_ChangePassword_Issue_#.md
    └── Report_DeleteAccount_Issue_#.md
```

## Acceptance Criteria

All of the following must be completed before PR can be merged:

- [ ] Real profile created with all information
- [ ] Profile screenshot attached
- [ ] Real service published
- [ ] Service screenshot attached
- [ ] Real offer published
- [ ] Offer screenshot attached
- [ ] Change password test passes
- [ ] Change password error handling works
- [ ] Delete account test passes
- [ ] Delete account confirmation works
- [ ] User cannot login after account deletion
- [ ] Test report completed and submitted
- [ ] All screenshots attached to PR

## Important Notes

⚠️ **No fake/placeholder data** - All test data must be real and professional
⚠️ **Real profile photo** - Not a default avatar or placeholder
⚠️ **Real service** - Something you genuinely offer
⚠️ **Real offer** - Something you genuinely need
⚠️ **Full test report** - All tests must be run and documented

## Questions?

Refer to:

- [CONTRIBUTING.md](../docs/CONTRIBUTING.md) - General contribution guidelines
- [DEVELOPER-GUIDE.md](../docs/DEVELOPER-GUIDE.md) - Development setup
- [Privacy Policy](../src/app/privacy/page.tsx) - Data handling information
