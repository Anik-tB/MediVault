# MediVault Backend

Express and PostgreSQL backend for MediVault.

## What Is Ready

- Express server
- PostgreSQL connection with `pg`
- health check route
- starter SQL schema for MediVault
- sample medicine seed SQL

## Files

- `src/server.js` -> starts the backend
- `src/app.js` -> Express app setup
- `src/config/env.js` -> reads `.env`
- `src/config/db.js` -> PostgreSQL pool and query helpers
- `src/routes/index.js` -> API routes
- `src/controllers/health.controller.js` -> health check response
- `src/scripts/check-db.js` -> test the database connection
- `database/migrations/001_init_medivault.sql` -> create tables
- `database/seeders/001_sample_medicines.sql` -> insert sample data

## Step By Step PostgreSQL Setup

### 1. Create the database in pgAdmin

In pgAdmin:

1. Open pgAdmin4
2. Expand your PostgreSQL server
3. Right click `Databases`
4. Click `Create > Database`
5. Name it `medivault`
6. Save

### 2. Create backend env file

Inside `backend`:

1. Copy `.env.example`
2. Rename the copy to `.env`
3. Put your real PostgreSQL password in `DB_PASSWORD`

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medivault
DB_USER=postgres
DB_PASSWORD=your_real_password
```

### 3. Install backend packages

```bash
cd backend
npm install
```

### 4. Run the SQL migration in pgAdmin

Open pgAdmin Query Tool for the `medivault` database and run:

- `database/migrations/001_init_medivault.sql`

This creates:

- `users`
- `medicines`
- `inventory_batches`
- `medicine_conflicts`
- `orders`
- `order_items`
- `prescriptions`

### 5. Add sample data

Optional but useful for testing:

- run `database/seeders/001_sample_medicines.sql`

This adds:

- Aspirin
- Warfarin
- Amoxicillin
- one sample medicine conflict

### 6. Check the database connection

From `backend` run:

```bash
npm run db:check
```

If everything is correct, you should see:

- database connected successfully
- current database name
- current PostgreSQL time

### 7. Start the backend

```bash
npm run dev
```

The server should run on:

- `http://localhost:5000`

Test route:

- `GET http://localhost:5000/api/v1/health`

## Health Route Response

If PostgreSQL is connected, the route returns database status and current time.

If PostgreSQL is not connected, it returns an error message so you know the backend is up but the DB config is wrong.

## Recommended Next Step

After PostgreSQL is working, the next backend task should be:

1. add Firebase Admin SDK
2. verify Firebase user tokens
3. create `POST /auth/sync-profile`
4. store signed-in mobile users in the `users` table
