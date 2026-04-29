import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@firebase/auth';

import { getFirebaseAuth } from '@/services/firebase';

export function getReadableAuthErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/missing-password':
        return 'Password is required.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email or password is incorrect.';
      case 'auth/email-already-in-use':
        return 'This email is already used by another account.';
      case 'auth/weak-password':
        return 'Use a stronger password with at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export async function signInUser(email: string, password: string) {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function registerUser({
  displayName,
  email,
  password,
}: {
  displayName: string;
  email: string;
  password: string;
}) {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

  if (displayName.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }

  return credential;
}

export async function sendResetEmail(email: string) {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}
