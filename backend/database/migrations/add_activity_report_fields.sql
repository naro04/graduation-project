-- Migration: Add fields for Field Activity Reports
-- Attendees count and Actual implementation date

ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_date DATE;

-- Update existing implemented activities with a dummy actual date if needed
UPDATE activities 
SET actual_date = end_date 
WHERE implementation_status = 'Implemented' AND actual_date IS NULL;
