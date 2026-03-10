'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Shield, Users, Calendar, BarChart3, Plus, Trash2, Edit2, X, Save, Search } from 'lucide-react';

export default function AdminPage() {
    const { currentUser, seasons, keywords, notifications, addSeason, updateSeason, deleteSeason } = useStore();
    const [activeTab, setActiveTab] = useState<'seasons' | 'users' | 'stats'>('stats');
    const [showAddSeason, setShowAddSeason] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    // New season form
    const [newName, setNewName] = useState('');
    const [newEmoji, setNewEmoji] = useState('🎉');
    const [newDate, setNewDate] = useState('');
    const [newColor, setNewColor] = useState('#3B82F6');
    const [newTips, setNewTips] = useState('');

    if (currentUser?.role !== 'admin') {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Shield size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px', opacity: 0.3 }} />
                <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Không có quyền truy cập</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Trang này chỉ dành cho admin.</p>
            </div>
        );
    }

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleAddSeason = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newDate) return;
        addSeason({
            name: newName,
            emoji: newEmoji,
            event_date: newDate,
            color: newColor,
            reminder_months_before: 3,
            tips: newTips,
            is_active: true,
        });
        setNewName(''); setNewEmoji('🎉'); setNewDate(''); setNewColor('#3B82F6'); setNewTips('');
        setShowAddSeason(false);
        showToast('Đã thêm season mới!');
    };

    return (
        <div>
            {toast && <div className="toast">{toast}</div>}

            <h1 className="page-title">🛡️ Admin Panel</h1>
            <p className="page-subtitle">Quản lý hệ thống Seasonal Product Planner</p>

            {/* Stats */}
            <div className="admin-stats-grid">
                {[
                    { label: 'Users', value: 1, icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Seasons', value: seasons.length, icon: Calendar, color: '#10B981', bg: '#D1FAE5' },
                    { label: 'Keywords', value: keywords.length, icon: Search, color: '#F59E0B', bg: '#FEF3C7' },
                    { label: 'Notifications', value: notifications.length, icon: BarChart3, color: '#8B5CF6', bg: '#EDE9FE' },
                ].map((s, i) => (
                    <div key={i} className="card stat-card">
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="tabs">
                {[
                    { value: 'stats', label: 'Tổng quan' },
                    { value: 'seasons', label: 'Quản lý Seasons' },
                    { value: 'users', label: 'Quản lý Users' },
                ].map((t) => (
                    <button
                        key={t.value}
                        className={`tab ${activeTab === t.value ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.value as typeof activeTab)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'stats' && (
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>📊 System Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div>
                            <h4 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Top Seasons by Keywords</h4>
                            {seasons
                                .map((s) => ({ ...s, kwCount: keywords.filter((k) => k.season_id === s.id).length }))
                                .sort((a, b) => b.kwCount - a.kwCount)
                                .slice(0, 5)
                                .map((s) => (
                                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                                        <span style={{ fontSize: '14px' }}>{s.emoji} {s.name}</span>
                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{s.kwCount}</span>
                                    </div>
                                ))}
                        </div>
                        <div>
                            <h4 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Keyword Volume Distribution</h4>
                            {['High', 'Medium', 'Low'].map((vol) => {
                                const count = keywords.filter((k) => k.search_volume === vol).length;
                                const percent = keywords.length > 0 ? (count / keywords.length) * 100 : 0;
                                return (
                                    <div key={vol} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                            <span>{vol}</span>
                                            <span style={{ fontWeight: 600 }}>{count} ({Math.round(percent)}%)</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${percent}%`,
                                                background: vol === 'High' ? '#22C55E' : vol === 'Medium' ? '#F59E0B' : '#EF4444',
                                                borderRadius: '4px',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'seasons' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontWeight: 700 }}>Quản lý Seasons</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddSeason(true)}>
                            <Plus size={14} /> Thêm Season
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Season</th>
                                    <th>Event Date</th>
                                    <th>Color</th>
                                    <th>Active</th>
                                    <th>Keywords</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seasons.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                                                <span style={{ fontWeight: 600 }}>{s.name}</span>
                                            </div>
                                        </td>
                                        <td>{s.event_date}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: s.color }} />
                                                {s.color}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className={`toggle ${s.is_active ? 'active' : ''}`}
                                                onClick={() => updateSeason(s.id, { is_active: !s.is_active })}
                                            />
                                        </td>
                                        <td>{keywords.filter((k) => k.season_id === s.id).length}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    style={{ padding: '4px 8px' }}
                                                    onClick={() => {
                                                        if (confirm(`Xoá "${s.name}"?`)) {
                                                            deleteSeason(s.id);
                                                            showToast('Đã xoá season');
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Quản lý Users</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="avatar-btn" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                        {currentUser?.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{currentUser?.full_name}</span>
                                </td>
                                <td style={{ color: 'var(--color-text-secondary)' }}>admin@example.com</td>
                                <td>
                                    <span style={{ background: '#DBEAFE', color: '#2563EB', padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                        Admin
                                    </span>
                                </td>
                                <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Hôm nay</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Season Modal */}
            {showAddSeason && (
                <div className="modal-overlay" onClick={() => setShowAddSeason(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ fontWeight: 700 }}>Thêm Season mới</h3>
                            <button onClick={() => setShowAddSeason(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSeason}>
                            <div className="modal-body">
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="form-group" style={{ width: '80px' }}>
                                        <label className="form-label">Emoji</label>
                                        <input className="form-input" style={{ textAlign: 'center', fontSize: '24px' }} value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Tên Season *</label>
                                        <input className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="VD: Labor Day" required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Event Date (MM-DD) *</label>
                                        <input className="form-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="09-01" required pattern="\d{2}-\d{2}" />
                                    </div>
                                    <div className="form-group" style={{ width: '120px' }}>
                                        <label className="form-label">Color</label>
                                        <input type="color" className="form-input" style={{ padding: '4px', height: '40px' }} value={newColor} onChange={(e) => setNewColor(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Research Tips</label>
                                    <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={newTips} onChange={(e) => setNewTips(e.target.value)} placeholder="Mẹo nghiên cứu cho season này..." />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSeason(false)}>Huỷ</button>
                                <button type="submit" className="btn btn-primary"><Save size={16} /> Thêm Season</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
