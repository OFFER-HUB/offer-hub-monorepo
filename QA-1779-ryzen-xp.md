# QA session — Client journey: find a freelancer, favorites, messages and dashboard

- **Tester (GitHub user):** @ryzen-xp (Sandeep Chauhan)
- **Issue:** #1779
- **Date:** 2026-11-25
- **Device, OS and browser:** Not recorded
- **Wallet (only if used):** A wallet was connected during the session; wallet type not recorded. No wallet address included.
- **Order ids:** Not applicable (no orders with money)
- **Recording(s):**
  - https://youtu.be/pE6a9N_-IV4
  - https://github.com/user-attachments/assets/b701134d-4600-459e-8b79-6ef8af57652c
- **Discussion thread:** https://github.com/OFFER-HUB/OFFER-HUB-Frontend/discussions/612

## Step results

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Register as a Client | ✅ | Registered as a Client. |
| 2 | Complete onboarding and check the new-client Dashboard | ✅ | Completed onboarding and checked the Dashboard. |
| 3 | Search Services and apply at least two filters | ✅ | Search and filters worked. |
| 4 | Check three services and each freelancer's profile, Portfolio and Reviews | ✅ | Completed for three services. |
| 5 | Favorite two services and one freelancer; check Favorites and remove one | ✅ | Favorites worked as expected. |
| 6 | Review a service's Hire summary and fees without confirming an order | ✅ | Reviewed the summary; no paid order was confirmed. |
| 7 | Try to start a conversation with a freelancer | ❌ | Conversation list names/IDs overlap and are clipped. In an opened conversation, the profile image URL appears as text and the message area is blank. See screenshots below. |
| 8 | Check Purchases and Activities empty states | ✅ | Completed. |
| 9 | Edit profile, save and reload | ✅ | Completed. |
| 10 | Sign out, sign back in and check favorites and profile persistence | ✅ | Completed. |

## Problems found

1. **Messages conversation list:** Opened Messages → expected each conversation name to appear clearly in its own row → names or IDs overlap and are clipped, making conversations difficult to identify. Screenshot: https://github.com/user-attachments/assets/bc9f851c-ad5c-428b-8199-c710bdc08c62
2. **Message view and profile panel:** Opened a conversation and its profile panel → expected the freelancer's name and profile image to display correctly and the conversation area to show its messages → the image URL appears as text across the header and profile panel, while the conversation area is blank. Screenshot: https://github.com/user-attachments/assets/0a459f12-75b9-49fa-889c-6b9bf40a89df

## General impression

The client journey steps mostly worked as expected. The Messages experience has two visible display problems: conversation names are difficult to read in the list, and the opened conversation shows a broken profile image URL with a blank message area.
