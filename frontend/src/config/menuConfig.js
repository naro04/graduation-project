// Menu Configuration for all Roles - with Submenus Support

export const menuConfig = {
  // Super Admin - كل الصلاحيات
  superAdmin: {
    role: "Super Admin",
    items: [
      { 
        id: 1, 
        name: "Dashboard", 
        icon: "Dashboard.png", 
        path: "/dashboard", 
        hasSubmenu: false 
      },
      { 
        id: 2, 
        name: "User Management", 
        icon: "User Management.png", 
        path: "/user-management", 
        hasSubmenu: true,
        subItems: [
          { id: "2-1", name: "Employees", path: "/user-management/employees" },
          { id: "2-2", name: "Roles & Permissions", path: "/user-management/roles" },
          { id: "2-3", name: "Departments", path: "/user-management/departments" },
        ]
      },
      { 
        id: 3, 
        name: "Attendance", 
        icon: "Attendance.png", 
        path: "/attendance", 
        hasSubmenu: true,
        subItems: [
          { id: "3-1", name: "Daily Attendance", path: "/attendance/daily" },
          { id: "3-2", name: "GPS Verification", path: "/attendance/gps" },
          { id: "3-3", name: "My Attendance", path: "/attendance/my" },
        ]
      },
      { 
        id: 4, 
        name: "Activities", 
        icon: "Activities.png", 
        path: "/activities", 
        hasSubmenu: false
      },
      { 
        id: 5, 
        name: "Locations Management", 
        icon: "Locations Management.png", 
        path: "/locations", 
        hasSubmenu: true,
        subItems: [
          { id: "5-1", name: "Locations", path: "/locations/all" },
          { id: "5-2", name: "Location Type", path: "/locations/types" },
          { id: "5-3", name: "Location Assignment", path: "/locations/assignment" },
        ]
      },
      { 
        id: 6, 
        name: "Leave Management", 
        icon: "Leave Management.png", 
        path: "/leave", 
        hasSubmenu: true,
        subItems: [
          { id: "6-1", name: "Leave Requests", path: "/leave/requests" },
          { id: "6-3", name: "My Leave", path: "/leave/my" },
        ]
      },
      { 
        id: 7, 
        name: "Reports", 
        icon: "Reports.png", 
        path: "/reports", 
        hasSubmenu: true,
        subItems: [
          { id: "7-1", name: "Attendance Reports", path: "/reports/attendance" },
          { id: "7-2", name: "Field Activity Reports", path: "/reports/activities" },
          { id: "7-3", name: "Leave Reports", path: "/reports/leave" },
          { id: "7-4", name: "HR Reports", path: "/reports/hr" },
        ]
      },
      { 
        id: 8, 
        name: "More", 
        icon: "More.png", 
        path: "/more", 
        hasSubmenu: true,
        subItems: [
          { id: "8-1", name: "My Profile", path: "/more/profile" },
          { id: "8-2", name: "System Configuration", path: "/more/config" },
          { id: "8-3", name: "Notifications Settings", path: "/more/notifications" },
          { id: "8-4", name: "API Keys", path: "/more/api-keys" },
          { id: "8-5", name: "Help Center", path: "/more/help" },
          { id: "8-6", name: "Support", path: "/more/support" },
        ]
      },
    ]
  },

  // HR Admin
  hr: {
    role: "HR",
    items: [
      { id: 1, name: "Dashboard", icon: "Dashboard.png", path: "/dashboard", hasSubmenu: false },
      { 
        id: 2, 
        name: "User Management", 
        icon: "User Management.png", 
        path: "/user-management", 
        hasSubmenu: true,
        subItems: [
          { id: "2-1", name: "Employees", path: "/user-management/employees" },
          { id: "2-2", name: "Departments", path: "/user-management/departments" },
        ]
      },
      { 
        id: 3, 
        name: "Attendance", 
        icon: "Attendance.png", 
        path: "/attendance", 
        hasSubmenu: true,
        subItems: [
          { id: "3-1", name: "Daily Attendance", path: "/attendance/daily" },
          { id: "3-2", name: "GPS Verification", path: "/attendance/gps" },
          { id: "3-3", name: "My Attendance", path: "/attendance/my" },
        ]
      },
      { 
        id: 4, 
        name: "Activities", 
        icon: "Activities.png", 
        path: "/activities", 
        hasSubmenu: false
      },
      { 
        id: 5, 
        name: "Leave Management", 
        icon: "Leave Management.png", 
        path: "/leave", 
        hasSubmenu: true,
        subItems: [
          { id: "5-1", name: "Leave Requests", path: "/leave/requests" },
          { id: "5-2", name: "Request Leave", path: "/leave/request" },
          { id: "5-3", name: "My Leave", path: "/leave/my" },
        ]
      },
      { 
        id: 6, 
        name: "Reports", 
        icon: "Reports.png", 
        path: "/reports", 
        hasSubmenu: true,
        subItems: [
          { id: "6-1", name: "HR Reports", path: "/reports/hr" },
          { id: "6-2", name: "Attendance Reports", path: "/reports/attendance" },
          { id: "6-3", name: "Leave Reports", path: "/reports/leave" },
          { id: "6-4", name: "Field Activity Reports", path: "/reports/activities" },
        ]
      },
      { 
        id: 7, 
        name: "More", 
        icon: "More.png", 
        path: "/more", 
        hasSubmenu: true,
        subItems: [
          { id: "7-1", name: "My Profile", path: "/more/profile" },
          { id: "7-2", name: "Help Center", path: "/more/help" },
          { id: "7-3", name: "Support", path: "/more/support" },
        ]
      },
    ]
  },

  // Manager
  manager: {
    role: "Manager",
    items: [
      { id: 1, name: "Dashboard", icon: "Dashboard.png", path: "/dashboard", hasSubmenu: false },
      { 
        id: 2, 
        name: "My Team", 
        icon: "User Management.png", 
        path: "/my-team", 
        hasSubmenu: true,
        subItems: [
          { id: "2-1", name: "Team Members", path: "/my-team/members" },
          { id: "2-2", name: "Team Attendance", path: "/my-team/attendance" },
          { id: "2-3", name: "Team Activities", path: "/my-team/activities" },
          { id: "2-4", name: "Team Leave Requests", path: "/my-team/leave" },
        ]
      },
      { 
        id: 3, 
        name: "Attendance", 
        icon: "Attendance.png", 
        path: "/attendance", 
        hasSubmenu: true,
        subItems: [
          { id: "3-1", name: "Daily Attendance", path: "/attendance/daily" },
          { id: "3-2", name: "My Attendance", path: "/attendance/my" },
        ]
      },
      { 
        id: 4, 
        name: "Activities", 
        icon: "Activities.png", 
        path: "/activities", 
        hasSubmenu: true,
        subItems: [
          { id: "4-1", name: "Activity Approval", path: "/approvals/activities" },
          { id: "4-2", name: "Log Activity", path: "/activities/log" },
          { id: "4-3", name: "My Activities", path: "/activities/my" },
        ]
      },
      { 
        id: 5, 
        name: "Leave", 
        icon: "Leave Management.png", 
        path: "/leave", 
        hasSubmenu: true,
        subItems: [
          { id: "5-1", name: "Leave Requests", path: "/leave/requests" },
          { id: "5-2", name: "Request Leave", path: "/leave/request" },
          { id: "5-3", name: "My Leave", path: "/leave/my" },
        ]
      },
      { 
        id: 6, 
        name: "Reports", 
        icon: "Reports.png", 
        path: "/reports", 
        hasSubmenu: true,
        subItems: [
          { id: "6-1", name: "Team Reports", path: "/reports/team" },
          { id: "6-2", name: "Attendance Reports", path: "/reports/attendance" },
          { id: "6-3", name: "Leave Reports", path: "/reports/leave" },
        ]
      },
      { 
        id: 7, 
        name: "More", 
        icon: "More.png", 
        path: "/more", 
        hasSubmenu: true,
        subItems: [
          { id: "7-1", name: "My Profile", path: "/more/profile" },
          { id: "7-2", name: "Help Center", path: "/more/help" },
          { id: "7-3", name: "Support", path: "/more/support" },
        ]
      },
    ]
  },

  // Field Employee
  fieldEmployee: {
    role: "Field Employee",
    items: [
      { id: 1, name: "Dashboard", icon: "Dashboard.png", path: "/dashboard", hasSubmenu: false },
      { 
        id: 2, 
        name: "Attendance", 
        icon: "Attendance.png", 
        path: "/attendance", 
        hasSubmenu: true,
        subItems: [
          { id: "2-1", name: "My Attendance", path: "/attendance/my" },
        ]
      },
      { 
        id: 3, 
        name: "Activities", 
        icon: "Activities.png", 
        path: "/activities", 
        hasSubmenu: true,
        subItems: [
          { id: "3-1", name: "Log Activity", path: "/activities/log" },
          { id: "3-2", name: "My Activities", path: "/activities/my" },
        ]
      },
      { 
        id: 4, 
        name: "Leave", 
        icon: "Leave Management.png", 
        path: "/leave", 
        hasSubmenu: true,
        subItems: [
          { id: "4-1", name: "Request Leave", path: "/leave/request" },
          { id: "4-2", name: "My Leave", path: "/leave/my" },
        ]
      },
      { 
        id: 5, 
        name: "More", 
        icon: "More.png", 
        path: "/more", 
        hasSubmenu: true,
        subItems: [
          { id: "5-1", name: "My Profile", path: "/more/profile" },
          { id: "5-2", name: "Help Center", path: "/more/help" },
          { id: "5-3", name: "Support", path: "/more/support" },
        ]
      },
    ]
  },

  // Officer
  officer: {
    role: "Officer",
    items: [
      { id: 1, name: "Dashboard", icon: "Dashboard.png", path: "/dashboard", hasSubmenu: false },
      { 
        id: 2, 
        name: "Attendance", 
        icon: "Attendance.png", 
        path: "/attendance", 
        hasSubmenu: true,
        subItems: [
          { id: "2-1", name: "My Attendance", path: "/attendance/my" },
        ]
      },
      { 
        id: 3, 
        name: "Leave", 
        icon: "Leave Management.png", 
        path: "/leave", 
        hasSubmenu: true,
        subItems: [
          { id: "3-1", name: "Request Leave", path: "/leave/request" },
          { id: "3-2", name: "My Leave", path: "/leave/my" },
        ]
      },
      { 
        id: 4, 
        name: "More", 
        icon: "More.png", 
        path: "/more", 
        hasSubmenu: true,
        subItems: [
          { id: "4-1", name: "My Profile", path: "/more/profile" },
          { id: "4-2", name: "Help Center", path: "/more/help" },
          { id: "4-3", name: "Support", path: "/more/support" },
        ]
      },
    ]
  },
};

// Helper function to get menu by role
export const getMenuByRole = (role) => {
  return menuConfig[role] || menuConfig.officer;
};
