import { apiRequest } from './api';

export function loginUser(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function signupUser(payload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchUsers() {
  return apiRequest('/auth/users');
}

export function fetchCurrentUser() {
  return apiRequest('/auth/me');
}

export function updateCurrentUser(payload) {
  return apiRequest('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeUser(id) {
  return apiRequest(`/auth/users/${id}`, {
    method: 'DELETE',
  });
}

export function removeOwnAccount() {
  return apiRequest('/auth/me', {
    method: 'DELETE',
  });
}
