// Employees Service
// Handles all employee-related API calls

import { apiRequest } from './api.js';

/**
 * Get all employees
 * @returns {Promise<object>} - Response object with status, results, and data array
 */
const getEmployees = async () => {
  try {
    console.log('📤 Fetching employees from /employees');
    
    const response = await apiRequest('/employees', {
      method: 'GET',
    });

    console.log('✅ Employees loaded successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch employees:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 404) {
      throw new Error('Employees endpoint not found. Please contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to fetch employees. Please try again.');
    }
  }
};

/**
 * Create a new employee
 * @param {object} employeeData - Employee data to create
 * @returns {Promise<object>} - Response object with status and data
 */
const createEmployee = async (employeeData) => {
  try {
    console.log('📤 Creating employee:', employeeData);
    
    const response = await apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });

    console.log('✅ Employee created successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to create employee:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 400) {
      throw new Error(error.message || 'Invalid employee data. Please check all fields.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to create employee. Please try again.');
    }
  }
};

export { getEmployees, createEmployee };
