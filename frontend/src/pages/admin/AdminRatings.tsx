import { Search, Star, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Rating = {
  _id: string;
  user: { name?: string; email?: string; avatarUrl?: string } | null;
  sessionType: 'practice' | 'interview';
  sessionId: string;
  score: number;
  comment: string;
  createdAt: string;
};

const fmt = (d: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));

export function AdminRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await api.get('/ratings/admin', { params: { page: p, limit: 30 } });
      setRatings(res.data.ratings);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setErr('Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(1); }, []);

  const filtered = ratings.filter(r => {
    const t = search.toLowerCase();
    return !t
      || (r.user?.name ?? '').toLowerCase().includes(t)
      || (r.user?.email ?? '').toLowerCase().includes(t)
      || r.comment.toLowerCase().includes(t);
  });

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

  const Badge = ({ children, bg, color, border }: { children: React.ReactNode; bg: string; color: string; border: string }) => (
    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', background: bg, color, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );

  return (
    <div style={{ ...S.font, color: '#F0F0F0' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#F0F0F0' }}>Đánh giá & Nhận xét</h2>
        <p style={{ ...S.textM, fontSize: 13 }}>{total} đánh giá tổng cộng</p>
      </div>

      {err && <p style={{ color: '#F87171', marginBottom: 12, fontSize: 13 }}>{err}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#525252' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email hoặc nhận xét..."
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#1a1a1a', border: S.borderS, borderRadius: 8, color: '#F0F0F0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.45)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ ...S.textS, fontSize: 13 }}>Đang tải...</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: S.borderS }}>
                  {['Người dùng', 'Loại phiên', 'Đánh giá', 'Nhận xét', 'Ngày'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#525252', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }} onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', color: '#F0F0F0', fontSize: 13 }}>{r.user?.name ?? 'Ẩn danh'}</div>
                      <div style={{ color: '#525252', fontSize: 11, marginTop: 1 }}>{r.user?.email ?? ''}</div>
                    </td>
                    <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                      <Badge bg="rgba(255,255,255,0.06)" color="#A0A0A0" border="rgba(255,255,255,0.08)">
                        {r.sessionType === 'practice' ? 'Luyện tập' : 'Phỏng vấn'}
                      </Badge>
                    </td>
                    <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < r.score ? '#FCD34D' : 'transparent'} color={i < r.score ? '#FCD34D' : '#525252'} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '11px 12px', maxWidth: 300 }}>
                      {r.comment ? (
                        <div style={{ color: '#A0A0A0', fontSize: 13, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          <MessageSquare size={12} style={{ display: 'inline', marginRight: 4, transform: 'translateY(2px)' }} />
                          {r.comment}
                        </div>
                      ) : (
                        <span style={{ color: '#525252', fontStyle: 'italic', fontSize: 12 }}>Không có nhận xét</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px', color: '#525252', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {fmt(r.createdAt)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#525252', fontSize: 13 }}>Không có đánh giá nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <button type="button" disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); load(p); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#A0A0A0', fontSize: 13, opacity: page === 1 ? 0.35 : 1, transition: 'all .15s' }}>←</button>
              <span style={{ padding: '6px 14px', color: '#525252', fontSize: 13 }}>Trang {page} / {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => { const p = page + 1; setPage(p); load(p); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#A0A0A0', fontSize: 13, opacity: page === totalPages ? 0.35 : 1, transition: 'all .15s' }}>→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
