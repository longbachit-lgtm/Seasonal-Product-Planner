'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Season, Keyword, Notification, UserSeasonProgress } from '@/lib/types/database';
import { supabase } from '@/lib/supabase/client';
import { SEASONS_DATA, KEYWORDS_DATA } from '@/lib/utils/constants';

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

function buildInitialKeywords(): Keyword[] {
    const keywords: Keyword[] = [];
    Object.entries(KEYWORDS_DATA).forEach(([, kwList]) => {
        kwList.forEach((kw) => {
            keywords.push({
                ...kw,
                id: generateId(),
                added_by: 'admin',
                created_at: new Date().toISOString(),
            });
        });
    });
    return keywords;
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && url !== 'your_supabase_url_here' && url.includes('supabase.co');
};

interface AppState {
    // Auth
    isLoggedIn: boolean;
    currentUser: { id: string; full_name: string; role: 'admin' | 'member'; avatar_url: string | null; notification_enabled: boolean } | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
    authError: string | null;

    // Theme
    darkMode: boolean;
    toggleDarkMode: () => void;

    // Seasons
    seasons: Season[];
    fetchSeasons: () => Promise<void>;
    addSeason: (season: Omit<Season, 'id' | 'created_by' | 'created_at'>) => Promise<void>;
    updateSeason: (id: string, data: Partial<Season>) => Promise<void>;
    deleteSeason: (id: string) => Promise<void>;

    // Keywords
    keywords: Keyword[];
    fetchKeywords: () => Promise<void>;
    addKeyword: (keyword: Omit<Keyword, 'id' | 'added_by' | 'created_at'>) => Promise<void>;
    addKeywords: (keywords: Omit<Keyword, 'id' | 'added_by' | 'created_at'>[]) => Promise<void>;
    deleteKeyword: (id: string) => Promise<void>;

    // Notifications
    notifications: Notification[];
    fetchNotifications: () => Promise<void>;
    addNotification: (n: Omit<Notification, 'id' | 'created_at'>) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    unreadCount: () => number;

    // Progress
    progress: UserSeasonProgress[];
    fetchProgress: () => Promise<void>;
    updateProgress: (seasonId: string, data: Partial<UserSeasonProgress>) => Promise<void>;

    // Search
    globalSearchQuery: string;
    setGlobalSearchQuery: (q: string) => void;
    showSearchModal: boolean;
    setShowSearchModal: (show: boolean) => void;

    // Init
    initialized: boolean;
    initializeData: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Auth
            isLoggedIn: false,
            currentUser: null,
            isLoading: false,
            authError: null,

            login: async (email: string, password: string) => {
                if (!isSupabaseConfigured()) {
                    // Fallback: mock login
                    set({
                        isLoggedIn: true,
                        authError: null,
                        currentUser: {
                            id: 'user-1',
                            full_name: email.split('@')[0],
                            role: 'admin',
                            avatar_url: null,
                            notification_enabled: true,
                        },
                    });
                    return true;
                }

                set({ isLoading: true, authError: null });
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });

                if (error) {
                    set({ isLoading: false, authError: error.message });
                    return false;
                }

                if (data.user) {
                    // Fetch profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    set({
                        isLoggedIn: true,
                        isLoading: false,
                        currentUser: {
                            id: data.user.id,
                            full_name: profile?.full_name || data.user.email?.split('@')[0] || 'User',
                            role: profile?.role || 'member',
                            avatar_url: profile?.avatar_url || null,
                            notification_enabled: profile?.notification_enabled ?? true,
                        },
                    });

                    // Fetch all data
                    get().initializeData();
                    return true;
                }

                set({ isLoading: false });
                return false;
            },

            register: async (name: string, email: string, password: string) => {
                if (!isSupabaseConfigured()) {
                    set({
                        isLoggedIn: true,
                        authError: null,
                        currentUser: {
                            id: 'user-1',
                            full_name: name,
                            role: 'admin',
                            avatar_url: null,
                            notification_enabled: true,
                        },
                    });
                    return true;
                }

                set({ isLoading: true, authError: null });
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } },
                });

                if (error) {
                    set({ isLoading: false, authError: error.message });
                    return false;
                }

                if (data.user) {
                    set({
                        isLoggedIn: true,
                        isLoading: false,
                        currentUser: {
                            id: data.user.id,
                            full_name: name,
                            role: 'member',
                            avatar_url: null,
                            notification_enabled: true,
                        },
                    });
                    get().initializeData();
                    return true;
                }

                set({ isLoading: false });
                return false;
            },

            logout: async () => {
                if (isSupabaseConfigured()) {
                    await supabase.auth.signOut();
                }
                set({ isLoggedIn: false, currentUser: null });
            },

            // Check existing auth session
            checkAuth: async () => {
                if (!isSupabaseConfigured()) return;

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    set({
                        isLoggedIn: true,
                        currentUser: {
                            id: session.user.id,
                            full_name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
                            role: profile?.role || 'member',
                            avatar_url: profile?.avatar_url || null,
                            notification_enabled: profile?.notification_enabled ?? true,
                        },
                    });
                    get().initializeData();
                }
            },

            // Theme
            darkMode: false,
            toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

            // =================== SEASONS ===================
            seasons: SEASONS_DATA.map((s) => ({
                ...s,
                created_by: 'admin',
                created_at: new Date().toISOString(),
            })),

            fetchSeasons: async () => {
                if (!isSupabaseConfigured()) return;
                const { data } = await supabase.from('seasons').select('*').order('event_date');
                if (data) set({ seasons: data });
            },

            addSeason: async (season) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({
                        seasons: [
                            ...s.seasons,
                            { ...season, id: generateId(), created_by: get().currentUser?.id || 'admin', created_at: new Date().toISOString() },
                        ],
                    }));
                    return;
                }

                const { data, error } = await supabase
                    .from('seasons')
                    .insert({ ...season, created_by: get().currentUser?.id })
                    .select()
                    .single();

                if (data && !error) {
                    set((s) => ({ seasons: [...s.seasons, data] }));
                }
            },

            updateSeason: async (id, data) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({
                        seasons: s.seasons.map((season) => (season.id === id ? { ...season, ...data } : season)),
                    }));
                    return;
                }

                const { error } = await supabase.from('seasons').update(data).eq('id', id);
                if (!error) {
                    set((s) => ({
                        seasons: s.seasons.map((season) => (season.id === id ? { ...season, ...data } : season)),
                    }));
                }
            },

            deleteSeason: async (id) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({ seasons: s.seasons.filter((season) => season.id !== id) }));
                    return;
                }

                const { error } = await supabase.from('seasons').delete().eq('id', id);
                if (!error) {
                    set((s) => ({ seasons: s.seasons.filter((season) => season.id !== id) }));
                }
            },

            // =================== KEYWORDS ===================
            keywords: buildInitialKeywords(),

            fetchKeywords: async () => {
                if (!isSupabaseConfigured()) return;
                const { data } = await supabase.from('keywords').select('*').order('created_at', { ascending: false });
                if (data) set({ keywords: data });
            },

            addKeyword: async (keyword) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({
                        keywords: [
                            ...s.keywords,
                            { ...keyword, id: generateId(), added_by: get().currentUser?.id || 'admin', created_at: new Date().toISOString() },
                        ],
                    }));
                    return;
                }

                const { data, error } = await supabase
                    .from('keywords')
                    .insert({ ...keyword, added_by: get().currentUser?.id })
                    .select()
                    .single();

                if (data && !error) {
                    set((s) => ({ keywords: [...s.keywords, data] }));
                }
            },

            addKeywords: async (keywords) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({
                        keywords: [
                            ...s.keywords,
                            ...keywords.map((kw) => ({
                                ...kw,
                                id: generateId(),
                                added_by: get().currentUser?.id || 'admin',
                                created_at: new Date().toISOString(),
                            })),
                        ],
                    }));
                    return;
                }

                const insertData = keywords.map((kw) => ({ ...kw, added_by: get().currentUser?.id }));
                const { data, error } = await supabase.from('keywords').insert(insertData).select();

                if (data && !error) {
                    set((s) => ({ keywords: [...s.keywords, ...data] }));
                }
            },

            deleteKeyword: async (id) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({ keywords: s.keywords.filter((k) => k.id !== id) }));
                    return;
                }

                const { error } = await supabase.from('keywords').delete().eq('id', id);
                if (!error) {
                    set((s) => ({ keywords: s.keywords.filter((k) => k.id !== id) }));
                }
            },

            // =================== NOTIFICATIONS ===================
            notifications: [
                {
                    id: 'n1',
                    user_id: 'user-1',
                    season_id: 'valentines-day',
                    title: "Chuẩn bị cho Valentine's Day!",
                    message: "Valentine's Day chỉ còn vài tháng. Hãy bắt đầu nghiên cứu sản phẩm ngay!",
                    type: 'reminder' as const,
                    is_read: false,
                    created_at: new Date().toISOString(),
                },
                {
                    id: 'n2',
                    user_id: 'user-1',
                    season_id: 'easter',
                    title: 'Easter sắp tới',
                    message: 'Đã đến lúc research sản phẩm Easter. Kiểm tra keyword trends ngay.',
                    type: 'reminder' as const,
                    is_read: false,
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                },
                {
                    id: 'n3',
                    user_id: 'user-1',
                    season_id: 'mothers-day',
                    title: "Keyword mới cho Mother's Day",
                    message: '5 keyword mới được thêm vào danh sách Mother\'s Day.',
                    type: 'new_keyword' as const,
                    is_read: true,
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                },
            ],

            fetchNotifications: async () => {
                if (!isSupabaseConfigured()) return;
                const userId = get().currentUser?.id;
                if (!userId) return;
                const { data } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                if (data) set({ notifications: data });
            },

            addNotification: async (n) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({
                        notifications: [{ ...n, id: generateId(), created_at: new Date().toISOString() }, ...s.notifications],
                    }));
                    return;
                }

                const { data, error } = await supabase.from('notifications').insert(n).select().single();
                if (data && !error) {
                    set((s) => ({ notifications: [data, ...s.notifications] }));
                }
            },

            markAsRead: async (id) => {
                if (!isSupabaseConfigured()) {
                    set((s) => ({
                        notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
                    }));
                    return;
                }

                const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
                if (!error) {
                    set((s) => ({
                        notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
                    }));
                }
            },

            markAllAsRead: async () => {
                const userId = get().currentUser?.id;
                if (!isSupabaseConfigured()) {
                    set((s) => ({
                        notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
                    }));
                    return;
                }

                if (userId) {
                    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
                }
                set((s) => ({
                    notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
                }));
            },

            unreadCount: () => get().notifications.filter((n) => !n.is_read).length,

            // =================== PROGRESS ===================
            progress: [],

            fetchProgress: async () => {
                if (!isSupabaseConfigured()) return;
                const userId = get().currentUser?.id;
                if (!userId) return;
                const { data } = await supabase
                    .from('user_season_progress')
                    .select('*')
                    .eq('user_id', userId);
                if (data) set({ progress: data });
            },

            updateProgress: async (seasonId, data) => {
                const userId = get().currentUser?.id || 'user-1';

                if (!isSupabaseConfigured()) {
                    set((s) => {
                        const existing = s.progress.find((p) => p.season_id === seasonId && p.user_id === userId);
                        if (existing) {
                            return {
                                progress: s.progress.map((p) =>
                                    p.season_id === seasonId && p.user_id === userId
                                        ? { ...p, ...data, updated_at: new Date().toISOString() }
                                        : p
                                ),
                            };
                        }
                        return {
                            progress: [
                                ...s.progress,
                                {
                                    id: generateId(),
                                    user_id: userId,
                                    season_id: seasonId,
                                    status: 'not_started' as const,
                                    personal_notes: null,
                                    target_products: null,
                                    completed_products: null,
                                    updated_at: new Date().toISOString(),
                                    ...data,
                                },
                            ],
                        };
                    });
                    return;
                }

                // Upsert in Supabase
                const { data: existing } = await supabase
                    .from('user_season_progress')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('season_id', seasonId)
                    .single();

                if (existing) {
                    await supabase.from('user_season_progress').update({ ...data, updated_at: new Date().toISOString() }).eq('id', existing.id);
                } else {
                    await supabase.from('user_season_progress').insert({
                        user_id: userId,
                        season_id: seasonId,
                        status: 'not_started',
                        ...data,
                    });
                }

                get().fetchProgress();
            },

            // Search
            globalSearchQuery: '',
            setGlobalSearchQuery: (q) => set({ globalSearchQuery: q }),
            showSearchModal: false,
            setShowSearchModal: (show) => set({ showSearchModal: show }),

            // Initialize
            initialized: false,
            initializeData: async () => {
                if (!isSupabaseConfigured() || get().initialized) return;
                await Promise.all([
                    get().fetchSeasons(),
                    get().fetchKeywords(),
                    get().fetchNotifications(),
                    get().fetchProgress(),
                ]);
                set({ initialized: true });
            },
        }),
        {
            name: 'seasonal-planner-storage',
            partialize: (state) => ({
                isLoggedIn: state.isLoggedIn,
                currentUser: state.currentUser,
                darkMode: state.darkMode,
                // Only persist data in localStorage when Supabase is NOT configured
                ...(isSupabaseConfigured() ? {} : {
                    seasons: state.seasons,
                    keywords: state.keywords,
                    notifications: state.notifications,
                    progress: state.progress,
                }),
            }),
        }
    )
);
