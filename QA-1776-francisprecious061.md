# QA session — Freelancer services: create, edit and find a service in the marketplace

- **Tester (GitHub user):** @francisprecious061
- **Issue:** #1776
- **Date:** 2026-11-24
- **Device, OS and browser:** HP EliteBook 840 G8, Windows 11 Pro, Chrome 158.0.8127.36 (incognito)
- **Wallet (only if used):** xBull, demo account with no funds (the profile setup required a wallet connection, see problems 2 and 3)
- **Recording(s):** https://youtu.be/nOgh-FGTbMY
- **Discussion thread:** https://github.com/OFFER-HUB/OFFER-HUB-Frontend/discussions/598

## Step results

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Open https://www.offer-hub.org in a private window and register as a Freelancer (email/password or Google) | ❌ | The account is created and a confirmation appears, but the freelancer profile cannot be completed: the username field cannot be edited (problem 1) and the required wallet connection (last field of the form) cannot be skipped and does not complete (problems 2 and 3). |
| 2 | My services → New service: fill in title, description, category, delivery time and price 20, then publish | ❌ | Blocked: could not get past profile setup in step 1. |
| 3 | Open the created service and check every field matches what was entered | ❌ | Blocked: no service could be created (step 2). |
| 4 | Edit: change the price to 25 and the delivery time, save, and check both changes show | ❌ | Blocked: no service could be created (step 2). |
| 5 | Marketplace → Services: find the service with the search bar, then with a category filter | ❌ | Blocked: no service could be created (step 2). |
| 6 | Open two other freelancers' services: detail page, reviews and public profile | ✅ | Marketplace → Services lists 18 services from different freelancers, each with its price. Service detail pages open, and I could view the other services offered by the same freelancer. Navigation was smooth and responsive. I did not see any reviews or star ratings on the service pages I opened. |
| 7 | Add a service to Favorites, check it is listed, remove it and check it disappears | ✅ | The Favorites tab works as expected. |
| 8 | Open Hire on someone else's service and read the order summary and fees (order **not** confirmed). Are the amounts clear? | ❌ | Not completed: the Hire option is available on other freelancers' services, but I did not reach the order summary / fees section, so I cannot say whether the amounts are clear. No order was confirmed. |
| 9 | Back in My services, check the service is listed with the new price | ❌ | Blocked: no service could be created (step 2). |
| 10 | Sign out, sign back in, and check the service is still there | ❌ | Blocked: no service could be created (step 2). |

## Problems found

1. **Username field cannot be edited (blocker).** On the profile setup screen I clicked the username field and tried to type → I expected to be able to enter a username → only the placeholder text is shown and no input is accepted. The field is required, so I could not finish creating the freelancer profile, which blocked every later step. (video minute: 05:00–09:00)
2. **Wallet connection cannot be skipped.** The last field of the profile setup form is a "Connect wallet" step → I expected to be able to cancel or skip it, since a wallet is not needed to create a service → it has no working cancel/close option, so a wallet connection is mandatory to finish the profile. (video minute: 05:00–09:00)
3. **Wallet connection does not respond correctly.** I tried to connect an xBull demo wallet to get past problem 2 → I expected the wallet to connect → the connection did not respond as expected and the seed phrase step could not be completed. (video minute: 05:00–09:00)

## General impression

Browsing the marketplace worked well and was fully responsive: the Services section lists 18 services with clear price tags per freelancer, Favorites works, and the Offers section shows offers (e.g. web development) with their prices and number of applications. The layouts are clean and easy to interact with. However, profile setup is currently a hard blocker: with a non-editable required username field and a wallet connection that cannot be skipped, a new freelancer cannot reach the point of creating a service, so none of the service creation, editing or search steps could be tested.
