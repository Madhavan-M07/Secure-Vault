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

    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
        });
    } catch (networkErr) {
        // If initial request failed due to cold boot or dropped connection, retry once automatically
        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            response = await fetch(url, {
                ...options,
                headers,
            });
        } catch {
            throw new Error('Unable to connect to the server. Please check your connection or ensure the backend is running.');
        }
    }

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