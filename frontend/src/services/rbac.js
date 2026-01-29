// RBAC Service
// Handles all RBAC (Role-Based Access Control) related API calls

import { apiRequest } from './api.js';

/**
 * Get all roles
 * @returns {Promise<Array>} - Array of role objects with id, name, and description
 */
const getRoles = async () => {
  try {
    console.log('📤 Fetching roles from /rbac/roles');
    
    const response = await apiRequest('/rbac/roles', {
      method: 'GET',
    });

    console.log('✅ Roles loaded successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch roles:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 404) {
      throw new Error('Roles endpoint not found. Please contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to fetch roles. Please try again.');
    }
  }
};

/**
 * Get role details by ID including permissions
 * @param {string} roleId - The ID of the role
 * @returns {Promise<object>} - Role object with id, name, description, and permissions array
 */
const getRoleById = async (roleId) => {
  try {
    console.log('📤 Fetching role details from /rbac/roles/' + roleId);
    
    const response = await apiRequest(`/rbac/roles/${roleId}`, {
      method: 'GET',
    });

    console.log('✅ Role details loaded successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch role details:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 404) {
      throw new Error('Role not found. Please check the role ID.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to fetch role details. Please try again.');
    }
  }
};

/**
 * Update role permissions
 * @param {string} roleId - The ID of the role to update
 * @param {Array<string>} permissionIds - Array of permission IDs to assign to the role
 * @returns {Promise<object>} - Updated role object
 */
const updateRole = async (roleId, permissionIds) => {
  try {
    console.log('📤 Updating role permissions to /rbac/roles/' + roleId, permissionIds);
    
    const response = await apiRequest(`/rbac/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify({
        permissionIds: permissionIds
      }),
    });

    console.log('✅ Role updated successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to update role:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 404) {
      throw new Error('Role not found. Please check the role ID.');
    } else if (error.status === 400) {
      throw new Error(error.message || 'Invalid data. Please check your input.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to update role. Please try again.');
    }
  }
};

/**
 * Get all permissions
 * @returns {Promise<Array>} - Array of permission objects with id, resource, action, permissionType, and slug
 */
const getPermissions = async () => {
  try {
    console.log('📤 Fetching permissions from /rbac/permissions');
    
    const response = await apiRequest('/rbac/permissions', {
      method: 'GET',
    });

    console.log('✅ Permissions loaded successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch permissions:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      throw new Error('Session expired. Please login again.');
    } else if (error.status === 500) {
      throw new Error('Internal server error. Please try again later or contact support.');
    } else if (error.status === 404) {
      throw new Error('Permissions endpoint not found. Please contact support.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Failed to fetch permissions. Please try again.');
    }
  }
};

export { getRoles, getRoleById, updateRole, getPermissions };
