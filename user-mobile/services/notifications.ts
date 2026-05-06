import { fetchAuthenticatedJson } from './api';

export type Notification = {
  id: string;
  type: 'order' | 'prescription' | 'system' | 'alert' | string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type NotificationsResponse = {
  notifications: Notification[];
};

type MarkAsReadResponse = {
  message: string;
};

export async function fetchNotifications() {
  return fetchAuthenticatedJson<NotificationsResponse>('/notifications');
}

export async function markAllNotificationsAsRead() {
  return fetchAuthenticatedJson<MarkAsReadResponse>('/notifications/read-all', {
    method: 'PATCH',
  });
}
