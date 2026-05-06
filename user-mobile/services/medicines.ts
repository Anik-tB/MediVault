import { API_URL } from './api';

export async function fetchMedicines(search?: string, category?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);

    const queryString = params.toString();
    const url = `${API_URL}/medicines${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching medicines: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('fetchMedicines error:', error);
    throw error;
  }
}
