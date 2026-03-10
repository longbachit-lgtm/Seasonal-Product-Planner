'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { getDaysUntilEvent, getUrgencyLevel, getUrgencyColor, formatEventDate } from '@/lib/utils/dates';
import { STATUS_OPTIONS, URGENCY_COLORS } from '@/lib/utils/constants';
import { ArrowLeft, Plus, Download, Upload, Search, Trash2, ExternalLink, ArrowUpDown, ChevronDown, FileSpreadsheet, X, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SeasonDetailPage() {
    const params = useParams();
    const seasonId = params.id as string;
    const { seasons, keywords, progress, addKeyword, addKeywords, deleteKeyword, updateProgress } = useStore();

    const season = seasons.find((s) => s.id === seasonId);
    const seasonKeywords = useMemo(() => keywords.filter((k) => k.season_id === seasonId), [keywords, seasonId]);
    const seasonProgress = progress.find((p) => p.season_id === seasonId);

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'keyword' | 'search_volume' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [importPreview, setImportPreview] = useState<Array<{ keyword: string; reference_url: string; search_volume: string; competition: string; notes: string }>>([]);
    const [toast, setToast] = useState('');

    // New keyword form
    const [newKeyword, setNewKeyword] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newVolume, setNewVolume] = useState<'High' | 'Medium' | 'Low'>('Medium');
    const [newNotes, setNewNotes] = useState('');

    if (!season) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
                <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Season không tồn tại</h2>
                <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '16px', display: 'inline-flex' }}>
                    <ArrowLeft size={16} /> Về Dashboard
                </Link>
            </div>
        );
    }

    const daysUntil = getDaysUntilEvent(season.event_date);
    const urgency = getUrgencyLevel(daysUntil);
    const urgencyColor = getUrgencyColor(urgency);
    const urgencyInfo = URGENCY_COLORS[urgency];

    // Filter and sort keywords
    const filteredKeywords = seasonKeywords
        .filter((k) => k.keyword.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const mult = sortOrder === 'asc' ? 1 : -1;
            if (sortBy === 'keyword') return a.keyword.localeCompare(b.keyword) * mult;
            if (sortBy === 'search_volume') return ((a.search_volume || '').localeCompare(b.search_volume || '')) * mult;
            return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * mult;
        });

    const handleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortOrder('asc'); }
    };

    const handleAddKeyword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyword.trim()) return;
        addKeyword({
            season_id: seasonId,
            keyword: newKeyword.trim(),
            reference_url: newUrl || null,
            search_volume: newVolume,
            competition: null,
            notes: newNotes || null,
        });
        setNewKeyword(''); setNewUrl(''); setNewNotes('');
        setShowAddForm(false);
        showToast('Đã thêm keyword!');
    };

    const handleExcelExport = () => {
        const data = seasonKeywords.map((k) => ({
            Keyword: k.keyword,
            URL: k.reference_url || '',
            'Search Volume': k.search_volume || '',
            Competition: k.competition || '',
            Notes: k.notes || '',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Keywords');
        XLSX.writeFile(wb, `${season.name.replace(/\s+/g, '_')}_keywords.xlsx`);
        showToast('Đã export file Excel!');
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet);
            const preview = rows.map((row) => ({
                keyword: row['keyword'] || row['Keyword'] || row['KEYWORD'] || '',
                reference_url: row['url'] || row['URL'] || row['reference_url'] || '',
                search_volume: row['volume'] || row['Volume'] || row['search_volume'] || 'Medium',
                competition: row['competition'] || row['Competition'] || '',
                notes: row['notes'] || row['Notes'] || '',
            })).filter((r) => r.keyword);
            setImportPreview(preview);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
    };

    const handleImportConfirm = () => {
        addKeywords(importPreview.map((k) => ({
            season_id: seasonId,
            keyword: k.keyword,
            reference_url: k.reference_url || null,
            search_volume: (k.search_volume as 'High' | 'Medium' | 'Low') || null,
            competition: k.competition || null,
            notes: k.notes || null,
        })));
        setImportPreview([]);
        setShowImport(false);
        showToast(`Đã import ${importPreview.length} keywords!`);
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div>
            {toast && <div className="toast">{toast}</div>}

            {/* Back */}
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Về Dashboard
            </Link>

            {/* Season Header */}
            <div className="card" style={{ marginBottom: '24px', borderTop: `4px solid ${urgencyColor}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '56px' }}>{season.emoji}</span>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>{season.name}</h1>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                📅 {formatEventDate(season.event_date)}
                            </p>
                            <div style={{ marginTop: '8px' }}>
                                <span className="urgency-badge" style={{ background: urgencyInfo.bg, color: urgencyInfo.text }}>
                                    {urgencyInfo.label} — Còn {daysUntil} ngày
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '48px', fontWeight: 800, color: urgencyColor }}>{daysUntil}</span>
                        <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>ngày</span>
                    </div>
                </div>
            </div>

            {/* Tips */}
            {season.tips && (
                <div className="card" style={{ marginBottom: '24px', background: 'rgba(27, 77, 62, 0.05)', borderLeft: '4px solid var(--color-primary)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-primary)' }}>💡 Mẹo nghiên cứu</h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{season.tips}</p>
                </div>
            )}

            {/* Progress Tracker */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>📊 Tiến độ cá nhân</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label className="form-label">Trạng thái</label>
                        <select
                            className="form-input form-select"
                            value={seasonProgress?.status || 'not_started'}
                            onChange={(e) => updateProgress(seasonId, { status: e.target.value as UserSeasonProgress['status'] })}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                        <label className="form-label">Mục tiêu SP</label>
                        <input
                            className="form-input"
                            type="number"
                            min={0}
                            value={seasonProgress?.target_products || ''}
                            placeholder="0"
                            onChange={(e) => updateProgress(seasonId, { target_products: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                        <label className="form-label">Đã hoàn thành</label>
                        <input
                            className="form-input"
                            type="number"
                            min={0}
                            value={seasonProgress?.completed_products || ''}
                            placeholder="0"
                            onChange={(e) => updateProgress(seasonId, { completed_products: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>
            </div>

            {/* Keywords Section */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                        🔑 Keywords ({filteredKeywords.length})
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
                            <Plus size={14} /> Thêm Keyword
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
                            <Upload size={14} /> Import Excel
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={handleExcelExport}>
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                    <input
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                        placeholder="Tìm keyword..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('keyword')} style={{ cursor: 'pointer' }}>
                                    Keyword <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                                </th>
                                <th>URL</th>
                                <th onClick={() => handleSort('search_volume')} style={{ cursor: 'pointer' }}>
                                    Volume <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                                </th>
                                <th>Competition</th>
                                <th>Notes</th>
                                <th style={{ width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKeywords.map((k) => (
                                <tr key={k.id}>
                                    <td style={{ fontWeight: 600 }}>{k.keyword}</td>
                                    <td>
                                        {k.reference_url ? (
                                            <a href={k.reference_url} target="_blank" rel="noopener" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                Link <ExternalLink size={12} />
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        {k.search_volume && (
                                            <span className={`volume-badge volume-${k.search_volume.toLowerCase()}`}>
                                                {k.search_volume}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>{k.competition || '—'}</td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{k.notes || '—'}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            style={{ padding: '4px 8px' }}
                                            onClick={() => { deleteKeyword(k.id); showToast('Đã xoá keyword'); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredKeywords.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                        Chưa có keyword nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Keyword Modal */}
            {showAddForm && (
                <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ fontWeight: 700 }}>Thêm Keyword</h3>
                            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddKeyword}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Keyword *</label>
                                    <input className="form-input" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="Nhập keyword" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">URL tham khảo</label>
                                    <input className="form-input" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Search Volume</label>
                                    <select className="form-input form-select" value={newVolume} onChange={(e) => setNewVolume(e.target.value as 'High' | 'Medium' | 'Low')}>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ghi chú</label>
                                    <input className="form-input" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Ghi chú thêm..." />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Huỷ</button>
                                <button type="submit" className="btn btn-primary"><Save size={16} /> Thêm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Excel Modal */}
            {showImport && (
                <div className="modal-overlay" onClick={() => { setShowImport(false); setImportPreview([]); }}>
                    <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ fontWeight: 700 }}><FileSpreadsheet size={20} style={{ marginRight: '8px' }} />Import Excel</h3>
                            <button onClick={() => { setShowImport(false); setImportPreview([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {importPreview.length === 0 ? (
                                <div
                                    className={`drop-zone ${dragActive ? 'active' : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleDrop}
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = '.xlsx,.csv';
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) handleFileUpload(file);
                                        };
                                        input.click();
                                    }}
                                >
                                    <Upload size={40} style={{ margin: '0 auto 12px', color: 'var(--color-text-muted)' }} />
                                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>Kéo thả file Excel hoặc click để chọn</p>
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Hỗ trợ .xlsx và .csv</p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                                        Columns: keyword, url, volume, competition, notes
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: '12px' }}>Preview: {importPreview.length} keywords</p>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Keyword</th>
                                                    <th>Volume</th>
                                                    <th>Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importPreview.slice(0, 20).map((k, i) => (
                                                    <tr key={i}>
                                                        <td style={{ fontWeight: 600 }}>{k.keyword}</td>
                                                        <td>{k.search_volume}</td>
                                                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{k.notes || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {importPreview.length > 20 && (
                                            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', padding: '12px' }}>
                                                ...và {importPreview.length - 20} keywords khác
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {importPreview.length > 0 && (
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setImportPreview([])}>Chọn file khác</button>
                                <button className="btn btn-primary" onClick={handleImportConfirm}>
                                    <Upload size={16} /> Import {importPreview.length} keywords
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Type helper
type UserSeasonProgress = { status: 'not_started' | 'researching' | 'developing' | 'ready' | 'launched' };
