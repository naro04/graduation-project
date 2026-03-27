import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearClientSession, getEffectiveRole, hasAnyPermission, hasValidAuthSession } from "../services/auth.js";

/**
 * Central route guard: requires a present, non-expired JWT (see auth session helpers).
 * Unauthenticated users are sent to /login with return location in state.
 */
export function ProtectedRoute() {
  const location = useLocation();
  if (!hasValidAuthSession()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/**
 * Role guard for route-level authorization.
 * Redirects to dashboard if current role is not in allowedRoles.
 */
export function RoleRoute({ allowedRoles = [] }) {
  const role = getEffectiveRole("officer");
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return <Outlet />;
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

/**
 * Permission guard for route-level authorization (RBAC slugs).
 */
export function PermissionRoute({ requiredPermissions = [] }) {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) return <Outlet />;
  if (!hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

/**
 * For login/register: if already authenticated, skip auth screens.
 */
export function PublicOnlyRoute({ children }) {
  if (hasValidAuthSession()) {
    // Treat opening /login or /register while authenticated as an explicit sign-out intent.
    clearClientSession();
  }
  return children;
}

export function HomeRedirect() {
  if (hasValidAuthSession()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

/**
 * Unknown paths: send guests to login (with intended path); authed users to dashboard.
 */
export function FallbackRoute() {
  const location = useLocation();
  if (!hasValidAuthSession()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Navigate to="/dashboard" replace />;
}
