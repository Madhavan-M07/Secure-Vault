import { apiRequest } from '../../../services/api';

/**
 * Document & Vault Service
 * Connects directly to FastAPI /api/v1/documents, /api/v1/shared, /api/v1/activity, and /api/v1/settings
 */

export async function getDashboardStats() {
  return await apiRequest('/documents/dashboard-stats', {
    method: 'GET',
  });
}

export async function getCategoriesSummary() {
  return await apiRequest('/documents/categories-summary', {
    method: 'GET',
  });
}

export async function getRecentDocuments(limit = 5) {
  return await apiRequest(`/documents/recent?limit=${limit}`, {
    method: 'GET',
  });
}

export async function getDocuments({ category, search } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All' && category !== 'All Categories') {
    params.append('category', category);
  }
  if (search && search.trim()) {
    params.append('search', search.trim());
  }

  const query = params.toString();
  const endpoint = query ? `/documents/?${query}` : '/documents/';

  return await apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function uploadDocument(file, title, category = 'Academic') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('category', category);

  return await apiRequest('/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteDocument(documentId) {
  return await apiRequest(`/documents/${documentId}`, {
    method: 'DELETE',
  });
}

// --- SHARED LINKS API ---

export async function getSharedLinks() {
  return await apiRequest('/shared/', {
    method: 'GET',
  });
}

export async function getSharedStats() {
  return await apiRequest('/shared/stats', {
    method: 'GET',
  });
}

export async function createShareLink({ document_id, recipient_email, permission, expires_in_days = 7 }) {
  return await apiRequest('/shared/', {
    method: 'POST',
    body: JSON.stringify({
      document_id: Number(document_id),
      recipient_email,
      permission,
      expires_in_days: Number(expires_in_days),
    }),
  });
}

export async function deleteShareLink(linkId) {
  return await apiRequest(`/shared/${linkId}`, {
    method: 'DELETE',
  });
}

export async function accessSharedDocument(shareToken) {
  return await apiRequest(`/shared/access/${shareToken}`, {
    method: 'GET',
  });
}

// --- ACTIVITY & AUDIT LOGS API ---

export async function getActivityLogs(category = null) {
  const endpoint = category && category !== 'All Activity' 
    ? `/activity/?category=${encodeURIComponent(category)}`
    : '/activity/';
  return await apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function getActivityStats() {
  return await apiRequest('/activity/stats', {
    method: 'GET',
  });
}

// --- USER SETTINGS & PREFERENCES API ---

export async function getUserSettings() {
  return await apiRequest('/settings/', {
    method: 'GET',
  });
}

export async function updateUserSettings(settingsPayload) {
  return await apiRequest('/settings/', {
    method: 'PUT',
    body: JSON.stringify(settingsPayload),
  });
}
