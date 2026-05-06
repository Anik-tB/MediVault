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

export async function getOrders() {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('You must be logged in');
    const idToken = await user.getIdToken();

    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${idToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch orders');
    }

    return await response.json(); // { orders: [], stats: {} }
  } catch (error) {
    console.error('getOrders error:', error);
    throw error;
  }
}

export async function getOrderDetails(orderId: number) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in');
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${idToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch order details');
  return await response.json(); // array of { medicine_name, quantity }
}

export async function cancelOrder(orderId: number) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in');
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${idToken}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to cancel order');
  }
  return await response.json();
}
