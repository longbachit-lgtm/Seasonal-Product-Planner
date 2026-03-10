
📅 SEASONAL PRODUCT PLANNER
Amazon Seasonal Research & Reminder Platform

VIBE CODING PROMPT — Full Specification Document
Platform: Antigravity / Cursor / Bolt / Lovable / Any AI Code Tool
Tech Stack: Next.js + Supabase + Tailwind CSS
Version: 1.0 — March 2026
 
🎯  MASTER PROMPT — Copy & Paste vào Antigravity

PROMPT BẮT ĐẦU (Copy toàn bộ phần trong khung này):

Build me a full-stack web application called "Seasonal Product Planner"
for Amazon sellers to research and prepare products by season.

TECH STACK:
- Frontend: Next.js 14+ (App Router) with TypeScript
- Styling: Tailwind CSS + shadcn/ui components
- Backend/DB: Supabase (Auth + PostgreSQL + Realtime)
- Deployment: Vercel
- Responsive: Mobile-first design, works on all devices

CORE CONCEPT:
The app reminds Amazon sellers 3 MONTHS BEFORE each seasonal event
(Valentine's Day, St. Patrick's, Easter, Mother's Day, etc.)
to start researching and developing products.
Example: Valentine's Day = Feb 14 → Reminder starts Nov 14.

DATABASE SCHEMA (Supabase PostgreSQL):

Table: profiles
  - id (uuid, FK to auth.users)
  - full_name (text)
  - avatar_url (text, nullable)
  - role (text: 'admin' | 'member', default 'member')
  - notification_enabled (boolean, default true)
  - created_at (timestamptz)

Table: seasons
  - id (uuid, PK)
  - name (text) -- e.g. "Valentine's Day"
  - emoji (text) -- e.g. "💝"
  - event_date (text) -- MM-DD format e.g. "02-14"
  - color (text) -- hex color
  - reminder_months_before (int, default 3)
  - tips (text) -- research tips in Vietnamese
  - is_active (boolean, default true)
  - created_by (uuid, FK to profiles)
  - created_at (timestamptz)

Table: keywords
  - id (uuid, PK)
  - season_id (uuid, FK to seasons)
  - keyword (text)
  - reference_url (text, nullable)
  - search_volume (text, nullable) -- e.g. "High", "Medium", "Low"
  - competition (text, nullable)
  - notes (text, nullable)
  - added_by (uuid, FK to profiles)
  - created_at (timestamptz)

Table: notifications
  - id (uuid, PK)
  - user_id (uuid, FK to profiles)
  - season_id (uuid, FK to seasons)
  - title (text)
  - message (text)
  - type (text: 'reminder' | 'new_keyword' | 'deadline')
  - is_read (boolean, default false)
  - created_at (timestamptz)

Table: user_season_progress
  - id (uuid, PK)
  - user_id (uuid, FK to profiles)
  - season_id (uuid, FK to seasons)
  - status (text: 'not_started'|'researching'|'developing'|'ready'|'launched')
  - personal_notes (text, nullable)
  - target_products (int, nullable)
  - completed_products (int, nullable)
  - updated_at (timestamptz)

Table: excel_imports
  - id (uuid, PK)
  - season_id (uuid, FK to seasons)
  - uploaded_by (uuid, FK to profiles)
  - file_name (text)
  - total_keywords (int)
  - status (text: 'processing' | 'completed' | 'error')
  - created_at (timestamptz)

PAGES & FEATURES:

1. AUTH PAGES (/login, /register):
   - Supabase Auth with email/password
   - Google OAuth login
   - Beautiful login page with seasonal background animation
   - After login → redirect to Dashboard

2. DASHBOARD (/ - main page after login):
   - Hero section showing CURRENT active reminders with countdown timer
   - Cards for each upcoming season sorted by urgency (closest first)
   - Each card shows: season name, emoji, days until event,
     days until research deadline, status badge, progress bar
   - Color-coded urgency: RED (<30 days), ORANGE (30-60), YELLOW (60-90), GREEN (>90)
   - Quick stats: total seasons tracked, keywords researched, products in progress
   - Notification bell icon with unread count badge

3. SEASONAL CALENDAR (/calendar):
   - Full year timeline view showing all seasons
   - Visual bars showing "research window" (3 months before each event)
   - Today marker line
   - Click on season → go to detail page
   - Toggle between timeline view and calendar grid view

4. SEASON DETAIL PAGE (/season/[id]):
   - Season header with emoji, name, dates, countdown
   - KEYWORD TABLE: searchable, sortable table of all keywords
     Columns: Keyword, Reference URL (clickable), Search Volume,
     Competition, Added By, Date Added
   - ADD KEYWORD: form to add single keyword + URL + notes
   - EXCEL IMPORT: drag-and-drop Excel upload (.xlsx, .csv)
     Parse columns: keyword, url, volume, competition, notes
     Show preview before importing
   - EXCEL EXPORT: download all keywords as Excel file
   - Research tips section specific to this season
   - User's personal progress tracker for this season

5. NOTIFICATION CENTER (/notifications):
   - List of all notifications, grouped by date
   - Filter by type: reminder, new_keyword, deadline
   - Mark as read / mark all as read
   - Auto-generate notifications when:
     a) 3 months before event: "Time to start researching [Season]!"
     b) 2 months before: "[Season] is 2 months away - finalize product ideas"
     c) 1 month before: "[Season] is next month - products should be ready"
     d) New keywords added to a season you're tracking

6. ADMIN PANEL (/admin - role='admin' only):
   - Manage seasons: add/edit/delete seasons
   - Manage users: view all users, change roles
   - Bulk import keywords via Excel for any season
   - View system stats: total users, active seasons, total keywords

7. PROFILE & SETTINGS (/settings):
   - Edit profile name, avatar
   - Toggle notification preferences
   - Choose which seasons to track/follow
   - Dark mode / Light mode toggle

BONUS FEATURES:
- Pomodoro/Focus Timer: built-in timer for research sessions
- Kanban Board: drag products between status columns per season
- Team Workspace: share keyword lists with team members
- Search across all seasons: global keyword search
- AI Keyword Suggestions: button to generate keyword ideas (placeholder)
- Weekly Email Digest: summary of upcoming deadlines (Supabase Edge Function)

DESIGN REQUIREMENTS:
- Modern, clean design with subtle seasonal themed colors
- Mobile-first responsive layout
- Sidebar navigation on desktop, bottom nav on mobile
- Smooth page transitions and micro-animations
- Loading skeletons for async data
- Toast notifications for actions
- Dark mode support
- Vietnamese language as primary with English option

PRE-POPULATED DATA:
Seed the database with these seasons and sample keywords:

Valentine's Day (Feb 14) - Keywords: valentine gifts for her,
  romantic gifts, heart shaped gifts, couples gifts,
  personalized valentine, rose bear, love necklace

St. Patrick's Day (Mar 17) - Keywords: st patricks day shirt,
  shamrock decor, green party supplies, irish gifts,
  leprechaun costume, clover jewelry

Easter (Apr 20) - Keywords: easter basket, easter egg hunt supplies,
  spring wreath, easter bunny decor, pastel decor

Mother's Day (May 11) - Keywords: mothers day gifts, mom necklace,
  spa gift set, personalized mom gifts, mom jewelry

Father's Day (Jun 15) - Keywords: fathers day gifts, dad tools,
  bbq gifts, golf accessories, fishing gifts

Back to School (Aug 1) - Keywords: school supplies, backpacks,
  lunch boxes, teacher gifts, dorm room decor

Halloween (Oct 31) - Keywords: halloween costume, spooky decor,
  trick or treat bags, halloween party supplies, pumpkin decor

Thanksgiving (Nov 27) - Keywords: thanksgiving decor, fall wreath,
  thanksgiving tablecloth, grateful signs, harvest decor

Black Friday/Cyber Monday (Nov 28) - Keywords: deals, gift bundles,
  best sellers, trending products, holiday gift sets

Christmas (Dec 25) - Keywords: christmas gifts, christmas tree decor,
  stocking stuffers, ugly christmas sweater, gift wrapping

Super Bowl (Feb 9) - Keywords: super bowl party supplies,
  football decor, game day snack trays, team jerseys, tailgate supplies

Independence Day (Jul 4) - Keywords: 4th of july decor,
  patriotic shirts, american flag accessories, fireworks party, red white blue

Start building with auth first, then dashboard, then each page.
Make sure ALL features work end-to-end with real Supabase data.
 
🏗️  KIẾN TRÚC HỆ THỐNG (System Architecture)
Tech Stack Chi Tiết
Layer	Technology	Lý do chọn
Frontend	Next.js 14+ (App Router)	SSR, routing, SEO tốt
UI Library	shadcn/ui + Tailwind CSS	Component đẹp, responsive
Backend	Supabase	Auth + DB + Realtime + Storage
Database	PostgreSQL (Supabase)	RLS bảo mật, JSON support
Auth	Supabase Auth	Email + Google OAuth
File Upload	Supabase Storage	Excel upload lưu trữ
Realtime	Supabase Realtime	Notification push
Hosting	Vercel	CI/CD tự động với Next.js
Excel Parse	SheetJS (xlsx)	Parse Excel import/export
State	Zustand	Nhẹ, đơn giản
Icons	Lucide React	Đẹp, nhẹ, đầy đủ
Date	date-fns	Lightweight date utility

Folder Structure
seasonal-planner/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (dashboard)/page.tsx
│   ├── (dashboard)/calendar/page.tsx
│   ├── (dashboard)/season/[id]/page.tsx
│   ├── (dashboard)/notifications/page.tsx
│   ├── (dashboard)/settings/page.tsx
│   ├── (dashboard)/admin/page.tsx
│   ├── (dashboard)/focus/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/          (shadcn components)
│   ├── layout/      (Sidebar, MobileNav, Header)
│   ├── dashboard/   (SeasonCard, StatsBar, CountdownTimer)
│   ├── season/      (KeywordTable, ExcelImport, ProgressTracker)
│   ├── calendar/    (TimelineView, CalendarGrid)
│   └── shared/      (NotificationBell, SearchBar, FocusTimer)
├── lib/
│   ├── supabase/    (client.ts, server.ts, middleware.ts)
│   ├── store/       (useStore.ts - Zustand)
│   ├── utils/       (dates.ts, excel.ts, constants.ts)
│   └── types/       (database.ts, api.ts)
├── supabase/
│   ├── migrations/  (SQL schema)
│   ├── seed.sql     (pre-populated data)
│   └── functions/   (Edge Functions for email digest)
└── public/              (assets, icons)
 
💡  PROMPT THEO TẪNG BƯớC (Step-by-Step Prompts)
Nếu Antigravity không làm hết 1 lần, hãy chia nhỏ và gửi từng prompt sau:

Bước 1: Setup Project + Supabase + Auth
PROMPT:
Set up a Next.js 14 project with TypeScript, Tailwind CSS, and shadcn/ui.
Integrate Supabase for authentication (email/password + Google OAuth).
Create the database schema with all tables: profiles, seasons, keywords,
notifications, user_season_progress, excel_imports.
Set up Row Level Security (RLS) policies.
Create login and register pages with beautiful seasonal-themed design.
After successful login, redirect to dashboard.
Add Supabase middleware for protected routes.

Bước 2: Dashboard + Season Cards
PROMPT:
Build the main Dashboard page that shows:
- Hero section with current active reminders and countdown timers
- Season cards sorted by urgency (closest deadline first)
- Each card: emoji, name, days until event, research deadline,
  status badge, progress bar, urgency color coding
  (RED <30 days, ORANGE 30-60, YELLOW 60-90, GREEN >90)
- Quick stats bar: seasons tracked, keywords researched, products in progress
- Notification bell with unread count
- Sidebar navigation (desktop) + bottom nav (mobile)
Seed database with 12 seasons and sample keywords.

Bước 3: Season Detail + Keywords + Excel Import
PROMPT:
Build Season Detail page (/season/[id]) with:
- Season header: emoji, name, event date, research deadline, countdown
- Keyword table: searchable, sortable, with columns:
  Keyword, Reference URL (clickable link), Search Volume,
  Competition, Added By, Date
- Add keyword form: keyword + URL + search volume + notes
- Excel import: drag-drop .xlsx/.csv upload with preview before import
  Parse columns: keyword, url, volume, competition, notes
- Excel export: download all keywords as .xlsx
- Research tips section for this season
- Personal progress tracker (status, target products, completed)
Use SheetJS (xlsx) library for Excel parsing.

Bước 4: Calendar + Notifications
PROMPT:
Build the Seasonal Calendar page (/calendar):
- Full year horizontal timeline showing all 12 seasons
- Visual bars for each season's "research window" (3 months before event)
- Today marker line, month labels
- Click season → navigate to detail page
- Toggle between timeline view and calendar grid view

Build Notification Center (/notifications):
- List all notifications grouped by date
- Filter by type: reminder / new_keyword / deadline
- Mark as read / mark all as read
- Create Supabase function to auto-generate reminders
  at 3 months, 2 months, 1 month before each event
- Use Supabase Realtime for live notification updates

Bước 5: Admin + Settings + Bonus Features
PROMPT:
Build Admin Panel (/admin - only visible to role='admin'):
- Manage seasons: add, edit, delete, reorder
- Manage users: view list, change roles
- Bulk keyword import for any season
- System stats dashboard

Build Settings page (/settings):
- Edit profile (name, avatar upload)
- Notification preferences toggle
- Choose which seasons to follow
- Dark mode / Light mode toggle

Add bonus features:
- Pomodoro Focus Timer (/focus) for research sessions
  25min work / 5min break, track sessions per season
- Global keyword search across all seasons
- Keyboard shortcuts (Ctrl+K for search, N for new keyword)
 
🌟  DỮ LIỆU MÙA (Pre-populated Seasons)
App sẽ được seed sẵn 12 mùa với từ khoá mẫu. Bảng dưới đây là master data:

Season	Date	Remind	Top Keywords
🏈 Super Bowl	Feb 9	Nov 9	party supplies, football decor, game day
💝 Valentine’s	Feb 14	Nov 14	gifts for her/him, romantic, couples
☘️ St. Patrick’s	Mar 17	Dec 17	green shirts, shamrock, irish gifts
🐣 Easter	Apr 20	Jan 20	baskets, egg hunt, spring wreath
👩 Mother’s Day	May 11	Feb 11	mom gifts, jewelry, spa sets
👨 Father’s Day	Jun 15	Mar 15	dad tools, bbq, golf, fishing
🇺🇸 July 4th	Jul 4	Apr 4	patriotic decor, flags, fireworks
🎒 Back to School	Aug 1	May 1	supplies, backpacks, dorm decor
🎃 Halloween	Oct 31	Jul 31	costumes, spooky decor, party
🦃 Thanksgiving	Nov 27	Aug 27	fall decor, tablecloth, grateful
💰 Black Friday	Nov 28	Aug 28	deals, bundles, gift sets
🎄 Christmas	Dec 25	Sep 25	gifts, tree decor, stockings
 
🎨  DESIGN GUIDE
Color System
Primary #1B4D3E	Accent #FF6B35	Background #F8FAFC	Dark Mode #1E293B

Urgency Color Coding
•	RED (#EF4444): Dưới 30 ngày — Khẩn cấp, cần hành động ngay
•	ORANGE (#F97316): 30-60 ngày — Cần chú ý
•	YELLOW (#EAB308): 60-90 ngày — Bắt đầu chuẩn bị
•	GREEN (#22C55E): Trên 90 ngày — Thoải mái lên kế hoạch

Layout Rules
•	Desktop: Sidebar 240px cố định bên trái + content area
•	Mobile: Bottom navigation bar 5 tabs (Dashboard, Calendar, Add, Notifications, Settings)
•	Breakpoint: md (768px) chuyển đổi giữa mobile và desktop
•	Cards: rounded-xl, shadow-sm, hover:shadow-md transition
•	Spacing: Consistent 16px/24px grid system
 
🔒  SUPABASE ROW LEVEL SECURITY (RLS)
Copy các policy này vào Supabase SQL Editor hoặc đưa vào prompt:

-- Profiles: users can read all, update own
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Seasons: everyone can read, admin can modify
CREATE POLICY "seasons_read" ON seasons FOR SELECT USING (true);
CREATE POLICY "seasons_admin" ON seasons FOR ALL
  USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

-- Keywords: everyone can read, authenticated can insert
CREATE POLICY "keywords_read" ON keywords FOR SELECT USING (true);
CREATE POLICY "keywords_insert" ON keywords FOR INSERT
  WITH CHECK (auth.uid() = added_by);

-- Notifications: users see own only
CREATE POLICY "notifications_own" ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- Progress: users manage own
CREATE POLICY "progress_own" ON user_season_progress FOR ALL
  USING (auth.uid() = user_id);
 
🚀  TIPS VIBE CODING HIỆU QUẢ
Nguyên tắc khi dùng Antigravity
1.	Bắt đầu với Master Prompt đầy đủ để AI hiểu toàn bộ context. Nếu app quá lớn, dùng các prompt theo bước.
2.	Luôn giữ Supabase project URL và anon key sẵn sàng để paste khi AI hỏi.
3.	Nếu AI tạo sai, paste lỗi và nói: "Fix this error: [error message]". Đừng tự sửa.
4.	Test từng feature trước khi chuyển sang feature tiếp theo.
5.	Dùng prompt: "Show me the current file structure" để kiểm tra project structure.
6.	Khi cần sửa UI: chụp màn hình và nói "Make this look like [mô tả]" hoặc paste screenshot.

Prompt bổ sung hữu ích
Fix bug: "I'm getting this error: [paste error]. Fix it and explain what went wrong."
Improve UI: "The dashboard cards look too plain. Make them more visually appealing with gradients, hover effects, and micro-animations."
Add feature: "Add a Kanban board on the season detail page where I can drag products between columns: Ideas → Researching → Developing → Ready → Launched."
Mobile fix: "The calendar page doesn't work well on mobile. Make it horizontally scrollable with touch gestures."
Dark mode: "Add dark mode toggle that persists in localStorage. Use slate-900 backgrounds with appropriate contrast."
Performance: "The keyword table is slow with 500+ rows. Add virtual scrolling and pagination."

Checklist trước khi deploy
•	Tất cả pages hoạt động đúng trên mobile và desktop
•	Login/Register hoạt động với email và Google
•	12 seasons được seed đầy đủ với keywords
•	Excel import/export hoạt động
•	Notifications tự động tạo đúng thời điểm
•	RLS policies bảo mật đúng
•	Admin panel chỉ admin mới vào được
•	Dark mode hoạt động nhất quán
•	Deploy lên Vercel thành công
