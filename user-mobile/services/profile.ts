import { fetchAuthenticatedJson } from './api';

export type UserProfile = {
  id: string;
  firebaseUid: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  bloodGroup: string;
  allergies: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationSettings = {
  orderAlerts: boolean;
  lowStockAlerts: boolean;
  expiryAlerts: boolean;
  weeklyReports: boolean;
};

export type AppearanceSettings = {
  theme: 'light' | 'dark' | 'system';
  sidebarDensity: 'compact' | 'default' | 'relaxed';
};

export type UserSettings = {
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  updatedAt: string;
};

type ProfileResponse = {
  message?: string;
  profile: UserProfile;
};

type SettingsResponse = {
  message?: string;
  settings: UserSettings;
};

export type UpdateUserProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  bloodGroup?: string;
  allergies?: string;
};

export async function fetchUserProfile() {
  const response = await fetchAuthenticatedJson<ProfileResponse>('/profile');
  return response.profile;
}

export async function updateUserProfile(payload: UpdateUserProfileInput) {
  const response = await fetchAuthenticatedJson<ProfileResponse>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return response.profile;
}

export async function fetchUserSettings() {
  const response = await fetchAuthenticatedJson<SettingsResponse>('/settings');
  return response.settings;
}

export async function updateNotificationSettings(payload: NotificationSettings) {
  const response = await fetchAuthenticatedJson<SettingsResponse>('/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return response.settings;
}

export async function updateAppearanceSettings(payload: Partial<AppearanceSettings>) {
  const response = await fetchAuthenticatedJson<SettingsResponse>('/settings/appearance', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return response.settings;
}
