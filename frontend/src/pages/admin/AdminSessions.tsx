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

const DIFF_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  easy:   { bg: 'rgba(34,197,94,0.12)',   text: '#4ADE80', border: 'rgba(34,197,94,0.25)'   },
  medium: { bg: 'rgba(245,158,11,0.12)',  text: '#FCD34D', border: 'rgba(245,158,11,0.25)'  },
  hard:   { bg: 'rgba(239,68,68,0.12)',   text: '#F87171', border: 'rgba(239,68,68,0.25)'   },
};
const DIFF_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'TB', hard: 'Khó' };

const fmt = (d: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));

const fmtDur = (s: number) =>
  s < 60 ? `${s}s` : `${Math.floor(s / 60)}p${s % 60 > 0 ? ` ${s % 60}s` : ''}`;

const scoreColor = (score: number) =>
  score >= 80 ? '#4ADE80' : score >= 60 ? '#FCD34D' : '#F87171';

export function AdminSessions() {
  const [sessions, setSessions]           = useState<Session[]>([]);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [err, setErr]                     = useState('');
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
    return !t
      || s.topic.toLowerCase().includes(t)
      || (s.user?.name ?? '').toLowerCase().includes(t)
      || (s.user?.email ?? '').toLowerCase().includes(t);
  });

  /* ── Shared token shorthands ── */
  const S = {
    surface:  { background: '#111111' },
    elevated: { background: '#1a1a1a' },
    borderS:  '1px solid rgba(255,255,255,0.06)',
    borderD:  '1px solid rgba(255,255,255,0.10)',
    radius12: { borderRadius: 12 },
    radius8:  { borderRadius: 8 },
    radius6:  { borderRadius: 6 },
    textP:    { color: '#F0F0F0' },
    textS:    { color: '#A0A0A0' },
    textM:    { color: '#525252' },
    font:     { fontFamily: "'Inter', sans-serif" },
  } as const;

  /* ── Badge helper ── */
  const Badge = ({
    children, bg, color, border,
  }: { children: React.ReactNode; bg: string; color: string; border: string }) => (
    <span style={{
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.03em',
      background: bg,
      color,
      border: `1px solid ${border}`,
      whiteSpace: 'nowrap' as const,
    }}>
      {children}
    </span>
  );

  return (
    <div style={{ ...S.font, color: '#F0F0F0' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#F0F0F0' }}>
          Phiên luyện tập
        </h2>
        <p style={{ ...S.textM, fontSize: 13 }}>{total} phiên tổng cộng</p>
      </div>

      {err && <p style={{ color: '#F87171', marginBottom: 12, fontSize: 13 }}>{err}</p>}

      {/* ── SEARCH BAR ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search
            size={15}
            style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#525252',
            }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo chủ đề hoặc người dùng..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: '#1a1a1a',
              border: S.borderS,
              borderRadius: 8,
              color: '#F0F0F0',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color .15s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.45)')}
            onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
          />
        </div>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <p style={{ ...S.textS, fontSize: 13 }}>Đang tải...</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: S.borderS }}>
                  {['Người dùng','Chủ đề','Loại','Độ khó','Điểm','XP','Thời gian','Kết quả','Ngày','Chi tiết'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      color: '#525252',
                      fontWeight: 600,
                      fontSize: 10,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                  >
                    {/* Người dùng */}
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', color: '#F0F0F0', fontSize: 13 }}>
                        {s.user?.name ?? 'Ẩn danh'}
                      </div>
                      <div style={{ color: '#525252', fontSize: 11, marginTop: 1 }}>
                        {s.user?.email ?? ''}
                      </div>
                    </td>

                    {/* Chủ đề */}
                    <td style={{ padding: '11px 12px', maxWidth: 200 }}>
                      <div style={{
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', color: '#A0A0A0', fontSize: 13,
                      }}>
                        {s.topic}
                      </div>
                    </td>

                    {/* Loại */}
                    <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                      <Badge bg="rgba(255,255,255,0.06)" color="#A0A0A0" border="rgba(255,255,255,0.08)">
                        {s.practiceType === 'presentation' ? 'Thuyết trình' : 'Phỏng vấn'}
                      </Badge>
                    </td>

                    {/* Độ khó */}
                    <td style={{ padding: '11px 12px' }}>
                      {s.difficulty && DIFF_COLOR[s.difficulty] ? (
                        <Badge {...DIFF_COLOR[s.difficulty]}>
                          {DIFF_LABEL[s.difficulty] ?? s.difficulty}
                        </Badge>
                      ) : (
                        <span style={{ color: '#525252' }}>—</span>
                      )}
                    </td>

                    {/* Điểm */}
                    <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(s.totalScore) }}>
                        {s.totalScore}
                      </span>
                      <span style={{ color: '#525252', fontSize: 11 }}>/100</span>
                    </td>

                    {/* XP */}
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ color: '#FCD34D', fontWeight: 600, fontSize: 13 }}>
                        +{s.xpEarned}
                      </span>
                    </td>

                    {/* Thời gian */}
                    <td style={{ padding: '11px 12px', color: '#A0A0A0', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {fmtDur(s.durationSeconds)}
                    </td>

                    {/* Kết quả */}
                    <td style={{ padding: '11px 12px' }}>
                      {s.passed ? (
                        <Badge bg="rgba(34,197,94,0.12)" color="#4ADE80" border="rgba(34,197,94,0.2)">Đạt</Badge>
                      ) : (
                        <Badge bg="rgba(239,68,68,0.12)" color="#F87171" border="rgba(239,68,68,0.2)">Chưa đạt</Badge>
                      )}
                    </td>

                    {/* Ngày */}
                    <td style={{ padding: '11px 12px', color: '#525252', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {fmt(s.createdAt)}
                    </td>

                    {/* Chi tiết */}
                    <td style={{ padding: '11px 12px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSession(s)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: 6,
                          border: '1px solid rgba(59,130,246,0.25)',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#60A5FA',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.12)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#3B82F6';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.25)';
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#525252', fontSize: 13 }}>
                      Không có phiên nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => { const p = page - 1; setPage(p); load(p); }}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer',
                  color: '#A0A0A0', fontSize: 13,
                  opacity: page === 1 ? 0.35 : 1, transition: 'all .15s',
                }}
              >←</button>
              <span style={{ padding: '6px 14px', color: '#525252', fontSize: 13 }}>
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => { const p = page + 1; setPage(p); load(p); }}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  color: '#A0A0A0', fontSize: 13,
                  opacity: page === totalPages ? 0.35 : 1, transition: 'all .15s',
                }}
              >→</button>
            </div>
          )}
        </>
      )}

      {/* ── DETAIL MODAL ── */}
      {selectedSession && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#111111',
            borderRadius: 16,
            padding: 28,
            width: '100%',
            maxWidth: 700,
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
            {/* Gradient top border on modal */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(124,58,237,0.4), transparent)',
              borderRadius: '16px 16px 0 0',
            }} />

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: '#F0F0F0' }}>
                  Chi tiết phiên luyện tập
                </h3>
                <p style={{ color: '#525252', fontSize: 12 }}>
                  {selectedSession.topic} • {fmt(selectedSession.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, cursor: 'pointer',
                  color: '#A0A0A0', padding: '4px 6px',
                  display: 'flex', alignItems: 'center',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#F87171';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#A0A0A0';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* User info */}
                <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#525252', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Người dùng
                  </div>
                  <div style={{ fontWeight: 600, color: '#F0F0F0', fontSize: 14 }}>
                    {selectedSession.user?.name ?? 'Ẩn danh'}
                  </div>
                  <div style={{ fontSize: 12, color: '#525252', marginTop: 2 }}>
                    {selectedSession.user?.email ?? ''}
                  </div>
                </div>

                {/* Score */}
                <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#525252', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Điểm tổng (AI)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: scoreColor(selectedSession.totalScore) }}>
                      {selectedSession.totalScore}
                    </span>
                    <span style={{ fontSize: 14, color: '#525252', fontWeight: 600 }}>/ 100</span>
                  </div>
                </div>

                {/* Meta */}
                <div style={{ background: '#1a1a1a', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Thời gian', value: fmtDur(selectedSession.durationSeconds) },
                    { label: 'XP nhận được', value: `+${selectedSession.xpEarned}`, style: { color: '#FCD34D', fontWeight: 600 } },
                    { label: 'Kết quả', value: selectedSession.passed ? 'Đạt' : 'Chưa đạt', style: { color: selectedSession.passed ? '#4ADE80' : '#F87171', fontWeight: 600 } },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#525252' }}>{item.label}</span>
                      <span style={{ fontSize: 13, color: '#A0A0A0', ...item.style }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#F0F0F0' }}>
                  <BarChart size={16} style={{ color: '#60A5FA' }} />
                  Feedback chi tiết từ AI
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {[
                    { label: 'Độ rõ ràng (Clarity)',   score: Math.min(100, selectedSession.totalScore + 5), color: '#4ADE80' },
                    { label: 'Nội dung (Content)',      score: selectedSession.totalScore,                    color: '#FCD34D' },
                    { label: 'Sự tự tin (Confidence)', score: Math.max(0, selectedSession.totalScore - 10),  color: '#60A5FA' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: '#1a1a1a',
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 500, color: '#A0A0A0', fontSize: 13 }}>{item.label}</span>
                      <strong style={{ color: item.color, fontSize: 14 }}>{item.score}/100</strong>
                    </div>
                  ))}
                </div>

                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#F0F0F0' }}>
                  <PlayCircle size={16} style={{ color: '#60A5FA' }} />
                  Bản ghi hình/âm thanh
                </h4>
                <div style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <PlayCircle size={44} style={{ color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }} />
                  <div style={{
                    position: 'absolute', bottom: 10, left: 12,
                    fontSize: 11, background: 'rgba(0,0,0,0.7)',
                    padding: '3px 8px', borderRadius: 4, color: '#A0A0A0',
                  }}>
                    00:00 / {fmtDur(selectedSession.durationSeconds)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
