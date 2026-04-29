import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getAuth, initializeAuth } from '@firebase/auth';
import { FirebaseError, getApp, getApps, initializeApp } from 'firebase/app';

const { getReactNativePersistence } = require('@firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => any;
};

const firebaseEnv = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const googleEnv = {
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

export const missingFirebaseKeys = Object.entries(firebaseEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const hasFirebaseConfig = missingFirebaseKeys.length === 0;

export const firebaseConfigError = hasFirebaseConfig
  ? null
  : `Missing Firebase config: ${missingFirebaseKeys.join(
      ', '
    )}. Add them to user-mobile/.env or .env.local and restart Expo.`;

const firebaseConfig = {
  apiKey: firebaseEnv.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: firebaseEnv.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: firebaseEnv.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: firebaseEnv.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: firebaseEnv.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: firebaseEnv.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const googleAuthConfig = {
  androidClientId: googleEnv.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  iosClientId: googleEnv.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  webClientId: googleEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
};

export function getMissingGoogleClientKeys(platform: string) {
  if (platform === 'android') {
    return googleAuthConfig.androidClientId ? [] : ['EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'];
  }

  if (platform === 'ios') {
    return googleAuthConfig.iosClientId ? [] : ['EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'];
  }

  return googleAuthConfig.webClientId ? [] : ['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'];
}

export const firebaseApp = hasFirebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

let firebaseAuth: Auth | null = null;

if (firebaseApp) {
  try {
    firebaseAuth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    firebaseAuth = getAuth(firebaseApp);
  }
}

export function getFirebaseAuth() {
  if (!firebaseAuth) {
    throw new Error(firebaseConfigError ?? 'Firebase Auth is not configured.');
  }

  return firebaseAuth;
}

export function formatFirebaseError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email or password is incorrect.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/missing-email':
      return 'Email is required.';
    case 'auth/missing-password':
      return 'Password is required.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'This email already uses another sign-in method. Use that method first.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}
