'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store/useStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bell, CheckCheck, Filter, Clock, Tag, AlertTriangle } from 'lucide-react';

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, seasons } = useStore();
    const [filter, setFilter] = useState<'all' | 'reminder' | 'new_keyword' | 'deadline'>('all');

    const filtered = useMemo(() => {
        let items = [...notifications];
        if (filter !== 'all') items = items.filter((n) => n.type === filter);
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [notifications, filter]);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // Group by date
    const grouped = useMemo(() => {
        const groups: Record<string, typeof filtered> = {};
        filtered.forEach((n) => {
            const date = format(new Date(n.created_at), 'dd/MM/yyyy');
            if (!groups[date]) groups[date] = [];
            groups[date].push(n);
        });
        return groups;
    }, [filtered]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <Clock size={16} style={{ color: '#3B82F6' }} />;
            case 'new_keyword': return <Tag size={16} style={{ color: '#10B981' }} />;
            case 'deadline': return <AlertTriangle size={16} style={{ color: '#EF4444' }} />;
            default: return <Bell size={16} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'reminder': return 'Nhắc nhở';
            case 'new_keyword': return 'Keyword mới';
            case 'deadline': return 'Deadline';
            default: return type;
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title">🔔 Thông báo</h1>
                    <p className="page-subtitle">
                        {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
                        <CheckCheck size={16} /> Đọc tất cả
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="tabs">
                {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'reminder', label: 'Nhắc nhở' },
                    { value: 'new_keyword', label: 'Keyword mới' },
                    { value: 'deadline', label: 'Deadline' },
                ].map((f) => (
                    <button
                        key={f.value}
                        className={`tab ${filter === f.value ? 'active' : ''}`}
                        onClick={() => setFilter(f.value as typeof filter)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="card">
                {Object.entries(grouped).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Bell size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px', opacity: 0.3 }} />
                        <p style={{ fontWeight: 600, marginBottom: '4px' }}>Không có thông báo</p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Bạn sẽ nhận thông báo khi có season cần chuẩn bị</p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([date, items]) => (
                        <div key={date}>
                            <div style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                {date}
                            </div>
                            {items.map((n) => {
                                const season = seasons.find((s) => s.id === n.season_id);
                                return (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                                        onClick={() => markAsRead(n.id)}
                                    >
                                        {!n.is_read && <div className="notification-dot" />}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                {getTypeIcon(n.type)}
                                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{n.title}</span>
                                                {season && <span style={{ fontSize: '16px' }}>{season.emoji}</span>}
                                            </div>
                                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: n.type === 'reminder' ? '#DBEAFE' : n.type === 'new_keyword' ? '#D1FAE5' : '#FEE2E2',
                                                    color: n.type === 'reminder' ? '#2563EB' : n.type === 'new_keyword' ? '#059669' : '#DC2626',
                                                    fontWeight: 600,
                                                }}>
                                                    {getTypeLabel(n.type)}
                                                </span>
                                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {format(new Date(n.created_at), 'HH:mm', { locale: vi })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
