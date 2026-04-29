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

Not connected yet:

- backend API
- real login/signup
- forgot password flow
- dropdown backend data
- home/dashboard after login

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
- forgot password link
- sign in button
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
- continue to security button
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
- create account button
- back button
- sign in instead link

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

## Routing Setup

Main route setup:

- `app/_layout.tsx`

Current routes:

- `/` -> sign in
- `/sign-up` -> sign up step 1
- `/sign-up/security` -> sign up step 2

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

## Prototype Behavior

This is currently frontend prototype behavior, not final business logic.

Examples:

- sign in button shows an alert
- forgot password shows an alert
- create account validates terms checkbox and password match
- department field currently cycles through sample department values

## Prerequisites

Before running the app, install:

- Git
- Node.js LTS
- npm
- Expo Go on your Android phone

## Teammate Setup

If your teammate is joining from GitHub, use these steps:

```bash
git clone <your-github-repo-url>
cd MediVault
cd user-mobile
npm install
npm start
```

After `npm start`:

- press `a` to open Android emulator
- press `w` to open web preview
- scan the QR code with Expo Go on your phone

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
git commit -m "Add user mobile screen"
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Run Locally

If the project is already cloned:

```bash
cd user-mobile
npm install
npm start
```

## Dependency Note

For this Expo project, do not use `npm audit fix --force`.
It can upgrade Expo packages to unsupported versions and break the app.

Use these instead:

```bash
npx expo install --check
npx expo install --fix
```

## Important folders

- `app/`: screens and routes
- `components/`: reusable UI parts
- `constants/`: theme, colors, config
- `assets/`: images and icons

## Current stack

- Expo
- React Native
- TypeScript
- Expo Router
