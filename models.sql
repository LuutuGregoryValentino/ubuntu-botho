-- ALBUMS
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_r2_url TEXT,
  location TEXT,
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IMAGES 
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  r2_url TEXT NOT NULL,
  original_drive_id TEXT,
  caption TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SITE CONTENT
CREATE TABLE site_content (
  key TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for high-speed query performance
CREATE INDEX idx_images_pinned ON images(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_images_album ON images(album_id);
CREATE INDEX idx_images_order ON images(display_order ASC);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 4. CREATE PUBLIC READ POLICIES
CREATE POLICY "Allow public read access for albums" 
  ON albums FOR SELECT USING (true);

CREATE POLICY "Allow public read access for images" 
  ON images FOR SELECT USING (true);

CREATE POLICY "Allow public read access for site_content" 
  ON site_content FOR SELECT USING (true);