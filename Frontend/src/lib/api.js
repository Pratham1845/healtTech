const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AUTH_USER_KEY = 'authUser';

export const getApiBaseUrl = () => API_BASE_URL;

export const getAuthUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const saveAuthUser = (user) => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};

export const clearAuthUser = () => {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem('isLoggedIn');
};

export const getAuthToken = () => getAuthUser()?.token || null;

export const apiFetch = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found. User may not be logged in.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    const payload = await response.json().catch(() => ({}));

    // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      console.error('Authentication failed: Token is invalid or expired');
      console.error('Request path:', path);
      console.error('Token exists:', !!token);
      
      // Clear invalid token
      clearAuthUser();
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login page...');
        window.location.href = '/login';
      }
      
      const error = new Error('Session expired. Please login again.');
      error.status = 401;
      error.isAuthError = true;
      throw error;
    }

    if (!response.ok) {
      const message = payload?.message || payload?.error || 'Request failed';
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    // Network errors (like failed to fetch) don't have response
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error: Cannot reach backend server at', API_BASE_URL);
      const networkError = new Error('Failed to fetch');
      networkError.status = 0;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};
