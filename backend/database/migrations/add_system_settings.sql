-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    CHECK (id = 1), -- Ensure only one row exists
    
    -- Attendance Settings
    work_start_time TIME DEFAULT '08:00:00',
    work_end_time TIME DEFAULT '16:00:00',
    max_working_hours_per_day INTEGER DEFAULT 8,
    late_tolerance_minutes INTEGER DEFAULT 15,
    allow_overtime BOOLEAN DEFAULT TRUE,
    auto_sign_out BOOLEAN DEFAULT TRUE,
    auto_sign_out_after_hours INTEGER DEFAULT 10,
    
    -- Leave Rules
    leave_approval_flow VARCHAR(50) DEFAULT 'Manager - HR', -- 'Manager - HR', 'HR only', 'Manager only', 'Auto Approve'
    annual_leave_limit_days INTEGER DEFAULT 20,
    leave_carry_over_allowed BOOLEAN DEFAULT TRUE,
    leave_auto_sign_out BOOLEAN DEFAULT FALSE,
    emergency_leave_instant_approval BOOLEAN DEFAULT FALSE,
    leave_document_required_after_days INTEGER DEFAULT 3,
    
    -- Activity Management Rules
    allowed_activity_types TEXT[] DEFAULT '{"Field Visit", "Client Meeting", "Site Inspection", "Delivery"}',
    require_approval_before_activity BOOLEAN DEFAULT TRUE,
    require_photos_on_completion BOOLEAN DEFAULT TRUE,
    enable_activity_reports BOOLEAN DEFAULT TRUE,
    
    -- General System Settings
    time_zone VARCHAR(100) DEFAULT 'Eastern Time (ET)',
    date_format VARCHAR(50) DEFAULT 'mm/dd/yy',
    first_day_of_week VARCHAR(20) DEFAULT 'Sunday',
    time_format VARCHAR(10) DEFAULT '12h',
    default_system_language VARCHAR(50) DEFAULT 'English',
    currency VARCHAR(50) DEFAULT 'USD - US Dollar $',
    number_format VARCHAR(50) DEFAULT '1,234.56 (US)',
    session_timeout_duration INTEGER DEFAULT 30, -- minutes
    auto_logout_on_inactivity BOOLEAN DEFAULT TRUE,
    remember_trusted_devices BOOLEAN DEFAULT TRUE,
    enforce_password_policy BOOLEAN DEFAULT TRUE,
    enable_two_factor_auth BOOLEAN DEFAULT FALSE,
    maximum_login_attempts INTEGER DEFAULT 5,
    default_dashboard VARCHAR(50) DEFAULT 'Overview Dashboard',
    theme_selection VARCHAR(20) DEFAULT 'Light',
    
    -- Location & GPS Settings
    gps_accuracy_threshold DECIMAL DEFAULT 50, -- meters
    geofencing_enabled BOOLEAN DEFAULT TRUE,
    geofencing_radius INTEGER DEFAULT 200, -- meters
    location_verification_method VARCHAR(50) DEFAULT 'GPS', -- 'GPS', 'QR Code', 'WiFi'
    
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Initial default settings
INSERT INTO system_settings (id) 
SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 1);

-- Configuration change history
CREATE TABLE IF NOT EXISTS system_configuration_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_type TEXT NOT NULL, -- 'Attendance', 'Leave', 'Activity', 'General'
    description TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

