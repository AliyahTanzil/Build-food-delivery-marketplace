# FreshLane Mobile

Expo React Native companion app for the FreshLane food delivery and packaged food marketplace.

## Features

- Customer signup and login with active local demo accounts
- Role-based customer, seller, driver, and admin dashboards
- Restaurant browsing and African meal detail screens
- Packaged food marketplace with search and category filters
- Cart, delivery address, checkout, payment summary, and order tracking
- Seller product CRUD for image, name, price, stock, category, and availability
- Driver delivery status updates
- Admin user creation, role/status editing, and deletion

## Run

```bash
cd mobile-app
npm install
npm run start
```

The app is intentionally self-contained and uses in-memory demo state so it can mirror the web app flows before connecting Supabase and Stripe SDKs.
