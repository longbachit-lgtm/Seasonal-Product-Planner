-- Seed Data for Seasonal Product Planner
-- Run this AFTER schema.sql

-- Insert seasons
INSERT INTO seasons (name, emoji, event_date, color, reminder_months_before, tips, is_active) VALUES
('Super Bowl', '🏈', '02-09', '#1E3A5F', 3, 'Tập trung vào party supplies, đồ trang trí football, và phụ kiện game day.', true),
('Valentine''s Day', '💝', '02-14', '#E11D48', 3, 'Focus vào quà romantic, trang sức, personalized items.', true),
('St. Patrick''s Day', '☘️', '03-17', '#16A34A', 3, 'Green-themed products bán rất tốt. Apparel, party supplies.', true),
('Easter', '🐣', '04-20', '#A855F7', 3, 'Easter baskets, egg hunt supplies, spring decor. Pastel colors.', true),
('Mother''s Day', '👩', '05-11', '#EC4899', 3, 'Personalized gifts cho mẹ. Jewelry, spa sets, kitchen gadgets.', true),
('Father''s Day', '👨', '06-15', '#2563EB', 3, 'Tools, BBQ accessories, golf gear, fishing equipment.', true),
('Independence Day', '🇺🇸', '07-04', '#DC2626', 3, 'Red-white-blue everything! Patriotic decor, outdoor party.', true),
('Back to School', '🎒', '08-01', '#F59E0B', 3, 'School supplies, backpacks, lunch boxes, dorm room decor.', true),
('Halloween', '🎃', '10-31', '#EA580C', 3, 'Costumes, spooky decor, trick-or-treat bags, party supplies.', true),
('Thanksgiving', '🦃', '11-27', '#B45309', 3, 'Fall decor, tablecloth, grateful signs, kitchen items.', true),
('Black Friday / Cyber Monday', '💰', '11-28', '#1F2937', 3, 'Bundle deals, gift sets, trending products.', true),
('Christmas', '🎄', '12-25', '#15803D', 3, 'Christmas decor, stocking stuffers, ugly sweaters. Mùa lớn nhất!', true);

-- Insert sample keywords (using subqueries for season_id)
INSERT INTO keywords (season_id, keyword, search_volume, competition) VALUES
((SELECT id FROM seasons WHERE name = 'Super Bowl'), 'super bowl party supplies', 'High', 'High'),
((SELECT id FROM seasons WHERE name = 'Super Bowl'), 'football decor', 'Medium', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Super Bowl'), 'game day snack trays', 'Medium', 'Low'),
((SELECT id FROM seasons WHERE name = 'Valentine''s Day'), 'valentine gifts for her', 'High', 'High'),
((SELECT id FROM seasons WHERE name = 'Valentine''s Day'), 'romantic gifts', 'High', 'High'),
((SELECT id FROM seasons WHERE name = 'Valentine''s Day'), 'heart shaped gifts', 'Medium', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Valentine''s Day'), 'rose bear', 'High', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Easter'), 'easter basket', 'High', 'High'),
((SELECT id FROM seasons WHERE name = 'Easter'), 'easter egg hunt supplies', 'High', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Easter'), 'spring wreath', 'Medium', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Mother''s Day'), 'mothers day gifts', 'High', 'High'),
((SELECT id FROM seasons WHERE name = 'Mother''s Day'), 'mom necklace', 'High', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Mother''s Day'), 'spa gift set', 'Medium', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Halloween'), 'halloween costume', 'High', 'High'),
((SELECT id FROM seasons WHERE name = 'Halloween'), 'spooky decor', 'High', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Halloween'), 'pumpkin decor', 'Medium', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Christmas'), 'christmas gifts', 'High', 'High'),
((SELECT id FROM seasons WHERE name = 'Christmas'), 'stocking stuffers', 'High', 'Medium'),
((SELECT id FROM seasons WHERE name = 'Christmas'), 'ugly christmas sweater', 'High', 'Medium');
