# MediVault User Mobile

This folder contains the Expo app used by patients/customers.

## What The Mobile App Does

- signs users in with Firebase Auth
- registers new users
- syncs the signed-in user into the backend
- shows the dashboard
- lists medicines
- manages the cart
- submits prescription records
- reserves orders for pickup
- shows order history
- lets the user edit profile and settings

## Folder Guide

- `app/`
  - Expo Router screens
- `assets/`
  - static app assets
- `components/`
  - reusable UI pieces
- `constants/`
  - shared constants such as theme colors
- `hooks/`
  - auth and theme hooks
- `services/`
  - Firebase and backend integration layer
- `scripts/`
  - Expo helper scripts
- `.expo/`
  - generated Expo metadata and cache
- `.vscode/`
  - local editor settings

## Screen Flow

- `app/index.tsx`
  - redirects to login or dashboard depending on auth state
- `app/login/`
  - sign in, forgot password, and Google sign in entry
- `app/sign-up/`
  - 2-step registration flow
- `app/dashboard/`
  - dashboard summary and navigation hub
- `app/search_medicine/`
  - medicine discovery
- `app/cart/`
  - cart and reserve-for-pickup flow
- `app/orders/`
  - order history and details
- `app/prescriptions/`
  - prescription history, review, and success screens
- `app/profile/`
  - editable profile
- `app/settings/`
  - settings home, appearance, notifications, and security
- `app/notifications/`
  - notifications UI
- `app/(tabs)/`
  - leftover Expo template area, not the main MediVault route path

## Component Folders

- `components/auth/`
  - reusable auth UI like fields, cards, and buttons
- `components/dashboard/DashboardComponents.tsx`
  - unified file containing all dashboard UI pieces such as the header, sidebar, stats, and recent orders
- `components/SharedUI.tsx`
  - unified file containing generic cross-platform UI helpers (e.g., themed text, icons, collapsibles)

## Services

- `services/firebase.ts`
  - Firebase app/auth setup and env validation
- `services/auth.ts`
  - Firebase auth helpers
- `services/api.ts`
  - shared authenticated fetch helper and profile sync helper
- `services/medicines.ts`
  - medicine catalog API calls
- `services/cart.ts`
  - cart API calls
- `services/orders.ts`
  - order API calls
- `services/prescriptions.ts`
  - prescription API calls
- `services/dashboard.ts`
  - dashboard API calls
- `services/profile.ts`
  - profile and settings API calls

## Important Local Setup

Create `user-mobile/.env.local` from `.env.example` and fill in your Firebase values.

Install dependencies:

```bash
cd user-mobile
npm install
```

Start Expo:

```bash
npm run start
```

## Important Networking Note

The backend IP is not fully centralized yet.

If you run the backend on your laptop and test on a physical phone, update the local IP in:

- `services/api.ts`
- `services/medicines.ts`
- `services/cart.ts`
- `services/orders.ts`

## Notes

- Email/password auth works in Expo Go
- Native Google sign-in needs a proper development build on supported platforms
- Prescription submission currently stores a backend record and metadata, not a real uploaded file
- See the root `README.md` for the complete monorepo workflow
