import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Video, CheckCircle, Send, BarChart2, Bot, ChevronRight, Search, Clock, Building2, ArrowRight, ChevronDown, Hourglass } from 'lucide-react';
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

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [response, featuredRes] = await Promise.all([
        api.get('/users/dashboard'),
        api.get('/interview-sets?featured=true&limit=4')
      ]);
      setDashboard(response.data);
      updateUser(response.data.user);
      setFeaturedSets(featuredRes.data.sets || []);
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
                <span className="stat-card-title">Đơn ứng tuyển<br/>đã gửi</span>
                <div className="stat-card-icon-wrap" style={{ color: '#3b82f6' }}>
                  <Send size={18} />
                </div>
              </div>
              <strong className="stat-card-value">0</strong>
              <div className="stat-card-blob" style={{ background: '#3b82f6' }}></div>
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

          {/* GỢI Ý VIỆC LÀM */}
          <div className="dashboard-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} /> Việc làm gợi ý
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Xem tất cả</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '1rem', background: '#121316', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.2rem' }}>E</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Luật sư cộng sự</h4>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Công Ty Luật TNHH Everest • Hà Nội</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: '4px' }}>Thỏa thuận</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '4px' }}>Từ xa</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-secondary)" />
              </div>

              <div style={{ padding: '1rem', background: '#121316', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.2rem' }}>E</span>
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Trợ lý Luật sư</h4>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Công Ty Luật TNHH Everest • Hà Nội</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: '4px' }}>Thỏa thuận</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '4px' }}>Từ xa</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-secondary)" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
