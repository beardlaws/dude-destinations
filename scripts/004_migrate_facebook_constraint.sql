-- Migrate taverns table to support Facebook videos
-- Step 1: Rename the old constraint temporarily
ALTER TABLE public.taverns
RENAME CONSTRAINT taverns_video_platform_check TO taverns_video_platform_check_old;

-- Step 2: Drop the old constraint
ALTER TABLE public.taverns
DROP CONSTRAINT taverns_video_platform_check_old;

-- Step 3: Add the new constraint with facebook support
ALTER TABLE public.taverns
ADD CONSTRAINT taverns_video_platform_check CHECK (video_platform IN ('youtube', 'tiktok', 'facebook'));
