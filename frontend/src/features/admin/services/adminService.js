import { apiRequest } from '../../../services/api';

/**
 * Super Admin & Analytics Service
 * Connects directly to protected FastAPI /api/v1/admin endpoints
 * Requires user.role === 'admin'
 */

export async function getAdminOverview() {
  return await apiRequest('/admin/overview', {
    method: 'GET',
  });
}

export async function getUserGrowth() {
  return await apiRequest('/admin/growth', {
    method: 'GET',
  });
}

export async function getTrafficAnalytics() {
  return await apiRequest('/admin/traffic', {
    method: 'GET',
  });
}

export async function getStorageBreakdown() {
  return await apiRequest('/admin/storage-breakdown', {
    method: 'GET',
  });
}

export async function getGeoDistribution() {
  return await apiRequest('/admin/geo-distribution', {
    method: 'GET',
  });
}

export async function getAdminRecentActivity() {
  return await apiRequest('/admin/recent-activity', {
    method: 'GET',
  });
}

export async function getSystemHealth() {
  return await apiRequest('/admin/system-health', {
    method: 'GET',
  });
}

export async function getAdminUsers() {
  return await apiRequest('/admin/users', {
    method: 'GET',
  });
}

