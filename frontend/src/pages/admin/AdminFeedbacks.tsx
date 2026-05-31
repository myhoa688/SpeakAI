import { useEffect, useState } from 'react';
import { Star, MessageSquare, TrendingUp, User as UserIcon, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';

interface Feedback {
  _id: string;
  userRating: number;
  ratingComment: string;
  industry: string;
  specialization: string;
  completedAt: string;
  userId: { name: string; email: string } | null;
}

export function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/feedbacks?page=${page}`).then(res => {
      setFeedbacks(res.data.feedbacks);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  }, [page]);

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.userRating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
            <MessageSquare size={28} color="#6366f1" />
            Feedback người dùng
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Quản lý và theo dõi đánh giá từ người dùng sau các phiên phỏng vấn.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', color: '#818cf8' }}>
            <MessageSquare size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng Feedback</p>
            <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{total}</h3>
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', color: '#fbbf24' }}>
            <Star size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating Trung Bình</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{avgRating}</h3>
              <span style={{ color: '#64748b', fontWeight: 600 }}>/ 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#e2e8f0' }}>Danh sách đánh giá gần đây</h2>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', animation: 'pulse 2s infinite' }} />
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem' }}>Chưa có feedback nào được ghi nhận.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {feedbacks.map(fb => (
                <div key={fb._id} style={{ 
                  background: 'rgba(30, 41, 59, 0.4)', 
                  border: '1px solid rgba(255,255,255,0.03)', 
                  borderRadius: '16px', 
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                    {/* User Info */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '48px', height: '48px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                        flexShrink: 0
                      }}>
                        {getInitials(fb.userId?.name || 'Ẩn danh')}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '1.05rem', fontWeight: 600 }}>
                          {fb.userId?.name || 'Người dùng ẩn danh'}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <UserIcon size={14} /> {fb.userId?.email || 'Không có email'}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={14} /> {new Date(fb.completedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', 
                      background: 'rgba(245, 158, 11, 0.1)', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '100px',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} fill={s <= fb.userRating ? '#f59e0b' : 'transparent'} color={s <= fb.userRating ? '#f59e0b' : '#475569'} />
                        ))}
                      </div>
                      <span style={{ fontWeight: 700, color: '#fbbf24', marginLeft: '0.25rem' }}>{fb.userRating}.0</span>
                    </div>
                  </div>

                  {/* Context tags & Comment */}
                  <div style={{ paddingLeft: '4rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {fb.industry}
                      </span>
                      {fb.specialization && (
                        <span style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {fb.specialization}
                        </span>
                      )}
                    </div>
                    
                    {fb.ratingComment ? (
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                        <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                          "{fb.ratingComment}"
                        </p>
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        Người dùng không để lại nhận xét chi tiết.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Hiển thị trang <strong style={{ color: '#fff' }}>{page}</strong> / {Math.ceil(total / 20)}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.5rem 1rem', borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  background: page === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', 
                  color: page === 1 ? '#475569' : '#e2e8f0',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 500, transition: 'all 0.2s'
                }}
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button 
                disabled={page * 20 >= total} 
                onClick={() => setPage(p => p + 1)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.5rem 1rem', borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  background: page * 20 >= total ? 'rgba(255,255,255,0.02)' : '#6366f1', 
                  color: page * 20 >= total ? '#475569' : '#fff',
                  cursor: page * 20 >= total ? 'not-allowed' : 'pointer',
                  fontWeight: 500, transition: 'all 0.2s',
                  borderColor: page * 20 >= total ? 'rgba(255,255,255,0.1)' : '#4f46e5'
                }}
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}

