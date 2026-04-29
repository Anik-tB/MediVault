# MediVault User Mobile

Expo React Native app for the user side of MediVault.

## Current Status

The mobile frontend has been converted from the default Expo starter into a custom auth flow based on the Figma prototype.

Implemented now:

- sign in screen
- sign up step 1 screen
- sign up step 2 security screen
- screen-to-screen navigation with Expo Router
- custom mobile auth UI components
- custom theme colors and auth layout styling
- Firebase Auth setup with persistent mobile sessions
- real sign in, sign up, sign out, and password reset
- Google sign-in button wired to Firebase Auth
- authenticated placeholder home screen

Not connected yet:

- backend API
- PostgreSQL profile sync
- dropdown backend data
- full home/dashboard after login
- PostgreSQL backend sync after Google sign-in

## Implemented Screens

### 1. Sign In

File:

- `app/index.tsx`

Features:

- MediVault logo header
- Patient / Student role banner
- email input
- password input
- show/hide password
- forgot password email flow
- Firebase sign in
- Google sign-in
- create account link

### 2. Sign Up Step 1

File:

- `app/sign-up/index.tsx`

Features:

- step progress indicator
- full name input
- email input
- student ID input
- phone input
- faculty/department selector
- validation before step 2
- sign in instead link

### 3. Sign Up Step 2

File:

- `app/sign-up/security.tsx`

Features:

- profile summary card
- password input
- confirm password input
- show/hide password
- terms agreement checkbox
- Firebase account creation
- back button
- sign in instead link

### 4. Authenticated Home Placeholder

File:

- `app/home.tsx`

Features:

- redirects signed-in user after login/signup
- shows current Firebase user email
- sign out button
- temporary placeholder until the real home screen is designed

## Shared UI Components

Reusable auth components were created here:

- `components/auth/auth-ui.tsx`

Main shared parts:

- `AuthScaffold`
- `BrandHeader`
- `RoleBanner`
- `StepProgress`
- `AuthCard`
- `TextField`
- `SelectField`
- `PrimaryButton`
- `SecondaryButton`
- `FooterPrompt`
- `ProfileSummaryCard`
- `LegalCheckbox`

Buttons now also support disabled states for loading flows.

## Routing Setup

Main route setup:

- `app/_layout.tsx`

Current routes:

- `/` -> sign in
- `/home` -> authenticated placeholder screen
- `/sign-up` -> sign up step 1
- `/sign-up/security` -> sign up step 2

## Firebase Setup

Firebase client setup lives here:

- `services/firebase.ts`
- `hooks/use-auth.tsx`

Required local env file:

- create `user-mobile/.env`
- or create `user-mobile/.env.local`
- copy values from `user-mobile/.env.example`
- paste your Firebase Web app config values

Required env keys:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

Important:

- use the Firebase Web app config for Expo
- do not put the Firebase Admin SDK key inside `user-mobile`
- after changing `.env`, restart Expo with `npx expo start --clear`
- `.env.local` also works if you prefer keeping local secrets separate
- Google sign-in also needs OAuth client IDs from your Firebase/Google Cloud project
- Android Google sign-in needs a development build or native Android build, not Expo Go

## Theme and Styling

Custom mobile palette is defined here:

- `constants/theme.ts`

Added styling tokens for:

- background
- surface cards
- primary blue
- text colors
- borders
- disabled states
- button pressed state

## Current Auth Behavior

This mobile app now uses Firebase Auth for the user authentication flow.

Working now:

- email/password sign in
- email/password sign up
- Google sign in with Firebase credential exchange
- auth session persistence with AsyncStorage
- password reset email
- redirect to `/home` after successful auth
- sign out

Still temporary:

- step 1 signup details other than name/email are not saved yet
- department field still cycles through sample values
- no backend API or PostgreSQL sync yet
- Google sign-in cannot be tested inside Expo Go

## Prerequisites

Before running the app, install:

- Git
- Node.js LTS
- npm
- Expo Go on your Android phone
- a Firebase project with Email/Password auth enabled
- Google provider enabled in Firebase Authentication

## Teammate Setup

If your teammate is joining from GitHub, use these steps:

```bash
git clone <your-github-repo-url>
cd MediVault
cd user-mobile
npm install
copy .env.example .env
npm start
```

Then open `user-mobile/.env` and paste the Firebase Web app config values.
You can use `.env.local` instead if you prefer.

After `npm start`:

- press `a` to open Android emulator
- press `w` to open web preview
- scan the QR code with Expo Go on your phone

Important:

- Email/password auth works in Expo Go
- Google auth needs a development build on Android because OAuth redirects cannot be tested in Expo Go

## If New Changes Are Pulled

When your teammate pulls the latest code from GitHub, run this again inside `user-mobile`:

```bash
npm install
```

This is important when `package.json` or `package-lock.json` changes.

If routes or types feel stale, run:

```bash
npx expo start --clear
```

## Simple Collaboration Workflow

Use GitHub like this:

```bash
git checkout -b feature/your-feature-name
```

After making changes:

```bash
git add .
git commit -m "Add user mobile feature"
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Run Locally

If the project is already cloned:

```bash
cd user-mobile
npm install
copy .env.example .env
npm start
```

After that:

1. Open `user-mobile/.env`
2. Paste Firebase Web app config values
3. Paste Google OAuth client IDs if you want Google login
4. Restart Expo if it was already running

## Dependency Note

For this Expo project, do not use `npm audit fix --force`.
It can upgrade Expo packages to unsupported versions and break the app.

Use these instead:

```bash
npx expo install --check
npx expo install --fix
```

## Important Folders

- `app/`: screens and routes
- `components/`: reusable UI parts
- `constants/`: theme, colors, config
- `hooks/`: auth session state
- `services/`: Firebase setup and helpers
- `assets/`: images and icons

## Current Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Firebase Auth
- AsyncStorage
