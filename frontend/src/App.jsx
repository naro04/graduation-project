import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage.jsx'
import RegisterPage from './components/RegisterPage.jsx'
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx'
import DashboardPage from './components/DashboardPage.jsx'
import ProfilePageWithSidebar from './components/ProfilePageWithSidebar.jsx'
import EmployeesPage from './components/EmployeesPage.jsx'
import DepartmentsPage from './components/DepartmentsPage.jsx'
import RolesPermissionsPage from './components/RolesPermissionsPage.jsx'
import DailyAttendancePage from './components/DailyAttendancePage.jsx'
import AttendanceDetailsPage from './components/AttendanceDetailsPage.jsx'
import GPSVerificationsPage from './components/GPSVerificationsPage.jsx'
import GPSLocationDetailsPage from './components/GPSLocationDetailsPage.jsx'
import MyAttendancePage from './components/MyAttendancePage.jsx'
import ActivitiesPage from './components/ActivitiesPage.jsx'
import ActivityDetailsPage from './components/ActivityDetailsPage.jsx'
import LocationsPage from './components/LocationsPage.jsx'
import LocationTypePage from './components/LocationTypePage.jsx'
import LocationAssignmentPage from './components/LocationAssignmentPage.jsx'
import LocationActivitiesPage from './components/LocationActivitiesPage.jsx'
import ViewEmployeesPage from './components/ViewEmployeesPage.jsx'
import ViewLocationEmployeesPage from './components/ViewLocationEmployeesPage.jsx'
import LeaveManagementPage from './components/LeaveRequestsPage.jsx'
import RequestLeavePage from './components/RequestLeavePage.jsx'
import MyLeavePage from './components/MyLeavePage.jsx'
import AttendanceReportPage from './components/AttendanceReportPage.jsx'
import FieldActivityReportsPage from './components/FieldActivityReportsPage.jsx'
import LeaveReportsPage from './components/LeaveReportsPage.jsx'
import HRReportsPage from './components/HRReportsPage.jsx'
import SystemConfigurationPage from './components/SystemConfigurationPage.jsx'
import NotificationsSettingsPage from './components/NotificationsSettingsPage.jsx'
import APIKeysPage from './components/APIKeysPage.jsx'
import HelpCenterPage from './components/HelpCenterPage.jsx'
import SupportPage from './components/SupportPage.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Dashboard routes for different roles */}
        <Route path="/dashboard" element={<DashboardPage userRole="superAdmin" />} />
        <Route path="/dashboard/super-admin" element={<DashboardPage userRole="superAdmin" />} />
        <Route path="/dashboard/hr" element={<DashboardPage userRole="hr" />} />
        <Route path="/dashboard/manager" element={<DashboardPage userRole="manager" />} />
        <Route path="/dashboard/field-employee" element={<DashboardPage userRole="fieldEmployee" />} />
        <Route path="/dashboard/officer" element={<DashboardPage userRole="officer" />} />

        {/* Profile routes for different roles */}
        <Route path="/more/profile" element={<ProfilePageWithSidebar userRole="superAdmin" />} />
        <Route path="/profile" element={<ProfilePageWithSidebar userRole="superAdmin" />} />
        <Route path="/profile/super-admin" element={<ProfilePageWithSidebar userRole="superAdmin" />} />
        <Route path="/profile/hr" element={<ProfilePageWithSidebar userRole="hr" />} />
        <Route path="/profile/manager" element={<ProfilePageWithSidebar userRole="manager" />} />
        <Route path="/profile/field-employee" element={<ProfilePageWithSidebar userRole="fieldEmployee" />} />
        <Route path="/profile/officer" element={<ProfilePageWithSidebar userRole="officer" />} />

        {/* User Management routes */}
        <Route path="/user-management/employees" element={<EmployeesPage userRole="superAdmin" />} />
        <Route path="/user-management/roles" element={<RolesPermissionsPage userRole="superAdmin" />} />
        <Route path="/user-management/departments" element={<DepartmentsPage userRole="superAdmin" />} />
        
        {/* Attendance routes */}
        <Route path="/attendance/daily" element={<DailyAttendancePage userRole="superAdmin" />} />
        <Route path="/attendance/gps" element={<GPSVerificationsPage userRole="superAdmin" />} />
        <Route path="/attendance/details" element={<AttendanceDetailsPage userRole="superAdmin" />} />
        <Route path="/attendance/gps-location" element={<GPSLocationDetailsPage userRole="superAdmin" />} />
        <Route path="/attendance/my" element={<MyAttendancePage userRole="superAdmin" />} />
        
        {/* Activities routes */}
        <Route path="/activities" element={<ActivitiesPage userRole="superAdmin" />} />
        <Route path="/activities/details" element={<ActivityDetailsPage userRole="superAdmin" />} />
        
        {/* Locations Management routes */}
        <Route path="/locations/all" element={<LocationsPage userRole="superAdmin" />} />
        <Route path="/locations/types" element={<LocationTypePage userRole="superAdmin" />} />
        <Route path="/locations/assignment" element={<LocationAssignmentPage userRole="superAdmin" />} />
        <Route path="/locations/assignment/activities/:locationName" element={<LocationActivitiesPage userRole="superAdmin" />} />
        <Route path="/locations/assignment/activities/:locationName/employees/:activityName" element={<ViewEmployeesPage userRole="superAdmin" />} />
        <Route path="/locations/assignment/employees/:locationName" element={<ViewLocationEmployeesPage userRole="superAdmin" />} />
        
        {/* Leave Management routes */}
        <Route path="/leave/requests" element={<LeaveManagementPage userRole="superAdmin" />} />
        <Route path="/leave/request" element={<RequestLeavePage userRole="superAdmin" />} />
        <Route path="/leave/my" element={<MyLeavePage userRole="superAdmin" />} />
        
        {/* Reports routes */}
        <Route path="/reports/attendance" element={<AttendanceReportPage userRole="superAdmin" />} />
        <Route path="/reports/activities" element={<FieldActivityReportsPage userRole="superAdmin" />} />
        <Route path="/reports/leave" element={<LeaveReportsPage userRole="superAdmin" />} />
        <Route path="/reports/hr" element={<HRReportsPage userRole="superAdmin" />} />
        
        {/* System Configuration routes */}
        <Route path="/more/config" element={<SystemConfigurationPage userRole="superAdmin" />} />
        <Route path="/system/configuration" element={<SystemConfigurationPage userRole="superAdmin" />} />
        
        {/* Notifications Settings routes */}
        <Route path="/more/notifications" element={<NotificationsSettingsPage userRole="superAdmin" />} />
        
        {/* API Keys routes */}
        <Route path="/more/api-keys" element={<APIKeysPage userRole="superAdmin" />} />
        
        {/* Help Center routes */}
        <Route path="/more/help" element={<HelpCenterPage userRole="superAdmin" />} />
        
        {/* Support routes */}
        <Route path="/more/support" element={<SupportPage userRole="superAdmin" />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App

