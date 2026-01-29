// Profile Service
// Handles all profile-related API calls

import { apiRequest } from './api.js';

/**
 * Get current user profile data
 * @returns {Promise<object>} - Profile data with user and employee information
 */
const getProfileMe = async () => {
  try {
    console.log('📤 Fetching profile data from /profile/me');
    
    const response = await apiRequest('/profile/me', {
      method: 'GET',
    });

    console.log('✅ Profile data loaded successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch profile data:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 404) {
      throw new Error('Profile not found. Please contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to fetch profile data. Please try again.');
    }
  }
};

/**
 * Update current user profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} - Updated profile data
 */
const updateProfile = async (profileData) => {
  try {
    console.log('📤 Updating profile data to /profile/me', profileData);
    
    const response = await apiRequest('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });

    console.log('✅ Profile updated successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 400) {
      throw new Error(error.message || 'Invalid data. Please check your input.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to update profile. Please try again.');
    }
  }
};

/**
 * Update personal information
 * @param {object} personalData - Personal information to update
 * @returns {Promise<object>} - Updated profile data
 */
const updatePersonalInfo = async (personalData) => {
  try {
    console.log('📤 Updating personal info to /profile/personal-info', personalData);
    
    const response = await apiRequest('/profile/personal-info', {
      method: 'PUT',
      body: JSON.stringify(personalData),
    });

    console.log('✅ Personal info updated successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to update personal info:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 400) {
      throw new Error(error.message || 'Invalid data. Please check your input.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to update personal info. Please try again.');
    }
  }
};

/**
 * Update emergency contact information
 * @param {object} emergencyContactData - Emergency contact data to update
 * @returns {Promise<object>} - Updated profile data
 */
const updateEmergencyContact = async (emergencyContactData) => {
  try {
    console.log('📤 Updating emergency contact to /profile/emergency-contact', emergencyContactData);
    
    const response = await apiRequest('/profile/emergency-contact', {
      method: 'PUT',
      body: JSON.stringify(emergencyContactData),
    });

    console.log('✅ Emergency contact updated successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to update emergency contact:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 400) {
      throw new Error(error.message || 'Invalid data. Please check your input.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to update emergency contact. Please try again.');
    }
  }
};

export { getProfileMe, updateProfile, updatePersonalInfo, updateEmergencyContact };
