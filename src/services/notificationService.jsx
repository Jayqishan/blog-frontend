import { apiRequest } from './api';

export function fetchNotifications() {
  return apiRequest('/notifications');
}

export function markAllNotificationsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'PATCH',
  });
}
