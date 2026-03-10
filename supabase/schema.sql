-- ============================================================
-- SEASONAL PRODUCT PLANNER - SUPABASE SETUP
-- Chạy toàn bộ file này trong SQL Editor của Supabase
-- ============================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SEASONS TABLE
CREATE TABLE IF NOT EXISTS seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🎉',
  event_date TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  reminder_months_before INT DEFAULT 3,
  tips TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KEYWORDS TABLE
CREATE TABLE IF NOT EXISTS keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  reference_url TEXT,
  search_volume TEXT CHECK (search_volume IN ('High', 'Medium', 'Low')),
  competition TEXT,
  notes TEXT,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'reminder' CHECK (type IN ('reminder', 'new_keyword', 'deadline')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER SEASON PROGRESS TABLE
CREATE TABLE IF NOT EXISTS user_season_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'researching', 'developing', 'ready', 'launched')),
  personal_notes TEXT,
  target_products INT,
  completed_products INT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, season_id)
);

-- 6. EXCEL IMPORTS TABLE
CREATE TABLE IF NOT EXISTS excel_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  total_keywords INT DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS - ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_imports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "profiles_read" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "seasons_read" ON seasons;
DROP POLICY IF EXISTS "seasons_write" ON seasons;
DROP POLICY IF EXISTS "keywords_read" ON keywords;
DROP POLICY IF EXISTS "keywords_insert" ON keywords;
DROP POLICY IF EXISTS "keywords_delete" ON keywords;
DROP POLICY IF EXISTS "notifications_own" ON notifications;
DROP POLICY IF EXISTS "progress_own" ON user_season_progress;
DROP POLICY IF EXISTS "excel_read" ON excel_imports;
DROP POLICY IF EXISTS "excel_insert" ON excel_imports;

-- Profiles policies
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Seasons: all can read, authenticated can write
CREATE POLICY "seasons_read" ON seasons FOR SELECT USING (true);
CREATE POLICY "seasons_write" ON seasons FOR ALL USING (auth.role() = 'authenticated');

-- Keywords
CREATE POLICY "keywords_read" ON keywords FOR SELECT USING (true);
CREATE POLICY "keywords_insert" ON keywords FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "keywords_delete" ON keywords FOR DELETE USING (auth.uid() = added_by);

-- Notifications
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Progress
CREATE POLICY "progress_own" ON user_season_progress FOR ALL USING (auth.uid() = user_id);

-- Excel imports
CREATE POLICY "excel_read" ON excel_imports FOR SELECT USING (true);
CREATE POLICY "excel_insert" ON excel_imports FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_keywords_season ON keywords(season_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_season ON user_season_progress(user_id, season_id);

-- ============================================================
-- TRIGGER: Tự động tạo profile khi có user mới đăng ký
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Không để lỗi trigger chặn quá trình đăng ký
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA: 12 Seasons
-- ============================================================
INSERT INTO seasons (name, emoji, event_date, color, reminder_months_before, tips, is_active) VALUES
('Super Bowl', '🏈', '02-09', '#1E3A5F', 3, 'Party supplies, đồ football, game day accessories.', true),
('Valentine''s Day', '💝', '02-14', '#E11D48', 3, 'Quà romantic, trang sức, personalized items.', true),
('St. Patrick''s Day', '☘️', '03-17', '#16A34A', 3, 'Green-themed products, apparel, party supplies.', true),
('Easter', '🐣', '04-20', '#A855F7', 3, 'Easter baskets, egg hunt supplies, spring decor.', true),
('Mother''s Day', '👩', '05-11', '#EC4899', 3, 'Personalized gifts, jewelry, spa sets, kitchen gadgets.', true),
('Father''s Day', '👨', '06-15', '#2563EB', 3, 'Tools, BBQ accessories, golf gear, fishing equipment.', true),
('Independence Day', '🇺🇸', '07-04', '#DC2626', 3, 'Patriotic decor, flags, outdoor party supplies.', true),
('Back to School', '🎒', '08-01', '#F59E0B', 3, 'School supplies, backpacks, lunch boxes, teacher gifts.', true),
('Halloween', '🎃', '10-31', '#EA580C', 3, 'Costumes, spooky decor, trick-or-treat bags.', true),
('Thanksgiving', '🦃', '11-27', '#B45309', 3, 'Fall decor, tablecloth, grateful signs, kitchen items.', true),
('Black Friday / Cyber Monday', '💰', '11-28', '#1F2937', 3, 'Bundle deals, gift sets, trending products.', true),
('Christmas', '🎄', '12-25', '#15803D', 3, 'Decor, stocking stuffers, ugly sweaters, gift wrapping.', true)
ON CONFLICT DO NOTHING;

-- SEED KEYWORDS (chỉ chạy 1 lần)
DO $$
DECLARE
  v_super_bowl UUID;
  v_valentines UUID;
  v_st_patricks UUID;
  v_easter UUID;
  v_mothers UUID;
  v_fathers UUID;
  v_independence UUID;
  v_back_school UUID;
  v_halloween UUID;
  v_thanksgiving UUID;
  v_black_friday UUID;
  v_christmas UUID;
BEGIN
  SELECT id INTO v_super_bowl FROM seasons WHERE name = 'Super Bowl' LIMIT 1;
  SELECT id INTO v_valentines FROM seasons WHERE name = 'Valentine''s Day' LIMIT 1;
  SELECT id INTO v_st_patricks FROM seasons WHERE name = 'St. Patrick''s Day' LIMIT 1;
  SELECT id INTO v_easter FROM seasons WHERE name = 'Easter' LIMIT 1;
  SELECT id INTO v_mothers FROM seasons WHERE name = 'Mother''s Day' LIMIT 1;
  SELECT id INTO v_fathers FROM seasons WHERE name = 'Father''s Day' LIMIT 1;
  SELECT id INTO v_independence FROM seasons WHERE name = 'Independence Day' LIMIT 1;
  SELECT id INTO v_back_school FROM seasons WHERE name = 'Back to School' LIMIT 1;
  SELECT id INTO v_halloween FROM seasons WHERE name = 'Halloween' LIMIT 1;
  SELECT id INTO v_thanksgiving FROM seasons WHERE name = 'Thanksgiving' LIMIT 1;
  SELECT id INTO v_black_friday FROM seasons WHERE name = 'Black Friday / Cyber Monday' LIMIT 1;
  SELECT id INTO v_christmas FROM seasons WHERE name = 'Christmas' LIMIT 1;

  INSERT INTO keywords (season_id, keyword, search_volume, competition) VALUES
  (v_super_bowl, 'super bowl party supplies', 'High', 'High'),
  (v_super_bowl, 'football decor', 'Medium', 'Medium'),
  (v_super_bowl, 'game day snack trays', 'Medium', 'Low'),
  (v_valentines, 'valentine gifts for her', 'High', 'High'),
  (v_valentines, 'romantic gifts', 'High', 'High'),
  (v_valentines, 'rose bear', 'High', 'Medium'),
  (v_valentines, 'love necklace', 'Medium', 'Medium'),
  (v_st_patricks, 'st patricks day shirt', 'High', 'Medium'),
  (v_st_patricks, 'shamrock decor', 'Medium', 'Low'),
  (v_easter, 'easter basket', 'High', 'High'),
  (v_easter, 'easter egg hunt supplies', 'High', 'Medium'),
  (v_easter, 'spring wreath', 'Medium', 'Medium'),
  (v_mothers, 'mothers day gifts', 'High', 'High'),
  (v_mothers, 'mom necklace', 'High', 'Medium'),
  (v_mothers, 'spa gift set', 'Medium', 'Medium'),
  (v_fathers, 'fathers day gifts', 'High', 'High'),
  (v_fathers, 'bbq gifts', 'Medium', 'Medium'),
  (v_fathers, 'golf accessories', 'Medium', 'Low'),
  (v_independence, '4th of july decor', 'High', 'Medium'),
  (v_independence, 'patriotic shirts', 'High', 'Medium'),
  (v_back_school, 'school supplies', 'High', 'High'),
  (v_back_school, 'backpacks', 'High', 'High'),
  (v_back_school, 'teacher gifts', 'Medium', 'Low'),
  (v_halloween, 'halloween costume', 'High', 'High'),
  (v_halloween, 'spooky decor', 'High', 'Medium'),
  (v_halloween, 'pumpkin decor', 'Medium', 'Medium'),
  (v_thanksgiving, 'thanksgiving decor', 'High', 'Medium'),
  (v_thanksgiving, 'fall wreath', 'Medium', 'Medium'),
  (v_black_friday, 'gift bundles', 'High', 'Medium'),
  (v_black_friday, 'holiday gift sets', 'High', 'Medium'),
  (v_christmas, 'christmas gifts', 'High', 'High'),
  (v_christmas, 'stocking stuffers', 'High', 'Medium'),
  (v_christmas, 'ugly christmas sweater', 'High', 'Medium')
  ON CONFLICT DO NOTHING;
END $$;
