-- Add Facebook video platform support
-- This migration updates the existing taverns table constraint to allow 'facebook' as a valid video platform

-- Drop the existing inline constraint
ALTER TABLE public.taverns
DROP CONSTRAINT taverns_video_platform_check;

-- Add the new constraint that includes facebook
ALTER TABLE public.taverns
ADD CONSTRAINT taverns_video_platform_check CHECK (video_platform IN ('youtube', 'tiktok', 'facebook'));
