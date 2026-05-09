import { getFirebaseAuth } from './firebase';
import { API_URL } from './api';

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
      if (response.status === 409 && errorData.error === 'Interaction Warning') {
        const err: any = new Error(errorData.message || 'Interaction Warning');
        err.isInteractionWarning = true;
        err.severity = errorData.severity;
        err.clinicalDescription = errorData.clinicalDescription;
        throw err;
      }
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
