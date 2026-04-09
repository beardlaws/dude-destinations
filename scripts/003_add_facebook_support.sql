-- Add Facebook video platform support
-- This allows taverns to use Facebook videos in addition to YouTube and TikTok

-- Note: The database constraint on video_platform will accept 'facebook' 
-- when rows are updated. No schema migration is strictly necessary since
-- the constraint allows these values: ('youtube', 'tiktok', 'facebook')

-- If you encounter constraint issues, run these commands in the Supabase SQL editor:
-- ALTER TABLE public.taverns DROP CONSTRAINT video_platform_check;
-- ALTER TABLE public.taverns ADD CONSTRAINT video_platform_check CHECK (video_platform IN ('youtube', 'tiktok', 'facebook'));
