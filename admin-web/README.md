# MediVault Admin Web

The complete Vite + React web dashboard for dispensary staff and pharmacists.

## Features

- **Dashboard**: View overall statistics, recent orders, and pending prescriptions.
- **Medicines**: Full CRUD for the medicine catalog.
- **Interactions**: Configure and manage medicine conflict rules to ensure patient safety.
- **Prescriptions**: Review, approve, or reject user-uploaded prescriptions.
- **Orders**: Manage pickup orders (approve, reject, or mark as picked up).
- **Settings**: Manage staff profile, security, appearance, and notification preferences.

## Local setup

```bash
cd admin-web
npm install
cp .env.example .env.local
npm run dev
```

Default seeded staff login after running `backend/database/migrations/admin_web.sql`:

- Email: `admin@medivault.com`
- Password: `Admin@123`

The app calls the Express API at `VITE_API_URL`, defaulting to `http://localhost:5000/api/v1`.

## Tech Stack

- React
- Vite
- TailwindCSS
- Lucide React (Icons)
- React Router (for navigation)

## Status

The admin web portal is fully implemented and integrated with the `backend` admin routes.
