-- Add Facebook video platform support
-- This allows taverns to use Facebook videos in addition to YouTube and TikTok

-- Drop the existing constraint and recreate with facebook support
ALTER TABLE public.taverns DROP CONSTRAINT IF EXISTS taverns_video_platform_check;
ALTER TABLE public.taverns ADD CONSTRAINT taverns_video_platform_check CHECK (video_platform IS NULL OR video_platform IN ('youtube', 'tiktok', 'facebook'));
