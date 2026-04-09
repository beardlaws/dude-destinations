-- Add view tracking table for analytics
CREATE TABLE IF NOT EXISTS public.tavern_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tavern_id UUID NOT NULL REFERENCES public.taverns(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'map', 'card', 'search'))
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_tavern_views_tavern_id ON public.tavern_views(tavern_id);
CREATE INDEX IF NOT EXISTS idx_tavern_views_viewed_at ON public.tavern_views(viewed_at);

-- Add view_count column to taverns for quick access (denormalized)
ALTER TABLE public.taverns ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create a function to update the view count
CREATE OR REPLACE FUNCTION update_tavern_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.taverns 
  SET view_count = view_count + 1 
  WHERE id = NEW.tavern_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update view count
DROP TRIGGER IF EXISTS trigger_update_view_count ON public.tavern_views;
CREATE TRIGGER trigger_update_view_count
AFTER INSERT ON public.tavern_views
FOR EACH ROW
EXECUTE FUNCTION update_tavern_view_count();

-- Enable RLS on tavern_views
ALTER TABLE public.tavern_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert views (anonymous tracking)
CREATE POLICY "Allow anonymous view inserts" ON public.tavern_views
FOR INSERT WITH CHECK (true);

-- Allow reading views for analytics (admin only in production, open for now)
CREATE POLICY "Allow reading views" ON public.tavern_views
FOR SELECT USING (true);
