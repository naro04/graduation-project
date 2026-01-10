-- Migration: Add check_in_method and check_out_method to attendance table
-- Run this script to add the new columns if the database already exists

-- Add check_in_method column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS check_in_method VARCHAR(20) DEFAULT 'GPS';

-- Add check_out_method column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS check_out_method VARCHAR(20);

-- Add a comment to document the columns
COMMENT ON COLUMN attendance.check_in_method IS 'Method used for check-in: GPS or Manual';
COMMENT ON COLUMN attendance.check_out_method IS 'Method used for check-out: GPS or Manual';

