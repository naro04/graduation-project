// Authentication Service
// Handles all authentication-related API calls

import { apiRequest, setToken, removeToken, getToken } from './api.js';

/**
 * Login user
 * @param {string} email - User email or ID
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember user
 * @returns {Promise<object>} - User data
 */
const login = async (email, password, rememberMe = false) => {
  try {
    // Log the exact data being sent
    console.log('📤 Sending login request with data:', { email, password: '***', rememberMe });
    
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    // Handle API response structure: { status: "success", token: "...", data: { user: {...} } }
    let token = null;
    let userData = null;

    if (response.token) {
      token = response.token;
    } else if (response.data?.token) {
      token = response.data.token;
    } else if (response.access_token) {
      token = response.access_token;
    }

    if (token) {
      setToken(token);
    }

    // Extract user data from response
    if (response.data?.user) {
      userData = response.data.user;
    } else if (response.user) {
      userData = response.user;
    } else if (response.data) {
      userData = response.data;
    }

    // If rememberMe is true, fetch complete user data from /auth/me endpoint
    // This ensures we have full user data including permissions and role info
    if (rememberMe && token) {
      try {
        console.log('📤 Fetching complete user data from /auth/me (remember me enabled)');
        const meResponse = await apiRequest('/auth/me', {
          method: 'GET',
        });
        
        // Update userData with complete profile from /auth/me
        if (meResponse.data?.user) {
          userData = meResponse.data.user;
        } else if (meResponse.user) {
          userData = meResponse.user;
        } else if (meResponse.data) {
          userData = meResponse.data;
        }
        
        // Store in localStorage for persistent session
        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        console.log('✅ Complete user data stored (remember me)');
      } catch (meError) {
        console.warn('⚠️ Failed to fetch /auth/me, using login response data:', meError);
        // Fallback to storing login response data
        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      }
    } else if (userData) {
      // Store in sessionStorage for non-persistent session
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }

    return response;
  } catch (error) {
    // Re-throw with user-friendly message based on error status
    if (error.status === 401) {
      throw new Error('Invalid email or password. Please try again.');
    } else if (error.status === 500) {
      // If the error message already contains "Internal server error", use it
      if (error.message && error.message.includes('Internal server error')) {
        throw error;
      }
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 400) {
      throw new Error(error.message || 'Invalid request. Please check your input.');
    } else if (error.status === 404) {
      throw new Error('Service not found. Please contact support.');
    } else if (error.message) {
      // Use the error message from the API if available
      throw error;
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

/**
 * Register new user
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} phone - User phone number
 * @returns {Promise<object>} - User data
 */
const register = async (firstName, lastName, email, password, phone) => {
  try {
    const requestData = {
      firstName,
      lastName,
      email,
      password,
      phone,
    };
    console.log('📤 Sending register request with data:', { ...requestData, password: '***' });
    
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    // Store token if provided in response
    if (response.token || response.access_token) {
      const token = response.token || response.access_token;
      setToken(token);
    } else if (response.data?.token) {
      setToken(response.data.token);
    }

    // Store user data if needed
    if (response.user || response) {
      const userData = response.user || response;
      localStorage.setItem('userData', JSON.stringify(userData));
    }

    return response;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    if (error.status === 400) {
      throw new Error(error.message || 'Invalid request. Please check your input.');
    } else if (error.status === 409) {
      throw new Error('Email already exists. Please use a different email.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Registration failed. Please try again.');
    }
  }
};

/**
 * Google OAuth login/signup
 * @param {string} token - Google OAuth token
 * @returns {Promise<object>} - User data
 */
const googleAuth = async (token) => {
  try {
    const requestData = {
      token,
    };
    console.log('📤 Sending Google OAuth request');
    
    const response = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    // Store token if provided in response
    if (response.token || response.access_token) {
      const authToken = response.token || response.access_token;
      setToken(authToken);
    } else if (response.data?.token) {
      setToken(response.data.token);
    }

    // Store user data if needed
    if (response.data?.user || response.user || response) {
      const userData = response.data?.user || response.user || response;
      localStorage.setItem('userData', JSON.stringify(userData));
    }

    return response;
  } catch (error) {
    console.error('❌ Google OAuth failed:', error);
    if (error.status === 400) {
      throw new Error(error.message || 'Invalid Google token. Please try again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Google authentication failed. Please try again.');
    }
  }
};

/**
 * Logout user
 * Calls the backend logout endpoint and clears local storage
 */
const logout = async () => {
  try {
    // Call backend logout endpoint
    console.log('📤 Calling logout endpoint');
    await apiRequest('/auth/logout', {
      method: 'GET',
    });
    console.log('✅ Logout successful');
  } catch (error) {
    // Even if API call fails, we should still clear local data
    console.warn('⚠️ Logout API call failed, clearing local data anyway:', error);
  } finally {
    // Always clear local storage regardless of API response
    removeToken();
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
  }
};

/**
 * Get current user token
 * @returns {string|null} - Auth token or null
 */
const getAuthToken = () => {
  return getToken();
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists
 */
const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get current user data from localStorage/sessionStorage
 * @returns {object|null} - User data or null
 */
const getCurrentUser = () => {
  const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Get effective role key for menu/UI from current user (so Manager stays Manager on all pages)
 * @param {string} fallback - fallback role if no user (e.g. from route)
 * @returns {string} - role key: superAdmin | hr | manager | fieldEmployee | officer
 */
const getEffectiveRole = (fallback = 'superAdmin') => {
  const user = getCurrentUser();
  if (!user) return fallback;
  const role = user.role ?? user.roles?.[0];
  if (!role || typeof role !== 'string') return fallback;
  const r = role.toLowerCase().trim();
  if (r === 'super admin' || r === 'superadmin') return 'superAdmin';
  if (r === 'hr' || r === 'hr admin' || r === 'hradmin') return 'hr';
  if (r === 'manager') return 'manager';
  if (r === 'field employee' || r === 'fieldemployee' || r === 'field worker') return 'fieldEmployee';
  if (r === 'officer' || r === 'office staff') return 'officer';
  return fallback;
};

/**
 * Fetch current user data from API
 * @returns {Promise<object>} - User data with permissions and role info
 */
const getMe = async () => {
  try {
    console.log('📤 Fetching current user data from /auth/me');
    
    const response = await apiRequest('/auth/me', {
      method: 'GET',
    });

    // Handle API response structure: { status: "success", data: { user: {...} } }
    let userData = null;

    if (response.data?.user) {
      userData = response.data.user;
    } else if (response.user) {
      userData = response.user;
    } else if (response.data) {
      userData = response.data;
    }

    // Store user data if available
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }

    return response;
  } catch (error) {
    console.error('❌ Failed to fetch current user:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      // Token expired or invalid - clear stored data
      removeToken();
      localStorage.removeItem('userData');
      sessionStorage.removeItem('userData');
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 404) {
      throw new Error('Service not found. Please contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to fetch user data. Please try again.');
    }
  }
};

export { login, register, googleAuth, logout, getAuthToken, isAuthenticated, getCurrentUser, getEffectiveRole, getMe };
