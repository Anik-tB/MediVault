import { getFirebaseAuth } from './firebase';
import { API_URL } from './api';

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
      if (response.status === 409 && errorData.error === 'Interaction Warning') {
        const err: any = new Error(errorData.message || 'Interaction Warning');
        err.isInteractionWarning = true;
        err.severity = errorData.severity;
        err.clinicalDescription = errorData.clinicalDescription;
        err.conflictingMedicine = errorData.conflictingMedicine;
        throw err;
      }
      throw new Error(errorData.error || `Error adding to cart: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('addToCart error:', error);
    throw error;
  }
}

export async function getCartItems() {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('You must be logged in to view your cart');
    }

    const idToken = await user.getIdToken();

    const response = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error fetching cart: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('getCartItems error:', error);
    throw error;
  }
}

async function getAuthToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in');
  return user.getIdToken();
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const idToken = await getAuthToken();
  const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error('Failed to update quantity');
  return response.json();
}

export async function removeFromCart(cartItemId: string) {
  const idToken = await getAuthToken();
  const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${idToken}` },
  });
  if (!response.ok) throw new Error('Failed to remove item');
  return response.json();
}

export async function clearCart() {
  const idToken = await getAuthToken();
  const response = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${idToken}` },
  });
  if (!response.ok) throw new Error('Failed to clear cart');
  return response.json();
}
