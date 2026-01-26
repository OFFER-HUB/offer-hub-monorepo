-- Migration: Add freelancer and escrow to projects
-- Description: Adds freelancer_id and escrow_address columns, updates project_status enum
-- Date: 2026-01-21

-- Add missing values to project_status enum
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'open';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'deleted';

-- Add freelancer_id and escrow_address columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS escrow_address TEXT;

-- Create index for freelancer_id lookups
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);

-- Drop the redundant CHECK constraint
-- (The enum already enforces valid status values, so CHECK constraint is unnecessary)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_project_status'
    ) THEN
        ALTER TABLE projects DROP CONSTRAINT check_project_status;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN projects.freelancer_id IS 'Reference to the freelancer assigned to this project';
COMMENT ON COLUMN projects.escrow_address IS 'Stellar blockchain escrow account address for this project';