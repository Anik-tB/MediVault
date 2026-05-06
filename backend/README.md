# MediVault Backend

This folder contains the Express API and PostgreSQL integration used by the MediVault mobile app.

## What This Backend Does

- verifies Firebase ID tokens with Firebase Admin
- syncs Firebase users into PostgreSQL
- exposes medicine catalog data
- stores cart items per user
- creates pickup orders
- stores prescription submission records
- powers dashboard, profile, and settings screens

The API base path is:

```text
/api/v1
```

## Folder Guide

- `package.json`
  - backend scripts and dependencies
- `.env.example`
  - sample local environment variables
- `serviceAccountKey.json`
  - local Firebase Admin credential file
- `database/migrations/`
  - SQL schema and seed files
- `src/app.js`
  - Express app setup
- `src/server.js`
  - starts the HTTP server
- `src/config/`
  - env loading, PostgreSQL pool, and Firebase Admin init
- `src/controllers/`
  - feature logic per route group
- `src/middleware/`
  - request middleware like auth verification
- `src/routes/`
  - API endpoint registration
- `src/utils/`
  - shared account helpers
- `src/models/`
  - currently reserved for future model abstractions
- `src/services/`
  - currently reserved for future business services

## Route Map

- `POST /auth/sync`
  - sync the signed-in Firebase user into PostgreSQL
- `GET /medicines`
  - list medicines
- `POST /cart`
  - add item to cart
- `GET /cart`
  - get cart contents
- `PATCH /cart/:cartItemId`
  - update cart quantity
- `DELETE /cart/:cartItemId`
  - remove one cart item
- `DELETE /cart`
  - clear cart
- `GET /dashboard`
  - fetch dashboard summary and recent orders
- `GET /orders`
  - list order history
- `GET /orders/:orderId`
  - fetch order items
- `DELETE /orders/:orderId`
  - cancel pending pickup order
- `POST /orders`
  - reserve current cart for pickup
- `GET /prescriptions`
  - list prescription submissions
- `POST /prescriptions`
  - create a prescription record
- `GET /profile`
  - fetch user profile
- `PATCH /profile`
  - update profile
- `GET /settings`
  - fetch current settings
- `PATCH /settings/notifications`
  - update notification preferences
- `PATCH /settings/appearance`
  - update appearance preferences

## Database Files

Run these migrations in order:

1. `database/migrations/users.sql`
2. `database/migrations/user_profile_settings.sql`
3. `database/migrations/medicines.sql`
4. `database/migrations/cart.sql`
5. `database/migrations/cart_items_view.sql`
6. `database/migrations/orders.sql`
7. `database/migrations/prescriptions.sql`

What they hold:

- `users.sql`
  - base `users` table
- `user_profile_settings.sql`
  - extra profile fields plus `user_settings`
- `medicines.sql`
  - `medicines` table and seed records
- `cart.sql`
  - `cart_items`
- `cart_items_view.sql`
  - a helper SQL view for inspecting cart rows with medicine names
- `orders.sql`
  - `orders` and `order_items`
- `prescriptions.sql`
  - `prescriptions` and `orders.prescription_id`

## Setup

Install dependencies:

```bash
cd backend
npm install
```

Create `.env` from `.env.example`.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medivault
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

Place your Firebase Admin key at:

```text
backend/serviceAccountKey.json
```

Start the server:

```bash
npm run dev
```

## Notes

- Rx order creation checks for a usable prescription record before creating the order
- Prescription submission is currently metadata-based and does not yet store uploaded file binaries
- See the root `README.md` for the end-to-end mobile + backend workflow
