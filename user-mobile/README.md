# MediVault User Mobile

Expo React Native app for the user side of MediVault.

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

## Important folders

- `app/`: screens and routes
- `components/`: reusable UI parts
- `constants/`: colors, labels, config
- `assets/`: images and icons

## Current stack

- Expo
- React Native
- TypeScript
- Expo Router
