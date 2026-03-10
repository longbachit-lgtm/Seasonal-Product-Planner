// Types matching the Supabase database schema

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'member';
  notification_enabled: boolean;
  created_at: string;
}

export interface Season {
  id: string;
  name: string;
  emoji: string;
  event_date: string; // MM-DD format
  color: string;
  reminder_months_before: number;
  tips: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface Keyword {
  id: string;
  season_id: string;
  keyword: string;
  reference_url: string | null;
  search_volume: 'High' | 'Medium' | 'Low' | null;
  competition: string | null;
  notes: string | null;
  added_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  season_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'new_keyword' | 'deadline';
  is_read: boolean;
  created_at: string;
}

export interface UserSeasonProgress {
  id: string;
  user_id: string;
  season_id: string;
  status: 'not_started' | 'researching' | 'developing' | 'ready' | 'launched';
  personal_notes: string | null;
  target_products: number | null;
  completed_products: number | null;
  updated_at: string;
}

export interface ExcelImport {
  id: string;
  season_id: string;
  uploaded_by: string;
  file_name: string;
  total_keywords: number;
  status: 'processing' | 'completed' | 'error';
  created_at: string;
}

export type UrgencyLevel = 'critical' | 'warning' | 'attention' | 'safe';
