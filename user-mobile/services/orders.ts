import { Platform } from 'react-native';
import { getFirebaseAuth } from './firebase';

const DEVICE_IP = '10.15.4.173';
const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api/v1'
    : `http://${DEVICE_IP}:5000/api/v1`;

export async function reserveForPickup() {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('You must be logged in to reserve for pickup');
    }

    const idToken = await user.getIdToken();

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Error reserving pickup: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('reserveForPickup error:', error);
    throw error;
  }
}
