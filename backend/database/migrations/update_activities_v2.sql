-- Migration to add project_id and images to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS images TEXT[]; -- Array of image URLs or base64 strings

