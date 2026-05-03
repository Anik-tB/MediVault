import { getFirebaseAuth } from './firebase';
import { Platform } from 'react-native';

// For Android emulator to access local backend, use 10.0.2.2.
// For Web or iOS simulator, use localhost.
// For a physical device on the same Wi-Fi, use your computer's local IP address.
const DEVICE_IP = '192.168.0.192'; // ← Update this to your computer's Wi-Fi IP
const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api/v1'
    : `http://${DEVICE_IP}:5000/api/v1`;

export async function syncUserProfile() {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  const idToken = await user.getIdToken();

  const response = await fetch(`${API_URL}/auth/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to sync profile with backend');
  }

  return response.json();
}
