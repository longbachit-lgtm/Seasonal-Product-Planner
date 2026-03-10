'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { User, Moon, Sun, Bell, Eye, Palette } from 'lucide-react';

export default function SettingsPage() {
    const { currentUser, darkMode, toggleDarkMode, seasons } = useStore();
    const [name, setName] = useState(currentUser?.full_name || '');
    const [toast, setToast] = useState('');
    const [followedSeasons, setFollowedSeasons] = useState<Set<string>>(new Set(seasons.map((s) => s.id)));

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const toggleFollow = (seasonId: string) => {
        setFollowedSeasons((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(seasonId)) newSet.delete(seasonId);
            else newSet.add(seasonId);
            return newSet;
        });
    };

    return (
        <div style={{ maxWidth: '700px' }}>
            {toast && <div className="toast">{toast}</div>}

            <h1 className="page-title">⚙️ Cài đặt</h1>
            <p className="page-subtitle">Tuỳ chỉnh trải nghiệm của bạn</p>

            {/* Profile Section */}
            <div className="card settings-section" style={{ marginBottom: '20px' }}>
                <h3><User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Thông tin cá nhân</h3>
                <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Họ tên</label>
                    <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Avatar</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="avatar-btn" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                            {name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="btn btn-secondary btn-sm">Thay đổi avatar</button>
                    </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Đã lưu thông tin!')}>
                    Lưu thay đổi
                </button>
            </div>

            {/* Appearance Section */}
            <div className="card settings-section" style={{ marginBottom: '20px' }}>
                <h3><Palette size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Giao diện</h3>
                <div className="settings-item">
                    <div>
                        <div className="settings-item-label">
                            {darkMode ? <Moon size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> : <Sun size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />}
                            Dark Mode
                        </div>
                        <div className="settings-item-desc">Sử dụng giao diện tối</div>
                    </div>
                    <button className={`toggle ${darkMode ? 'active' : ''}`} onClick={toggleDarkMode} />
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="card settings-section" style={{ marginBottom: '20px' }}>
                <h3><Bell size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Thông báo</h3>
                <div className="settings-item">
                    <div>
                        <div className="settings-item-label">Nhắc nhở season</div>
                        <div className="settings-item-desc">Nhận thông báo 3 tháng trước mỗi sự kiện</div>
                    </div>
                    <button className="toggle active" />
                </div>
                <div className="settings-item">
                    <div>
                        <div className="settings-item-label">Keyword mới</div>
                        <div className="settings-item-desc">Thông báo khi có keyword mới được thêm</div>
                    </div>
                    <button className="toggle active" />
                </div>
                <div className="settings-item">
                    <div>
                        <div className="settings-item-label">Deadline</div>
                        <div className="settings-item-desc">Cảnh báo khi sắp đến deadline</div>
                    </div>
                    <button className="toggle active" />
                </div>
            </div>

            {/* Season Follow */}
            <div className="card settings-section">
                <h3><Eye size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Seasons theo dõi</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                    Chọn các season bạn muốn theo dõi và nhận thông báo
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                    {seasons.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => toggleFollow(s.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: `2px solid ${followedSeasons.has(s.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: followedSeasons.has(s.id) ? 'rgba(27, 77, 62, 0.05)' : 'transparent',
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                            <span style={{ flex: 1, fontSize: '13px', fontWeight: 600 }}>{s.name}</span>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '6px',
                                border: `2px solid ${followedSeasons.has(s.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                background: followedSeasons.has(s.id) ? 'var(--color-primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                transition: 'all 0.2s',
                            }}>
                                {followedSeasons.has(s.id) && '✓'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
