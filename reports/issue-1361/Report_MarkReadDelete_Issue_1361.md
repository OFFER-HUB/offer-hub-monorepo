# Issue 1361: Mark Read/Delete and Notification Delivery

## Scope
This report focuses on notification delivery and the mark-read/delete flow. It covers the absence of expected notifications after user actions and related implementation gaps.

## Environment
- URL: https://www.offer-hub.org
- External test path: https://www.drips.network/external/https%3A%2F%2Fwww.offer-hub.org%2F
- Testing type: manual
- Screenshots: required

## Findings
1. No notifications were delivered even after performing high-impact actions such as applying for offers, creating service offers, submitting proposals, and logging in.
2. The absence of any notification suggests the notification trigger code is missing or not executed for these actions.
3. A code scan of the repository did not reveal any backend or frontend implementation for notification creation, delivery, or mark-read/delete handling.
4. This behavior makes the notification system appear non-existent rather than broken.

## Impact
- Users are not informed about critical account and transaction events.
- The notification center is effectively disabled for key workflows.
- Without notifications, users may not trust that actions like applications or proposals were successfully recorded.
- The application is missing a core feedback mechanism for authenticated users.

## Reproduction Steps
1. Sign in to the app through the Drips external URL.
2. Perform actions expected to trigger notifications:
   - Apply for a job offer.
   - Create a service offer.
   - Submit a proposal.
   - Log in to the app.
3. Navigate to the notifications area.
4. Confirm that no notifications are present.
5. Attempt to mark notifications as read or delete notifications if any appear.

## Expected Behavior
- Each important action should create a notification.
- Notifications should appear in the notifications view immediately after the action.
- Mark-read and delete functionality should be available and functional for existing notifications.
- The application should persist notification state and reflect it correctly in the UI.

## Actual Behavior
- No notifications are present after multiple actions that should generate them.
- There is no evidence of notification triggers or creation in the application codebase.
- Mark-read/delete behavior cannot be validated because no notifications are generated.

## Outcome
- A full scan of the repository confirmed there is no implemented notification workflow in the current codebase.
- No frontend or backend code was found for notification creation, delivery, "View all notifications", mark-read, or delete notification handling.
- This strongly indicates the issue is due to missing implementation, not a broken existing notification component.

## Notes
- The notification system may be missing entirely rather than only having a UI issue.
- If possible, verify the server-side event hooks for user actions and ensure notification creation is integrated.
- Capture screenshots of completed actions and the empty notifications view to demonstrate the lack of delivery.
- This report should be considered alongside the view notifications issue because both point to an overall missing notification workflow.

## Screenshots
- Capture the empty notifications page after performing actions.
- Capture the completed action screens (application submission, service offer creation, proposals, login).
- Capture the notifications panel while verifying mark-read/delete behavior.

