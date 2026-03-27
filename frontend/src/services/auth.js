// Authentication Service
// Handles all authentication-related API calls

import { apiRequest, setToken, removeToken, getToken } from './api.js';
import { isJwtExpired } from '../utils/jwt.js';

/**
 * Clear stored session on the client (token + cached user). Does not call the API.
 */
const clearClientSession = () => {
  removeToken();
  localStorage.removeItem('userData');
  sessionStorage.removeItem('userData');
};

/**
 * True when a JWT is stored and, if it is a standard JWT with exp, it is not expired.
 * Expired tokens are cleared so the UI matches server-side session rules.
 */
const hasValidAuthSession = () => {
  const token = getToken();
  if (!token || typeof token !== 'string' || !token.trim()) return false;
  if (isJwtExpired(token)) {
    clearClientSession();
    return false;
  }
  return true;
};

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

    // الباكند يرجّع role_name؛ نضبط role عشان السايدبار واسم الرول يظهران صح
    if (userData && userData.role_name && !userData.role) {
      userData.role = userData.role_name;
    }

    // Always try /auth/me after login so userData includes full profile fields (e.g. avatar)
    if (token) {
      try {
        console.log('📤 Fetching complete user data from /auth/me after login');
        const meResponse = await apiRequest('/auth/me', { method: 'GET' });
        if (meResponse.data?.user) {
          userData = meResponse.data.user;
        } else if (meResponse.user) {
          userData = meResponse.user;
        } else if (meResponse.data) {
          userData = meResponse.data;
        }
      } catch (meError) {
        console.warn('⚠️ Failed to fetch /auth/me, using login response data:', meError);
      }
    }

    if (userData && userData.role_name && !userData.role) {
      userData.role = userData.role_name;
    }

    // Keep only one storage target based on rememberMe preference
    if (userData) {
      if (rememberMe) {
        sessionStorage.removeItem('userData');
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        localStorage.removeItem('userData');
        sessionStorage.setItem('userData', JSON.stringify(userData));
      }
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
 * Register new user (normal signup only; do not use for Google signup).
 * POST /api/v1/auth/register
 * Backend requires: privacyPolicyAgreement (boolean), name OR (firstName+lastName), email, password, confirmPassword (optional).
 * We send name from firstName + lastName. No agreeToPrivacyPolicy / agreeToTermsPolicy.
 */
const register = async (data) => {
  try {
    const requestData = {
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
      privacyPolicyAgreement: data.privacyPolicyAgreement === true,
    };
    console.log('📤 Sending register request with data:', { ...requestData, password: '***', confirmPassword: '***' });
    
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
 * Google OAuth login/signup. POST /api/v1/auth/google
 * Backend requires: { googleToken: ACCESS_TOKEN } — must be Google access_token (not ID token/credential).
 * Call with token from initTokenClient callback: tokenResponse.access_token.
 */
const googleAuth = async (accessToken) => {
  try {
    const requestData = { googleToken: accessToken };
    console.log('📤 Sending Google OAuth request (googleToken)');
    
    const response = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify(requestData),
      credentials: 'include',
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
    clearClientSession();
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
  return hasValidAuthSession();
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
 * Update stored user's avatar URL (so header avatar updates on all pages after profile picture change)
 * @param {string} avatarUrl - New avatar URL or path
 */
const updateStoredUserAvatar = (avatarUrl) => {
  const user = getCurrentUser();
  if (!user) return;
  const next = { ...user, avatar_url: avatarUrl || user.avatar_url, avatarUrl: avatarUrl || user.avatarUrl };
  try {
    if (localStorage.getItem('userData')) localStorage.setItem('userData', JSON.stringify(next));
    if (sessionStorage.getItem('userData')) sessionStorage.setItem('userData', JSON.stringify(next));
  } catch (e) {
    console.warn('updateStoredUserAvatar:', e);
  }
};

/**
 * Get effective role key for menu/UI from current user (so Manager stays Manager on all pages)
 * @param {string} fallback - fallback role if no user (e.g. from route)
 * @returns {string} - role key: superAdmin | hr | manager | fieldEmployee | officer
 */
const getEffectiveRole = (fallback = 'superAdmin') => {
  const user = getCurrentUser();
  if (!user) return fallback;
  const role = user.role ?? user.role_name ?? user.roles?.[0];
  if (!role || typeof role !== 'string') return fallback;
  const r = role.toLowerCase().trim();
  if (r === 'super admin' || r === 'superadmin') return 'superAdmin';
  if (r === 'hr' || r === 'hr admin' || r === 'hradmin') return 'hr';
  if (r === 'manager') return 'manager';
  if (r === 'field employee' || r === 'fieldemployee' || r === 'field worker') return 'fieldEmployee';
  if (r === 'officer' || r === 'office staff') return 'officer';
  return fallback;
};

const normalizePermissionSlug = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[\/\s]+/g, "_")
    .replace(/[^a-z0-9:_,-]/g, "");

const hasAnyPermission = (requiredPermissions = [], userPermissions = null) => {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) return true;

  const perms = Array.isArray(userPermissions)
    ? userPermissions
    : (getCurrentUser()?.permissions || []);
  if (!Array.isArray(perms) || perms.length === 0) return false;

  const normalizedUserPerms = new Set(perms.map(normalizePermissionSlug).filter(Boolean));
  return requiredPermissions
    .map(normalizePermissionSlug)
    .filter(Boolean)
    .some((p) => normalizedUserPerms.has(p));
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

    // Keep permissions from existing cached session if /auth/me does not return them
    const existingUser = getCurrentUser();
    if (userData && (!Array.isArray(userData.permissions) || userData.permissions.length === 0) && Array.isArray(existingUser?.permissions)) {
      userData.permissions = existingUser.permissions;
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
      clearClientSession();
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

/**
 * Request password reset link
 * POST /auth/forgot-password
 * @param {string} email - User email
 * @returns {Promise<object>} - { status, message }
 */
const forgotPassword = async (email) => {
  const response = await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
  return response;
};

/**
 * Reset password with token from email
 * PATCH /auth/reset-password
 * @param {string} token - Reset token from URL
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<object>} - { status, message }
 */
const resetPassword = async (token, password, confirmPassword) => {
  const response = await apiRequest('/auth/reset-password', {
    method: 'PATCH',
    body: JSON.stringify({ token, password, confirmPassword }),
  });
  return response;
};

export { login, register, googleAuth, logout, getAuthToken, isAuthenticated, hasValidAuthSession, clearClientSession, getCurrentUser, getEffectiveRole, getMe, forgotPassword, resetPassword, updateStoredUserAvatar, hasAnyPermission };
