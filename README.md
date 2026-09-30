# Eminent Clicks Hub

Build a React web app called "Eminent Clicks" with a built-in database. 

SIDEBAR: 5 locked tools: SubTrack(₦5,000), JobFlow(₦10,000), PayChaser(₦10,000), ReportSnap(₦10,000), ClaimDesk(₦10,000). 

PAYMENT LOGIC: Clicking a locked tool opens a pricing modal showing Kuda Bank details: 2088333205, Okechukwu Chimaobi Destiny. Requires Form fields: Email, WhatsApp Number, and Receipt Image upload. Auto-compress uploaded images (2MB to 180KB), show an active uploading % progress bar. On submit, save status as 'pending' and generate tracking code format "EC-NGN-XXXX-XXXX".

USER RULE: Regular users must sign up/login using an Email and a Password. They must never see any admin links or buttons.

ADMIN ENTRANCE: Accessible via triple-tapping "My Dashboard", using URL "?admin=true", or via a temporary visible testing button at the very bottom footer called "Open Admin Panel". 

ADMIN AUTH: The admin login screen requires an Email ONLY (no password needed). If my specific admin email is entered, instantly grant access.

ADMIN DASHBOARD: Fully coded visual dashboard layout showing analytics cards (Total, Pending, Approved), search filters, and an approval queue listing pending submissions with receipt thumbnails, emails, and WhatsApp numbers. Clicking a green "Approve" button must instantly switch that specific user's tool status to an active, fully functional operational UI shell.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a009a2c1-0cf2-4993-961a-7bb4b80b1db7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
