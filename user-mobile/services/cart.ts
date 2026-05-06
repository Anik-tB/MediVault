import { Platform } from 'react-native';
import { getFirebaseAuth } from './firebase';

const DEVICE_IP = '10.15.4.173';
const API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000/api/v1'
    : `http://${DEVICE_IP}:5000/api/v1`;

export async function addToCart(medicineId: string, quantity: number = 1) {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('You must be logged in to add to cart');
    }

    const idToken = await user.getIdToken();

    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ medicine_id: medicineId, quantity }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error adding to cart: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('addToCart error:', error);
    throw error;
  }
}
