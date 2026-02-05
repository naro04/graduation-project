// Profile Service
// GET /profile/me, PATCH /profile/me, GET/PUT personal-info, GET job-info, GET/PUT emergency-contact, GET work-schedule, GET account-security

import { apiClient } from "./apiClient";

const handleApiError = (error, fallbackMessage) => {
  if (error.response?.status === 401) throw new Error("Session expired. Please login again.");
  if (error.response?.status === 404) throw new Error("Profile not found. Please contact support.");
  if (error.response?.status === 500) throw new Error("Internal server error. Please try again later or contact support.");
  if (error.response?.status === 400) throw new Error(error.response?.data?.message || "Invalid data. Please check your input.");
  throw error?.message ? error : new Error(fallbackMessage);
};

/**
 * Get current user profile (main)
 * GET http://localhost:5000/api/v1/profile/me
 * @returns {Promise<object>} - Profile data (user + employee)
 */
export const getProfileMe = async () => {
  try {
    const response = await apiClient.get("/profile/me");
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch profile data. Please try again.");
  }
};

/**
 * Update current user profile (e.g. password / account security)
 * PATCH http://localhost:5000/api/v1/profile/me
 * @param {object} profileData - e.g. { currentPassword, password }
 * @returns {Promise<object>} - Updated profile data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.patch("/profile/me", profileData);
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to update profile. Please try again.");
  }
};

/**
 * Get personal information
 * GET http://localhost:5000/api/v1/profile/personal-info
 * @returns {Promise<object>} - Personal info (name, email, phone, birthDate, gender, etc.)
 */
export const getPersonalInfo = async () => {
  try {
    const response = await apiClient.get("/profile/personal-info");
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to load personal info. Please try again.");
  }
};

/**
 * Update personal information
 * PUT http://localhost:5000/api/v1/profile/personal-info
 * @param {object} personalData - firstName, lastName, email, phone, birthDate, gender, maritalStatus, etc.
 * @returns {Promise<object>} - Updated personal info
 */
export const updatePersonalInfo = async (personalData) => {
  try {
    const response = await apiClient.put("/profile/personal-info", personalData);
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to update personal info. Please try again.");
  }
};

/**
 * Get job information
 * GET http://localhost:5000/api/v1/profile/job-info
 * @returns {Promise<object>} - Job info (department, position, etc.)
 */
export const getJobInfo = async () => {
  try {
    const response = await apiClient.get("/profile/job-info");
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to load job info. Please try again.");
  }
};

/**
 * Get emergency contact(s)
 * GET http://localhost:5000/api/v1/profile/emergency-contact
 * @returns {Promise<object|Array>} - Emergency contact(s)
 */
export const getEmergencyContact = async () => {
  try {
    const response = await apiClient.get("/profile/emergency-contact");
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to load emergency contact. Please try again.");
  }
};

/**
 * Update emergency contact(s)
 * PUT http://localhost:5000/api/v1/profile/emergency-contact
 * @param {object} data - e.g. { emergencyContacts: [...] }
 * @returns {Promise<object>} - Updated data
 */
export const updateEmergencyContact = async (data) => {
  try {
    const response = await apiClient.put("/profile/emergency-contact", data);
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to update emergency contact. Please try again.");
  }
};

/**
 * Get work schedule
 * GET http://localhost:5000/api/v1/profile/work-schedule
 * @returns {Promise<object>} - Work schedule
 */
export const getWorkSchedule = async () => {
  try {
    const response = await apiClient.get("/profile/work-schedule");
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to load work schedule. Please try again.");
  }
};

/**
 * Get account security info
 * GET http://localhost:5000/api/v1/profile/account-security
 * @returns {Promise<object>} - Account security (e.g. 2FA status, last login)
 */
export const getAccountSecurity = async () => {
  try {
    const response = await apiClient.get("/profile/account-security");
    return response.data?.data ?? response.data;
  } catch (error) {
    handleApiError(error, "Failed to load account security. Please try again.");
  }
};
