# MediVault 🏥

MediVault is a full-stack **Local Dispensary Management** system. It connects a mobile application (for patients/customers) to a robust backend infrastructure, allowing users to browse medicines, view their cart, upload prescriptions, and track order history.

The project is structured as a monorepo consisting of three main environments:

1. **`user-mobile/`**: The React Native (Expo) mobile application for customers.
2. **`backend/`**: The Express.js & PostgreSQL server powering the API and database.
3. **`admin-web/`**: The web dashboard for dispensary administrators (work in progress).

---

## 📁 Project Architecture & File Paths

### 1. Mobile Application (`/user-mobile`)
Built with React Native, Expo, and Expo Router. It uses Firebase for Authentication and fetches data from the custom Express backend.

**Key Files & Directories:**
- **`app/`**: Contains all the screens and routing logic (Expo Router).
  - **`app/index.tsx`**: The main entry point and Login screen. Handles Google Sign-In and Email Authentication.
  - **`app/sign-up/`**: Contains the two-step registration flow (`index.tsx` and `security.tsx`).
  - **`app/dashboard/index.tsx`**: The main user dashboard that users see after logging in.
- **`components/`**: Reusable UI components.
  - **`components/dashboard/`**: Contains all the modular UI pieces for the dashboard (e.g., `Sidebar.tsx`, `StatsGrid.tsx`, `WelcomeBanner.tsx`, `QuickActions.tsx`, `RecentOrders.tsx`).
  - **`components/auth/`**: Custom styled UI components for the login/signup screens.
- **`services/`**: Integration layers.
  - **`services/api.ts`**: Axios configuration linking the mobile app to the backend. The `API_URL` must point to your computer's local Wi-Fi IP address (e.g., `http://192.168.0.x:5000/api/v1`) to work on physical devices.
  - **`services/firebase.ts`**: Firebase Auth initialization.
- **`.env.local`**: Contains the Firebase configuration keys (API Key, Project ID, etc.).

### 2. Backend API (`/backend`)
Built with Node.js, Express, and PostgreSQL. It uses Firebase Admin SDK to securely verify tokens sent from the mobile app.

**Key Files & Directories:**
- **`src/app.js`**: The Express application setup and middleware configuration.
- **`src/server.js`**: The entry point that starts the server on port `5000`.
- **`src/routes/`**: API endpoint definitions.
  - **`index.js`**: Combines all route handlers.
  - **`auth.routes.js`**: Defines the `/auth/sync` endpoint.
- **`src/controllers/auth.controller.js`**: Contains the logic to take a verified Firebase user and insert/update their profile into the PostgreSQL `users` table.
- **`src/middleware/auth.middleware.js`**: Protects backend routes by validating Firebase ID tokens sent in the `Authorization` header.
- **`src/config/`**: Database and Firebase Admin configurations.
  - **`db.js`**: PostgreSQL connection pool setup.
  - **`firebase.js`**: Initializes the Firebase Admin SDK.
- **`serviceAccountKey.json`**: The downloaded private key from the Google Cloud Console (ignored by git for security) used to verify mobile tokens.
- **`.env`**: Contains database credentials (`DB_USER`, `DB_PASSWORD`, `DB_PORT`).

---

## 🚀 How to Run the Project

### 1. Start the Backend
You must have PostgreSQL running on your machine with a database named `medivault`.
```bash
cd backend
npm install
npm run dev
```
*The server will start on `http://localhost:5000`.*

### 2. Start the Mobile App
You will need the Expo Go app installed on your physical mobile device.
```bash
cd user-mobile
npm install
npx expo start
```
1. Ensure your phone and computer are on the **same Wi-Fi network**.
2. Update `user-mobile/services/api.ts` with your computer's IPv4 address.
3. Scan the QR code in the terminal using the Expo Go app (Android) or the Camera app (iOS).

---

## 🔐 Authentication Flow

MediVault uses a hybrid authentication model:
1. The mobile app authenticates the user natively via **Firebase Auth** (Email/Password or Google).
2. Upon success, the mobile app silently calls the **Backend Sync API** (`POST /api/v1/auth/sync`).
3. The backend securely verifies the token using the Admin SDK and upserts the user profile into the **PostgreSQL `users` table**.
4. This guarantees that Firebase handles password security, while PostgreSQL handles relational data (Orders, Cart, Prescriptions).
