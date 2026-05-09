# MediVault Admin Web

Pharmacist/admin web dashboard for MediVault.

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
