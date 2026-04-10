const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4005/api/v1'
    : 'https://blog-backend-nu-indol.vercel.app/api/v1';

let sessionExpiredHandler = null;

export function registerSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('blogToken');
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error('Unable to reach the server. Please make sure the backend is running.');
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/signup')) {
    sessionExpiredHandler?.();
    throw new Error('Session expired, please login again');
  }

  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export { API_BASE };
