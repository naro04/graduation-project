const swaggerUi = require('swagger-ui-express');

// --- API PATHS ---
const paths = {
  // --- Dashboard ---
  '/': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get dashboard statistics',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'object' } } }
        } 
      }
    }
  },

  // --- Authentication ---
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'User Login',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, rememberMe: { type: 'boolean' } } } } },
      },
      responses: { 
        200: { 
          description: 'Login successful',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
        }, 
        401: { description: 'Unauthorized' } 
      },
    },
  },
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'User Registration',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, phone: { type: 'string' } } } } },
      },
      responses: { 
        201: { 
          description: 'User created',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Employee' } } }
        } 
      },
    },
  },
  '/auth/google': {
    post: {
      tags: ['Authentication'],
      summary: 'Google OAuth login/signup',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } },
      },
      responses: { 200: { description: 'Success' } },
    },
  },
  '/auth/forgot-password': {
    post: {
      tags: ['Authentication'],
      summary: 'Request password reset',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } },
      },
      responses: { 200: { description: 'Email sent' } },
    },
  },
  '/auth/reset-password': {
    patch: {
      tags: ['Authentication'],
      summary: 'Reset password with token',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, password: { type: 'string' } } } } },
      },
      responses: { 200: { description: 'Password reset' } },
    },
  },
  '/auth/logout': {
    get: {
      tags: ['Authentication'],
      summary: 'User logout',
      responses: { 200: { description: 'Logged out' } },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user data',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
        } 
      }
    }
  },

  // --- Profile ---
  '/profile/me': {
    get: {
      tags: ['Profile'],
      summary: 'Get current user profile',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Employee' } } }
        } 
      }
    },
    patch: {
      tags: ['Profile'],
      summary: 'Update current user profile',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/profile/personal-info': {
    get: {
      tags: ['Profile'],
      summary: 'Get personal information',
      responses: { 200: { description: 'Success' } }
    },
    put: {
      tags: ['Profile'],
      summary: 'Update personal information',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/profile/job-info': {
    get: {
      tags: ['Profile'],
      summary: 'Get job information',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/profile/emergency-contact': {
    get: {
      tags: ['Profile'],
      summary: 'Get emergency contact',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EmergencyContact' } } }
        } 
      }
    },
    put: {
      tags: ['Profile'],
      summary: 'Update emergency contact',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/profile/work-schedule': {
    get: {
      tags: ['Profile'],
      summary: 'Get work schedule (Routine + Assignments)',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'object', properties: { routine: { type: 'array' }, assignments: { type: 'array' } } } } }
        } 
      }
    }
  },
  '/profile/account-security': {
    get: {
      tags: ['Profile'],
      summary: 'Get account security settings',
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- RBAC ---
  '/rbac/roles': {
    get: {
      tags: ['RBAC'],
      summary: 'Get all roles',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Role' } } } }
        } 
      }
    },
    post: {
      tags: ['RBAC'],
      summary: 'Create a new role',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/rbac/roles/{id}': {
    get: {
      tags: ['RBAC'],
      summary: 'Get role by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Role' } } }
        } 
      }
    },
    put: {
      tags: ['RBAC'],
      summary: 'Update role',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['RBAC'],
      summary: 'Delete role',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/rbac/permissions': {
    get: {
      tags: ['RBAC'],
      summary: 'Get all permissions',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Permission' } } } }
        } 
      }
    },
    post: {
      tags: ['RBAC'],
      summary: 'Create a permission',
      responses: { 201: { description: 'Created' } }
    }
  },

  // --- Departments ---
  '/departments': {
    get: {
      tags: ['Departments'],
      summary: 'Get all departments',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Department' } } } }
        } 
      }
    },
    post: {
      tags: ['Departments'],
      summary: 'Create a department',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/departments/bulk-action': {
    post: {
      tags: ['Departments'],
      summary: 'Bulk action on departments',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/departments/{id}': {
    get: {
      tags: ['Departments'],
      summary: 'Get department by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Department' } } }
        } 
      }
    },
    put: {
      tags: ['Departments'],
      summary: 'Update department',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Departments'],
      summary: 'Delete department',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Employees ---
  '/employees': {
    get: {
      tags: ['Employees'],
      summary: 'Get all employees',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Employee' } } } }
        } 
      }
    },
    post: {
      tags: ['Employees'],
      summary: 'Create a new employee',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/employees/team/members': {
    get: {
      tags: ['Employees'],
      summary: 'Get members reporting to me (Manager)',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Employee' } } } }
        } 
      }
    }
  },
  '/employees/reports': {
    get: {
      tags: ['Employees'],
      summary: 'Get HR reports',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/employees/bulk-action': {
    post: {
      tags: ['Employees'],
      summary: 'Bulk action on employees',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/employees/{id}': {
    get: {
      tags: ['Employees'],
      summary: 'Get employee by ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Employee' } } }
        } 
      }
    },
    put: {
      tags: ['Employees'],
      summary: 'Update employee',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    patch: {
      tags: ['Employees'],
      summary: 'Partial update employee',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Employees'],
      summary: 'Delete/Disable employee',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Positions ---
  '/positions': {
    get: {
      tags: ['Positions'],
      summary: 'Get all positions',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Position' } } } }
        } 
      }
    },
    post: {
      tags: ['Positions'],
      summary: 'Create a position',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/positions/{id}': {
    put: {
      tags: ['Positions'],
      summary: 'Update position',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Positions'],
      summary: 'Delete position',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Location Types ---
  '/location-types': {
    get: {
      tags: ['Location Types'],
      summary: 'Get all location types',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LocationType' } } } }
        } 
      }
    },
    post: {
      tags: ['Location Types'],
      summary: 'Create a location type',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/location-types/{id}': {
    put: {
      tags: ['Location Types'],
      summary: 'Update location type',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Location Types'],
      summary: 'Delete location type',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Locations ---
  '/locations': {
    get: {
      tags: ['Locations'],
      summary: 'Get all locations',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Location' } } } }
        } 
      }
    },
    post: {
      tags: ['Locations'],
      summary: 'Create a location',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/locations/{id}': {
    put: {
      tags: ['Locations'],
      summary: 'Update location',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Locations'],
      summary: 'Delete location',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/locations/{location_id}/employees': {
    get: {
      tags: ['Locations'],
      summary: 'Get employees assigned to location',
      parameters: [{ name: 'location_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/locations/{location_id}/activities': {
    get: {
      tags: ['Locations'],
      summary: 'Get activities at location',
      parameters: [{ name: 'location_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Location Assignments ---
  '/location-assignments': {
    get: {
      tags: ['Location Assignments'],
      summary: 'Get all location assignments',
      responses: { 200: { description: 'Success' } }
    },
    post: {
      tags: ['Location Assignments'],
      summary: 'Assign employee to location',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/location-assignments/{employee_id}/{location_id}': {
    delete: {
      tags: ['Location Assignments'],
      summary: 'Remove employee from location',
      parameters: [
        { name: 'employee_id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'location_id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Location Activities ---
  '/location-activities': {
    get: {
      tags: ['Activities'],
      summary: 'Get all activities',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Activity' } } } }
        } 
      }
    },
    post: {
      tags: ['Activities'],
      summary: 'Create activity',
      responses: { 201: { description: 'Created' } }
    }
  },
  '/location-activities/reports': {
    get: {
      tags: ['Activities'],
      summary: 'Get activity reports',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/location-activities/team': {
    get: {
      tags: ['Activities'],
      summary: 'Get team activities (Manager)',
      description: 'Get activities for employees supervised by the logged-in manager',
      parameters: [
        { name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by date' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by implementation status' },
        { name: 'approvalStatus', in: 'query', schema: { type: 'string' }, description: 'Filter by approval status' },
        { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter by activity type' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by activity name' }
      ],
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'object', properties: { activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } }, stats: { type: 'object' } } } } }
        } 
      }
    }
  },
  '/location-activities/{activity_id}': {
    get: {
      tags: ['Activities'],
      summary: 'Get activity by ID',
      parameters: [{ name: 'activity_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Activity' } } }
        } 
      }
    },
    put: {
      tags: ['Activities'],
      summary: 'Update activity',
      parameters: [{ name: 'activity_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    },
    delete: {
      tags: ['Activities'],
      summary: 'Delete activity',
      parameters: [{ name: 'activity_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/location-activities/{activity_id}/approve': {
    patch: {
      tags: ['Activities'],
      summary: 'Approve activity',
      parameters: [{ name: 'activity_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/location-activities/{activity_id}/reject': {
    patch: {
      tags: ['Activities'],
      summary: 'Reject activity',
      parameters: [{ name: 'activity_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Attendance ---
  '/attendance/check-in': {
    post: {
      tags: ['Attendance'],
      summary: 'Record attendance check-in',
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { locationId: { type: 'string' }, method: { type: 'string', enum: ['GPS', 'QR', 'MANUAL'] } } } } }
      },
      responses: { 200: { description: 'Checked in' } }
    }
  },
  '/attendance/check-out': {
    post: {
      tags: ['Attendance'],
      summary: 'Record attendance check-out',
      responses: { 200: { description: 'Checked out' } }
    }
  },
  '/attendance/my-attendance': {
    get: {
      tags: ['Attendance'],
      summary: 'Get my attendance history',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } } } }
        } 
      }
    }
  },
  '/attendance/daily': {
    get: {
      tags: ['Attendance'],
      summary: 'Get daily attendance (HR)',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/attendance/team': {
    get: {
      tags: ['Attendance'],
      summary: 'Get team attendance (Manager)',
      description: 'Get attendance records for employees supervised by the logged-in manager',
      parameters: [
        { name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by date' },
        { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filter by location' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by employee name' }
      ],
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } }, stats: { type: 'object' } } } } }
        } 
      }
    }
  },
  '/attendance/reports': {
    get: {
      tags: ['Attendance'],
      summary: 'Get attendance reports',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/attendance/locations': {
    get: {
      tags: ['Attendance'],
      summary: 'Get locations available for check-in',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/attendance/{id}': {
    delete: {
      tags: ['Attendance'],
      summary: 'Delete attendance record',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Leaves ---
  '/leaves': {
    get: {
      tags: ['Leaves'],
      summary: 'Get all leave requests (Admin/HR)',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LeaveRequest' } } } }
        } 
      }
    },
    post: {
      tags: ['Leaves'],
      summary: 'Submit a leave request',
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { leaveType: { type: 'string' }, startDate: { type: 'string', format: 'date' }, endDate: { type: 'string', format: 'date' }, reason: { type: 'string' } } } } }
      },
      responses: { 201: { description: 'Leave requested' } },
    },
    delete: {
      tags: ['Leaves'],
      summary: 'Bulk delete leave requests',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/leaves/my': {
    get: {
      tags: ['Leaves'],
      summary: 'Get my leave requests',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/leaves/team': {
    get: {
      tags: ['Leaves'],
      summary: 'Get team leave requests (Manager)',
      description: 'Get leave requests for employees supervised by the logged-in manager',
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by employee name' },
        { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter by leave type' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status' }
      ],
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/LeaveRequest' } }, stats: { type: 'object' } } } } }
        } 
      }
    }
  },
  '/leaves/my-stats': {
    get: {
      tags: ['Leaves'],
      summary: 'Get my leave balance stats',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LeaveBalance' } } } }
        } 
      }
    }
  },
  '/leaves/reports': {
    get: {
      tags: ['Leaves'],
      summary: 'Get leave reports',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/leaves/{id}/status': {
    put: {
      tags: ['Leaves'],
      summary: 'Update leave request status',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- GPS Verifications ---
  '/gps-verifications': {
    get: {
      tags: ['GPS Verifications'],
      summary: 'Get GPS verifications',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/gps-verifications/stats': {
    get: {
      tags: ['GPS Verifications'],
      summary: 'Get GPS verification stats',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/gps-verifications/{attendance_id}/verify': {
    post: {
      tags: ['GPS Verifications'],
      summary: 'Verify GPS for attendance record',
      parameters: [{ name: 'attendance_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/gps-verifications/{attendance_id}/status': {
    put: {
      tags: ['GPS Verifications'],
      summary: 'Update GPS verification status',
      parameters: [{ name: 'attendance_id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Notifications ---
  '/notifications/settings': {
    get: {
      tags: ['Notifications'],
      summary: 'Get notification settings',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationSettings' } } }
        } 
      }
    },
    put: {
      tags: ['Notifications'],
      summary: 'Update notification settings',
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Help ---
  '/help/content': {
    get: {
      tags: ['Help'],
      summary: 'Get help content',
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- System Settings ---
  '/system-settings': {
    get: {
      tags: ['System Settings'],
      summary: 'Get system configuration',
      responses: { 200: { description: 'Success' } }
    },
    put: {
      tags: ['System Settings'],
      summary: 'Update system configuration',
      responses: { 200: { description: 'Updated' } }
    }
  },
  '/system-settings/history': {
    get: {
      tags: ['System Settings'],
      summary: 'Get configuration change history',
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- Support ---
  '/support/tickets': {
    get: {
      tags: ['Support'],
      summary: 'Get support tickets',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/SupportTicket' } } } }
        } 
      }
    },
    post: {
      tags: ['Support'],
      summary: 'Create a support ticket',
      requestBody: {
        content: { 'application/json': { schema: { type: 'object', properties: { subject: { type: 'string' }, message: { type: 'string' }, priority: { type: 'string' } } } } }
      },
      responses: { 201: { description: 'Ticket created' } }
    }
  },

  // --- Projects ---
  '/projects': {
    get: {
      tags: ['Projects'],
      summary: 'Get all active projects',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } } } }
        } 
      }
    }
  },

  // --- Uploads ---
  '/uploads/upload-images': {
    post: {
      tags: ['Uploads'],
      summary: 'Upload multiple images',
      responses: { 200: { description: 'Success' } }
    }
  },
  '/uploads/delete-image': {
    delete: {
      tags: ['Uploads'],
      summary: 'Delete an uploaded image',
      responses: { 200: { description: 'Success' } }
    }
  },

  // --- API Keys ---
  '/api-keys': {
    get: {
      tags: ['API Keys'],
      summary: 'Get API keys',
      responses: { 
        200: { 
          description: 'Success',
          content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/APIKey' } } } }
        } 
      }
    },
    post: {
      tags: ['API Keys'],
      summary: 'Create an API key',
      responses: { 201: { description: 'Created' } }
    },
    delete: {
      tags: ['API Keys'],
      summary: 'Delete API key',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  },
  '/api-keys/{id}/rotate': {
    put: {
      tags: ['API Keys'],
      summary: 'Rotate API key',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Success' } }
    }
  }
};

// --- DATA SCHEMAS ---
const schemas = {
  Error: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      error: { type: 'string' }
    }
  },
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      avatar_url: { type: 'string', nullable: true },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  },
  Employee: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      employee_code: { type: 'string' },
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      full_name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      department_id: { type: 'string', format: 'uuid' },
      position_id: { type: 'string', format: 'uuid' },
      role_id: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['active', 'inactive'] },
      hired_at: { type: 'string', format: 'date-time' }
    }
  },
  Department: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' }
    }
  },
  Position: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      title: { type: 'string' },
      department_id: { type: 'string', format: 'uuid' },
      description: { type: 'string' }
    }
  },
  Role: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string' }
    }
  },
  Permission: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      slug: { type: 'string' },
      display_name: { type: 'string' },
      permission_type: { type: 'string', enum: ['menu', 'action'] }
    }
  },
  Attendance: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      employee_id: { type: 'string', format: 'uuid' },
      check_in_time: { type: 'string', format: 'date-time' },
      check_out_time: { type: 'string', format: 'date-time', nullable: true },
      gps_status: { type: 'string' },
      daily_status: { type: 'string' }
    }
  },
  LeaveRequest: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      employee_id: { type: 'string', format: 'uuid' },
      leave_type: { type: 'string' },
      start_date: { type: 'string', format: 'date' },
      end_date: { type: 'string', format: 'date' },
      status: { type: 'string', enum: ['pending', 'approved', 'rejected'] }
    }
  },
  LeaveBalance: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      employee_id: { type: 'string', format: 'uuid' },
      leave_type: { type: 'string' },
      total_days: { type: 'integer' },
      used_days: { type: 'integer' }
    }
  },
  LocationType: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string' }
    }
  },
  Location: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      address: { type: 'string' },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      status: { type: 'string' }
    }
  },
  Project: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string' }
    }
  },
  Activity: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      employee_id: { type: 'string', format: 'uuid', nullable: true },
      project_id: { type: 'string', format: 'uuid', nullable: true },
      name: { type: 'string' },
      activity_type: { type: 'string' },
      description: { type: 'string' },
      location_id: { type: 'string', format: 'uuid' },
      status: { type: 'string' },
      implementation_status: { type: 'string' },
      approval_status: { type: 'string' },
      images: { type: 'array', items: { type: 'string' } }
    }
  },
  EmergencyContact: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      employee_id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      relationship: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string', format: 'email' }
    }
  },
  NotificationSettings: {
    type: 'object',
    properties: {
      user_id: { type: 'string', format: 'uuid' },
      attendance_check_in_out_email: { type: 'boolean' },
      attendance_check_in_out_in_app: { type: 'boolean' },
      leave_new_request_email: { type: 'boolean' },
      leave_new_request_in_app: { type: 'boolean' }
    }
  },
  SupportTicket: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      subject: { type: 'string' },
      category: { type: 'string' },
      message: { type: 'string' },
      status: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' }
    }
  },
  APIKey: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      api_key: { type: 'string' },
      status: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' }
    }
  }
};

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'HR Management System API',
    version: '1.0.0',
    description: `
Comprehensive API documentation for the HR Management System. All endpoints are grouped by functional area.

### 🗄️ Database Schema Reference
Below is the structural overview of the database tables used in this project:

\`\`\`sql
-- USERS & AUTH
users (id, email, password_hash, name, avatar_url)
refresh_tokens (id, user_id, token_hash, expires_at)

-- RBAC
roles (id, name, description)
permissions (id, slug, display_name, permission_type)
role_permissions (role_id, permission_id)
user_roles (user_id, role_id)

-- ORGANIZATION
departments (id, name, description, status)
positions (id, title, department_id, description)
employees (id, user_id, employee_code, full_name, email, department_id, position_id, role_id, status)
emergency_contacts (id, employee_id, name, relationship, phone, email)

-- TRACKING
attendance (id, employee_id, check_in_time, check_out_time, gps_status, daily_status)
leave_requests (id, employee_id, leave_type, start_date, end_date, status)
leave_balances (id, employee_id, leave_type, total_days, used_days)

-- FIELD & ACTIVITIES
projects (id, name, description, status)
locations (id, name, address, latitude, longitude, status)
location_types (id, name, description, status)
activities (id, project_id, name, location_id, status, implementation_status)
employee_locations (employee_id, location_id)
activity_employees (activity_id, employee_id)

-- PREFERENCES & SUPPORT
user_notification_settings (user_id, attendance_email, leave_email, etc.)
api_keys (id, user_id, name, api_key, status)
support_tickets (id, user_id, subject, category, message, status)
\`\`\`
`,
  },
  servers: [
    {
      url: `${process.env.API_URL || 'http://localhost:5000'}/api/v1`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: schemas
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: paths
};

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1
    },
    customSiteTitle: "HR System API Documentation"
  }));
  app.get('/api-docs-json', (req, res) => res.json(swaggerSpec));
  const baseUrl = process.env.API_URL || 'http://localhost:5000';
  console.log(`✅ Swagger Documentation: ${baseUrl}/api-docs`);
  console.log(`✅ Swagger JSON: ${baseUrl}/api-docs-json`);
}

module.exports = setupSwagger;
