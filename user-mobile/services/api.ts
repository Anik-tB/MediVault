import { Platform } from 'react-native';

import { getFirebaseAuth } from './firebase';

// For Android emulator to access local backend, use 10.0.2.2.
// For Web or iOS simulator, use localhost.
// For a physical device on the same Wi-Fi, use your computer's local IP address.
const DEVICE_IP = '10.15.4.173';

export const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api/v1'
    : `http://${DEVICE_IP}:5000/api/v1`;

type SyncUserProfileInput = {
  phone?: string;
  department?: string;
  bloodGroup?: string;
  allergies?: string;
};

async function getAuthToken(forceRefresh = false) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user is currently signed in');
  }

  return user.getIdToken(forceRefresh);
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      responseData &&
      typeof responseData === 'object' &&
      'error' in responseData &&
      typeof responseData.error === 'string'
        ? responseData.error
        : 'Request failed';

    throw new Error(errorMessage);
  }

  return responseData as T;
}

export async function fetchAuthenticatedJson<T>(
  path: string,
  options: RequestInit = {},
  { forceRefresh = false }: { forceRefresh?: boolean } = {}
) {
  const idToken = await getAuthToken(forceRefresh);
  const headers = new Headers(options.headers ?? {});

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Authorization', `Bearer ${idToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return parseJsonResponse<T>(response);
}

export async function syncUserProfile(profile: SyncUserProfileInput = {}) {
  const responseBody =
    Object.keys(profile).length > 0 ? JSON.stringify(profile) : undefined;

  return fetchAuthenticatedJson('/auth/sync', {
    method: 'POST',
    body: responseBody,
  }, {
    forceRefresh: true,
  });
}
