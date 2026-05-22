# MediVault

MediVault is a complete monorepo for a local dispensary workflow. The working stack is:

- `user-mobile/`: the patient-facing Expo app
- `backend/`: the Express + PostgreSQL API used by the mobile app and admin web
- `admin-web/`: the Vite + React admin panel for dispensary staff
- `docs/`: project notes and architecture documentation

The implemented journey today is:

1. Sign up or sign in with Firebase Auth (Mobile) or Admin Auth (Web)
2. Sync the Firebase user into PostgreSQL
3. Browse medicines
4. Add medicines to cart
5. Upload a prescription record for Rx items
6. Reserve an order for pickup
7. Review dashboard, orders, profile, and settings
8. Staff access the `admin-web` portal to manage medicines, prescriptions, orders, and review medicine interactions.

Important current boundary:

- Prescription submission uploads the real file binary to the local backend server (stored in `backend/uploads/`).
- Rx validation for orders is based on the stored prescription record status.
- Medicine conflict rules are managed via the admin panel.

## Repository Layout

- `README.md`
  - monorepo overview, workflow, and setup
- `backend/`
  - Express server, PostgreSQL access, migrations, admin routes, and Firebase Admin token verification
- `user-mobile/`
  - Expo Router mobile app, Firebase client auth, and API integrations
- `admin-web/`
  - Vite + React staff dashboard for managing the dispensary
- `docs/`
  - architecture notes

Generated folders like `node_modules/`, `.expo/`, `dist/`, and `.git/` are not part of the core source architecture.

## Full Workflow

### 1. App startup and auth gate

- `user-mobile/app/index.tsx` is the app entry redirect.
- If Firebase auth is still loading, it shows a loader.
- If a user session exists, it redirects to `/dashboard`.
- If there is no session, it redirects to `/login`.

### 2. Sign in / sign up

- `user-mobile/app/login/index.tsx` handles:
  - email/password sign in
  - password reset
  - Google sign in on web and supported native builds
- `user-mobile/app/sign-up/index.tsx` collects name, email, and phone
- `user-mobile/app/sign-up/security.tsx` creates the Firebase account

### 3. Firebase to PostgreSQL sync

- `user-mobile/hooks/use-auth.tsx` listens for Firebase auth changes
- When a user logs in, it calls `syncUserProfile()` from `user-mobile/services/api.ts`
- That sends the Firebase ID token to `POST /api/v1/auth/sync`
- The backend verifies the token with Firebase Admin
- The backend creates or updates:
  - the `users` row
  - the `user_settings` row

This is the bridge between Firebase Auth and PostgreSQL business data.

### 4. Dashboard

- `user-mobile/app/dashboard/index.tsx` loads:
  - dashboard summary
  - recent orders
- It calls `GET /api/v1/dashboard`
- The backend aggregates:
  - active orders
  - cart item count
  - pending prescriptions
  - medicines currently in stock

### 5. Medicine search

- `user-mobile/app/search_medicine/index.tsx` fetches medicine data from `GET /api/v1/medicines`
- The `medicines` table is seeded by `backend/database/migrations/medicines.sql`
- Users browse medicine cards and add items into the cart

### 6. Cart

- `user-mobile/app/cart/index.tsx` calls:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart`
  - `PATCH /api/v1/cart/:cartItemId`
  - `DELETE /api/v1/cart/:cartItemId`
  - `DELETE /api/v1/cart`
- The backend stores cart rows in `cart_items`
- Each cart row is tied to the Firebase UID stored as `user_id`

### 7. Prescription flow

- `user-mobile/app/prescriptions/index.tsx` shows:
  - summary counts
  - recent submissions
  - upload entry point
- `user-mobile/app/prescriptions/preview.tsx` is the review step
- `user-mobile/app/prescriptions/success.tsx` shows the submission result
- The mobile app calls:
  - `GET /api/v1/prescriptions`
  - `POST /api/v1/prescriptions`
- The backend stores prescription metadata in `prescriptions`

Current behavior:

- a prescription record can be `submitted`, `under_review`, `approved`, or `rejected`
- Rx order reservation accepts the latest prescription in `submitted`, `under_review`, or `approved`
- rejected prescriptions do not unlock Rx checkout
- Prescriptions are approved/rejected by staff in the `admin-web` portal.

### 8. Order reservation

- `user-mobile/app/cart/index.tsx` calls `POST /api/v1/orders` through `reserveForPickup()`
- The backend:
  - reads the current cart
  - checks whether any cart item requires Rx
  - if Rx is required, verifies a usable prescription exists
  - creates an `orders` row
  - creates `order_items`
  - links `orders.prescription_id` when relevant
  - clears the cart

### 9. Orders history

- `user-mobile/app/orders/index.tsx` calls:
  - `GET /api/v1/orders`
  - `GET /api/v1/orders/:orderId`
  - `DELETE /api/v1/orders/:orderId`
- The order screen shows:
  - counts by status
  - each order's items
  - cancel action for pending pickup orders

### 10. Profile and settings

- `user-mobile/app/profile/index.tsx` uses:
  - `GET /api/v1/profile`
  - `PATCH /api/v1/profile`
- `user-mobile/app/settings/index.tsx` and child screens use:
  - `GET /api/v1/settings`
  - `PATCH /api/v1/settings/notifications`
  - `PATCH /api/v1/settings/appearance`
- Password changes are handled in mobile through Firebase Auth, not PostgreSQL

### 11. Admin Web Portal

- `admin-web/` provides a comprehensive staff dashboard.
- Staff can:
  - Manage the medicine catalog (add, edit, delete).
  - Review and approve/reject user prescriptions.
  - Manage orders (approve, reject, mark as picked up).
  - Configure medicine interaction rules (conflict rules).
  - View overall dashboard metrics.
- Built with React, Vite, and Lucide React icons.
- Communicates with the backend via `admin.*` endpoints and `adminAuth` for staff session handling.

## Backend Architecture

### Backend tech stack

- Node.js
- Express
- PostgreSQL via `pg`
- Firebase Admin SDK

### Backend folder breakdown

- `backend/package.json`
  - backend package metadata and scripts
- `backend/.env.example`
  - sample environment file for local PostgreSQL config
- `backend/serviceAccountKey.json`
  - local Firebase Admin credential file, must not be committed publicly
- `backend/database/`
  - database setup assets
- `backend/database/migrations/`
  - SQL files that create or extend the schema
- `backend/src/`
  - backend application source
- `backend/src/app.js`
  - Express app, middleware setup, root route, and `/api/v1` mounting
- `backend/src/server.js`
  - HTTP server bootstrap
- `backend/src/config/`
  - environment, database pool, and Firebase Admin initialization
- `backend/src/controllers/`
  - route handler logic (includes user and admin controllers)
- `backend/src/middleware/`
  - request middleware such as Firebase token verification and Admin sessions
- `backend/src/routes/`
  - endpoint registration by feature
- `backend/src/utils/`
  - shared helpers used across controllers

### Backend config folder

- `backend/src/config/env.js`
  - reads `.env` and exposes `PORT`, `DATABASE_URL`, or `DB_*`
- `backend/src/config/db.js`
  - creates the PostgreSQL pool and exports query helpers
- `backend/src/config/firebase.js`
  - initializes Firebase Admin with the local service account

### Backend middleware folder

- `backend/src/middleware/auth.middleware.js`
  - verifies the Firebase ID token and attaches `req.user`
- `backend/src/middleware/admin.middleware.js`
  - verifies admin sessions for the staff portal

### Backend controller folder

**User Controllers:**
- `auth.controller.js` (syncs Firebase users)
- `medicines.controller.js`, `cart.controller.js`, `orders.controller.js`
- `prescriptions.controller.js`, `dashboard.controller.js`
- `profile.controller.js`, `settings.controller.js`, `health.controller.js`

**Admin Controllers:**
- `adminAuth.controller.js`
- `adminDashboard.controller.js`
- `adminMedicines.controller.js`
- `adminOrders.controller.js`
- `adminPrescriptions.controller.js`
- `adminInteractions.controller.js`
- `adminSettings.controller.js`

### Backend routes folder

- `index.js`: composes all feature routers under `/api/v1`
- `admin.routes.js`: All `/admin/*` routes for staff management
- `auth.routes.js`, `medicines.routes.js`, `cart.routes.js`
- `orders.routes.js`, `prescriptions.routes.js`, `dashboard.routes.js`
- `profile.routes.js`, `settings.routes.js`, `notifications.routes.js`

## User Mobile Architecture

### Mobile tech stack

- React Native
- Expo
- Expo Router
- Firebase client SDK
- React Navigation primitives

### Mobile folder breakdown

- `user-mobile/package.json`
  - app package metadata and Expo scripts
- `user-mobile/.env.example`
  - sample Firebase client environment variables
- `user-mobile/app/`
  - screen routes
- `user-mobile/assets/`
  - static assets such as icons and images
- `user-mobile/components/`
  - reusable UI building blocks
- `user-mobile/constants/`
  - shared constants such as the color palette
- `user-mobile/hooks/`
  - shared React hooks and auth context
- `user-mobile/services/`
  - Firebase and HTTP integration layer
- `user-mobile/scripts/`
  - Expo helper scripts

### Mobile app folder

- `user-mobile/app/_layout.tsx`: root navigation stack and theme provider
- `user-mobile/app/index.tsx`: auth-aware redirect to login or dashboard
- `user-mobile/app/login/`: sign-in screen and reset-password entry
- `user-mobile/app/sign-up/`: two-step registration flow
- `user-mobile/app/dashboard/`: dashboard screen shell
- `user-mobile/app/search_medicine/`: medicine discovery screen
- `user-mobile/app/cart/`: cart management and reserve-for-pickup flow
- `user-mobile/app/orders/`: order history, expand details, and cancel action
- `user-mobile/app/prescriptions/`: prescription list, preview, and success screens
- `user-mobile/app/profile/`: editable user profile screen
- `user-mobile/app/settings/`: settings home plus appearance, notifications, and security screens
- `user-mobile/app/notifications/`: notifications screen UI

### Mobile components folder

- `user-mobile/components/auth/`: reusable auth screen UI
- `user-mobile/components/dashboard/DashboardComponents.tsx`: unified dashboard components
- `user-mobile/components/SharedUI.tsx`: generic cross-platform UI helpers

### Mobile services folder

- `user-mobile/services/firebase.ts`: initializes Firebase app and auth
- `user-mobile/services/api.ts`: authenticated fetch wrapper for the backend
- `user-mobile/services/medicines.ts`, `cart.ts`, `orders.ts`, `prescriptions.ts`, `dashboard.ts`, `profile.ts`

- The API base URL is centralized dynamically in `api.ts` detecting the Expo Go host IP address.

## Local Setup

### 1. Backend setup

From the repo root:

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medivault
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

Place your Firebase Admin JSON at:

```text
backend/serviceAccountKey.json
```

### 2. Database migration order

Run these SQL files in this order against your PostgreSQL `medivault` database:

1. `backend/database/migrations/users.sql`
2. `backend/database/migrations/user_profile_settings.sql`
3. `backend/database/migrations/medicines.sql`
4. `backend/database/migrations/cart.sql`
5. `backend/database/migrations/cart_items_view.sql`
6. `backend/database/migrations/orders.sql`
7. `backend/database/migrations/prescriptions.sql`
8. `backend/database/migrations/notifications.sql`

Then start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000/api/v1
```

### 3. Mobile setup

From the repo root:

```bash
cd user-mobile
npm install
```

Create `user-mobile/.env.local` from `user-mobile/.env.example`.

You need values for:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### 4. Point the mobile app to your backend

For physical-device testing on the same Wi-Fi, the Expo app automatically detects your computer's local IPv4 address.

Then start Expo:

```bash
npm run start
```

### 5. Admin Web setup

From the repo root:

```bash
cd admin-web
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

The admin web panel runs at:

```text
http://localhost:5173
```

## What Is Implemented Right Now

- Firebase email/password auth for mobile users
- Google sign-in support where platform config allows it
- Firebase-to-PostgreSQL user sync
- Medicine catalog browsing and cart management
- Rx-aware order reservation
- Order history and cancellation
- User dashboard summary
- Prescription submission and history
- Profile management and settings
- Staff Admin Portal (Vite + React)
- Full admin CRUD for medicines, orders, and prescriptions
- Medicine conflict/interaction rules management via admin panel

## Known Gaps

- None. The core dispensary workflows, including the mobile user app, backend API, and staff admin web portal, are fully implemented.
