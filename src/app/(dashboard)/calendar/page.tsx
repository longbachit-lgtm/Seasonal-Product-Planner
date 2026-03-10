'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { getDaysUntilEvent, getUrgencyLevel, getUrgencyColor, getNextEventDate, getReminderDate } from '@/lib/utils/dates';
import { CalendarDays, List } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CalendarPage() {
    const router = useRouter();
    const { seasons } = useStore();
    const [view, setView] = useState<'timeline' | 'grid'>('timeline');

    const currentYear = new Date().getFullYear();
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(currentYear, 0, 0).getTime()) / 86400000);
    const totalDays = 365;

    const seasonData = useMemo(() => {
        return seasons.filter(s => s.is_active).map((s) => {
            const eventDate = getNextEventDate(s.event_date);
            const reminderDate = getReminderDate(s.event_date, s.reminder_months_before);
            const daysUntil = getDaysUntilEvent(s.event_date);
            const urgency = getUrgencyLevel(daysUntil);
            const color = getUrgencyColor(urgency);

            const eventMonth = eventDate.getMonth();
            const eventDay = eventDate.getDate();

            const reminderDayOfYear = Math.floor((reminderDate.getTime() - new Date(reminderDate.getFullYear(), 0, 0).getTime()) / 86400000);
            const eventDayOfYear = Math.floor((eventDate.getTime() - new Date(eventDate.getFullYear(), 0, 0).getTime()) / 86400000);

            let barStart = (reminderDayOfYear / totalDays) * 100;
            let barWidth = ((eventDayOfYear - reminderDayOfYear) / totalDays) * 100;

            if (barWidth < 0) {
                barWidth = ((totalDays - reminderDayOfYear + eventDayOfYear) / totalDays) * 100;
            }

            if (barStart < 0) barStart = 0;
            if (barWidth < 3) barWidth = 3;

            return { ...s, eventDate, reminderDate, daysUntil, urgency, color, eventMonth, eventDay, barStart, barWidth };
        }).sort((a, b) => {
            const mA = parseInt(a.event_date.split('-')[0]);
            const mB = parseInt(b.event_date.split('-')[0]);
            return mA - mB;
        });
    }, [seasons]);

    const todayPercent = (dayOfYear / totalDays) * 100;

    // Group by month for grid view
    const monthGroups = useMemo(() => {
        const groups: Record<number, typeof seasonData> = {};
        seasonData.forEach((s) => {
            const month = s.eventMonth;
            if (!groups[month]) groups[month] = [];
            groups[month].push(s);
        });
        return groups;
    }, [seasonData]);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title">📅 Seasonal Calendar</h1>
                    <p className="page-subtitle">Tổng quan timeline nghiên cứu sản phẩm theo mùa</p>
                </div>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--color-border)' }}>
                    <button
                        className={`btn btn-sm ${view === 'timeline' ? 'btn-primary' : ''}`}
                        onClick={() => setView('timeline')}
                        style={view !== 'timeline' ? { background: 'none', border: 'none' } : {}}
                    >
                        <List size={14} /> Timeline
                    </button>
                    <button
                        className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : ''}`}
                        onClick={() => setView('grid')}
                        style={view !== 'grid' ? { background: 'none', border: 'none' } : {}}
                    >
                        <CalendarDays size={14} /> Grid
                    </button>
                </div>
            </div>

            {view === 'timeline' ? (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div className="timeline-container">
                        {/* Month Headers */}
                        <div className="timeline-months">
                            {MONTHS.map((m, i) => (
                                <div key={i} className="timeline-month">{m}</div>
                            ))}
                        </div>

                        {/* Today Marker */}
                        <div style={{ position: 'relative', height: '0' }}>
                            <div className="timeline-today" style={{ left: `calc(${todayPercent}% + 160px)` }} />
                        </div>

                        {/* Season Rows */}
                        <div style={{ paddingTop: '24px' }}>
                            {seasonData.map((s) => (
                                <div key={s.id} className="timeline-row" style={{ marginBottom: '8px' }}>
                                    <div className="timeline-label">
                                        <span>{s.emoji}</span>
                                        <span style={{ color: 'var(--color-text)' }}>{s.name}</span>
                                    </div>
                                    <div className="timeline-bar-container">
                                        {/* Research Window */}
                                        <div
                                            className="timeline-bar"
                                            style={{
                                                left: `${s.barStart}%`,
                                                width: `${s.barWidth}%`,
                                                background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                                            }}
                                            onClick={() => router.push(`/season/${s.id}`)}
                                            title={`${s.name}: Research window`}
                                        >
                                            {s.barWidth > 8 && `${s.daysUntil}d`}
                                        </div>
                                        {/* Event dot */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: `${(parseInt(s.event_date.split('-')[0]) - 1) * 100 / 12 + parseInt(s.event_date.split('-')[1]) * 100 / 365}%`,
                                                top: '2px',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: s.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                zIndex: 3,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => router.push(`/season/${s.id}`)}
                                        >
                                            {s.emoji}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                <div style={{ width: '30px', height: '12px', borderRadius: '3px', background: 'linear-gradient(90deg, #22C55E88, #22C55E)' }} />
                                Research Window
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                <div style={{ width: '2px', height: '16px', background: 'var(--color-accent)' }} />
                                Today
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Calendar Grid View */
                <div className="calendar-grid">
                    {MONTHS.map((month, idx) => (
                        <div key={idx} className="card calendar-month-card" style={{ padding: 0 }}>
                            <div className="calendar-month-header">{month}</div>
                            <div>
                                {monthGroups[idx]?.map((s) => (
                                    <div
                                        key={s.id}
                                        className="calendar-event"
                                        onClick={() => router.push(`/season/${s.id}`)}
                                    >
                                        <span>{s.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{s.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{s.event_date}</div>
                                        </div>
                                        <span className="urgency-badge" style={{ background: `${s.color}20`, color: s.color, padding: '2px 6px', fontSize: '11px' }}>
                                            {s.daysUntil}d
                                        </span>
                                    </div>
                                )) || (
                                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                            Không có event
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
