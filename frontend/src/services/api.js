// API Service Layer – الباكند على Railway (لوكل ودومين)
const BASE_URL = "https://graduation-project-production-b02b.up.railway.app/api/v1";
//const BASE_URL = "http://localhost:5000/api/v1";

console.log('🌐 API Base URL:', BASE_URL);

/**
 * Get authentication token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Set authentication token in localStorage
 */
const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove authentication token from localStorage
 */
const removeToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Make API request with error handling
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Response data or throws error
 */
const apiRequest = async (endpoint, options = {}) => {
  // Ensure endpoint starts with / if it doesn't
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge options
  const config = {
    ...options,
    headers,
  };

  // Debug logging
  console.log('🔵 API Request:', {
    url,
    method: config.method || 'GET',
    headers,
    body: config.body
  });

  try {
    const response = await fetch(url, config);
    
    console.log('🟢 API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('🟡 Response Data:', data);

    // Handle error responses
    if (!response.ok) {
      console.error('🔴 API Error:', {
        status: response.status,
        data: data
      });
      // Extract error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.msg) {
          errorMessage = data.msg;
        } else if (response.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        } else if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (response.status === 404) {
          errorMessage = 'Service not found. Please contact support.';
        }
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ API Request Failed:', {
      name: error.name,
      message: error.message,
      status: error.status,
      data: error.data
    });
    
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new Error('Network error: Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

export { apiRequest, getToken, setToken, removeToken, BASE_URL };
