'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { getDaysUntilEvent, getUrgencyLevel, getUrgencyColor, formatEventDate, isInResearchWindow, getDaysUntilReminder } from '@/lib/utils/dates';
import { URGENCY_COLORS } from '@/lib/utils/constants';
import { TrendingUp, BookOpen, Package, ArrowRight, Zap } from 'lucide-react';
import SearchModal from '@/components/SearchModal';

export default function DashboardPage() {
    const { seasons, keywords, progress, showSearchModal } = useStore();

    const sortedSeasons = useMemo(() => {
        return [...seasons]
            .filter((s) => s.is_active)
            .map((s) => {
                const daysUntil = getDaysUntilEvent(s.event_date);
                const urgency = getUrgencyLevel(daysUntil);
                const seasonKeywords = keywords.filter((k) => k.season_id === s.id);
                const seasonProgress = progress.find((p) => p.season_id === s.id);
                const inResearchWindow = isInResearchWindow(s.event_date, s.reminder_months_before);
                const daysUntilReminder = getDaysUntilReminder(s.event_date, s.reminder_months_before);
                return { ...s, daysUntil, urgency, keywordCount: seasonKeywords.length, progress: seasonProgress, inResearchWindow, daysUntilReminder };
            })
            .sort((a, b) => a.daysUntil - b.daysUntil);
    }, [seasons, keywords, progress]);

    const activeReminders = sortedSeasons.filter((s) => s.inResearchWindow);

    const stats = useMemo(() => ({
        totalSeasons: seasons.filter(s => s.is_active).length,
        totalKeywords: keywords.length,
        inProgress: progress.filter(p => p.status === 'researching' || p.status === 'developing').length,
        launched: progress.filter(p => p.status === 'launched').length,
    }), [seasons, keywords, progress]);

    return (
        <div>
            {showSearchModal && <SearchModal />}

            {/* Hero - Active Reminders */}
            {activeReminders.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #1B4D3E 0%, #2D6B55 50%, #1B4D3E 100%)',
                    borderRadius: '20px',
                    padding: '28px',
                    marginBottom: '24px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-20px', right: '-20px',
                        width: '200px', height: '200px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Zap size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>
                            {activeReminders.length} sự kiện đang trong giai đoạn nghiên cứu
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {activeReminders.slice(0, 4).map((s) => (
                            <Link href={`/season/${s.id}`} key={s.id} style={{ textDecoration: 'none', color: 'white' }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '14px',
                                    padding: '16px 20px',
                                    minWidth: '200px',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer',
                                }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.emoji}</div>
                                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{s.name}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8 }}>Còn {s.daysUntil} ngày</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '8px' }}>
                                        <span style={{ fontSize: '28px', fontWeight: 800 }}>{s.daysUntil}</span>
                                        <span style={{ fontSize: '12px', opacity: 0.7 }}>ngày</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { icon: BookOpen, label: 'Seasons đang track', value: stats.totalSeasons, color: '#1B4D3E', bg: '#DCFCE7' },
                    { icon: TrendingUp, label: 'Keywords đã nghiên cứu', value: stats.totalKeywords, color: '#2563EB', bg: '#DBEAFE' },
                    { icon: Package, label: 'Đang phát triển', value: stats.inProgress, color: '#F59E0B', bg: '#FEF3C7' },
                    { icon: Zap, label: 'Đã launch', value: stats.launched, color: '#8B5CF6', bg: '#EDE9FE' },
                ].map((stat, i) => (
                    <div key={i} className="card stat-card">
                        <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h2 className="page-title" style={{ fontSize: '22px', marginBottom: '4px' }}>Tất cả Seasons</h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Sắp xếp theo độ ưu tiên</p>
                </div>
                <Link href="/calendar" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                    <Calendar size={16} />
                    Xem Calendar
                    <ArrowRight size={14} />
                </Link>
            </div>

            {/* Season Cards Grid */}
            <div className="season-grid">
                {sortedSeasons.map((season) => {
                    const urgencyInfo = URGENCY_COLORS[season.urgency];
                    const urgencyColor = getUrgencyColor(season.urgency);
                    const progressPercent = season.progress
                        ? Math.round(((season.progress.completed_products || 0) / Math.max(season.progress.target_products || 1, 1)) * 100)
                        : 0;

                    return (
                        <Link href={`/season/${season.id}`} key={season.id} style={{ textDecoration: 'none' }}>
                            <div className="card season-card" style={{ borderTop: `4px solid ${urgencyColor}` }}>
                                <div className="season-card-header">
                                    <div>
                                        <div className="season-emoji">{season.emoji}</div>
                                    </div>
                                    <span
                                        className="urgency-badge"
                                        style={{ background: urgencyInfo.bg, color: urgencyInfo.text }}
                                    >
                                        {urgencyInfo.label}
                                    </span>
                                </div>

                                <h3 className="season-name">{season.name}</h3>
                                <p className="season-date">{formatEventDate(season.event_date)}</p>

                                <div className="countdown-display">
                                    <span className="countdown-number" style={{ color: urgencyColor }}>
                                        {season.daysUntil}
                                    </span>
                                    <span className="countdown-label">ngày còn lại</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                                    <span>🔑 {season.keywordCount} keywords</span>
                                    <span>
                                        {season.inResearchWindow ? '🔬 Đang research' : `⏰ Research trong ${season.daysUntilReminder} ngày`}
                                    </span>
                                </div>

                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${progressPercent}%`,
                                            background: `linear-gradient(90deg, ${urgencyColor}, ${urgencyColor}88)`,
                                        }}
                                    />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function Calendar({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
}
