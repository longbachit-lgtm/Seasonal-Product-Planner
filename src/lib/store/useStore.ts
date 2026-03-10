'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Season, Keyword, Notification, UserSeasonProgress } from '@/lib/types/database';
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

interface AppState {
    // Auth
    isLoggedIn: boolean;
    currentUser: { id: string; full_name: string; role: 'admin' | 'member'; avatar_url: string | null; notification_enabled: boolean } | null;
    login: (email: string, password: string) => boolean;
    register: (name: string, email: string, password: string) => boolean;
    logout: () => void;

    // Theme
    darkMode: boolean;
    toggleDarkMode: () => void;

    // Seasons
    seasons: Season[];
    addSeason: (season: Omit<Season, 'id' | 'created_by' | 'created_at'>) => void;
    updateSeason: (id: string, data: Partial<Season>) => void;
    deleteSeason: (id: string) => void;

    // Keywords
    keywords: Keyword[];
    addKeyword: (keyword: Omit<Keyword, 'id' | 'added_by' | 'created_at'>) => void;
    addKeywords: (keywords: Omit<Keyword, 'id' | 'added_by' | 'created_at'>[]) => void;
    deleteKeyword: (id: string) => void;

    // Notifications
    notifications: Notification[];
    addNotification: (n: Omit<Notification, 'id' | 'created_at'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    unreadCount: () => number;

    // Progress
    progress: UserSeasonProgress[];
    updateProgress: (seasonId: string, data: Partial<UserSeasonProgress>) => void;

    // Search
    globalSearchQuery: string;
    setGlobalSearchQuery: (q: string) => void;
    showSearchModal: boolean;
    setShowSearchModal: (show: boolean) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Auth
            isLoggedIn: false,
            currentUser: null,
            login: (email: string, _password: string) => {
                set({
                    isLoggedIn: true,
                    currentUser: {
                        id: 'user-1',
                        full_name: email.split('@')[0],
                        role: 'admin',
                        avatar_url: null,
                        notification_enabled: true,
                    },
                });
                return true;
            },
            register: (name: string, _email: string, _password: string) => {
                set({
                    isLoggedIn: true,
                    currentUser: {
                        id: 'user-1',
                        full_name: name,
                        role: 'admin',
                        avatar_url: null,
                        notification_enabled: true,
                    },
                });
                return true;
            },
            logout: () => set({ isLoggedIn: false, currentUser: null }),

            // Theme
            darkMode: false,
            toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

            // Seasons
            seasons: SEASONS_DATA.map((s) => ({
                ...s,
                created_by: 'admin',
                created_at: new Date().toISOString(),
            })),
            addSeason: (season) =>
                set((s) => ({
                    seasons: [
                        ...s.seasons,
                        { ...season, id: generateId(), created_by: get().currentUser?.id || 'admin', created_at: new Date().toISOString() },
                    ],
                })),
            updateSeason: (id, data) =>
                set((s) => ({
                    seasons: s.seasons.map((season) => (season.id === id ? { ...season, ...data } : season)),
                })),
            deleteSeason: (id) => set((s) => ({ seasons: s.seasons.filter((season) => season.id !== id) })),

            // Keywords
            keywords: buildInitialKeywords(),
            addKeyword: (keyword) =>
                set((s) => ({
                    keywords: [
                        ...s.keywords,
                        { ...keyword, id: generateId(), added_by: get().currentUser?.id || 'admin', created_at: new Date().toISOString() },
                    ],
                })),
            addKeywords: (keywords) =>
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
                })),
            deleteKeyword: (id) => set((s) => ({ keywords: s.keywords.filter((k) => k.id !== id) })),

            // Notifications
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
            addNotification: (n) =>
                set((s) => ({
                    notifications: [{ ...n, id: generateId(), created_at: new Date().toISOString() }, ...s.notifications],
                })),
            markAsRead: (id) =>
                set((s) => ({
                    notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
                })),
            markAllAsRead: () =>
                set((s) => ({
                    notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
                })),
            unreadCount: () => get().notifications.filter((n) => !n.is_read).length,

            // Progress
            progress: [],
            updateProgress: (seasonId, data) =>
                set((s) => {
                    const existing = s.progress.find((p) => p.season_id === seasonId && p.user_id === get().currentUser?.id);
                    if (existing) {
                        return {
                            progress: s.progress.map((p) =>
                                p.season_id === seasonId && p.user_id === get().currentUser?.id
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
                                user_id: get().currentUser?.id || 'user-1',
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
                }),

            // Search
            globalSearchQuery: '',
            setGlobalSearchQuery: (q) => set({ globalSearchQuery: q }),
            showSearchModal: false,
            setShowSearchModal: (show) => set({ showSearchModal: show }),
        }),
        {
            name: 'seasonal-planner-storage',
        }
    )
);
