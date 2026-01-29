// Dashboard Service
// Handles all dashboard-related API calls

import { apiRequest } from './api.js';

/**
 * Get dashboard statistics
 * @returns {Promise<object>} - Dashboard data
 */
const getDashboardStats = async () => {
  try {
    const response = await apiRequest('/dashboard', {
      method: 'GET',
    });
    
    console.log('📊 Dashboard stats received:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch dashboard stats:', error);
    throw error;
  }
};

/**
 * Get organization-wide attendance data
 * @param {string} startDate - Start date (optional)
 * @param {string} endDate - End date (optional)
 * @returns {Promise<object>} - Attendance graph data
 */
const getAttendanceGraph = async (startDate = null, endDate = null) => {
  try {
    // If there's a specific endpoint for attendance graph, use it
    // Otherwise, use the dashboard endpoint
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/dashboard?${queryString}` : '/dashboard';
    
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    
    // Extract attendance graph data from response
    // Adjust based on actual API response structure
    return response.attendanceGraph || response.attendance || response;
  } catch (error) {
    console.error('❌ Failed to fetch attendance graph:', error);
    throw error;
  }
};

export { getDashboardStats, getAttendanceGraph };
