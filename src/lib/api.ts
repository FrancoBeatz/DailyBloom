/**
 * API configuration and helper functions for connecting to the backend.
 */

// Use the local proxy to avoid CORS issues
export const API_BASE_URL = window.location.origin;

/**
 * Helper to construct API URLs
 */
export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  // Route through our local proxy
  return `${API_BASE_URL}/api/proxy/${cleanPath}`;
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

    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      const errorData = contentType?.includes('application/json') 
        ? await response.json() 
        : { message: `API error: ${response.status}` };
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      const snippet = text.substring(0, 100).replace(/[\n\r]/g, ' ');
      throw new Error(`API response was not JSON. Received: ${snippet}...`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch error for ${url}:`, error);
    throw error;
  }
};
