-- Add Location & GPS fields to system_settings
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS gps_accuracy_threshold DECIMAL DEFAULT 50,
ADD COLUMN IF NOT EXISTS geofencing_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS geofencing_radius INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS location_verification_method VARCHAR(50) DEFAULT 'GPS';

