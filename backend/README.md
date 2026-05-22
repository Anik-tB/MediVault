# MediVault Backend

This folder contains the complete Express API and PostgreSQL integration used by the MediVault mobile app and the admin web portal.

## What This Backend Does

- verifies Firebase ID tokens with Firebase Admin for mobile users
- syncs Firebase users into PostgreSQL
- exposes medicine catalog data
- stores cart items per user
- creates pickup orders
- stores prescription submission records
- powers dashboard, profile, and settings screens for mobile users
- **powers the staff admin panel with dedicated `/admin/*` routes**
- **manages medicine conflict/interaction rules**
- **handles staff authentication and session management**

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
  - SQL schema and seed files (including admin and interactions tables)
- `src/app.js`
  - Express app setup
- `src/server.js`
  - starts the HTTP server
- `src/config/`
  - env loading, PostgreSQL pool, and Firebase Admin init
- `src/controllers/`
  - feature logic per route group (contains both user and admin controllers)
- `src/middleware/`
  - request middleware like auth verification and admin session checks
- `src/routes/`
  - API endpoint registration (`admin.routes.js` handles all staff routes)
- `src/utils/`
  - shared account helpers
- `src/models/`
  - currently reserved for future model abstractions
- `src/services/`
  - currently reserved for future business services

## Route Map

**User Mobile Routes:**
- `POST /auth/sync`: sync the signed-in Firebase user into PostgreSQL
- `GET /medicines`: list medicines
- `POST /cart`, `GET /cart`, `PATCH /cart/:cartItemId`, `DELETE /cart/:cartItemId`, `DELETE /cart`: cart management
- `GET /dashboard`: fetch dashboard summary and recent orders
- `GET /orders`, `GET /orders/:orderId`, `DELETE /orders/:orderId`, `POST /orders`: order management
- `GET /prescriptions`, `POST /prescriptions`: prescription management
- `GET /profile`, `PATCH /profile`: user profile
- `GET /settings`, `PATCH /settings/notifications`, `PATCH /settings/appearance`: user settings

**Admin Routes (`/admin/*`):**
- `/auth/*`: Admin login, registration, session management
- `/dashboard`: Admin statistics
- `/medicines/*`: CRUD for medicine catalog
- `/orders/*`: Verify prescriptions and approve/reject/pickup orders
- `/prescriptions/*`: Approve or reject submitted prescriptions
- `/interactions/*`: CRUD for medicine conflict/interaction rules
- `/settings/*`: Staff profile, notifications, and security management

## Database Files

Run these migrations in order:

1. `database/migrations/users.sql`
2. `database/migrations/user_profile_settings.sql`
3. `database/migrations/medicines.sql`
4. `database/migrations/cart_items.sql`
5. `database/migrations/cart_items_view.sql`
6. `database/migrations/orders.sql`
7. `database/migrations/prescriptions.sql`
8. `database/migrations/notifications.sql`
9. `database/migrations/admin_web.sql`

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

- Rx order creation checks for a usable prescription record before creating the order.
- Medicine conflict rules are fully enforced via the interactions table managed in the admin panel.
- See the root `README.md` for the end-to-end mobile + admin + backend workflow.
