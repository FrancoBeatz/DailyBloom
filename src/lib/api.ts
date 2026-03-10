/**
 * API configuration and helper functions for connecting to the backend.
 */

// Use the VITE_API_URL if provided, otherwise default to the Render backend URL
export const API_BASE_URL = process.env.VITE_API_URL || 'https://dailybloom-6y1q.onrender.com';

/**
 * Helper to construct API URLs
 */
export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_BASE_URL}/api/${cleanPath}`;
};

/**
 * Basic fetch wrapper with error handling
 */
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const url = getApiUrl(path);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch error for ${url}:`, error);
    throw error;
  }
};
