-- ============================================
-- DATABASE SCHEMA
-- ============================================
-- This file contains the complete database schema
-- Run this file to create all tables in your PostgreSQL database
--
-- Usage:
--   psql -U username -d database_name -f src/db/schema.sql
--   OR
--   Use the setup-database.ts script: npm run db:setup
-- ============================================

-- Enable UUID extension (for generating unique IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table - stores user account information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Refresh tokens table - stores refresh tokens for authentication
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP
);

-- ============================================
-- ROLE-BASED ACCESS CONTROL (RBAC)
-- ============================================

-- Roles table - stores different user roles (e.g., Admin, Manager, Employee)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Permissions table - stores individual permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE, -- e.g., 'menu:dashboard', 'action:create_employee'
  display_name TEXT NOT NULL, -- e.g., "Dashboard", "Create Employee"
  description TEXT,
  resource TEXT, -- e.g., "employees" (used for grouping actions)
  action TEXT, -- e.g., "read" (optional for menus)
  permission_type VARCHAR(50) NOT NULL, -- 'menu' or 'action'
  parent_id UUID REFERENCES permissions(id), -- For hierarchical structure
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Role permissions table - links roles to permissions (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User roles table - links users to roles (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- DEPARTMENTS & EMPLOYEES
-- ============================================

-- Departments table - stores department information
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  is_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Positions table - stores job positions
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(title, department_id)
);

-- Employees table - stores employee information
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id), -- Link to user account (nullable)
  employee_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date TIMESTAMP,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  avatar_url TEXT,
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  role_id UUID REFERENCES roles(id),
  employment_type VARCHAR(50), -- Full-Time, Part-Time
  supervisor_id UUID, -- Self-reference for manager hierarchy
  city TEXT,
  country TEXT,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  hired_at TIMESTAMP,
  terminated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- ATTENDANCE
-- ============================================

-- Attendance table - stores employee check-in/check-out records
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  
  -- Location & GPS Verification
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  distance_from_base DECIMAL(10, 2), -- Distance in meters from assigned location
  gps_status VARCHAR(50) DEFAULT 'Not Verified', -- 'Verified', 'Suspicious', 'Not Verified', 'Rejected'
  
  -- Check-in/Check-out method tracking
  check_in_method VARCHAR(20) DEFAULT 'GPS', -- 'GPS' or 'Manual'
  check_out_method VARCHAR(20), -- 'GPS' or 'Manual'
  
  -- Attendance details
  daily_status VARCHAR(50), -- 'Present', 'Late', 'Absent', 'Missing Check-out'
  work_type VARCHAR(50) DEFAULT 'Office', -- 'Office', 'Remote', 'Field'
  
  notes TEXT,
  approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEAVES
-- ============================================

-- Leave requests table - stores employee leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- vacation, sick, personal, etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  document_url TEXT,
  admin_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leave balances table - tracks leave quotas and usage per employee
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, leave_type)
);

-- ============================================
-- LOCATIONS
-- ============================================

-- Location types table - stores location type information
CREATE TABLE IF NOT EXISTS location_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Locations table - stores location information
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_type TEXT,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Employee locations table - links employees to locations (many-to-many)
CREATE TABLE IF NOT EXISTS employee_locations (
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, location_id)
);

-- ============================================
-- ACTIVITIES
-- ============================================

-- Projects table - stores project information
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activities table - stores employee field activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE, -- Nullable for location activities
  project_id UUID REFERENCES projects(id), -- Link to project
  name TEXT NOT NULL, -- Activity title/name
  activity_type TEXT,
  description TEXT,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- For location activities
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  start_date DATE, -- For location activities
  end_date DATE, -- For location activities
  activity_days INTEGER, -- Number of days for location activities
  status VARCHAR(50) DEFAULT 'Active', -- Status for location activities
  
  -- Statuses
  implementation_status VARCHAR(50) DEFAULT 'Planned', -- 'Planned', 'Implemented', 'Cancelled'
  approval_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activity employees table - links employees to activities (many-to-many for location activities)
CREATE TABLE IF NOT EXISTS activity_employees (
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY (activity_id, employee_id)
);

-- ============================================
-- EMERGENCY CONTACTS
-- ============================================

-- Emergency contacts table - stores employee emergency contact information
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  address TEXT,
  email TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- ============================================
-- USER PREFERENCES
-- ============================================

-- User notification settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    -- Attendance
    attendance_check_in_out_email BOOLEAN DEFAULT TRUE,
    attendance_check_in_out_in_app BOOLEAN DEFAULT TRUE,
    attendance_late_arrival_email BOOLEAN DEFAULT TRUE,
    attendance_late_arrival_in_app BOOLEAN DEFAULT TRUE,
    attendance_early_departure_email BOOLEAN DEFAULT TRUE,
    attendance_early_departure_in_app BOOLEAN DEFAULT TRUE,
    -- Leaves
    leave_new_request_email BOOLEAN DEFAULT TRUE,
    leave_new_request_in_app BOOLEAN DEFAULT TRUE,
    leave_request_approved_email BOOLEAN DEFAULT TRUE,
    leave_request_approved_in_app BOOLEAN DEFAULT TRUE,
    leave_request_rejected_email BOOLEAN DEFAULT TRUE,
    leave_request_rejected_in_app BOOLEAN DEFAULT TRUE,
    -- Activities
    activity_new_assigned_email BOOLEAN DEFAULT TRUE,
    activity_new_assigned_in_app BOOLEAN DEFAULT TRUE,
    activity_completed_email BOOLEAN DEFAULT TRUE,
    activity_completed_in_app BOOLEAN DEFAULT TRUE,
    activity_overdue_email BOOLEAN DEFAULT TRUE,
    activity_overdue_in_app BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    permissions TEXT[] DEFAULT '{read}',
    status VARCHAR(50) DEFAULT 'Active',
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    status VARCHAR(50) DEFAULT 'In Progress',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES (for better query performance)
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Employee indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_employee_code ON employees(employee_code);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_time ON attendance(check_in_time);

-- Leave requests indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_employee_id ON activities(employee_id);
CREATE INDEX IF NOT EXISTS idx_activities_impl_status ON activities(implementation_status);
CREATE INDEX IF NOT EXISTS idx_activities_appr_status ON activities(approval_status);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Role permissions indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_permissions_parent_id ON permissions(parent_id);