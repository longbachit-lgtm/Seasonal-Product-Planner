'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import {
    LayoutDashboard, Calendar, Bell, Timer, Settings,
    Search, Moon, Sun, LogOut, Shield, ChevronRight
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/notifications', label: 'Thông báo', icon: Bell },
    { href: '/focus', label: 'Focus Timer', icon: Timer },
    { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, currentUser, darkMode, toggleDarkMode, logout, notifications, setShowSearchModal, checkAuth } = useStore();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Check for existing auth session on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        }
    }, [isLoggedIn, router]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Keyboard shortcut: Ctrl+K for search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearchModal(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setShowSearchModal]);

    if (!isLoggedIn) return null;

    return (
        <div>
            {/* Sidebar - Desktop */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span style={{ fontSize: '28px' }}>🌿</span>
                    <div>
                        <h1>Seasonal Planner</h1>
                        <span>Amazon Product Research</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                            {item.href === '/notifications' && unreadCount > 0 && (
                                <span className="badge">{unreadCount}</span>
                            )}
                        </Link>
                    ))}

                    {currentUser?.role === 'admin' && (
                        <Link
                            href="/admin"
                            className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
                        >
                            <Shield size={20} />
                            Admin Panel
                        </Link>
                    )}
                </nav>

                <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)' }}>
                    <button className="nav-item" onClick={toggleDarkMode}>
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button className="nav-item" onClick={async () => { await logout(); router.push('/login'); }} style={{ color: '#EF4444' }}>
                        <LogOut size={20} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <div
                            className="header-search"
                            onClick={() => setShowSearchModal(true)}
                        >
                            <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                            <span>Tìm kiếm keywords...</span>
                            <kbd>⌘K</kbd>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="icon-btn" onClick={toggleDarkMode} title="Toggle dark mode">
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link href="/notifications">
                            <button className="icon-btn">
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>
                        </Link>
                        <button className="avatar-btn" title={currentUser?.full_name || ''}>
                            {currentUser?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </button>
                    </div>
                </header>

                <div className="page-content">
                    {children}
                </div>
            </main>

            {/* Bottom Nav - Mobile */}
            <nav className="bottom-nav">
                <div className="bottom-nav-items">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <item.icon size={22} />
                            {item.label}
                            {item.href === '/notifications' && unreadCount > 0 && (
                                <span className="dot" />
                            )}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
