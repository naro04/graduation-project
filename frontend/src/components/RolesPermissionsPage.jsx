import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getRoles, getRoleById, updateRole, getPermissions } from "../services/rbac.js";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

const RolesPermissionsPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("2-2");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [rolesData, setRolesData] = useState([]); // Store full role objects with id
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(null);
  const [isLoadingRoleDetails, setIsLoadingRoleDetails] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]); // Store original permissions from API
  const [allPermissions, setAllPermissions] = useState([]); // Store all available permissions from API
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Menu Access Permissions State
  const [menuPermissions, setMenuPermissions] = useState({
    dashboard: false,
    userManagement: {
      enabled: false,
      employees: false,
      rolesPermissions: false,
      departments: false
    },
    attendance: {
      enabled: false,
      dailyAttendance: false,
      gpsVerification: false,
      myAttendance: false
    },
    activities: {
      enabled: false,
      allActivities: false,
      activityApproval: false,
      myActivities: false,
      logActivity: false
    },
    locationsManagement: {
      enabled: false,
      locations: false,
      locationType: false,
      locationAssignment: false
    },
    leaveManagement: {
      enabled: false,
      leaveRequests: false,
      requestLeave: false,
      myLeave: false
    },
    reports: {
      enabled: false,
      attendanceReports: false,
      fieldActivityReports: false,
      leaveReports: false,
      hrReports: false,
      teamReports: false
    },
    myTeam: {
      enabled: false,
      teamMembers: false,
      teamAttendance: false,
      teamActivities: false,
      teamLeaveRequests: false
    },
    more: {
      enabled: false,
      myProfile: false,
      systemConfiguration: false,
      notificationsSettings: false,
      apiKeys: false,
      helpCenter: false,
      support: false
    },
    logout: false
  });

  // Actions Permissions State
  const [actionPermissions, setActionPermissions] = useState({
    userActions: {
      viewAllEmployees: false,
      createEmployee: false,
      editEmployee: false,
      disableDeleteEmployee: false,
      assignRoles: false,
      manageDepartments: false
    },
    attendanceActions: {
      viewAllAttendance: false,
      verifyGpsLogs: false,
      editAttendance: false,
      deleteAttendance: false,
      exportAttendanceData: false,
      viewTeamAttendance: false,
      viewMyAttendance: false,
      checkInCheckOut: false
    },
    activityActions: {
      viewAllActivities: false,
      approveRejectActivities: false,
      editActivity: false,
      manageActivityTemplates: false,
      approveRejectTeamActivities: false,
      logMyActivity: false,
      viewMyActivities: false
    },
    leaveActions: {
      viewAllLeaveRequests: false,
      approveRejectLeave: false,
      adjustLeaveBalance: false,
      checkLeaveBalance: false,
      approveRejectTeamLeaveRequests: false,
      requestLeaveForSelf: false,
      viewMyLeaveStatus: false
    },
    locationsActions: {
      createEditDeleteLocations: false,
      assignEmployeesToLocations: false,
      manageLocationTypes: false
    },
    reportsActions: {
      viewExportHrReports: false,
      viewExportFieldActivitiesReports: false,
      viewExportAttendanceLeaveReports: false,
      viewExportTeamReports: false
    },
    systemActions: {
      accessFullSystemConfiguration: false,
      manageNotificationSettings: false,
      generateDeleteApiKeys: false,
      accessSystemLogs: false
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isRoleDropdownOpen && roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (isUserDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen, isUserDropdownOpen]);

  // Function to get permissions based on role
  const getPermissionsByRole = (role) => {
    // Map role names from API to internal role keys
    const roleKey = role === "Super Admin" ? "superAdmin" : 
                    role === "HR Admin" || role === "HR" ? "hr" :
                    role === "Manager" ? "manager" :
                    role === "Field Worker" || role === "Field Employee" ? "fieldEmployee" : 
                    role === "Office Staff" || role === "Officer" ? "officer" : "superAdmin";

    const permissions = {
      superAdmin: {
        menuPermissions: {
          dashboard: true,
          userManagement: { enabled: true, employees: true, rolesPermissions: true, departments: true },
          attendance: { enabled: true, dailyAttendance: true, gpsVerification: true, myAttendance: true },
          activities: { enabled: true, allActivities: true, activityApproval: false, myActivities: false, logActivity: false },
          locationsManagement: { enabled: true, locations: true, locationType: true, locationAssignment: true },
          leaveManagement: { enabled: true, leaveRequests: true, requestLeave: true, myLeave: true },
          reports: { enabled: true, attendanceReports: true, fieldActivityReports: true, leaveReports: true, hrReports: true, teamReports: false },
          myTeam: { enabled: false, teamMembers: false, teamAttendance: false, teamActivities: false, teamLeaveRequests: false },
          more: { enabled: true, myProfile: true, systemConfiguration: true, notificationsSettings: true, apiKeys: true, helpCenter: true, support: true },
          logout: true
        },
        actionPermissions: {
          userActions: { viewAllEmployees: true, createEmployee: true, editEmployee: true, disableDeleteEmployee: true, assignRoles: true, manageDepartments: true },
          attendanceActions: { viewAllAttendance: true, verifyGpsLogs: true, editAttendance: true, deleteAttendance: true, exportAttendanceData: true, viewTeamAttendance: false, viewMyAttendance: true, checkInCheckOut: true },
          activityActions: { viewAllActivities: true, approveRejectActivities: true, editActivity: true, manageActivityTemplates: true, approveRejectTeamActivities: true, logMyActivity: false, viewMyActivities: false },
          leaveActions: { viewAllLeaveRequests: true, approveRejectLeave: true, adjustLeaveBalance: true, checkLeaveBalance: true, approveRejectTeamLeaveRequests: false, requestLeaveForSelf: true, viewMyLeaveStatus: true },
          locationsActions: { createEditDeleteLocations: true, assignEmployeesToLocations: true, manageLocationTypes: true },
          reportsActions: { viewExportHrReports: true, viewExportFieldActivitiesReports: true, viewExportAttendanceLeaveReports: true, viewExportTeamReports: true },
          systemActions: { accessFullSystemConfiguration: true, manageNotificationSettings: true, generateDeleteApiKeys: true, accessSystemLogs: true }
        }
      },
      hr: {
        menuPermissions: {
          dashboard: true,
          userManagement: { enabled: true, employees: true, rolesPermissions: false, departments: true },
          attendance: { enabled: true, dailyAttendance: true, gpsVerification: true, myAttendance: true },
          activities: { enabled: true, allActivities: false, activityApproval: false, myActivities: false, logActivity: false },
          locationsManagement: { enabled: false, locations: false, locationType: false, locationAssignment: false },
          leaveManagement: { enabled: true, leaveRequests: true, requestLeave: true, myLeave: true },
          reports: { enabled: true, attendanceReports: true, fieldActivityReports: true, leaveReports: true, hrReports: true, teamReports: false },
          myTeam: { enabled: false, teamMembers: false, teamAttendance: false, teamActivities: false, teamLeaveRequests: false },
          more: { enabled: true, myProfile: true, systemConfiguration: false, notificationsSettings: false, apiKeys: false, helpCenter: true, support: true },
          logout: true
        },
        actionPermissions: {
          userActions: { viewAllEmployees: true, createEmployee: true, editEmployee: true, disableDeleteEmployee: true, assignRoles: false, manageDepartments: false },
          attendanceActions: { viewAllAttendance: true, verifyGpsLogs: true, editAttendance: true, deleteAttendance: true, exportAttendanceData: true, viewTeamAttendance: false, viewMyAttendance: true, checkInCheckOut: true },
          activityActions: { viewAllActivities: true, approveRejectActivities: false, editActivity: false, manageActivityTemplates: false, approveRejectTeamActivities: false, logMyActivity: false, viewMyActivities: false },
          leaveActions: { viewAllLeaveRequests: true, approveRejectLeave: true, adjustLeaveBalance: true, checkLeaveBalance: true, approveRejectTeamLeaveRequests: false, requestLeaveForSelf: true, viewMyLeaveStatus: true },
          locationsActions: { createEditDeleteLocations: false, assignEmployeesToLocations: false, manageLocationTypes: false },
          reportsActions: { viewExportHrReports: true, viewExportFieldActivitiesReports: true, viewExportAttendanceLeaveReports: true, viewExportTeamReports: false },
          systemActions: { accessFullSystemConfiguration: false, manageNotificationSettings: false, generateDeleteApiKeys: false, accessSystemLogs: false }
        }
      },
      manager: {
        menuPermissions: {
          dashboard: true,
          userManagement: { enabled: false, employees: false, rolesPermissions: false, departments: false },
          attendance: { enabled: true, dailyAttendance: true, gpsVerification: false, myAttendance: true },
          activities: { enabled: true, allActivities: false, activityApproval: true, myActivities: true, logActivity: true },
          locationsManagement: { enabled: false, locations: false, locationType: false, locationAssignment: false },
          leaveManagement: { enabled: true, leaveRequests: true, requestLeave: true, myLeave: true },
          reports: { enabled: true, attendanceReports: true, fieldActivityReports: false, leaveReports: true, hrReports: false, teamReports: true },
          myTeam: { enabled: true, teamMembers: true, teamAttendance: true, teamActivities: true, teamLeaveRequests: true },
          more: { enabled: true, myProfile: true, systemConfiguration: false, notificationsSettings: false, apiKeys: false, helpCenter: true, support: true },
          logout: true
        },
        actionPermissions: {
          userActions: { viewAllEmployees: false, createEmployee: false, editEmployee: false, disableDeleteEmployee: false, assignRoles: false, manageDepartments: false },
          attendanceActions: { viewAllAttendance: false, verifyGpsLogs: false, editAttendance: false, deleteAttendance: false, exportAttendanceData: true, viewTeamAttendance: true, viewMyAttendance: true, checkInCheckOut: true },
          activityActions: { viewAllActivities: false, approveRejectActivities: false, editActivity: false, manageActivityTemplates: false, approveRejectTeamActivities: true, logMyActivity: true, viewMyActivities: true },
          leaveActions: { viewAllLeaveRequests: false, approveRejectLeave: false, adjustLeaveBalance: false, checkLeaveBalance: true, approveRejectTeamLeaveRequests: true, requestLeaveForSelf: true, viewMyLeaveStatus: true },
          locationsActions: { createEditDeleteLocations: false, assignEmployeesToLocations: false, manageLocationTypes: false },
          reportsActions: { viewExportHrReports: false, viewExportFieldActivitiesReports: false, viewExportAttendanceLeaveReports: true, viewExportTeamReports: true },
          systemActions: { accessFullSystemConfiguration: false, manageNotificationSettings: false, generateDeleteApiKeys: false, accessSystemLogs: false }
        }
      },
      fieldEmployee: {
        menuPermissions: {
          dashboard: true,
          userManagement: { enabled: false, employees: false, rolesPermissions: false, departments: false },
          attendance: { enabled: true, dailyAttendance: false, gpsVerification: false, myAttendance: true },
          activities: { enabled: true, allActivities: false, activityApproval: false, myActivities: true, logActivity: true },
          locationsManagement: { enabled: false, locations: false, locationType: false, locationAssignment: false },
          leaveManagement: { enabled: true, leaveRequests: true, requestLeave: true, myLeave: true },
          reports: { enabled: false, attendanceReports: false, fieldActivityReports: false, leaveReports: false, hrReports: false, teamReports: false },
          myTeam: { enabled: false, teamMembers: false, teamAttendance: false, teamActivities: false, teamLeaveRequests: false },
          more: { enabled: true, myProfile: true, systemConfiguration: false, notificationsSettings: false, apiKeys: false, helpCenter: true, support: true },
          logout: true
        },
        actionPermissions: {
          userActions: { viewAllEmployees: false, createEmployee: false, editEmployee: false, disableDeleteEmployee: false, assignRoles: false, manageDepartments: false },
          attendanceActions: { viewAllAttendance: false, verifyGpsLogs: false, editAttendance: false, deleteAttendance: false, exportAttendanceData: false, viewTeamAttendance: false, viewMyAttendance: true, checkInCheckOut: true },
          activityActions: { viewAllActivities: false, approveRejectActivities: false, editActivity: false, manageActivityTemplates: false, approveRejectTeamActivities: false, logMyActivity: true, viewMyActivities: true },
          leaveActions: { viewAllLeaveRequests: false, approveRejectLeave: false, adjustLeaveBalance: false, checkLeaveBalance: false, approveRejectTeamLeaveRequests: false, requestLeaveForSelf: true, viewMyLeaveStatus: true },
          locationsActions: { createEditDeleteLocations: false, assignEmployeesToLocations: false, manageLocationTypes: false },
          reportsActions: { viewExportHrReports: false, viewExportFieldActivitiesReports: false, viewExportAttendanceLeaveReports: false, viewExportTeamReports: false },
          systemActions: { accessFullSystemConfiguration: false, manageNotificationSettings: false, generateDeleteApiKeys: false, accessSystemLogs: false }
        }
      },
      officer: {
        menuPermissions: {
          dashboard: true,
          userManagement: { enabled: false, employees: false, rolesPermissions: false, departments: false },
          attendance: { enabled: true, dailyAttendance: false, gpsVerification: false, myAttendance: true },
          activities: { enabled: false, allActivities: false, activityApproval: false, myActivities: false, logActivity: false },
          locationsManagement: { enabled: false, locations: false, locationType: false, locationAssignment: false },
          leaveManagement: { enabled: true, leaveRequests: false, requestLeave: true, myLeave: true },
          reports: { enabled: false, attendanceReports: false, fieldActivityReports: false, leaveReports: false, hrReports: false, teamReports: false },
          myTeam: { enabled: false, teamMembers: false, teamAttendance: false, teamActivities: false, teamLeaveRequests: false },
          more: { enabled: true, myProfile: true, systemConfiguration: false, notificationsSettings: false, apiKeys: false, helpCenter: true, support: true },
          logout: true
        },
        actionPermissions: {
          userActions: { viewAllEmployees: false, createEmployee: false, editEmployee: false, disableDeleteEmployee: false, assignRoles: false, manageDepartments: false },
          attendanceActions: { viewAllAttendance: false, verifyGpsLogs: false, editAttendance: false, deleteAttendance: false, exportAttendanceData: false, viewTeamAttendance: false, viewMyAttendance: true, checkInCheckOut: true },
          activityActions: { viewAllActivities: false, approveRejectActivities: false, editActivity: false, manageActivityTemplates: false, approveRejectTeamActivities: false, logMyActivity: false, viewMyActivities: false },
          leaveActions: { viewAllLeaveRequests: false, approveRejectLeave: false, adjustLeaveBalance: false, checkLeaveBalance: false, approveRejectTeamLeaveRequests: false, requestLeaveForSelf: true, viewMyLeaveStatus: true },
          locationsActions: { createEditDeleteLocations: false, assignEmployeesToLocations: false, manageLocationTypes: false },
          reportsActions: { viewExportHrReports: false, viewExportFieldActivitiesReports: false, viewExportAttendanceLeaveReports: false, viewExportTeamReports: false },
          systemActions: { accessFullSystemConfiguration: false, manageNotificationSettings: false, generateDeleteApiKeys: false, accessSystemLogs: false }
        }
      }
    };

    return permissions[roleKey] || permissions.superAdmin;
  };

  // Update permissions when role changes
  useEffect(() => {
    // Reset edit mode when role changes
    setIsEditMode(false);
    
    const fetchRolePermissions = async () => {
      if (selectedRole && selectedRole !== "" && selectedRole !== "Role") {
        // Find role ID from rolesData
        const roleData = rolesData.find(r => r.name === selectedRole);
        
        if (roleData && roleData.id) {
          try {
            setIsLoadingRoleDetails(true);
            setSelectedRoleId(roleData.id);
            const roleDetails = await getRoleById(roleData.id);
            
            if (roleDetails && roleDetails.permissions) {
              // Store original permissions for reference
              setRolePermissions(roleDetails.permissions);
              const convertedPermissions = convertPermissionsFromAPI(roleDetails.permissions);
              setMenuPermissions(convertedPermissions.menuPermissions);
              setActionPermissions(convertedPermissions.actionPermissions);
            }
          } catch (err) {
            console.error('Failed to load role permissions:', err);
            // Fallback to default permissions based on role name
      const newPermissions = getPermissionsByRole(selectedRole);
      setMenuPermissions(newPermissions.menuPermissions);
      setActionPermissions(newPermissions.actionPermissions);
          } finally {
            setIsLoadingRoleDetails(false);
          }
        } else {
          // Fallback to default permissions if role ID not found
          const newPermissions = getPermissionsByRole(selectedRole);
          setMenuPermissions(newPermissions.menuPermissions);
          setActionPermissions(newPermissions.actionPermissions);
        }
    } else {
      // Reset to empty state when no role is selected
        setSelectedRoleId(null);
      setMenuPermissions({
        dashboard: false,
        userManagement: { enabled: false, employees: false, rolesPermissions: false, departments: false },
        attendance: { enabled: false, dailyAttendance: false, gpsVerification: false, myAttendance: false },
        activities: { enabled: false, allActivities: false, activityApproval: false, myActivities: false, logActivity: false },
        locationsManagement: { enabled: false, locations: false, locationType: false, locationAssignment: false },
        leaveManagement: { enabled: false, leaveRequests: false, requestLeave: false, myLeave: false },
        reports: { enabled: false, attendanceReports: false, fieldActivityReports: false, leaveReports: false, hrReports: false, teamReports: false },
        myTeam: { enabled: false, teamMembers: false, teamAttendance: false, teamActivities: false, teamLeaveRequests: false },
        more: { enabled: false, myProfile: false, systemConfiguration: false, notificationsSettings: false, apiKeys: false, helpCenter: false, support: false },
        logout: false
      });
      setActionPermissions({
        userActions: { viewAllEmployees: false, createEmployee: false, editEmployee: false, disableDeleteEmployee: false, assignRoles: false, manageDepartments: false },
        attendanceActions: { viewAllAttendance: false, verifyGpsLogs: false, editAttendance: false, deleteAttendance: false, exportAttendanceData: false, viewTeamAttendance: false, viewMyAttendance: false, checkInCheckOut: false },
        activityActions: { viewAllActivities: false, approveRejectActivities: false, editActivity: false, manageActivityTemplates: false, approveRejectTeamActivities: false, logMyActivity: false, viewMyActivities: false },
        leaveActions: { viewAllLeaveRequests: false, approveRejectLeave: false, adjustLeaveBalance: false, checkLeaveBalance: false, approveRejectTeamLeaveRequests: false, requestLeaveForSelf: false, viewMyLeaveStatus: false },
        locationsActions: { createEditDeleteLocations: false, assignEmployeesToLocations: false, manageLocationTypes: false },
        reportsActions: { viewExportHrReports: false, viewExportFieldActivitiesReports: false, viewExportAttendanceLeaveReports: false, viewExportTeamReports: false },
        systemActions: { accessFullSystemConfiguration: false, manageNotificationSettings: false, generateDeleteApiKeys: false, accessSystemLogs: false }
      });
    }
    };

    fetchRolePermissions();
  }, [selectedRole, rolesData]);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Fetch roles and permissions from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingRoles(true);
        setRolesError(null);
        
        // Fetch roles and permissions in parallel
        const [rolesDataFromAPI, permissionsData] = await Promise.all([
          getRoles(),
          getPermissions()
        ]);
        
        setRolesData(rolesDataFromAPI);
        setAllPermissions(permissionsData);
        
        // Transform API response to include "Role" as first option
        const rolesList = ["Role", ...rolesDataFromAPI.map(role => role.name)];
        setRoles(rolesList);
      } catch (err) {
        console.error('Failed to load data:', err);
        setRolesError(err.message || 'Failed to load data');
        // Fallback to default roles if API fails
        setRoles(["Role", "Super Admin", "HR", "Manager", "Field Employee", "Officer"]);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchData();
  }, []);

  // Convert API permissions to component format
  const convertPermissionsFromAPI = (permissions) => {
    const menuPerms = {
      dashboard: false,
      userManagement: { enabled: false, employees: false, rolesPermissions: false, departments: false },
      attendance: { enabled: false, dailyAttendance: false, gpsVerification: false, myAttendance: false },
      activities: { enabled: false, allActivities: false, activityApproval: false, myActivities: false, logActivity: false },
      locationsManagement: { enabled: false, locations: false, locationType: false, locationAssignment: false },
      leaveManagement: { enabled: false, leaveRequests: false, requestLeave: false, myLeave: false },
      reports: { enabled: false, attendanceReports: false, fieldActivityReports: false, leaveReports: false, hrReports: false, teamReports: false },
      myTeam: { enabled: false, teamMembers: false, teamAttendance: false, teamActivities: false, teamLeaveRequests: false },
      more: { enabled: false, myProfile: false, systemConfiguration: false, notificationsSettings: false, apiKeys: false, helpCenter: false, support: false },
      logout: false
    };

    const actionPerms = {
      userActions: { viewAllEmployees: false, createEmployee: false, editEmployee: false, disableDeleteEmployee: false, assignRoles: false, manageDepartments: false },
      attendanceActions: { viewAllAttendance: false, verifyGpsLogs: false, editAttendance: false, deleteAttendance: false, exportAttendanceData: false, viewTeamAttendance: false, viewMyAttendance: false, checkInCheckOut: false },
      activityActions: { viewAllActivities: false, approveRejectActivities: false, editActivity: false, manageActivityTemplates: false, approveRejectTeamActivities: false, logMyActivity: false, viewMyActivities: false },
      leaveActions: { viewAllLeaveRequests: false, approveRejectLeave: false, adjustLeaveBalance: false, checkLeaveBalance: false, approveRejectTeamLeaveRequests: false, requestLeaveForSelf: false, viewMyLeaveStatus: false },
      locationsActions: { createEditDeleteLocations: false, assignEmployeesToLocations: false, manageLocationTypes: false },
      reportsActions: { viewExportHrReports: false, viewExportFieldActivitiesReports: false, viewExportAttendanceLeaveReports: false, viewExportTeamReports: false },
      systemActions: { accessFullSystemConfiguration: false, manageNotificationSettings: false, generateDeleteApiKeys: false, accessSystemLogs: false }
    };

    // Map permissions from API to component format
    permissions.forEach(permission => {
      const slug = permission.slug.toLowerCase();
      
      // Menu Access Permissions
      if (permission.permissionType === 'menu_access') {
        if (slug === 'dashboard:access') {
          menuPerms.dashboard = true;
        } else if (slug.includes('user_management')) {
          menuPerms.userManagement.enabled = true;
          if (slug.includes('employees')) menuPerms.userManagement.employees = true;
          if (slug.includes('roles_&_permissions') || slug.includes('roles_permissions')) menuPerms.userManagement.rolesPermissions = true;
          if (slug.includes('departments')) menuPerms.userManagement.departments = true;
        } else if (slug.includes('attendance')) {
          menuPerms.attendance.enabled = true;
          if (slug.includes('daily_attendance')) menuPerms.attendance.dailyAttendance = true;
          if (slug.includes('gps_verification')) menuPerms.attendance.gpsVerification = true;
          if (slug.includes('my_attendance')) menuPerms.attendance.myAttendance = true;
        } else if (slug.includes('activities')) {
          menuPerms.activities.enabled = true;
          if (slug.includes('all_activities')) menuPerms.activities.allActivities = true;
          if (slug.includes('activity_approval')) menuPerms.activities.activityApproval = true;
          if (slug.includes('my_activities')) menuPerms.activities.myActivities = true;
          if (slug.includes('log_activity')) menuPerms.activities.logActivity = true;
        } else if (slug.includes('locations_management')) {
          menuPerms.locationsManagement.enabled = true;
          if (slug.includes('locations') && !slug.includes('location_type') && !slug.includes('location_assignment')) menuPerms.locationsManagement.locations = true;
          if (slug.includes('location_type')) menuPerms.locationsManagement.locationType = true;
          if (slug.includes('location_assignment')) menuPerms.locationsManagement.locationAssignment = true;
        } else if (slug.includes('leave_management')) {
          menuPerms.leaveManagement.enabled = true;
          if (slug.includes('leave_requests')) menuPerms.leaveManagement.leaveRequests = true;
          if (slug.includes('request_leave')) menuPerms.leaveManagement.requestLeave = true;
          if (slug.includes('my_leave')) menuPerms.leaveManagement.myLeave = true;
        } else if (slug.includes('reports')) {
          menuPerms.reports.enabled = true;
          if (slug.includes('attendance_reports')) menuPerms.reports.attendanceReports = true;
          if (slug.includes('field_activity_reports')) menuPerms.reports.fieldActivityReports = true;
          if (slug.includes('leave_reports')) menuPerms.reports.leaveReports = true;
          if (slug.includes('hr_reports')) menuPerms.reports.hrReports = true;
          if (slug.includes('team_reports')) menuPerms.reports.teamReports = true;
        } else if (slug.includes('my_team')) {
          menuPerms.myTeam.enabled = true;
          if (slug.includes('team_members')) menuPerms.myTeam.teamMembers = true;
          if (slug.includes('team_attendance')) menuPerms.myTeam.teamAttendance = true;
          if (slug.includes('team_activites') || slug.includes('team_activities')) menuPerms.myTeam.teamActivities = true;
          if (slug.includes('team_leave_reaquest') || slug.includes('team_leave_requests')) menuPerms.myTeam.teamLeaveRequests = true;
        } else if (slug.includes('more')) {
          menuPerms.more.enabled = true;
          if (slug.includes('my_profile')) menuPerms.more.myProfile = true;
          if (slug.includes('system_configuration')) menuPerms.more.systemConfiguration = true;
          if (slug.includes('notifications_settings')) menuPerms.more.notificationsSettings = true;
          if (slug.includes('api_keys')) menuPerms.more.apiKeys = true;
          if (slug.includes('help_center')) menuPerms.more.helpCenter = true;
          if (slug.includes('support')) menuPerms.more.support = true;
        } else if (slug.includes('log_out') || slug.includes('logout')) {
          menuPerms.logout = true;
        }
      }
      
      // Action Permissions
      if (permission.permissionType === 'action') {
        if (slug.includes('user_actions')) {
          if (slug.includes('view_all_employees')) actionPerms.userActions.viewAllEmployees = true;
          if (slug.includes('create_employee')) actionPerms.userActions.createEmployee = true;
          if (slug.includes('edit_employee')) actionPerms.userActions.editEmployee = true;
          if (slug.includes('disable/delete_employee') || slug.includes('disable_delete_employee')) actionPerms.userActions.disableDeleteEmployee = true;
          if (slug.includes('assign_roles')) actionPerms.userActions.assignRoles = true;
          if (slug.includes('manage_departments')) actionPerms.userActions.manageDepartments = true;
        } else if (slug.includes('attendance_actions')) {
          if (slug.includes('view_all_attendance')) actionPerms.attendanceActions.viewAllAttendance = true;
          if (slug.includes('verify_gps_logs')) actionPerms.attendanceActions.verifyGpsLogs = true;
          if (slug.includes('edit_attendance')) actionPerms.attendanceActions.editAttendance = true;
          if (slug.includes('delete_attendance')) actionPerms.attendanceActions.deleteAttendance = true;
          if (slug.includes('export_attendance_data')) actionPerms.attendanceActions.exportAttendanceData = true;
          if (slug.includes('view_team_attendance')) actionPerms.attendanceActions.viewTeamAttendance = true;
          if (slug.includes('view_my_attendance')) actionPerms.attendanceActions.viewMyAttendance = true;
          if (slug.includes('check-in/check-out') || slug.includes('check_in_check_out')) actionPerms.attendanceActions.checkInCheckOut = true;
        } else if (slug.includes('activity_actions')) {
          if (slug.includes('view_all_activities')) actionPerms.activityActions.viewAllActivities = true;
          if (slug.includes('approve/reject_activities') || slug.includes('approve_reject_activities')) actionPerms.activityActions.approveRejectActivities = true;
          if (slug.includes('edit_activity')) actionPerms.activityActions.editActivity = true;
          if (slug.includes('manage_activity_templates')) actionPerms.activityActions.manageActivityTemplates = true;
          if (slug.includes('approve/reject_team_activities') || slug.includes('approve_reject_team_activities')) actionPerms.activityActions.approveRejectTeamActivities = true;
          if (slug.includes('log_my_activity')) actionPerms.activityActions.logMyActivity = true;
          if (slug.includes('view_my_activities')) actionPerms.activityActions.viewMyActivities = true;
        } else if (slug.includes('leave_actions')) {
          if (slug.includes('view_all_leave_requests')) actionPerms.leaveActions.viewAllLeaveRequests = true;
          if (slug.includes('approve/reject_leave') || slug.includes('approve_reject_leave')) actionPerms.leaveActions.approveRejectLeave = true;
          if (slug.includes('adjust_leave_balance')) actionPerms.leaveActions.adjustLeaveBalance = true;
          if (slug.includes('check_leave_balance')) actionPerms.leaveActions.checkLeaveBalance = true;
          if (slug.includes('approve/reject_team_leave_requests') || slug.includes('approve_reject_team_leave_requests')) actionPerms.leaveActions.approveRejectTeamLeaveRequests = true;
          if (slug.includes('request_leave_for_self')) actionPerms.leaveActions.requestLeaveForSelf = true;
          if (slug.includes('view_my_leave_status')) actionPerms.leaveActions.viewMyLeaveStatus = true;
        } else if (slug.includes('locations_actions')) {
          if (slug.includes('create/edit/delete_locations') || slug.includes('create_edit_delete_locations')) actionPerms.locationsActions.createEditDeleteLocations = true;
          if (slug.includes('assign_employees_to_locations')) actionPerms.locationsActions.assignEmployeesToLocations = true;
          if (slug.includes('manage_location_types')) actionPerms.locationsActions.manageLocationTypes = true;
        } else if (slug.includes('reports_actions')) {
          if (slug.includes('view/export_hr_reports') || slug.includes('view_export_hr_reports')) actionPerms.reportsActions.viewExportHrReports = true;
          if (slug.includes('view/export_field_activites_reports') || slug.includes('view_export_field_activites_reports') || slug.includes('view_export_field_activity_reports')) actionPerms.reportsActions.viewExportFieldActivitiesReports = true;
          if (slug.includes('view/export_attendance,_leave_reports') || slug.includes('view_export_attendance_leave_reports')) actionPerms.reportsActions.viewExportAttendanceLeaveReports = true;
          if (slug.includes('view/export_team_reports') || slug.includes('view_export_team_reports')) actionPerms.reportsActions.viewExportTeamReports = true;
        } else if (slug.includes('system_actions')) {
          if (slug.includes('access_full_system_configuration')) actionPerms.systemActions.accessFullSystemConfiguration = true;
          if (slug.includes('manage_notification_settings')) actionPerms.systemActions.manageNotificationSettings = true;
          if (slug.includes('generate/delete_api_keys') || slug.includes('generate_delete_api_keys')) actionPerms.systemActions.generateDeleteApiKeys = true;
          if (slug.includes('access_system_logs')) actionPerms.systemActions.accessSystemLogs = true;
        }
      }
    });

    return { menuPermissions: menuPerms, actionPermissions: actionPerms };
  };

  // Handle menu permission change
  const handleMenuPermissionChange = (path, value) => {
    setMenuPermissions(prev => {
      const newState = { ...prev };
      const keys = path.split('.');
      let current = newState;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      if (keys.length === 1) {
        newState[keys[0]] = value;
      } else {
        current[keys[keys.length - 1]] = value;
      }
      
      return newState;
    });
  };

  // Handle action permission change
  const handleActionPermissionChange = (category, action, value) => {
    setActionPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [action]: value
      }
    }));
  };

  // Convert component permissions format to API permission IDs
  const convertPermissionsToAPI = (menuPerms, actionPerms) => {
    const permissionIds = [];
    
    // Use allPermissions from state (loaded from /rbac/permissions)
    const permissionsToUse = allPermissions.length > 0 ? allPermissions : rolePermissions;
    
    // Create a map of slugs to permission IDs for quick lookup
    // Try both lowercase and original case for flexibility
    const slugToPermissionId = {};
    permissionsToUse.forEach(perm => {
      const slug = perm.slug;
      slugToPermissionId[slug] = perm.id; // Use 'id' not 'permissionId'
      slugToPermissionId[slug.toLowerCase()] = perm.id;
      // Also create variations with underscores and colons
      const slugLower = slug.toLowerCase();
      slugToPermissionId[slugLower.replace(/ /g, '_').replace(/:/g, ':')] = perm.id;
      slugToPermissionId[slugLower.replace(/ /g, ' ').replace(/:/g, ':')] = perm.id;
    });

    // Menu Access Permissions
    if (menuPerms.dashboard) {
      const id = slugToPermissionId['dashboard:access'];
      if (id) permissionIds.push(id);
    }

    if (menuPerms.userManagement.enabled) {
      if (menuPerms.userManagement.employees) {
        const id = slugToPermissionId['user_management:employees'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.userManagement.rolesPermissions) {
        const id = slugToPermissionId['user_management:roles_&_permissions'] || slugToPermissionId['user_management:roles_permissions'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.userManagement.departments) {
        const id = slugToPermissionId['user_management:departments'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.attendance.enabled) {
      if (menuPerms.attendance.dailyAttendance) {
        const id = slugToPermissionId['attendance:daily_attendance'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.attendance.gpsVerification) {
        const id = slugToPermissionId['attendance:gps_verification'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.attendance.myAttendance) {
        const id = slugToPermissionId['attendance:my_attendance'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.activities.enabled) {
      if (menuPerms.activities.allActivities) {
        const id = slugToPermissionId['activities:all_activities'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.activities.activityApproval) {
        const id = slugToPermissionId['activities:activity_approval'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.activities.myActivities) {
        const id = slugToPermissionId['activities:my_activities'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.activities.logActivity) {
        const id = slugToPermissionId['activities:log_activity'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.locationsManagement.enabled) {
      if (menuPerms.locationsManagement.locations) {
        const id = slugToPermissionId['locations_management:locations'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.locationsManagement.locationType) {
        const id = slugToPermissionId['locations_management:location_type'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.locationsManagement.locationAssignment) {
        const id = slugToPermissionId['locations_management:location_assignment'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.leaveManagement.enabled) {
      if (menuPerms.leaveManagement.leaveRequests) {
        const id = slugToPermissionId['leave_management:leave_requests'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.leaveManagement.requestLeave) {
        const id = slugToPermissionId['leave_management:request_leave'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.leaveManagement.myLeave) {
        const id = slugToPermissionId['leave_management:my_leave'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.reports.enabled) {
      if (menuPerms.reports.attendanceReports) {
        const id = slugToPermissionId['reports:attendance_reports'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.reports.fieldActivityReports) {
        const id = slugToPermissionId['reports:field_activity_reports'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.reports.leaveReports) {
        const id = slugToPermissionId['reports:leave_reports'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.reports.hrReports) {
        const id = slugToPermissionId['reports:hr_reports'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.reports.teamReports) {
        const id = slugToPermissionId['reports:team_reports'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.myTeam.enabled) {
      if (menuPerms.myTeam.teamMembers) {
        const id = slugToPermissionId['my_team:team_members'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.myTeam.teamAttendance) {
        const id = slugToPermissionId['my_team:team_attendance'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.myTeam.teamActivities) {
        const id = slugToPermissionId['my_team:team_activites'] || slugToPermissionId['my_team:team_activities'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.myTeam.teamLeaveRequests) {
        const id = slugToPermissionId['my_team:team_leave_reaquest'] || slugToPermissionId['my_team:team_leave_requests'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.more.enabled) {
      if (menuPerms.more.myProfile) {
        const id = slugToPermissionId['more:my_profile'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.more.systemConfiguration) {
        const id = slugToPermissionId['more:system_configuration'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.more.notificationsSettings) {
        const id = slugToPermissionId['more:notifications_settings'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.more.apiKeys) {
        const id = slugToPermissionId['more:api_keys'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.more.helpCenter) {
        const id = slugToPermissionId['more:help_center'];
        if (id) permissionIds.push(id);
      }
      if (menuPerms.more.support) {
        const id = slugToPermissionId['more:support'];
        if (id) permissionIds.push(id);
      }
    }

    if (menuPerms.logout) {
      const id = slugToPermissionId['log_out:access'] || slugToPermissionId['logout:access'];
      if (id) permissionIds.push(id);
    }

    // Action Permissions
    if (actionPerms.userActions.viewAllEmployees) {
      const id = slugToPermissionId['user_actions:view_all_employees'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.userActions.createEmployee) {
      const id = slugToPermissionId['user_actions:create_employee'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.userActions.editEmployee) {
      const id = slugToPermissionId['user_actions:edit_employee'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.userActions.disableDeleteEmployee) {
      const id = slugToPermissionId['user_actions:disable/delete_employee'] || slugToPermissionId['user_actions:disable_delete_employee'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.userActions.assignRoles) {
      const id = slugToPermissionId['user_actions:assign_roles'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.userActions.manageDepartments) {
      const id = slugToPermissionId['user_actions:manage_departments'];
      if (id) permissionIds.push(id);
    }

    if (actionPerms.attendanceActions.viewAllAttendance) {
      const id = slugToPermissionId['attendance_actions:view_all_attendance'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.attendanceActions.verifyGpsLogs) {
      const id = slugToPermissionId['attendance_actions:verify_gps_logs'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.attendanceActions.editAttendance) {
      const id = slugToPermissionId['attendance_actions:edit_attendance'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.attendanceActions.deleteAttendance) {
      const id = slugToPermissionId['attendance_actions:delete_attendance'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.attendanceActions.exportAttendanceData) {
      const id = slugToPermissionId['attendance_actions:export_attendance_data'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.attendanceActions.viewTeamAttendance) {
      const id = slugToPermissionId['attendance_actions:view_team_attendance'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.attendanceActions.viewMyAttendance) {
      const id = slugToPermissionId['attendance_actions:view_my_attendance'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.attendanceActions.checkInCheckOut) {
      const id = slugToPermissionId['attendance_actions:check-in/check-out'] || slugToPermissionId['attendance_actions:check_in_check_out'];
      if (id) permissionIds.push(id);
    }

    if (actionPerms.activityActions.viewAllActivities) {
      const id = slugToPermissionId['activity_actions:view_all_activities'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.activityActions.approveRejectActivities) {
      const id = slugToPermissionId['activity_actions:approve/reject_activities'] || slugToPermissionId['activity_actions:approve_reject_activities'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.activityActions.editActivity) {
      const id = slugToPermissionId['activity_actions:edit_activity'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.activityActions.manageActivityTemplates) {
      const id = slugToPermissionId['activity_actions:manage_activity_templates'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.activityActions.approveRejectTeamActivities) {
      const id = slugToPermissionId['activity_actions:approve/reject_team_activities'] || slugToPermissionId['activity_actions:approve_reject_team_activities'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.activityActions.logMyActivity) {
      const id = slugToPermissionId['activity_actions:log_my_activity'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.activityActions.viewMyActivities) {
      const id = slugToPermissionId['activity_actions:view_my_activities'];
      if (id) permissionIds.push(id);
    }

    if (actionPerms.leaveActions.viewAllLeaveRequests) {
      const id = slugToPermissionId['leave_actions:view_all_leave_requests'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.leaveActions.approveRejectLeave) {
      const id = slugToPermissionId['leave_actions:approve/reject_leave'] || slugToPermissionId['leave_actions:approve_reject_leave'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.leaveActions.adjustLeaveBalance) {
      const id = slugToPermissionId['leave_actions:adjust_leave_balance'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.leaveActions.checkLeaveBalance) {
      const id = slugToPermissionId['leave_actions:check_leave_balance'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.leaveActions.approveRejectTeamLeaveRequests) {
      const id = slugToPermissionId['leave_actions:approve/reject_team_leave_requests'] || slugToPermissionId['leave_actions:approve_reject_team_leave_requests'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.leaveActions.requestLeaveForSelf) {
      const id = slugToPermissionId['leave_actions:request_leave_for_self'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.leaveActions.viewMyLeaveStatus) {
      const id = slugToPermissionId['leave_actions:view_my_leave_status'];
      if (id) permissionIds.push(id);
    }

    if (actionPerms.locationsActions.createEditDeleteLocations) {
      const id = slugToPermissionId['locations_actions:create/edit/delete_locations'] || slugToPermissionId['locations_actions:create_edit_delete_locations'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.locationsActions.assignEmployeesToLocations) {
      const id = slugToPermissionId['locations_actions:assign_employees_to_locations'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.locationsActions.manageLocationTypes) {
      const id = slugToPermissionId['locations_actions:manage_location_types'];
      if (id) permissionIds.push(id);
    }

    if (actionPerms.reportsActions.viewExportHrReports) {
      const id = slugToPermissionId['reports_actions:view/export_hr_reports'] || slugToPermissionId['reports_actions:view_export_hr_reports'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.reportsActions.viewExportFieldActivitiesReports) {
      const id = slugToPermissionId['reports_actions:view/export_field_activites_reports'] || slugToPermissionId['reports_actions:view_export_field_activites_reports'] || slugToPermissionId['reports_actions:view_export_field_activity_reports'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.reportsActions.viewExportAttendanceLeaveReports) {
      const id = slugToPermissionId['reports_actions:view/export_attendance,_leave_reports'] || slugToPermissionId['reports_actions:view_export_attendance_leave_reports'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.reportsActions.viewExportTeamReports) {
      const id = slugToPermissionId['reports_actions:view/export_team_reports'] || slugToPermissionId['reports_actions:view_export_team_reports'];
      if (id) permissionIds.push(id);
    }

    if (actionPerms.systemActions.accessFullSystemConfiguration) {
      const id = slugToPermissionId['system_actions:access_full_system_configuration'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.systemActions.manageNotificationSettings) {
      const id = slugToPermissionId['system_actions:manage_notification_settings'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.systemActions.generateDeleteApiKeys) {
      const id = slugToPermissionId['system_actions:generate/delete_api_keys'] || slugToPermissionId['system_actions:generate_delete_api_keys'];
      if (id) permissionIds.push(id);
    }
    if (actionPerms.systemActions.accessSystemLogs) {
      const id = slugToPermissionId['system_actions:access_system_logs'];
      if (id) permissionIds.push(id);
    }

    return permissionIds;
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedRoleId) {
      setSaveError('Please select a role first');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Convert permissions to API format
      const permissionIds = convertPermissionsToAPI(menuPermissions, actionPermissions, rolePermissions);
      
      // Update role via API
      await updateRole(selectedRoleId, permissionIds);
      
      // Reload role permissions from API to get the updated data
      const updatedRoleDetails = await getRoleById(selectedRoleId);
      
      if (updatedRoleDetails && updatedRoleDetails.permissions) {
        // Update stored permissions with the latest from API
        setRolePermissions(updatedRoleDetails.permissions);
        // Convert and update the displayed permissions
        const convertedPermissions = convertPermissionsFromAPI(updatedRoleDetails.permissions);
        setMenuPermissions(convertedPermissions.menuPermissions);
        setActionPermissions(convertedPermissions.actionPermissions);
      }
      
      setSaveSuccess(true);
      setIsEditMode(false); // Exit edit mode after successful save
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save permissions:', err);
      setSaveError(err.message || 'Failed to save permissions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{`
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 18px;
          height: 18px;
          border: 1.5px solid #000000;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
          position: relative;
        }
        input[type="checkbox"]:checked {
          background-color: white;
          border: 1.5px solid #000000;
        }
        input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #000000;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
        }
        input[type="checkbox"]:focus {
          outline: none;
        }
        input[type="checkbox"]:focus-visible {
          outline: none;
        }
      `}</style>
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar 
          userRole={userRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        <main className="flex-1 flex flex-col bg-[#F5F7FA]">
          <header className="bg-white px-[40px] py-[20px]">
            <div className="flex items-center justify-between mb-[16px]">
              <div className="relative">
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="text"
                  placeholder="Search"
                  className="w-[280px] h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
              
              <div className="flex items-center gap-[16px]">
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>
                <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
                </button>
                <div className="relative" ref={userDropdownRef}>
                  <div 
                    className="flex items-center gap-[12px] cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                  <img 
                    src={UserAvatar}
                    alt="User"
                    className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]"
                  />
                  <div>
                    <div className="flex items-center gap-[6px]">
                      <p className="text-[16px] font-semibold text-[#333333]">Hi, Firas!</p>
                        <img 
                          src={DropdownArrow} 
                          alt="" 
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                    <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[userRole]}</p>
                  </div>
                </div>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div 
                      className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                      </div>
                      <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                      <button 
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsUserDropdownOpen(false);
                          setTimeout(() => {
                            navigate("/login", { replace: true });
                          }, 100);
                        }}
                        className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Breadcrumbs */}
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>User Management</span>
                <span style={{ color: '#8E8C8C', margin: '0 4px' }}> &gt; </span>
                <span style={{ color: '#8E8C8C' }}>Roles & Permissions</span>
              </p>
            </div>
          </header>

          <div className="flex-1 p-[36px] overflow-y-auto bg-[#F5F7FA]" style={{ overflowX: 'hidden' }}>

            {/* Title and Subtitle */}
            <div className="mb-[20px]">
              <h1 
                className="text-[28px] font-semibold text-[#000000] mb-[8px]" 
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                Roles & Permissions
              </h1>
              <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Control access levels and permissions across your organization
              </p>
            </div>

            {/* Role Dropdown and Edit Icon */}
            <div className="mb-[24px] flex items-center justify-between">
              <div className="relative inline-block" ref={roleDropdownRef}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  }}
                  className="appearance-none px-[20px] py-[12px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer text-left"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, minWidth: '200px', color: selectedRole ? '#374151' : '#9CA3AF' }}
                >
                  <span>{selectedRole || "Role"}</span>
                </button>
                <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isRoleDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isRoleDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full max-h-[300px] overflow-y-auto"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {isLoadingRoles ? (
                      <div className="px-[20px] py-[12px] text-[14px] text-[#6B7280] text-center">
                        Loading roles...
                      </div>
                    ) : rolesError ? (
                      <div className="px-[20px] py-[12px] text-[14px] text-red-600">
                        {rolesError}
                      </div>
                    ) : roles.length > 0 ? (
                      roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedRole(role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full px-[20px] py-[12px] text-left text-[14px] transition-colors cursor-pointer ${
                          selectedRole === role
                            ? 'bg-[#E5E7EB] text-[#000000]'
                            : 'bg-white text-[#374151] hover:bg-[#F5F7FA]'
                        }`}
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 400
                        }}
                      >
                        {role}
                      </button>
                      ))
                    ) : (
                      <div className="px-[20px] py-[12px] text-[14px] text-[#6B7280] text-center">
                        No roles available
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Edit Icon */}
              {isLoadingRoleDetails && selectedRole && selectedRole !== "" && selectedRole !== "Role" && (
                <div className="flex items-center justify-center py-[40px]">
                  <div className="text-[14px] text-[#6B7280]">Loading permissions...</div>
                </div>
              )}
              {!isLoadingRoleDetails && selectedRole && selectedRole !== "" && selectedRole !== "Role" && (
                <button
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`w-[44px] h-[44px] rounded-[8px] border flex items-center justify-center transition-colors ${
                    isEditMode 
                      ? 'border-[#004D40] bg-[#004D40] hover:bg-[#003d33]' 
                      : 'border-[#E0E0E0] bg-white hover:bg-[#F5F7FA]'
                  }`}
                >
                  <svg className={`w-[22px] h-[22px] ${isEditMode ? 'text-white' : 'text-[#6B7280]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm overflow-hidden">
              <div className="grid grid-cols-2">
                {/* Left Column: Menu Access */}
                <div className="border-r border-[#E0E0E0]">
                  <div className="px-[32px] pt-[32px] pb-0">
                    <h2
                      className="text-[20px] font-medium mb-[12px] text-center"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6C6C6C' }}
                    >
                      Menu Access
                    </h2>
                  </div>
                  <div className="border-b border-[#E0E0E0] mb-[20px]"></div>

                  <div className="px-[32px] pb-[32px]" style={{ minHeight: '600px' }}>
                    <div className="max-w-fit" style={{ marginLeft: '100px' }}>
                      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 12px', tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: '18px' }} />
                          <col />
                        </colgroup>
                        <tbody>
                          {/* Dashboard */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.dashboard}
                                onChange={(e) => handleMenuPermissionChange('dashboard', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                Dashboard
                              </label>
                            </td>
                          </tr>

                          {/* User Management */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.userManagement.enabled}
                                onChange={(e) => handleMenuPermissionChange('userManagement.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                User Management
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.userManagement.employees}
                                onChange={(e) => handleMenuPermissionChange('userManagement.employees', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Employees
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.userManagement.rolesPermissions}
                                onChange={(e) => handleMenuPermissionChange('userManagement.rolesPermissions', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Roles & Permissions
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.userManagement.departments}
                                onChange={(e) => handleMenuPermissionChange('userManagement.departments', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Departments
                              </label>
                            </td>
                          </tr>

                          {/* Attendance */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.attendance.enabled}
                                onChange={(e) => handleMenuPermissionChange('attendance.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                Attendance
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.attendance.dailyAttendance}
                                onChange={(e) => handleMenuPermissionChange('attendance.dailyAttendance', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Daily Attendance
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.attendance.gpsVerification}
                                onChange={(e) => handleMenuPermissionChange('attendance.gpsVerification', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - GPS Verification
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.attendance.myAttendance}
                                onChange={(e) => handleMenuPermissionChange('attendance.myAttendance', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - My Attendance
                              </label>
                            </td>
                          </tr>
                          {/* Activities */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.activities.enabled}
                                onChange={(e) => handleMenuPermissionChange('activities.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                Activities
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.activities.allActivities}
                                onChange={(e) => handleMenuPermissionChange('activities.allActivities', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - All Activities
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.activities.activityApproval}
                                onChange={(e) => handleMenuPermissionChange('activities.activityApproval', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Activity Approval
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.activities.myActivities}
                                onChange={(e) => handleMenuPermissionChange('activities.myActivities', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - My Activities
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.activities.logActivity}
                                onChange={(e) => handleMenuPermissionChange('activities.logActivity', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Log Activity
                              </label>
                            </td>
                          </tr>

                          {/* Locations Management */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.locationsManagement.enabled}
                                onChange={(e) => handleMenuPermissionChange('locationsManagement.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                Locations Management
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.locationsManagement.locations}
                                onChange={(e) => handleMenuPermissionChange('locationsManagement.locations', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Locations
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.locationsManagement.locationType}
                                onChange={(e) => handleMenuPermissionChange('locationsManagement.locationType', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Location Type
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.locationsManagement.locationAssignment}
                                onChange={(e) => handleMenuPermissionChange('locationsManagement.locationAssignment', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Location Assignment
                              </label>
                            </td>
                          </tr>

                          {/* Leave Management */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.leaveManagement.enabled}
                                onChange={(e) => handleMenuPermissionChange('leaveManagement.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                Leave Management
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.leaveManagement.leaveRequests}
                                onChange={(e) => handleMenuPermissionChange('leaveManagement.leaveRequests', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Leave Requests
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.leaveManagement.requestLeave}
                                onChange={(e) => handleMenuPermissionChange('leaveManagement.requestLeave', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Request Leave
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.leaveManagement.myLeave}
                                onChange={(e) => handleMenuPermissionChange('leaveManagement.myLeave', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - My Leave
                              </label>
                            </td>
                          </tr>

                          {/* Reports */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.reports.enabled}
                                onChange={(e) => handleMenuPermissionChange('reports.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                Reports
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.reports.attendanceReports}
                                onChange={(e) => handleMenuPermissionChange('reports.attendanceReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Attendance Reports
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.reports.fieldActivityReports}
                                onChange={(e) => handleMenuPermissionChange('reports.fieldActivityReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Field Activity Reports
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.reports.leaveReports}
                                onChange={(e) => handleMenuPermissionChange('reports.leaveReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Leave Reports
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.reports.hrReports}
                                onChange={(e) => handleMenuPermissionChange('reports.hrReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - HR Reports
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.reports.teamReports}
                                onChange={(e) => handleMenuPermissionChange('reports.teamReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Team Reports
                              </label>
                            </td>
                          </tr>

                          {/* My Team */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.myTeam.enabled}
                                onChange={(e) => handleMenuPermissionChange('myTeam.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                My Team
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.myTeam.teamMembers}
                                onChange={(e) => handleMenuPermissionChange('myTeam.teamMembers', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Team Members
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.myTeam.teamAttendance}
                                onChange={(e) => handleMenuPermissionChange('myTeam.teamAttendance', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Team Attendance
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.myTeam.teamActivities}
                                onChange={(e) => handleMenuPermissionChange('myTeam.teamActivities', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Team Activities
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.myTeam.teamLeaveRequests}
                                onChange={(e) => handleMenuPermissionChange('myTeam.teamLeaveRequests', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Team Leave Requests
                              </label>
                            </td>
                          </tr>

                          {/* More */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.more.enabled}
                                onChange={(e) => handleMenuPermissionChange('more.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                More
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.more.myProfile}
                                onChange={(e) => handleMenuPermissionChange('more.myProfile', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - My Profile
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.more.systemConfiguration}
                                onChange={(e) => handleMenuPermissionChange('more.systemConfiguration', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - System Configuration
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.more.notificationsSettings}
                                onChange={(e) => handleMenuPermissionChange('more.notificationsSettings', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Notifications Settings
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.more.apiKeys}
                                onChange={(e) => handleMenuPermissionChange('more.apiKeys', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - API Keys
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.more.helpCenter}
                                onChange={(e) => handleMenuPermissionChange('more.helpCenter', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Help Center
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]" style={{ paddingBottom: '24px' }}>
                              <input
                                type="checkbox"
                                checked={menuPermissions.more.support}
                                onChange={(e) => handleMenuPermissionChange('more.support', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle" style={{ paddingBottom: '24px' }}>
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                - Support
                              </label>
                            </td>
                          </tr>

                          {/* Log out */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                              <input
                                type="checkbox"
                                checked={menuPermissions.logout}
                                onChange={(e) => handleMenuPermissionChange('logout', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                              />
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                Log out
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Column: Actions Permissions */}
                <div>
                  <div className="px-[32px] pt-[32px] pb-0">
                    <h2
                      className="text-[20px] font-medium mb-[12px] text-center"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6C6C6C' }}
                    >
                      Actions Permissions
                    </h2>
                  </div>
                  <div className="border-b border-[#E0E0E0] mb-[20px]"></div>

                  <div className="px-[32px] pb-[32px]" style={{ minHeight: '600px' }}>
                    <div className="max-w-fit" style={{ marginLeft: '100px' }}>
                      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 12px', tableLayout: 'fixed' }}>
                        <colgroup>
                          <col style={{ width: '18px' }} />
                          <col />
                        </colgroup>
                        <tbody>
                          {/* User Actions */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                User Actions
                              </label>
                            </td>
                          </tr>
                          {[
                            { key: 'viewAllEmployees', label: '- View all employees' },
                            { key: 'createEmployee', label: '- Create employee' },
                            { key: 'editEmployee', label: '- Edit employee' },
                            { key: 'disableDeleteEmployee', label: '- Disable/Delete employee' },
                            { key: 'assignRoles', label: '- Assign roles' },
                            { key: 'manageDepartments', label: '- Manage departments' }
                          ].map((action) => (
                            <tr key={action.key}>
                              <td className="w-[18px] align-middle pr-[12px]" style={action.key === 'manageDepartments' ? { paddingBottom: '24px' } : {}}>
                                <input
                                  type="checkbox"
                                  checked={actionPermissions.userActions[action.key]}
                                  onChange={(e) => handleActionPermissionChange('userActions', action.key, e.target.checked)}
                                  disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                                />
                              </td>
                              <td className="align-middle" style={action.key === 'manageDepartments' ? { paddingBottom: '24px' } : {}}>
                                <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                  {action.label}
                                </label>
                              </td>
                            </tr>
                          ))}

                          {/* Attendance Actions */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                Attendance Actions
                              </label>
                            </td>
                          </tr>
                          {[
                            { key: 'viewAllAttendance', label: '- View all attendance' },
                            { key: 'verifyGpsLogs', label: '- Verify GPS logs' },
                            { key: 'editAttendance', label: '- Edit attendance' },
                            { key: 'deleteAttendance', label: '- Delete attendance' },
                            { key: 'exportAttendanceData', label: '- Export attendance data' },
                            { key: 'viewTeamAttendance', label: '- View team attendance' },
                            { key: 'viewMyAttendance', label: '- View My attendance' },
                            { key: 'checkInCheckOut', label: '- Check-in/Check-out' }
                          ].map((action) => (
                            <tr key={action.key}>
                              <td className="w-[18px] align-middle pr-[12px]" style={action.key === 'checkInCheckOut' ? { paddingBottom: '24px' } : {}}>
                                <input
                                  type="checkbox"
                                  checked={actionPermissions.attendanceActions[action.key]}
                                  onChange={(e) => handleActionPermissionChange('attendanceActions', action.key, e.target.checked)}
                                  disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                                />
                              </td>
                              <td className="align-middle" style={action.key === 'checkInCheckOut' ? { paddingBottom: '24px' } : {}}>
                                <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                  {action.label}
                                </label>
                              </td>
                            </tr>
                          ))}

                          {/* Activity Actions */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                Activity Actions
                              </label>
                            </td>
                          </tr>
                          {[
                            { key: 'viewAllActivities', label: '- View all activities' },
                            { key: 'approveRejectActivities', label: '- Approve/Reject activities' },
                            { key: 'editActivity', label: '- Edit activity' },
                            { key: 'manageActivityTemplates', label: '- Manage activity templates' },
                            { key: 'approveRejectTeamActivities', label: '- Approve/Reject team activities' },
                            { key: 'logMyActivity', label: '- Log my activity' },
                            { key: 'viewMyActivities', label: '- View my activities' }
                          ].map((action) => (
                            <tr key={action.key}>
                              <td className="w-[18px] align-middle pr-[12px]" style={action.key === 'viewMyActivities' ? { paddingBottom: '24px' } : {}}>
                                <input
                                  type="checkbox"
                                  checked={actionPermissions.activityActions[action.key]}
                                  onChange={(e) => handleActionPermissionChange('activityActions', action.key, e.target.checked)}
                                  disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                                />
                              </td>
                              <td className="align-middle" style={action.key === 'viewMyActivities' ? { paddingBottom: '24px' } : {}}>
                                <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                  {action.label}
                                </label>
                              </td>
                            </tr>
                          ))}

                          {/* Leave Actions */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                Leave Actions
                              </label>
                            </td>
                          </tr>
                          {[
                            { key: 'viewAllLeaveRequests', label: '- View all leave requests' },
                            { key: 'approveRejectLeave', label: '- Approve/Reject leave' },
                            { key: 'adjustLeaveBalance', label: '- Adjust leave balance' },
                            { key: 'checkLeaveBalance', label: '- Check leave balance' },
                            { key: 'approveRejectTeamLeaveRequests', label: '- Approve/Reject team leave requests' },
                            { key: 'requestLeaveForSelf', label: '- Request leave for self' },
                            { key: 'viewMyLeaveStatus', label: '- View my leave status' }
                          ].map((action) => (
                            <tr key={action.key}>
                              <td className="w-[18px] align-middle pr-[12px]" style={action.key === 'viewMyLeaveStatus' ? { paddingBottom: '24px' } : {}}>
                                <input
                                  type="checkbox"
                                  checked={actionPermissions.leaveActions[action.key]}
                                  onChange={(e) => handleActionPermissionChange('leaveActions', action.key, e.target.checked)}
                                  disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                                />
                              </td>
                              <td className="align-middle" style={action.key === 'viewMyLeaveStatus' ? { paddingBottom: '24px' } : {}}>
                                <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                  {action.label}
                                </label>
                              </td>
                            </tr>
                          ))}

                          {/* Locations Actions */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                Locations Actions
                              </label>
                            </td>
                          </tr>
                          {[
                            { key: 'createEditDeleteLocations', label: '- Create/Edit/Delete locations' },
                            { key: 'assignEmployeesToLocations', label: '- Assign employees to locations' },
                            { key: 'manageLocationTypes', label: '- Manage location types' }
                          ].map((action) => (
                            <tr key={action.key}>
                              <td className="w-[18px] align-middle pr-[12px]" style={action.key === 'manageLocationTypes' ? { paddingBottom: '24px' } : {}}>
                                <input
                                  type="checkbox"
                                  checked={actionPermissions.locationsActions[action.key]}
                                  onChange={(e) => handleActionPermissionChange('locationsActions', action.key, e.target.checked)}
                                  disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                                />
                              </td>
                              <td className="align-middle" style={action.key === 'manageLocationTypes' ? { paddingBottom: '24px' } : {}}>
                                <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                  {action.label}
                                </label>
                              </td>
                            </tr>
                          ))}

                          {/* Reports Actions */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                Reports Actions
                              </label>
                            </td>
                          </tr>
                          {[
                            { key: 'viewExportHrReports', label: '- View/Export HR reports' },
                            { key: 'viewExportFieldActivitiesReports', label: '- View/Export field activities reports' },
                            { key: 'viewExportAttendanceLeaveReports', label: '- View/Export attendance, leave reports' },
                            { key: 'viewExportTeamReports', label: '- View/Export team reports' }
                          ].map((action) => (
                            <tr key={action.key}>
                              <td className="w-[18px] align-middle pr-[12px]" style={action.key === 'viewExportTeamReports' ? { paddingBottom: '24px' } : {}}>
                                <input
                                  type="checkbox"
                                  checked={actionPermissions.reportsActions[action.key]}
                                  onChange={(e) => handleActionPermissionChange('reportsActions', action.key, e.target.checked)}
                                  disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                                />
                              </td>
                              <td className="align-middle" style={action.key === 'viewExportTeamReports' ? { paddingBottom: '24px' } : {}}>
                                <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                  {action.label}
                                </label>
                              </td>
                            </tr>
                          ))}

                          {/* System Actions */}
                          <tr>
                            <td className="w-[18px] align-middle pr-[12px]">
                            </td>
                            <td className="align-middle">
                              <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                System Actions
                              </label>
                            </td>
                          </tr>
                          {[
                            { key: 'accessFullSystemConfiguration', label: '- Access full system configuration' },
                            { key: 'manageNotificationSettings', label: '- Manage notification settings' },
                            { key: 'generateDeleteApiKeys', label: '- Generate/Delete API keys' },
                            { key: 'accessSystemLogs', label: '- Access system logs' }
                          ].map((action) => (
                            <tr key={action.key}>
                              <td className="w-[18px] align-middle pr-[12px]">
                                <input
                                  type="checkbox"
                                  checked={actionPermissions.systemActions[action.key]}
                                  onChange={(e) => handleActionPermissionChange('systemActions', action.key, e.target.checked)}
                                  disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{ 
                                  accentColor: '#000000',
                                  backgroundColor: 'white',
                                  borderColor: '#E0E0E0'
                                }}
                                />
                              </td>
                              <td className="align-middle">
                                <label className="text-[14px] text-[#000000] leading-none" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                                  {action.label}
                                </label>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save and Cancel Buttons */}
            <div className="flex justify-start gap-[12px] mt-[24px]">
              <button
                onClick={() => {
                  setSelectedRole("");
                  setIsRoleDropdownOpen(false);
                }}
                className="px-[48px] py-[8px] rounded-[5px] hover:opacity-90 transition-opacity"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontWeight: 600, 
                  fontSize: '16px', 
                  backgroundColor: 'white',
                  color: '#737373',
                  border: '1px solid #E0E0E0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedRoleId}
                className="px-[48px] py-[8px] text-white rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontWeight: 600, 
                  fontSize: '16px', 
                  backgroundColor: '#004D40',
                  border: '1px solid #B5B1B1',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-[#F5F7FA]">
        {/* Mobile Header */}
        <header className="h-[70px] bg-white flex items-center justify-between px-[16px] sticky top-0 z-30 border-b border-[#E0E0E0]">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-[40px] h-[40px] rounded-[8px] bg-[#004D40] flex items-center justify-center hover:bg-[#003830] transition-colors"
          >
            <svg className="w-[24px] h-[24px] text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="flex items-center gap-[12px]">
            <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
              <img src={MessageIcon} alt="Messages" className="w-[18px] h-[18px] object-contain" />
            </button>
            
            <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
              <img src={NotificationIcon} alt="Notifications" className="w-[18px] h-[18px] object-contain" />
              <span className="absolute top-[4px] right-[4px] w-[6px] h-[6px] bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Avatar with Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <div 
                className="flex items-center gap-[6px] cursor-pointer"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <img 
                  src={UserAvatar}
                  alt="User"
                  className="w-[36px] h-[36px] rounded-full object-cover border-2 border-[#E5E7EB]"
                />
                <img 
                  src={DropdownArrow} 
                  alt="" 
                  className={`w-[12px] h-[12px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                  <div className="px-[16px] py-[8px]">
                    <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                  </div>
                  <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                    Edit Profile
                  </button>
                  <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsUserDropdownOpen(false);
                      setTimeout(() => {
                        navigate("/login", { replace: true });
                      }, 100);
                    }}
                    className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div 
          className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar 
            userRole={userRole}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Mobile Content */}
        <div className="p-[16px]">
          {/* Page Header */}
          <div className="mb-[16px]">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Roles & Permissions
            </h1>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Control access levels and permissions across your organization
            </p>
          </div>

          {/* Role Dropdown and Edit Icon - Mobile */}
          <div className="mb-[24px] flex items-center justify-between gap-[12px]">
            <div className="relative flex-1" ref={roleDropdownRef}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                }}
                className="w-full appearance-none px-[16px] py-[12px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer text-left"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: selectedRole ? '#374151' : '#9CA3AF' }}
              >
                <span>{selectedRole || "Role"}</span>
              </button>
              <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isRoleDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isRoleDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedRole(role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full px-[20px] py-[12px] text-left text-[14px] transition-colors cursor-pointer ${
                        selectedRole === role
                          ? 'bg-[#E5E7EB] text-[#000000]'
                          : 'bg-white text-[#374151] hover:bg-[#F5F7FA]'
                      }`}
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontWeight: 400
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Edit Icon - Mobile */}
            {selectedRole && selectedRole !== "" && selectedRole !== "Role" && (
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`w-[44px] h-[44px] rounded-[8px] border flex items-center justify-center transition-colors flex-shrink-0 ${
                  isEditMode 
                    ? 'border-[#004D40] bg-[#004D40] hover:bg-[#003d33]' 
                    : 'border-[#E0E0E0] bg-white hover:bg-[#F5F7FA]'
                }`}
              >
                <svg className={`w-[22px] h-[22px] ${isEditMode ? 'text-white' : 'text-[#6B7280]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>

          {/* Main Content Card - Mobile */}
          <div className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm overflow-hidden">
            {/* Menu Access Section - Mobile */}
            <div className="border-b border-[#E0E0E0]">
              <div className="px-[16px] pt-[20px] pb-[12px]">
                <h2
                  className="text-[18px] font-medium text-center"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6C6C6C' }}
                >
                  Menu Access
                </h2>
              </div>
              <div className="border-b border-[#E0E0E0] mb-[16px]"></div>

              <div className="px-[16px] pb-[20px] max-h-[400px] overflow-y-auto">
                <div className="space-y-[12px]">
                  {/* Dashboard */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.dashboard}
                      onChange={(e) => handleMenuPermissionChange('dashboard', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ 
                        accentColor: '#000000',
                        backgroundColor: 'white',
                        borderColor: '#E0E0E0'
                      }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      Dashboard
                    </label>
                  </div>

                  {/* User Management */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.userManagement.enabled}
                      onChange={(e) => handleMenuPermissionChange('userManagement.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ 
                        accentColor: '#000000',
                        backgroundColor: 'white',
                        borderColor: '#E0E0E0'
                      }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      User Management
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.userManagement.employees}
                      onChange={(e) => handleMenuPermissionChange('userManagement.employees', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ 
                        accentColor: '#000000',
                        backgroundColor: 'white',
                        borderColor: '#E0E0E0'
                      }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Employees
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.userManagement.rolesPermissions}
                      onChange={(e) => handleMenuPermissionChange('userManagement.rolesPermissions', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ 
                        accentColor: '#000000',
                        backgroundColor: 'white',
                        borderColor: '#E0E0E0'
                      }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Roles & Permissions
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.userManagement.departments}
                      onChange={(e) => handleMenuPermissionChange('userManagement.departments', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ 
                        accentColor: '#000000',
                        backgroundColor: 'white',
                        borderColor: '#E0E0E0'
                      }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Departments
                    </label>
                  </div>

                  {/* Continue with other menu items - simplified for mobile */}
                  {/* Attendance */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.attendance.enabled}
                      onChange={(e) => handleMenuPermissionChange('attendance.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      Attendance
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.attendance.dailyAttendance}
                      onChange={(e) => handleMenuPermissionChange('attendance.dailyAttendance', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Daily Attendance
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.attendance.gpsVerification}
                      onChange={(e) => handleMenuPermissionChange('attendance.gpsVerification', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - GPS Verification
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.attendance.myAttendance}
                      onChange={(e) => handleMenuPermissionChange('attendance.myAttendance', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - My Attendance
                    </label>
                  </div>

                  {/* Activities */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.activities.enabled}
                      onChange={(e) => handleMenuPermissionChange('activities.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      Activities
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.activities.allActivities}
                      onChange={(e) => handleMenuPermissionChange('activities.allActivities', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - All Activities
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.activities.activityApproval}
                      onChange={(e) => handleMenuPermissionChange('activities.activityApproval', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Activity Approval
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.activities.myActivities}
                      onChange={(e) => handleMenuPermissionChange('activities.myActivities', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - My Activities
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.activities.logActivity}
                      onChange={(e) => handleMenuPermissionChange('activities.logActivity', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Log Activity
                    </label>
                  </div>

                  {/* Locations Management */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.locationsManagement.enabled}
                      onChange={(e) => handleMenuPermissionChange('locationsManagement.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      Locations Management
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.locationsManagement.locations}
                      onChange={(e) => handleMenuPermissionChange('locationsManagement.locations', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Locations
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.locationsManagement.locationType}
                      onChange={(e) => handleMenuPermissionChange('locationsManagement.locationType', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Location Type
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.locationsManagement.locationAssignment}
                      onChange={(e) => handleMenuPermissionChange('locationsManagement.locationAssignment', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Location Assignment
                    </label>
                  </div>

                  {/* Leave Management */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.leaveManagement.enabled}
                      onChange={(e) => handleMenuPermissionChange('leaveManagement.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      Leave Management
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.leaveManagement.leaveRequests}
                      onChange={(e) => handleMenuPermissionChange('leaveManagement.leaveRequests', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Leave Requests
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.leaveManagement.requestLeave}
                      onChange={(e) => handleMenuPermissionChange('leaveManagement.requestLeave', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Request Leave
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.leaveManagement.myLeave}
                      onChange={(e) => handleMenuPermissionChange('leaveManagement.myLeave', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - My Leave
                    </label>
                  </div>

                  {/* Reports */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.reports.enabled}
                      onChange={(e) => handleMenuPermissionChange('reports.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      Reports
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.reports.attendanceReports}
                      onChange={(e) => handleMenuPermissionChange('reports.attendanceReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Attendance Reports
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.reports.fieldActivityReports}
                      onChange={(e) => handleMenuPermissionChange('reports.fieldActivityReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Field Activity Reports
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.reports.leaveReports}
                      onChange={(e) => handleMenuPermissionChange('reports.leaveReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Leave Reports
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.reports.hrReports}
                      onChange={(e) => handleMenuPermissionChange('reports.hrReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - HR Reports
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.reports.teamReports}
                      onChange={(e) => handleMenuPermissionChange('reports.teamReports', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Team Reports
                    </label>
                  </div>

                  {/* My Team */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.myTeam.enabled}
                      onChange={(e) => handleMenuPermissionChange('myTeam.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      My Team
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.myTeam.teamMembers}
                      onChange={(e) => handleMenuPermissionChange('myTeam.teamMembers', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Team Members
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.myTeam.teamAttendance}
                      onChange={(e) => handleMenuPermissionChange('myTeam.teamAttendance', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Team Attendance
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.myTeam.teamActivities}
                      onChange={(e) => handleMenuPermissionChange('myTeam.teamActivities', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Team Activities
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.myTeam.teamLeaveRequests}
                      onChange={(e) => handleMenuPermissionChange('myTeam.teamLeaveRequests', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Team Leave Requests
                    </label>
                  </div>

                  {/* More */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.more.enabled}
                      onChange={(e) => handleMenuPermissionChange('more.enabled', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      More
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.more.myProfile}
                      onChange={(e) => handleMenuPermissionChange('more.myProfile', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - My Profile
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.more.systemConfiguration}
                      onChange={(e) => handleMenuPermissionChange('more.systemConfiguration', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - System Configuration
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.more.notificationsSettings}
                      onChange={(e) => handleMenuPermissionChange('more.notificationsSettings', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Notifications Settings
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.more.apiKeys}
                      onChange={(e) => handleMenuPermissionChange('more.apiKeys', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - API Keys
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.more.helpCenter}
                      onChange={(e) => handleMenuPermissionChange('more.helpCenter', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Help Center
                    </label>
                  </div>
                  <div className="flex items-center gap-[12px] pl-[30px] mb-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.more.support}
                      onChange={(e) => handleMenuPermissionChange('more.support', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      - Support
                    </label>
                  </div>

                  {/* Log out */}
                  <div className="flex items-center gap-[12px]">
                    <input
                      type="checkbox"
                      checked={menuPermissions.logout}
                      onChange={(e) => handleMenuPermissionChange('logout', e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                      style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                    />
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                      Log out
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Permissions Section - Mobile */}
            <div>
              <div className="px-[16px] pt-[20px] pb-[12px]">
                <h2
                  className="text-[18px] font-medium text-center"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#6C6C6C' }}
                >
                  Actions Permissions
                </h2>
              </div>
              <div className="border-b border-[#E0E0E0] mb-[16px]"></div>

              <div className="px-[16px] pb-[20px] max-h-[400px] overflow-y-auto">
                <div className="space-y-[12px]">
                  {/* User Actions */}
                  <div className="mb-[8px]">
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      User Actions
                    </label>
                  </div>
                  {[
                    { key: 'viewAllEmployees', label: '- View all employees' },
                    { key: 'createEmployee', label: '- Create employee' },
                    { key: 'editEmployee', label: '- Edit employee' },
                    { key: 'disableDeleteEmployee', label: '- Disable/Delete employee' },
                    { key: 'assignRoles', label: '- Assign roles' },
                    { key: 'manageDepartments', label: '- Manage departments' }
                  ].map((action) => (
                    <div key={action.key} className="flex items-center gap-[12px]">
                      <input
                        type="checkbox"
                        checked={actionPermissions.userActions[action.key]}
                        onChange={(e) => handleActionPermissionChange('userActions', action.key, e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                      />
                      <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                        {action.label}
                      </label>
                    </div>
                  ))}

                  {/* Attendance Actions */}
                  <div className="mb-[8px] mt-[12px]">
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Attendance Actions
                    </label>
                  </div>
                  {[
                    { key: 'viewAllAttendance', label: '- View all attendance' },
                    { key: 'verifyGpsLogs', label: '- Verify GPS logs' },
                    { key: 'editAttendance', label: '- Edit attendance' },
                    { key: 'deleteAttendance', label: '- Delete attendance' },
                    { key: 'exportAttendanceData', label: '- Export attendance data' },
                    { key: 'viewTeamAttendance', label: '- View team attendance' },
                    { key: 'viewMyAttendance', label: '- View My attendance' },
                    { key: 'checkInCheckOut', label: '- Check-in/Check-out' }
                  ].map((action) => (
                    <div key={action.key} className="flex items-center gap-[12px]">
                      <input
                        type="checkbox"
                        checked={actionPermissions.attendanceActions[action.key]}
                        onChange={(e) => handleActionPermissionChange('attendanceActions', action.key, e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                      />
                      <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                        {action.label}
                      </label>
                    </div>
                  ))}

                  {/* Activity Actions */}
                  <div className="mb-[8px] mt-[12px]">
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Activity Actions
                    </label>
                  </div>
                  {[
                    { key: 'viewAllActivities', label: '- View all activities' },
                    { key: 'approveRejectActivities', label: '- Approve/Reject activities' },
                    { key: 'editActivity', label: '- Edit activity' },
                    { key: 'manageActivityTemplates', label: '- Manage activity templates' },
                    { key: 'approveRejectTeamActivities', label: '- Approve/Reject team activities' },
                    { key: 'logMyActivity', label: '- Log my activity' },
                    { key: 'viewMyActivities', label: '- View my activities' }
                  ].map((action) => (
                    <div key={action.key} className="flex items-center gap-[12px]">
                      <input
                        type="checkbox"
                        checked={actionPermissions.activityActions[action.key]}
                        onChange={(e) => handleActionPermissionChange('activityActions', action.key, e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                      />
                      <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                        {action.label}
                      </label>
                    </div>
                  ))}

                  {/* Leave Actions */}
                  <div className="mb-[8px] mt-[12px]">
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Leave Actions
                    </label>
                  </div>
                  {[
                    { key: 'viewAllLeaveRequests', label: '- View all leave requests' },
                    { key: 'approveRejectLeave', label: '- Approve/Reject leave' },
                    { key: 'adjustLeaveBalance', label: '- Adjust leave balance' },
                    { key: 'checkLeaveBalance', label: '- Check leave balance' },
                    { key: 'approveRejectTeamLeaveRequests', label: '- Approve/Reject team leave requests' },
                    { key: 'requestLeaveForSelf', label: '- Request leave for self' },
                    { key: 'viewMyLeaveStatus', label: '- View my leave status' }
                  ].map((action) => (
                    <div key={action.key} className="flex items-center gap-[12px]">
                      <input
                        type="checkbox"
                        checked={actionPermissions.leaveActions[action.key]}
                        onChange={(e) => handleActionPermissionChange('leaveActions', action.key, e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                      />
                      <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                        {action.label}
                      </label>
                    </div>
                  ))}

                  {/* Locations Actions */}
                  <div className="mb-[8px] mt-[12px]">
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Locations Actions
                    </label>
                  </div>
                  {[
                    { key: 'createEditDeleteLocations', label: '- Create/Edit/Delete locations' },
                    { key: 'assignEmployeesToLocations', label: '- Assign employees to locations' },
                    { key: 'manageLocationTypes', label: '- Manage location types' }
                  ].map((action) => (
                    <div key={action.key} className="flex items-center gap-[12px]">
                      <input
                        type="checkbox"
                        checked={actionPermissions.locationsActions[action.key]}
                        onChange={(e) => handleActionPermissionChange('locationsActions', action.key, e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                      />
                      <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                        {action.label}
                      </label>
                    </div>
                  ))}

                  {/* Reports Actions */}
                  <div className="mb-[8px] mt-[12px]">
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      Reports Actions
                    </label>
                  </div>
                  {[
                    { key: 'viewExportHrReports', label: '- View/Export HR reports' },
                    { key: 'viewExportFieldActivitiesReports', label: '- View/Export field activities reports' },
                    { key: 'viewExportAttendanceLeaveReports', label: '- View/Export attendance, leave reports' },
                    { key: 'viewExportTeamReports', label: '- View/Export team reports' }
                  ].map((action) => (
                    <div key={action.key} className="flex items-center gap-[12px]">
                      <input
                        type="checkbox"
                        checked={actionPermissions.reportsActions[action.key]}
                        onChange={(e) => handleActionPermissionChange('reportsActions', action.key, e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                      />
                      <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                        {action.label}
                      </label>
                    </div>
                  ))}

                  {/* System Actions */}
                  <div className="mb-[8px] mt-[12px]">
                    <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      System Actions
                    </label>
                  </div>
                  {[
                    { key: 'accessFullSystemConfiguration', label: '- Access full system configuration' },
                    { key: 'manageNotificationSettings', label: '- Manage notification settings' },
                    { key: 'generateDeleteApiKeys', label: '- Generate/Delete API keys' },
                    { key: 'accessSystemLogs', label: '- Access system logs' }
                  ].map((action) => (
                    <div key={action.key} className="flex items-center gap-[12px]">
                      <input
                        type="checkbox"
                        checked={actionPermissions.systemActions[action.key]}
                        onChange={(e) => handleActionPermissionChange('systemActions', action.key, e.target.checked)}
                                disabled={!isEditMode}
                                className={`w-[18px] h-[18px] rounded border-[#E0E0E0] focus:ring-[#004D40] bg-white flex-shrink-0 ${
                                  isEditMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        style={{ accentColor: '#000000', backgroundColor: 'white', borderColor: '#E0E0E0' }}
                      />
                      <label className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, cursor: 'pointer' }}>
                        {action.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error/Success Messages - Mobile */}
          {(saveError || saveSuccess) && (
            <div className="px-[16px] mt-[20px]">
              {saveError && (
                <div className="px-[16px] py-[12px] rounded-[6px] bg-red-50 border border-red-200">
                  <p className="text-[13px] text-red-600">{saveError}</p>
                </div>
              )}
              {saveSuccess && (
                <div className="px-[16px] py-[12px] rounded-[6px] bg-green-50 border border-green-200">
                  <p className="text-[13px] text-green-600">Role permissions updated successfully!</p>
                </div>
              )}
            </div>
          )}

          {/* Save and Cancel Buttons - Mobile */}
          <div className="flex justify-start gap-[12px] mt-[24px]">
            <button
              onClick={() => {
                setSelectedRole("");
                setIsRoleDropdownOpen(false);
              }}
              className="px-[48px] py-[8px] rounded-[5px] hover:opacity-90 transition-opacity"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 600, 
                fontSize: '16px', 
                backgroundColor: 'white',
                color: '#737373',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedRoleId}
              className="px-[48px] py-[8px] text-white rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 600, 
                fontSize: '16px', 
                backgroundColor: '#004D40',
                border: '1px solid #B5B1B1',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          </div>
      </div>
    </div>
    </>
  );
};

export default RolesPermissionsPage;

