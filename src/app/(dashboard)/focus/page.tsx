'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';

export default function FocusPage() {
    const { seasons } = useStore();
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [selectedSeason, setSelectedSeason] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    const tick = useCallback(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                setIsRunning(false);
                if (mode === 'work') {
                    setSessions((s) => s + 1);
                    setMode('break');
                    return 5 * 60;
                } else {
                    setMode('work');
                    return 25 * 60;
                }
            }
            return prev - 1;
        });
    }, [mode]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(tick, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, tick]);

    const reset = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    };

    const switchMode = (newMode: 'work' | 'break') => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const circumference = 2 * Math.PI * 130;
    const dashOffset = circumference * (1 - progress / 100);

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="page-title">⏱️ Focus Timer</h1>
            <p className="page-subtitle">Pomodoro cho phiên nghiên cứu sản phẩm</p>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '32px', background: 'var(--color-bg)', borderRadius: '12px', padding: '4px', border: '1px solid var(--color-border)', display: 'inline-flex' }}>
                <button
                    className={`btn btn-sm ${mode === 'work' ? 'btn-primary' : ''}`}
                    onClick={() => switchMode('work')}
                    style={mode !== 'work' ? { background: 'none', border: 'none' } : {}}
                >
                    <Zap size={14} /> Làm việc
                </button>
                <button
                    className={`btn btn-sm ${mode === 'break' ? 'btn-accent' : ''}`}
                    onClick={() => switchMode('break')}
                    style={mode !== 'break' ? { background: 'none', border: 'none' } : {}}
                >
                    <Coffee size={14} /> Nghỉ
                </button>
            </div>

            {/* Timer Ring */}
            <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto 32px' }}>
                <svg width="300" height="300" viewBox="0 0 300 300">
                    {/* Background ring */}
                    <circle
                        cx="150" cy="150" r="130"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="8"
                    />
                    {/* Progress ring */}
                    <circle
                        cx="150" cy="150" r="130"
                        fill="none"
                        stroke={mode === 'work' ? 'var(--color-primary)' : 'var(--color-accent)'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 150 150)"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="timer-display">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        {mode === 'work' ? 'Tập trung nghiên cứu' : 'Thời gian nghỉ'}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                <button
                    className="btn btn-secondary"
                    onClick={reset}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, justifyContent: 'center' }}
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    className={`btn ${mode === 'work' ? 'btn-primary' : 'btn-accent'}`}
                    onClick={() => setIsRunning(!isRunning)}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0, justifyContent: 'center', fontSize: '0' }}
                >
                    {isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
                </button>
                <div style={{ width: '48px' }} /> {/* Spacer */}
            </div>

            {/* Season Selector */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ textAlign: 'left' }}>Research cho season:</label>
                <select
                    className="form-input form-select"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                >
                    <option value="">Chọn season...</option>
                    {seasons.filter(s => s.is_active).map((s) => (
                        <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>{sessions}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Phiên hôm nay</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-accent)' }}>{sessions * 25}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Phút tập trung</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
