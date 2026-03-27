import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { getEffectiveRole } from './services/auth.js'
import {
  ProtectedRoute,
  RoleRoute,
  PermissionRoute,
  PublicOnlyRoute,
  HomeRedirect,
  FallbackRoute,
} from './routing/RouteGuards.jsx'
import LoginPage from './components/LoginPage.jsx'
import RegisterPage from './components/RegisterPage.jsx'
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx'
import ResetPasswordPage from './components/ResetPasswordPage.jsx'
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
import TeamMembersPage from './components/TeamMembersPage.jsx'
import TeamAttendancePage from './components/TeamAttendancePage.jsx'
import TeamActivitiesPage from './components/TeamActivitiesPage.jsx'
import TeamLeaveRequestsPage from './components/TeamLeaveRequestsPage.jsx'
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

// Activities has no single index for some roles — redirect to first sub-route or dashboard
function ActivitiesOrRedirect() {
  const role = getEffectiveRole('superAdmin')
  if (role === 'manager') return <Navigate to="/my-team/activities" replace />
  if (role === 'fieldEmployee') return <Navigate to="/activities/log" replace />
  if (role === 'officer') return <Navigate to="/dashboard" replace />
  return <ActivitiesPage userRole="superAdmin" />
}

function DashboardRedirect() {
  const role = getEffectiveRole('officer')
  if (role === 'superAdmin') return <Navigate to="/dashboard/super-admin" replace />
  if (role === 'hr') return <Navigate to="/dashboard/hr" replace />
  if (role === 'manager') return <Navigate to="/dashboard/manager" replace />
  if (role === 'fieldEmployee') return <Navigate to="/dashboard/field-employee" replace />
  return <Navigate to="/dashboard/officer" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth pages — no JWT required */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* All app routes: central guard (JWT + expiry) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route element={<RoleRoute allowedRoles={['superAdmin']} />}>
            <Route path="/dashboard/super-admin" element={<DashboardPage userRole="superAdmin" />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['hr']} />}>
            <Route path="/dashboard/hr" element={<DashboardPage userRole="hr" />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['manager']} />}>
            <Route path="/dashboard/manager" element={<DashboardPage userRole="manager" />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['fieldEmployee']} />}>
            <Route path="/dashboard/field-employee" element={<DashboardPage userRole="fieldEmployee" />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['officer']} />}>
            <Route path="/dashboard/officer" element={<DashboardPage userRole="officer" />} />
          </Route>

          <Route path="/more/profile" element={<ProfilePageWithSidebar userRole="superAdmin" />} />
          <Route path="/profile" element={<ProfilePageWithSidebar userRole="superAdmin" />} />
          <Route path="/profile/super-admin" element={<ProfilePageWithSidebar userRole="superAdmin" />} />
          <Route path="/profile/hr" element={<ProfilePageWithSidebar userRole="hr" />} />
          <Route path="/profile/manager" element={<ProfilePageWithSidebar userRole="manager" />} />
          <Route path="/profile/field-employee" element={<ProfilePageWithSidebar userRole="fieldEmployee" />} />
          <Route path="/profile/officer" element={<ProfilePageWithSidebar userRole="officer" />} />

          <Route path="/user-management/employees" element={<EmployeesPage userRole="superAdmin" />} />
          <Route path="/user-management/roles" element={<RolesPermissionsPage userRole="superAdmin" />} />
          <Route path="/user-management/departments" element={<DepartmentsPage userRole="superAdmin" />} />

          <Route path="/attendance/daily" element={<DailyAttendancePage userRole="superAdmin" />} />
          <Route path="/attendance/gps" element={<GPSVerificationsPage userRole="superAdmin" />} />
          <Route path="/attendance/details" element={<AttendanceDetailsPage userRole="superAdmin" />} />
          <Route path="/attendance/gps-location" element={<GPSLocationDetailsPage userRole="superAdmin" />} />
          <Route path="/attendance/my" element={<MyAttendancePage userRole="superAdmin" />} />
          <Route path="/attendance/my-attendance" element={<MyAttendancePage userRole="superAdmin" />} />

          <Route path="/activities" element={<ActivitiesOrRedirect />} />
          <Route path="/activities/details" element={<ActivityDetailsPage userRole="superAdmin" />} />
          <Route path="/activities/log" element={<ActivitiesPage userRole="superAdmin" />} />
          <Route path="/activities/my" element={<ActivitiesPage userRole="superAdmin" />} />
          <Route path="/approvals/activities" element={<ActivitiesPage userRole="superAdmin" />} />

          <Route path="/locations/all" element={<LocationsPage userRole="superAdmin" />} />
          <Route path="/locations/types" element={<LocationTypePage userRole="superAdmin" />} />
          <Route path="/locations/assignment" element={<LocationAssignmentPage userRole="superAdmin" />} />
          <Route path="/locations/assignment/activities/:locationName" element={<LocationActivitiesPage userRole="superAdmin" />} />
          <Route path="/locations/assignment/activities/:locationName/employees/:activityName" element={<ViewEmployeesPage userRole="superAdmin" />} />
          <Route path="/locations/assignment/employees/:locationName" element={<ViewLocationEmployeesPage userRole="superAdmin" />} />

          <Route path="/my-team/members" element={<TeamMembersPage userRole="manager" />} />
          <Route path="/my-team/attendance" element={<TeamAttendancePage userRole="manager" />} />
          <Route path="/my-team/activities" element={<TeamActivitiesPage userRole="manager" />} />
          <Route path="/my-team/leave" element={<TeamLeaveRequestsPage userRole="manager" />} />

          <Route path="/leave/requests" element={<LeaveManagementPage userRole="superAdmin" />} />
          <Route path="/leave/request" element={<RequestLeavePage userRole="superAdmin" />} />
          <Route path="/leave/my" element={<MyLeavePage userRole="superAdmin" />} />
          <Route path="/leaves/my-leaves" element={<MyLeavePage userRole="superAdmin" />} />

          <Route path="/reports/attendance" element={<AttendanceReportPage userRole="superAdmin" />} />
          <Route path="/reports/activities" element={<FieldActivityReportsPage userRole="superAdmin" />} />
          <Route path="/reports/leave" element={<LeaveReportsPage userRole="superAdmin" />} />
          <Route path="/reports/hr" element={<HRReportsPage userRole="superAdmin" />} />
          <Route path="/reports/team" element={<AttendanceReportPage userRole="superAdmin" />} />

          <Route path="/more/config" element={<SystemConfigurationPage userRole="superAdmin" />} />
          <Route path="/system/configuration" element={<SystemConfigurationPage userRole="superAdmin" />} />

          <Route path="/more/notifications" element={<NotificationsSettingsPage userRole="superAdmin" />} />

          <Route element={<PermissionRoute requiredPermissions={['more:api_keys']} />}>
            <Route path="/more/api-keys" element={<APIKeysPage userRole="superAdmin" />} />
          </Route>

          <Route path="/more/help" element={<HelpCenterPage userRole="superAdmin" />} />

          <Route path="/more/support" element={<SupportPage userRole="superAdmin" />} />
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </Router>
  )
}

export default App
