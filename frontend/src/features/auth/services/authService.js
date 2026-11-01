import { apiRequest } from '../../../services/api';

/**
 * Authentication Service
 * Communicates with FastAPI /api/v1/auth endpoints.
 */

export async function registerUser(email, password) {
  return await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  return await apiRequest('/auth/login', {
    method: 'POST',
    body: formData,
  });
}

export async function getCurrentUser() {
  return await apiRequest('/auth/me', {
    method: 'GET',
  });
}

