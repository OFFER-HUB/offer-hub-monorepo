-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';

-- Update existing users based on is_freelancer field
UPDATE users SET role = 'freelancer' WHERE is_freelancer = true;
UPDATE users SET role = 'client' WHERE is_freelancer = false;

-- Add constraint to ensure valid roles
ALTER TABLE users ADD CONSTRAINT check_role CHECK (role IN ('admin', 'client', 'freelancer'));

-- Create an index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);