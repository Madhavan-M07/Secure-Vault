// 1. Single Source of Truth for the Backend API URL
// Read from environment variable, with a safe fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
/**
 * Universal HTTP request wrapper.
 * - Automatically injects JWT Bearer token if logged in
 * - Handles JSON and Form Data encoding
 * - Centralizes error parsing from FastAPI
 */
export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        ...options.headers,
    };

    // 2. Attach JWT token automatically if present in localStorage
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Set Content-Type only if body is raw JSON (not URLSearchParams)
    if (options.body && !(options.body instanceof URLSearchParams) && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // 4. Parse server response
    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    // 5. If server returns an error (4xx or 5xx), throw clean error message
    if (!response.ok) {
        const errorMessage = data?.detail || 'An unexpected error occurred';
        throw new Error(errorMessage);
    }

    return data;
}