import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Video, CheckCircle, Send, BarChart2, Bot, ChevronRight, Search, Clock, Building2, ArrowRight, ChevronDown, Hourglass, Lightbulb, Star, Trophy, FileText, FileUp, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { DashboardData, InterviewSet } from '../types';
import './DashboardPage.css';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [featuredSets, setFeaturedSets] = useState<InterviewSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCv, setHasCv] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [response, featuredRes, cvsRes] = await Promise.all([
        api.get('/users/dashboard'),
        api.get('/interview-sets?featured=true&limit=4'),
        api.get('/cvs').catch(() => ({ data: { cvs: [] } }))
      ]);
      setDashboard(response.data);
      updateUser(response.data.user);
      setFeaturedSets(featuredRes.data.sets || []);
      setHasCv(cvsRes.data.cvs && cvsRes.data.cvs.length > 0);
    } catch (loadError: any) {
      setError(loadError.response?.data?.message ?? 'Không thể tải dữ liệu tổng quan lúc này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải dashboard...</div>;
  }

  if (!dashboard) {
    return <div style={{ color: 'var(--danger)' }}>{error || 'Không có dữ liệu tổng quan.'}</div>;
  }

  const averageRecentScore = dashboard.recentSessions.length
    ? Math.round(
        dashboard.recentSessions.reduce((total, session) => total + session.totalScore, 0) / dashboard.recentSessions.length
      )
    : 0;

  return (
    <div style={{ maxWidth: '1440px', padding: '0 2rem', margin: '0 auto', color: '#fff' }}>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* LÊN LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                Chào mừng trở lại, {user?.name || 'Bạn'}!
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Đây là tổng quan về hành trình chuẩn bị phỏng vấn của bạn
              </p>
            </div>
          </div>
        

          {/* STAT CARDS */}
          <div className="dashboard-stats-grid">
            
            <div className="stat-card-modern">
              <div className="stat-card-modern-header">
                <span className="stat-card-title">Tổng số<br/>phỏng vấn</span>
                <div className="stat-card-icon-wrap" style={{ color: '#6366f1' }}>
                  <Video size={18} />
                </div>
              </div>
              <strong className="stat-card-value">{dashboard.overview.totalSessions}</strong>
              <div className="stat-card-blob" style={{ background: '#8b5cf6' }}></div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-card-modern-header">
                <span className="stat-card-title">Phỏng vấn<br/>đã hoàn thành</span>
                <div className="stat-card-icon-wrap" style={{ color: '#10b981' }}>
                  <CheckCircle size={18} />
                </div>
              </div>
              <strong className="stat-card-value">{dashboard.overview.totalSessions}</strong>
              <div className="stat-card-blob" style={{ background: '#10b981' }}></div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-card-modern-header">
                <span className="stat-card-title">Tổng điểm<br/>kinh nghiệm</span>
                <div className="stat-card-icon-wrap" style={{ color: '#eab308' }}>
                  <Star size={18} />
                </div>
              </div>
              <strong className="stat-card-value">{user?.totalXp || 0} XP</strong>
              <div className="stat-card-blob" style={{ background: '#eab308' }}></div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-card-modern-header">
                <span className="stat-card-title">Điểm<br/>trung bình</span>
                <div className="stat-card-icon-wrap" style={{ color: '#f59e0b' }}>
                  <BarChart2 size={18} />
                </div>
              </div>
              <strong className="stat-card-value">{averageRecentScore}%</strong>
              <div className="stat-card-blob" style={{ background: '#f59e0b' }}></div>
            </div>

          </div>

          {/* ACTIVITY SECTION */}
          <div className="dashboard-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Tìm kiếm câu hỏi, việc làm hoặc tài nguyên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#121316', color: '#fff' }}
              />
              <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.5rem 1rem', background: '#121316', border: '1px solid var(--border)', borderRadius: '100px', color: '#fff', fontSize: '0.85rem' }}>
                Tất cả danh mục <ChevronDown size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
              </button>
              <button style={{ padding: '0.5rem 1rem', background: '#121316', border: '1px solid var(--border)', borderRadius: '100px', color: '#fff', fontSize: '0.85rem' }}>
                Độ khó: Bất kỳ <ChevronDown size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
              </button>
            </div>
          </div>

          {/* HOẠT ĐỘNG GẦN ĐÂY -> LỊCH SỬ PHỎNG VẤN */}
          <div className="dashboard-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Lịch sử phỏng vấn</h3>
              <Link to="/interview/history" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Xem tất cả</Link>
            </div>
            
            {dashboard.recentSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                <Hourglass size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Chưa có lịch sử phỏng vấn nào</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboard.recentSessions.slice(0, 3).map((session, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{session.topic || 'Phiên phỏng vấn'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(session.completedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div style={{ padding: '0.25rem 0.75rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {session.totalScore} Điểm
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* HERO BANNER */}
          <div className="mock-cta-card">
            <div className="mock-cta-content">
              <div className="mock-cta-icon-box">
                <Video size={24} color="#ffffff" strokeWidth={1.5} />
              </div>
              <h3 className="mock-cta-title">
                Giả lập phỏng vấn thực tế
              </h3>
              <p className="mock-cta-desc">
                Trải nghiệm buổi phỏng vấn hoàn chỉnh với AI. Thực hành trả lời câu hỏi, nhận phản hồi chi tiết và tự tin hơn khi đi phỏng vấn thật.
              </p>
              <button 
              className="mock-cta-button"
              onClick={() => navigate('/interview')}
              style={{ position: 'relative' }}
            >
              <span style={{ margin: '0 auto' }}>Bắt đầu ngay</span>
              <ArrowRight size={18} style={{ position: 'absolute', right: '1.5rem' }} />
            </button>
            </div>
            <div className="mock-cta-watermark">
              <Bot size={180} color="#ffffff" strokeWidth={1.5} />
            </div>
          </div>


          {/* BẢNG XẾP HẠNG KINH NGHIỆM */}
          <div className="dashboard-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} color="#10b981" /> Xếp hạng kinh nghiệm
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dashboard.leaderboard && dashboard.leaderboard.length > 0 ? (
                [...dashboard.leaderboard].sort((a, b) => b.totalXp - a.totalXp).slice(0, 5).map((userL, idx) => {
                  let rankColor = '#6b7280';
                  let rankBg = 'rgba(255,255,255,0.05)';
                  if (idx === 0) { rankColor = '#f59e0b'; rankBg = 'rgba(245,158,11,0.1)'; }
                  else if (idx === 1) { rankColor = '#9ca3af'; rankBg = 'rgba(156,163,175,0.1)'; }
                  else if (idx === 2) { rankColor = '#b45309'; rankBg = 'rgba(180,83,9,0.1)'; }
                  
                  return (
                    <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '28px', height: '28px', background: rankBg, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: rankColor, fontWeight: 700, fontSize: '0.85rem' }}>{idx + 1}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {userL.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {userL.targetRole || 'Học viên'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                        {userL.totalXp} XP
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Chưa có dữ liệu xếp hạng
                </div>
              )}
            </div>
          </div>

          {/* HỒ SƠ CỦA BẠN (Ẩn nếu đã có CV) */}
          {!hasCv && (
            <div className="dashboard-panel" style={{ padding: 0, marginBottom: '1.5rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff', fontWeight: 600 }}>
                  <FileText size={18} color="#8b5cf6" /> Hồ sơ của bạn
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <FileUp size={24} color="var(--text-secondary)" />
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem', fontSize: '0.95rem' }}>
                  Chưa có hồ sơ nào được tải lên
                </p>
                <button 
                  onClick={() => navigate('/cv')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#8b5cf6', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <Upload size={18} /> Tải lên hồ sơ
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
