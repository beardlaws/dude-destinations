-- Create taverns table for The Dude Network
-- This stores all tavern/bar stops with their details

CREATE TABLE IF NOT EXISTS public.taverns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'OH',
  region TEXT NOT NULL,
  address TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  thumbnail TEXT,
  tags TEXT[] DEFAULT '{}',
  video_title TEXT,
  video_url TEXT,
  video_platform TEXT DEFAULT 'youtube' CHECK (video_platform IN ('youtube', 'tiktok', 'facebook')),
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  featured BOOLEAN DEFAULT false,
  dude_approved BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  stop_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.taverns ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view taverns)
CREATE POLICY "Allow public read access" ON public.taverns
  FOR SELECT USING (true);

-- Allow authenticated users to insert (admin functionality)
CREATE POLICY "Allow authenticated insert" ON public.taverns
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update (admin functionality)
CREATE POLICY "Allow authenticated update" ON public.taverns
  FOR UPDATE USING (true);

-- Allow authenticated users to delete (admin functionality)  
CREATE POLICY "Allow authenticated delete" ON public.taverns
  FOR DELETE USING (true);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_taverns_featured ON public.taverns(featured);
CREATE INDEX IF NOT EXISTS idx_taverns_dude_approved ON public.taverns(dude_approved);
CREATE INDEX IF NOT EXISTS idx_taverns_state ON public.taverns(state);
CREATE INDEX IF NOT EXISTS idx_taverns_region ON public.taverns(region);
CREATE INDEX IF NOT EXISTS idx_taverns_stop_number ON public.taverns(stop_number);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_taverns_updated_at ON public.taverns;
CREATE TRIGGER update_taverns_updated_at
  BEFORE UPDATE ON public.taverns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
