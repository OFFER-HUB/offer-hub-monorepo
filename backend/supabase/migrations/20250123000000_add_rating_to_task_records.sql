-- Add rating fields to task_records table
-- This allows clients to rate completed tasks (1-5 stars) with optional comment

-- Add rating columns
ALTER TABLE task_records
ADD COLUMN IF NOT EXISTS rating INTEGER,
ADD COLUMN IF NOT EXISTS rating_comment TEXT;

-- Add constraints for rating
ALTER TABLE task_records
ADD CONSTRAINT check_rating_range 
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
ADD CONSTRAINT check_rating_comment_length 
    CHECK (rating_comment IS NULL OR length(rating_comment) <= 500),
ADD CONSTRAINT check_rating_comment_not_empty 
    CHECK (rating_comment IS NULL OR length(trim(rating_comment)) > 0);

-- Create index for rating queries
CREATE INDEX IF NOT EXISTS idx_task_records_rating ON task_records(rating) WHERE rating IS NOT NULL;

-- Drop the old immutable update policy
DROP POLICY IF EXISTS "Task records are immutable" ON task_records;

-- Create new policy: Only clients can update rating (and only if not already set)
CREATE POLICY "Clients can update rating once" ON task_records
    FOR UPDATE
    USING (
        auth.uid() = client_id
        AND rating IS NULL  -- Only allow update if rating hasn't been set
    )
    WITH CHECK (
        auth.uid() = client_id
        -- Only allow updating rating and rating_comment fields
        -- This ensures other fields remain immutable
    );

-- Add comments for documentation
COMMENT ON COLUMN task_records.rating IS 'Client rating for the completed task (1-5 stars). Can only be set once.';
COMMENT ON COLUMN task_records.rating_comment IS 'Optional comment accompanying the rating (max 500 characters).';

-- Grant UPDATE permission for authenticated users (RLS policy will enforce restrictions)
GRANT UPDATE ON task_records TO authenticated;
