import type {
  AdminDashboard,
  InteractionListResponse,
  InteractionPayload,
  MedicineListResponse,
  MedicinePayload,
  OrderListResponse,
  PrescriptionListResponse,
  StaffProfile,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const TOKEN_KEY = 'medivault_admin_token';

export type AuthResponse = {
  message: string;
  token: string;
  expiresAt: string;
  staff: StaffProfile;
};

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return parseJson<T>(response);
}

export async function login(email: string, password: string) {
  const data = await apiFetch<AuthResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setStoredToken(data.token);
  return data;
}

export async function firebaseLogin(idToken: string) {
  const data = await apiFetch<AuthResponse>('/admin/auth/firebase-login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
  setStoredToken(data.token);
  return data;
}

export type RegisterPayload = {
  fullName: string;
  email: string;
  employeeId: string;
  phone?: string;
  department: string;
  password: string;
};

export async function register(payload: RegisterPayload) {
  const data = await apiFetch<AuthResponse>('/admin/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredToken(data.token);
  return data;
}

export async function getMe() {
  return apiFetch<{ staff: StaffProfile }>('/admin/auth/me');
}

export async function logout() {
  try {
    await apiFetch<{ message: string }>('/admin/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
}

export async function getDashboard() {
  return apiFetch<AdminDashboard>('/admin/dashboard');
}

export async function getMedicines(params: { search?: string; category?: string; status?: string } = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return apiFetch<MedicineListResponse>(`/admin/medicines?${query.toString()}`);
}

export async function createMedicine(payload: MedicinePayload) {
  return apiFetch<{ message: string }>('/admin/medicines', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMedicine(id: number, payload: MedicinePayload) {
  return apiFetch<{ message: string }>(`/admin/medicines/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteMedicine(id: number) {
  return apiFetch<{ message: string }>(`/admin/medicines/${id}`, { method: 'DELETE' });
}

export async function getOrders(params: { search?: string; status?: string } = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return apiFetch<OrderListResponse>(`/admin/orders?${query.toString()}`);
}

export async function approveOrder(id: number, pickupTime: string) {
  return apiFetch<{ message: string }>(`/admin/orders/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ pickupTime }),
  });
}

export async function rejectOrder(id: number, reason: string) {
  return apiFetch<{ message: string }>(`/admin/orders/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export async function markOrderPickedUp(id: number) {
  return apiFetch<{ message: string }>(`/admin/orders/${id}/pickup`, { method: 'PATCH' });
}

export async function getPrescriptions(params: { search?: string; status?: string } = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return apiFetch<PrescriptionListResponse>(`/admin/prescriptions?${query.toString()}`);
}

export async function approvePrescription(id: number, notes?: string) {
  return apiFetch<{ message: string }>(`/admin/prescriptions/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

export async function rejectPrescription(id: number, notes: string) {
  return apiFetch<{ message: string }>(`/admin/prescriptions/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

export async function getInteractions(params: { search?: string; severity?: string } = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return apiFetch<InteractionListResponse>(`/admin/interactions?${query.toString()}`);
}

export async function createInteraction(payload: InteractionPayload) {
  return apiFetch<{ message: string }>('/admin/interactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateInteraction(id: number, payload: InteractionPayload) {
  return apiFetch<{ message: string }>(`/admin/interactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteInteraction(id: number) {
  return apiFetch<{ message: string }>(`/admin/interactions/${id}`, { method: 'DELETE' });
}

export async function getSettings() {
  return apiFetch<{ staff: StaffProfile }>('/admin/settings');
}

export async function updateProfile(payload: { fullName: string; phone: string; department: string }) {
  return apiFetch<{ message: string; staff: StaffProfile }>('/admin/settings/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateNotifications(payload: StaffProfile['notificationSettings']) {
  return apiFetch<{ message: string; staff: StaffProfile }>('/admin/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateAppearance(payload: StaffProfile['appearance']) {
  return apiFetch<{ message: string; staff: StaffProfile }>('/admin/settings/appearance', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updatePassword(payload: { currentPassword: string; newPassword: string }) {
  return apiFetch<{ message: string }>('/admin/settings/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
