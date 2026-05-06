# MediVault

MediVault is a monorepo for a local dispensary workflow. The current working stack is:

- `user-mobile/`: the patient-facing Expo app
- `backend/`: the Express + PostgreSQL API used by the mobile app
- `admin-web/`: planned admin panel, not documented here in detail yet
- `docs/`: project notes and future architecture ideas

The implemented user journey today is:

1. Sign up or sign in with Firebase Auth
2. Sync the Firebase user into PostgreSQL
3. Browse medicines
4. Add medicines to cart
5. Upload a prescription record for Rx items
6. Reserve an order for pickup
7. Review dashboard, orders, profile, and settings

Important current boundary:

- Prescription submission uploads the real file binary to the local backend server (stored in `backend/uploads/`).
- Rx validation for orders is based on the stored prescription record status.

## Repository Layout

- `README.md`
  - monorepo overview, workflow, and setup
- `backend/`
  - Express server, PostgreSQL access, migrations, and Firebase Admin token verification
- `user-mobile/`
  - Expo Router mobile app, Firebase client auth, and API integrations
- `admin-web/`
  - reserved for the dispensary admin panel
- `docs/`
  - notes such as the planned medicine conflict rules

Generated folders like `node_modules/`, `.expo/`, and `.git/` are not part of the core source architecture.

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
  - route handler logic
- `backend/src/middleware/`
  - request middleware such as Firebase token verification
- `backend/src/routes/`
  - endpoint registration by feature
- `backend/src/utils/`
  - shared helpers used across controllers
- `backend/src/models/`
  - currently reserved for future model abstractions
- `backend/src/services/`
  - currently reserved for future service-layer abstractions

### Backend migrations and what they hold

- `backend/database/migrations/users.sql`
  - creates the base `users` table
- `backend/database/migrations/user_profile_settings.sql`
  - extends `users` with profile fields and creates `user_settings`
- `backend/database/migrations/medicines.sql`
  - creates `medicines` and seeds sample catalog data
- `backend/database/migrations/cart.sql`
  - creates `cart_items`
- `backend/database/migrations/cart_items_view.sql`
  - creates a human-readable SQL view for cart inspection
- `backend/database/migrations/orders.sql`
  - creates `orders` and `order_items`
- `backend/database/migrations/prescriptions.sql`
  - creates `prescriptions` and adds `orders.prescription_id`
- `backend/database/migrations/notifications.sql`
  - creates `notifications` for real-time alerts

### Backend config folder

- `backend/src/config/env.js`
  - reads `.env` and exposes `PORT`, `DATABASE_URL`, or `DB_*`
- `backend/src/config/db.js`
  - creates the PostgreSQL pool and exports query helpers
- `backend/src/config/firebase.js`
  - initializes Firebase Admin with the local service account

### Backend middleware folder

- `backend/src/middleware/auth.middleware.js`
  - checks the `Authorization: Bearer <token>` header
  - verifies the Firebase ID token
  - attaches `req.user`

### Backend utils folder

- `backend/src/utils/account.utils.js`
  - shared validation helpers
  - profile/settings row mappers
  - user upsert logic
  - default settings row creation

### Backend controller folder

- `auth.controller.js`
  - syncs Firebase users into PostgreSQL
- `health.controller.js`
  - simple API health response
- `medicines.controller.js`
  - medicine listing and filtering
- `cart.controller.js`
  - add, read, update, remove, and clear cart items
- `orders.controller.js`
  - reserve pickup, list orders, fetch order details, cancel pending orders
- `prescriptions.controller.js`
  - list prescription records and create new submissions
- `dashboard.controller.js`
  - aggregate stats and recent order data for the dashboard
- `profile.controller.js`
  - read and update the user's profile row
- `settings.controller.js`
  - read and update appearance and notification settings

### Backend routes folder

- `index.js`
  - composes all feature routers under `/api/v1`
- `auth.routes.js`
  - `POST /auth/sync`
- `medicines.routes.js`
  - `GET /medicines`
- `cart.routes.js`
  - `POST /cart`
  - `GET /cart`
  - `PATCH /cart/:cartItemId`
  - `DELETE /cart/:cartItemId`
  - `DELETE /cart`
- `orders.routes.js`
  - `GET /orders`
  - `GET /orders/:orderId`
  - `DELETE /orders/:orderId`
  - `POST /orders`
- `prescriptions.routes.js`
  - `GET /prescriptions`
  - `POST /prescriptions`
- `dashboard.routes.js`
  - `GET /dashboard`
- `profile.routes.js`
  - `GET /profile`
  - `PATCH /profile`
- `settings.routes.js`
  - `GET /settings`
  - `PATCH /settings/notifications`
  - `PATCH /settings/appearance`

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
- `user-mobile/.expo/`
  - generated Expo cache and local metadata
- `user-mobile/.vscode/`
  - workspace editor settings

### Mobile app folder

- `user-mobile/app/_layout.tsx`
  - root navigation stack and theme provider
- `user-mobile/app/index.tsx`
  - auth-aware redirect to login or dashboard
- `user-mobile/app/login/`
  - sign-in screen and reset-password entry
- `user-mobile/app/sign-up/`
  - two-step registration flow
- `user-mobile/app/dashboard/`
  - dashboard screen shell
- `user-mobile/app/search_medicine/`
  - medicine discovery screen
- `user-mobile/app/cart/`
  - cart management and reserve-for-pickup flow
- `user-mobile/app/orders/`
  - order history, expand details, and cancel action
- `user-mobile/app/prescriptions/`
  - prescription list, preview, and success screens
- `user-mobile/app/profile/`
  - editable user profile screen
- `user-mobile/app/settings/`
  - settings home plus appearance, notifications, and security screens
- `user-mobile/app/notifications/`
  - notifications screen UI

### Mobile components folder

- `user-mobile/components/auth/`
  - reusable auth screen UI like text fields, cards, buttons, step indicators
- `user-mobile/components/dashboard/DashboardComponents.tsx`
  - unified file containing all dashboard shell pieces such as header, sidebar, stats, banner, and recent orders
- `user-mobile/components/SharedUI.tsx`
  - unified file containing generic cross-platform UI helpers kept from the Expo template

### Mobile hooks folder

- `user-mobile/hooks/use-auth.tsx`
  - provides auth context
  - listens for Firebase session changes
  - syncs the signed-in user to the backend
- `user-mobile/hooks/use-color-scheme*`
  - color scheme helpers
- `user-mobile/hooks/use-theme-color.ts`
  - theme color accessor helper

### Mobile constants folder

- `user-mobile/constants/theme.ts`
  - defines the shared `Palette` used throughout the app

### Mobile services folder

- `user-mobile/services/firebase.ts`
  - initializes Firebase app and auth
  - validates Firebase env configuration
  - exposes Google sign-in config helpers
- `user-mobile/services/auth.ts`
  - high-level Firebase auth helpers
- `user-mobile/services/api.ts`
  - authenticated fetch wrapper for the newer backend integrations
  - also contains `syncUserProfile()`
- `user-mobile/services/medicines.ts`
  - medicine listing fetch
- `user-mobile/services/cart.ts`
  - cart CRUD requests
- `user-mobile/services/orders.ts`
  - order reservation, history, details, and cancellation
- `user-mobile/services/prescriptions.ts`
  - prescription list and submission requests
- `user-mobile/services/dashboard.ts`
  - dashboard summary and recent orders request
- `user-mobile/services/profile.ts`
  - profile and settings requests

- The API base URL is centralized dynamically in `api.ts`.
- It automatically detects your Expo Go host IP address using `expo-constants`.
- You do NOT need to manually configure IP addresses when testing on a physical phone.

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

For physical-device testing on the same Wi-Fi, the Expo app automatically detects your computer's local IPv4 address via the Metro bundler. No manual IP configuration is required!

Then start Expo:

```bash
npm run start
```

Useful variants:

```bash
npm run android
npm run ios
npm run web
```

## What Is Implemented Right Now

- Firebase email/password auth
- Google sign-in support where platform config allows it
- Firebase-to-PostgreSQL user sync
- medicine catalog browsing
- cart add/update/remove/clear
- Rx-aware order reservation
- order history and cancellation
- dashboard summary and recent orders
- prescription submission records and status history
- profile management
- notification and appearance settings
- Firebase-backed password change flow on mobile

## Known Gaps

- `admin-web/` is still work in progress
- medicine conflict rules are documented in `docs/architecture.md` but are not yet enforced in the current backend
