const API_BASE = '/api';

async function request(endpoint, options = {}) {
  let token = null;
  if (window.Clerk && window.Clerk.session) {
    token = await window.Clerk.session.getToken();
  }
  
  const headers = { ...options.headers };
  
  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('vrp_token');
    localStorage.removeItem('vrp_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getMe: () => request('/auth/me'),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Scan
  getScanDetail: (id) => request(`/scan/${id}`),
  
  submitScan: (formData) => request('/scan', {
    method: 'POST',
    body: formData,
  }),
  
  // Custom Settings
  getAdminStats: () => request('/admin/dashboard'),
  getAdminUserDetail: (id) => request(`/admin/user/${id}`),
  sendGlobalNotification: (message) => request('/admin/notify', { method: 'POST', body: JSON.stringify({ message }) }),
  getNotifications: () => request('/notifications'),
  markNotificationsRead: () => request('/notifications/read', { method: 'PUT' }),
  scanIngredient: (formData) => request('/scan/ingredient', { method: 'POST', body: formData }),
  sendChat: (message) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  checkRoutine: () => request('/user/routine', { method: 'PUT' }),
  updateBudget: (budget) => request('/user/budget', {
    method: 'PUT',
    body: JSON.stringify({ budget })
  }),
};
