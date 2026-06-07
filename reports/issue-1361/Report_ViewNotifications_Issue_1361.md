# Issue 1361: Notifications and Role Access

## Scope
This report covers the notification display behavior, the notifications page flow, and related role-based access issues observed in the signed-in user experience.

## Environment
- URL: https://www.offer-hub.org
- External test path: https://www.drips.network/external/https%3A%2F%2Fwww.offer-hub.org%2F
- Testing type: manual
- Screenshots: required

## Findings
1. The dashboard shows a red notification badge with "0 notifications" when there are no notifications. This is distracting and reduces the ability to notice real new alerts.
2. Clicking the "View all notifications" button does not open or load the notifications page.
3. Signed-in users can still access the home and landing pages, which should be available only to visitors.
4. The login flow is not separated by user role; clients and freelancers use the same login experience.
5. Freelancers appear to have access to client-specific functionality, including job creation and client marketplace access.

## Impact
- Users may ignore notifications because the badge is displayed even when no notifications exist.
- The notification center is effectively broken if the "View all notifications" action fails.
- Authenticated users can reach public visitor pages, which weakens the role-based navigation model.
- Role confusion may allow freelancers to attempt client-only actions, harming trust and workflow integrity.

## Reproduction Steps
1. Sign in to the application through the external Drips URL.
2. Observe the notification badge on the dashboard.
3. Verify whether the badge shows a count of zero when there are no messages.
4. Click the "View all notifications" button.
5. Confirm whether the notifications page loads successfully.
6. While signed in, try to access the home page and landing page from dashboard navigation or direct URL.
7. Validate the login experience for client and freelancer accounts.
8. Attempt to create a job or access the client marketplace with a freelancer account.

## Expected Behavior
- Notification badge should be hidden or removed when there are zero notifications.
- "View all notifications" should open the notifications page reliably.
- Authenticated users should not be able to access home and landing pages intended for visitors.
- Client and freelancer logins should be separate and route users to the correct dashboard.
- Freelancers should not be able to create client jobs or access the client marketplace.

## Actual Behavior
- The badge displays "0 notifications" when no notifications exist.
- The notifications page does not open from the "View all notifications" button.
- Signed-in users can still navigate to home and landing pages.
- Login is shared across client and freelancer accounts.
- Freelancer accounts are not fully restricted from client workflows.

## Notes
- Verify the notification badge logic first, then confirm the navigation and role-based access restrictions.
- Capture screenshots of the zero-count badge, the failed notifications page load, and the pages accessible while signed in.

