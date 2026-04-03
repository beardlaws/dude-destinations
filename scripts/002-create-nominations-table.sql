-- Create tavern_nominations table for user-submitted recommendations
CREATE TABLE IF NOT EXISTS tavern_nominations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tavern_name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(50) DEFAULT 'OH',
  reason TEXT NOT NULL,
  submitter_name VARCHAR(255),
  submitter_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, visited, rejected
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_nominations_status ON tavern_nominations(status);
CREATE INDEX IF NOT EXISTS idx_nominations_created ON tavern_nominations(created_at DESC);

-- Enable RLS
ALTER TABLE tavern_nominations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert nominations (public submissions)
CREATE POLICY "Anyone can submit nominations" ON tavern_nominations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can view nominations (admin)
CREATE POLICY "Authenticated users can view nominations" ON tavern_nominations
  FOR SELECT TO authenticated
  USING (true);

-- Only authenticated users can update nominations (admin)
CREATE POLICY "Authenticated users can update nominations" ON tavern_nominations
  FOR UPDATE TO authenticated
  USING (true);

-- Only authenticated users can delete nominations (admin)
CREATE POLICY "Authenticated users can delete nominations" ON tavern_nominations
  FOR DELETE TO authenticated
  USING (true);
