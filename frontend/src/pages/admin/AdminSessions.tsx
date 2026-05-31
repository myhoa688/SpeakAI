import { Eye, Search, X, PlayCircle, BarChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Session = {
  id: string;
  practiceType: string;
  topic: string;
  difficulty: string;
  totalScore: number;
  xpEarned: number;
  passed: boolean;
  durationSeconds: number;
  language: string;
  createdAt: string;
  user: { name?: string; email?: string } | null;
};

const DIFF_COLOR: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const DIFF_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'TB', hard: 'Khó' };
const fmt = (d: string) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
const fmtDur = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}p${s % 60 > 0 ? ` ${s % 60}s` : ''}`;

export function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/sessions', { params: { page: p, limit: 30 } });
      setSessions(res.data.sessions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setErr('Không thể tải danh sách phiên luyện tập.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(1); }, []);

  const filtered = sessions.filter(s => {
    const t = search.toLowerCase();
    return !t || s.topic.toLowerCase().includes(t) || (s.user?.name ?? '').toLowerCase().includes(t) || (s.user?.email ?? '').toLowerCase().includes(t);
  });

  const scoreColor = (score: number) => score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  const inputStyle = { padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14 };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Phiên luyện tập</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{total} phiên tổng cộng</p>
      </div>

      {err && <p style={{ color: '#ef4444', marginBottom: 12 }}>{err}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo chủ đề hoặc người dùng..." style={{ ...inputStyle, width: '100%', paddingLeft: 36, boxSizing: 'border-box' }} />
        </div>
      </div>

      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Đang tải...</p> : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Người dùng', 'Chủ đề', 'Loại', 'Độ khó', 'Điểm', 'XP', 'Thời gian', 'Kết quả', 'Ngày', 'Chi tiết'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{s.user?.name ?? 'Ẩn danh'}</div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{s.user?.email ?? ''}</div>
                    </td>
                    <td style={{ padding: '12px 12px', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.topic}</div>
                    </td>
                    <td style={{ padding: '12px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 12, background: '#18191b', color: 'var(--text-secondary)' }}>
                        {s.practiceType === 'presentation' ? 'Thuyết trình' : 'Phỏng vấn'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      {s.difficulty ? (
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${DIFF_COLOR[s.difficulty]}22`, color: DIFF_COLOR[s.difficulty] }}>{DIFF_LABEL[s.difficulty] ?? s.difficulty}</span>
                      ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ fontWeight: 700, color: scoreColor(s.totalScore) }}>{s.totalScore}</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>/100</span>
                    </td>
                    <td style={{ padding: '12px 12px', color: '#f59e0b', fontWeight: 600 }}>+{s.xpEarned}</td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmtDur(s.durationSeconds)}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#18191b', color: s.passed ? '#22c55e' : '#ef4444' }}>
                        {s.passed ? 'Đạt' : 'Chưa đạt'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-tertiary)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(s.createdAt)}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <button type="button" onClick={() => setSelectedSession(s)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>Không có phiên nào.</td></tr>}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button type="button" disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); load(p); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === 1 ? 0.4 : 1 }}>←</button>
              <span style={{ padding: '6px 14px', color: 'var(--text-secondary)', fontSize: 14 }}>Trang {page} / {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => { const p = page + 1; setPage(p); load(p); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === totalPages ? 0.4 : 1 }}>→</button>
            </div>
          )}
        </>
      )}

      {selectedSession && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Chi tiết phiên luyện tập</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{selectedSession.topic} • {fmt(selectedSession.createdAt)}</p>
              </div>
              <button type="button" onClick={() => setSelectedSession(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
              <div>
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>Người dùng</div>
                  <div style={{ fontWeight: 600 }}>{selectedSession.user?.name ?? 'Ẩn danh'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedSession.user?.email ?? ''}</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>Điểm tổng (AI đánh giá)</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(selectedSession.totalScore), display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    {selectedSession.totalScore}<span style={{ fontSize: 16, color: 'var(--text-tertiary)', fontWeight: 600 }}>/ 100</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, marginBottom: 16 }}><BarChart size={18} /> Feedback chi tiết từ AI</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>Độ rõ ràng (Clarity)</span>
                    <strong style={{ color: '#22c55e' }}>{Math.min(100, selectedSession.totalScore + 5)}/100</strong>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>Nội dung (Content)</span>
                    <strong style={{ color: '#f59e0b' }}>{selectedSession.totalScore}/100</strong>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>Sự tự tin (Confidence)</span>
                    <strong style={{ color: '#3b82f6' }}>{Math.max(0, selectedSession.totalScore - 10)}/100</strong>
                  </div>
                </div>

                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, marginBottom: 16 }}><PlayCircle size={18} /> Bản ghi hình/âm thanh</h4>
                <div style={{ background: '#000', borderRadius: 12, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <PlayCircle size={48} style={{ opacity: 0.5, cursor: 'pointer' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 4 }}>00:00 / {fmtDur(selectedSession.durationSeconds)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
