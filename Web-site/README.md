# FreshLane Marketplace

Food delivery and packaged food marketplace built with Vite, React, TypeScript, Tailwind CSS, and Supabase-ready database migrations.

## What is included

- Customer auth screens, browsing, search/filtering, cart, checkout, order history, and tracking
- Seller dashboard for business profile, restaurants/stores, meals, packaged products, and order status controls
- Driver dashboard for assigned deliveries and delivery progress controls
- Admin dashboard for users, seller approvals, products, meals, categories, orders, revenue, and commission
- Supabase schema with profiles, sellers, restaurants, categories, products, meals, carts, orders, payments, deliveries, reviews, RLS policies, triggers, and storage bucket
- African food marketplace demo content with `Le` currency

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in Supabase values if you want to connect live data.

3. Apply the Supabase migrations and seed data:

   ```bash
   supabase db reset
   ```

   Or run these SQL files manually in order:

   ```text
   supabase/migrations/202605220001_initial_schema.sql
   supabase/migrations/202605220002_rls_policies.sql
   supabase/migrations/202605220003_storage.sql
   supabase/seed.sql
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3001`.

## Notes

- Demo accounts use `DemoPass123!`.
- Seller accounts can be created from sign up, and admins approve or reject sellers in `/admin`.
- Admin users should be promoted by updating `profiles.role` to `admin` from Supabase or an existing admin account.
- Product images can use public Supabase Storage URLs from the `food-images` bucket.
- Checkout currently runs as a frontend demo flow; the Supabase schema is ready for persisting orders and payments.
