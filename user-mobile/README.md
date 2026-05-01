# MediVault Mobile Application 📱

Welcome to the **MediVault** mobile app. This is a React Native application built with [Expo](https://expo.dev/) and [Expo Router](https://docs.expo.dev/router/introduction/). It serves as the primary interface for patients and customers to interact with the Local Dispensary Management system.

---

## 🛠 Tech Stack
- **Framework:** React Native + Expo
- **Routing:** Expo Router (File-based routing)
- **Authentication:** Firebase Auth (Email/Password & Google Sign-In)
- **Icons:** Expo Vector Icons (`Feather`)
- **Animations:** React Native `Animated` API

---

## 📁 File Structure & Navigation

The app uses **Expo Router**, meaning the folder structure inside the `app/` directory directly dictates the navigation URLs of the app.

### `app/` (The Screens)
- **`index.tsx`**: The main entry point. Displays the **Login** screen. Handles Google Sign-In (Web) and standard Email/Password login. If a user is already logged in, it redirects to the Dashboard.
- **`sign-up/`**:
  - **`index.tsx`**: Step 1 of the sign-up flow. Collects Full Name, Email, and Phone number.
  - **`security.tsx`**: Step 2 of the sign-up flow. Collects the Password, validates terms, creates the Firebase profile, and silently syncs the new user to the PostgreSQL backend before redirecting to the Dashboard.
- **`dashboard/`**:
  - **`index.tsx`**: The main post-login experience. Integrates all dashboard components into a beautiful, scrollable interface with a custom sliding sidebar.

### `components/` (Reusable UI)
- **`auth/`**:
  - **`auth-ui.tsx`**: A collection of highly styled, reusable UI blocks exclusively for the authentication screens (e.g., `TextField`, `PrimaryButton`, `AuthCard`, `StepProgress`).
- **`dashboard/`**:
  - Modular UI components that make up the Dashboard screen:
    - `Sidebar.tsx`: Custom animated sliding drawer menu.
    - `DashboardHeader.tsx`: Top app bar with avatar and notifications.
    - `WelcomeBanner.tsx`: Dynamic greeting card showing active orders.
    - `StatsGrid.tsx`: 2x2 grid displaying quick numerical statistics.
    - `QuickActions.tsx`: Four primary action buttons.
    - `RecentOrders.tsx`: List of recent transactions with status badges.

### `services/` (Data & Logic)
- **`firebase.ts`**: Initializes the Firebase app and exports the auth instance. Contains helper functions for Firebase error formatting.
- **`api.ts`**: The Axios configuration connecting the mobile app to the Node.js Express backend. 
  - *Important: Contains the `syncUserProfile` function which automatically runs after any successful login/signup to ensure PostgreSQL stays perfectly in sync with Firebase.*

### `hooks/` & `constants/`
- **`use-auth.ts`**: A global custom hook that listens to Firebase Authentication state changes in real-time.
- **`theme.ts`**: Contains the `Palette` object, ensuring consistent colors across the entire application.

---

## 🚀 Running the App

### 1. Configure Environment Variables
You must have a `.env.local` file at the root of `user-mobile` with your Firebase credentials:
```env
EXPO_PUBLIC_FIREBASE_API_KEY="your-api-key"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
EXPO_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### 2. Configure Backend API URL
Open `services/api.ts` and ensure the `API_URL` variable is set to your computer's local Wi-Fi IP address (e.g., `http://192.168.x.x:5000/api/v1`) so your physical mobile device can communicate with the local Node.js server.

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```
Scan the QR code printed in the terminal using the **Expo Go** app on your physical iOS/Android device to test the application!
