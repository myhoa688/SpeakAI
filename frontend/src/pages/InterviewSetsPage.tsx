import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness, Clock, Filter, Loader2,
  PlayCircle, Search, Star, Users, ArrowRight, Clock3, Heart, PlusCircle, BarChart2, TrendingUp, ChevronRight, ChevronDown
} from 'lucide-react';
import { api } from '../lib/api';
import type { InterviewSet } from '../types';
import { useAuth } from '../context/AuthContext';
import { IndustrySelectorModal } from '../components/IndustrySelectorModal';
import './InterviewSetsPage.css';

const DIFFICULTY_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' } as const;
const DIFFICULTY_CLASS = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' } as const;

const INDUSTRY_OPTIONS = [
  'Tất cả', 'Công nghệ thông tin', 'Tài chính - Ngân hàng', 'Thương mại điện tử'
];

export function InterviewSetsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sets, setSets] = useState<InterviewSet[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('Tất cả');
  const [difficulty, setDifficulty] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isFavoriteFilter, setIsFavoriteFilter] = useState(false);
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);

  const loadSets = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '20' };
      if (search.trim()) params.search = search.trim();
      if (industry !== 'Tất cả') params.industry = industry;
      if (difficulty) params.difficulty = difficulty;
      if (experienceLevel) params.experienceLevel = experienceLevel;
      if (isFavoriteFilter) params.isFavorite = 'true';

      const res = await api.get('/interview-sets', { params });
      setSets(res.data.sets);
    } catch {
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { void loadSets(); }, 300);
    return () => clearTimeout(timer);
  }, [search, industry, difficulty, experienceLevel, isFavoriteFilter]);

  const handleToggleFavorite = async (e: React.MouseEvent, setId: string) => {
    e.stopPropagation();
    if (!user) {
      alert('Vui lòng đăng nhập để lưu mục yêu thích');
      return;
    }
    try {
      await api.post(`/interview-sets/${setId}/favorite`);
      // Optimistically update if in favorite filter mode, or just let user see it
      if (isFavoriteFilter) {
        setSets(prev => prev.filter(s => s._id !== setId));
      } else {
        // Technically we should update the specific item's isFavorite state if we tracked it in the UI, 
        // but for now we can just show a toast or rely on backend.
        // Re-fetching is simple enough:
        void loadSets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStart = (set: InterviewSet) => {
    navigate(`/interview-sets/${set._id}/prep`, { state: { set } });
  };

  return (
    <div className="page-stack">
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Luyện tập phỏng vấn 
          <span className="tag-chip" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>5 bộ</span>
        </h2>
        <p className="muted-text">Luyện tập phỏng vấn với các vị trí công việc thực tế cùng AI.</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 0.8fr)', alignItems: 'start' }}>
        
        {/* Main Content Left */}
        <div className="detail-stack" style={{ gap: '1.5rem' }}>
          
          {/* Hero Banner */}
          <div className="hero-mock-banner" onClick={() => navigate('/interview')} style={{ padding: '1.2rem 2.5rem', position: 'relative' }}>
            <div 
              className="hero-image" 
              style={{ position: 'absolute', left: '-3%', right: 'auto', bottom: 0, height: '89%', pointerEvents: 'auto', cursor: 'pointer' }}
              title="Nhấn để đổi nhân vật phỏng vấn"
              onClick={(e) => {
                e.stopPropagation();
                const img = e.currentTarget.querySelector('img');
                if (img) {
                  img.src = img.src.includes('boy') ? '/mock-hero-avatar-girl.png' : '/mock-hero-avatar-boy.png';
                }
              }}
            >
              <img src="/mock-hero-avatar-boy.png" alt="AI Avatar" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ height: '100%', objectFit: 'contain', transition: 'all 0.3s' }} />
            </div>
            <div className="hero-mock-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, marginLeft: '13%', position: 'relative', zIndex: 2 }}>
              <span className="hero-badge" style={{ background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                <span style={{ color: '#fbbf24' }}>✨</span> AI-POWERED
              </span>
              <h2 className="hero-title" style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', color: '#fff', fontWeight: 700 }}>Giả lập phỏng vấn thực tế</h2>
              <p className="hero-desc" style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0', opacity: 1, lineHeight: 1.5, color: '#fff', width: '113%', whiteSpace: 'nowrap' }}>
                Hệ thống tự động xây dựng câu hỏi phỏng vấn dựa trên CV và yêu cầu tuyển dụng. Bạn có thể thực hành trả lời,<br />nhận phản hồi chi tiết và tự tin hơn khi bước vào buổi phỏng vấn thật.
              </p>
              <button 
                className="hero-btn" 
                style={{ 
                  background: '#8ba2fb', 
                  border: 'none', 
                  color: '#fff', 
                  padding: '0.6rem 1.5rem', 
                  borderRadius: '100px', 
                  fontWeight: 500, 
                  display: 'flex', 

                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(139, 162, 251, 0.3)'
                }}
              >
                <PlusCircle size={16} /> Giả lập phỏng vấn thực tế <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <section className="xi-filters-container">
            <div className="xi-search-bar">
              <Search className="xi-search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên việc làm, tên công ty,..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="xi-search-input"
              />
            </div>
            
            <div className="xi-filter-row">
              <button 
                className={`xi-filter-btn ${isFavoriteFilter ? 'active' : ''}`}
                onClick={() => setIsFavoriteFilter(!isFavoriteFilter)}
              >
                <Heart size={16} fill={isFavoriteFilter ? "currentColor" : "none"} /> 
                Yêu thích
              </button>

              <div className="xi-filter-select-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                <select 
                  className="xi-filter-select"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="">Tất cả độ khó</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
                <ChevronDown size={14} className="xi-select-arrow" />
              </div>

              <button 
                className="xi-filter-btn xi-filter-industry-btn"
                onClick={() => setIsIndustryModalOpen(true)}
              >
                <BriefcaseBusiness size={16} />
                <span className="xi-industry-text">
                  {industry === 'Tất cả' || !industry ? 'Tất cả vị trí' : industry}
                </span>
                <ChevronDown size={14} />
              </button>

              <div className="xi-filter-select-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                <select 
                  className="xi-filter-select"
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value)}
                >
                  <option value="">Mới tốt nghiệp</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                </select>
                <ChevronDown size={14} className="xi-select-arrow" />
              </div>
            </div>
          </section>

          <p className="muted-text" style={{ margin: 0, fontSize: '0.9rem' }}>Hiển thị <b>1-{sets.length}</b> / 630 các vị trí phỏng vấn thực tế</p>

          {/* Cards Grid */}
          {loading ? (
            <div className="panel-card" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={32} className="spinner" color="var(--primary)" />
            </div>
          ) : sets.length === 0 ? (
            <div className="panel-card" style={{ textAlign: 'center', padding: '4rem' }}>
              <BriefcaseBusiness size={40} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
              <p className="muted-text">Không tìm thấy bộ phỏng vấn phù hợp.</p>
            </div>
          ) : (
            <div className="xi-sets-grid">
              {sets.map(set => {
                const isFavorited = user?.favoriteInterviewSets?.some(id => id.toString() === set._id);
                const difficultyClass = `xi-difficulty-${set.difficulty}`;
                const difficultyLabel = DIFFICULTY_LABEL[set.difficulty as keyof typeof DIFFICULTY_LABEL];
                
                return (
                  <div key={set._id} className="xi-set-card" onClick={() => handleStart(set)}>
                    <div className="xi-set-header">
                      <div className="xi-set-title-group">
                        <div className="xi-set-logo" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                          {set.title.charAt(0)}
                        </div>
                        <div>
                          <h3 className="xi-set-title">{set.title}</h3>
                          <p className="xi-set-company">{set.company}</p>
                        </div>
                      </div>
                      <button 
                        className={`xi-set-favorite ${isFavorited ? 'active' : ''}`}
                        onClick={(e) => handleToggleFavorite(e, set._id)}
                      >
                        <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
                      </button>
                    </div>
                    
                    <div className="xi-set-stats">
                      <div className="xi-stat-item">
                        <span className="xi-stat-value">{set.questionCount || 5}</span>
                        <span className="xi-stat-label">Câu hỏi</span>
                      </div>
                      <div className="xi-stat-item">
                        <span className="xi-stat-value">{set.durationMinutes || 20}</span>
                        <span className="xi-stat-label">Phút</span>
                      </div>
                      <div className="xi-stat-item">
                        <span className={`xi-stat-value ${difficultyClass}`}>{difficultyLabel}</span>
                        <span className="xi-stat-label">Độ khó</span>
                      </div>
                    </div>

                    <div className="xi-set-jd">
                      <div className="xi-set-jd-title">
                        <BriefcaseBusiness size={14} /> MÔ TẢ CÔNG VIỆC
                      </div>
                      <p className="xi-set-jd-content">
                        {set.jobDescription || "Đang cập nhật mô tả công việc..."}
                      </p>
                    </div>
                    
                    <button className="xi-start-btn">
                      Bắt đầu luyện tập &rarr;
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <IndustrySelectorModal 
          isOpen={isIndustryModalOpen}
          onClose={() => setIsIndustryModalOpen(false)}
          selectedIndustry={industry}
          onApply={(newIndustry) => setIndustry(newIndustry)}
        />

        {/* Right Sidebar */}
        <div className="detail-stack">
          {/* Lịch sử gần đây */}
          <div className="panel-card" style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '0.9rem' }}>
                <Clock3 size={18} /> Lịch sử gần đây
              </h3>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Xem tất cả &rarr;</a>
            </div>
            
            <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Tuyển dụng & phát triển nguồn ứng viên</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock3 size={14} /> 1 tuần trước</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BriefcaseBusiness size={14} /> TMEDU</span>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>&rarr;</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ĐIỂM</div>
                  <strong style={{ fontSize: '1.1rem' }}>-</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Đang thực hiện
                </div>
              </div>
            </div>
          </div>

          {/* Việc làm gợi ý */}
          <div className="panel-card" style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', margin: 0 }}>
                <BriefcaseBusiness size={18} /> Việc làm gợi ý
              </h3>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Xem tất cả</a>
            </div>
            
            <div className="detail-stack" style={{ gap: '0.5rem' }}>
              {[
                { title: 'Luật sư cộng sự', company: 'Công ty Luật TNHH Everest', location: 'Hà Nội, Hưng Yên' },
                { title: 'Trợ lý Luật sư', company: 'Công ty Luật TNHH Everest', location: 'Hà Nội, Hưng Yên' }
              ].map((job, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: idx === 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.6rem', letterSpacing: '-0.5px' }}>Everest</span>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>{job.title}</h4>
                      <p className="muted-text" style={{ margin: '0 0 0.5rem', fontSize: '0.8rem' }}>{job.company} • {job.location}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="tag-chip" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>Thỏa thuận</span>
                        <span className="tag-chip" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>Làm việc từ xa</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-tertiary)" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
