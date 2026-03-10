'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, register, isLoading, authError } = useStore();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        let success = false;
        if (isLogin) {
            success = await login(email, password);
        } else {
            if (!name) {
                setError('Vui lòng nhập tên');
                return;
            }
            success = await register(name, email, password);
        }

        if (success) {
            router.push('/');
        }
    };

    return (
        <div className="auth-page">
            {/* Background Animation */}
            <div className="auth-bg-animation">
                {['💝', '☘️', '🐣', '🎃', '🎄', '🏈', '👩', '🎒'].map((emoji, i) => (
                    <div
                        key={i}
                        className="bubble"
                        style={{
                            left: `${10 + i * 12}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            width: `${40 + i * 10}px`,
                            height: `${40 + i * 10}px`,
                            animationDelay: `${i * 0.8}s`,
                            animationDuration: `${5 + i}s`,
                            fontSize: `${24 + i * 4}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                        }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>

            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '40px' }}>🌿</div>
                <h1 className="auth-title">
                    {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                </h1>
                <p className="auth-subtitle">
                    {isLogin
                        ? 'Seasonal Product Planner — Quản lý sản phẩm theo mùa'
                        : 'Bắt đầu nghiên cứu sản phẩm Amazon theo mùa'}
                </p>


                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Họ tên</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: '36px' }}
                                    type="text"
                                    placeholder="Nhập họ tên"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: '36px' }}
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {(error || authError) && (
                        <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '12px' }}>{error || authError}</p>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ color: 'var(--color-primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                    </button>
                </p>
            </div>
        </div>
    );
}
