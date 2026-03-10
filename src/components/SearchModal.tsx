'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { Search, X, ArrowRight } from 'lucide-react';

export default function SearchModal() {
    const router = useRouter();
    const { keywords, seasons, setShowSearchModal, globalSearchQuery, setGlobalSearchQuery } = useStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState(globalSearchQuery);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowSearchModal(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setShowSearchModal]);

    const results = query.length > 1
        ? keywords
            .filter((k) => k.keyword.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
            .map((k) => {
                const season = seasons.find((s) => s.id === k.season_id);
                return { ...k, seasonName: season?.name || '', seasonEmoji: season?.emoji || '', seasonId: season?.id || '' };
            })
        : [];

    const seasonResults = query.length > 1
        ? seasons.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        : [];

    return (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
            <div className="modal-content search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="search-input-container">
                    <Search size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        className="search-input"
                        placeholder="Tìm keyword, season..."
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setGlobalSearchQuery(e.target.value); }}
                    />
                    <button
                        onClick={() => setShowSearchModal(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="search-results">
                    {/* Season Results */}
                    {seasonResults.length > 0 && (
                        <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            Seasons
                        </div>
                    )}
                    {seasonResults.map((s) => (
                        <div
                            key={s.id}
                            className="search-result-item"
                            onClick={() => { router.push(`/season/${s.id}`); setShowSearchModal(false); }}
                        >
                            <span style={{ fontSize: '24px' }}>{s.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Season</div>
                            </div>
                            <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                    ))}

                    {/* Keyword Results */}
                    {results.length > 0 && (
                        <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '8px' }}>
                            Keywords
                        </div>
                    )}
                    {results.map((k) => (
                        <div
                            key={k.id}
                            className="search-result-item"
                            onClick={() => { router.push(`/season/${k.seasonId}`); setShowSearchModal(false); }}
                        >
                            <span style={{ fontSize: '18px' }}>{k.seasonEmoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{k.keyword}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{k.seasonName}</div>
                            </div>
                            {k.search_volume && (
                                <span className={`volume-badge volume-${k.search_volume.toLowerCase()}`}>
                                    {k.search_volume}
                                </span>
                            )}
                        </div>
                    ))}

                    {query.length > 1 && results.length === 0 && seasonResults.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <p style={{ fontSize: '14px' }}>Không tìm thấy kết quả cho &quot;{query}&quot;</p>
                        </div>
                    )}

                    {query.length <= 1 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p style={{ fontSize: '14px' }}>Nhập để tìm kiếm keywords và seasons</p>
                            <p style={{ fontSize: '12px', marginTop: '4px' }}>Tip: Sử dụng Ctrl+K để mở nhanh</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
