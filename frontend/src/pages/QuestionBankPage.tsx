import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ChevronDown, Search, Bot, ChevronRight, PlayCircle, BookOpen, Video, ArrowRight, ChevronLeft, Headphones, X, Plus, Clock, Calendar } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import './DashboardPage.css'; // For shared mock-cta-card and dashboard-panel styles

interface Question {
  id: string;
  industryGroup: string;
  industry: string;
  specialization: string;
  question: string;
  guidance: string;
  sampleAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export function QuestionBankPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Suggested Sets
  const [featuredSets, setFeaturedSets] = useState<any[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // Filters
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [searchText, setSearchText] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'difficulty' | 'industry' | null>(null);


  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionLang, setNewQuestionLang] = useState('vi');
  const [isCreating, setIsCreating] = useState(false);

  // History State
  const [practiceHistory, setPracticeHistory] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialSearch = params.get('search');
    if (initialSearch) {
      setSearchText(initialSearch);
    }
    void loadData();
  }, [location.search]);

  const handleDifficultyChange = (val: string) => {
    setFilterDifficulty(val);
    setOpenDropdown(null);
    void applyFilters(val, filterIndustry);
  };

  const handleIndustryChange = (val: string) => {
    setFilterIndustry(val);
    setOpenDropdown(null);
    void applyFilters(filterDifficulty, val);
  };

  const clearAllFilters = () => {
    setFilterDifficulty('');
    setFilterIndustry('');
    setSearchText('');
    void applyFilters('', '');
  };

  const applyFilters = async (diff: string, ind: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (diff) params.set('difficulty', diff);
      if (ind) params.set('industry', ind);
      const res = await api.get(`/questions?${params.toString()}`);
      setQuestions(res.data.questions ?? []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions');
      setQuestions(res.data.questions ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
    
    // Fetch suggested sets based on user profile
    try {
      const searchTerm = user?.targetRole || user?.specialization || user?.industry || '';
      let setRes = await api.get('/interview-sets', { params: { search: searchTerm, limit: 3 } });
      if (!setRes.data.sets || setRes.data.sets.length === 0) {
        // Fallback to recent/popular sets if no match
        setRes = await api.get('/interview-sets', { params: { limit: 3 } });
      }
      setFeaturedSets(setRes.data.sets || []);
    } catch {
      // silently fail
    }

    try {
      const [histRes, interviewRes] = await Promise.all([
        api.get('/practice/sessions').catch(() => ({ data: { sessions: [] } })),
        api.get('/interviews/history').catch(() => ({ data: { sessions: [] } }))
      ]);

      const pSessions = (histRes.data.sessions || []).map((s: any) => ({
        ...s,
        _type: 'practice',
        displayDate: new Date(s.createdAt)
      }));

      const iSessions = (interviewRes.data.sessions || []).map((s: any) => ({
        ...s,
        _type: 'interview',
        displayDate: new Date(s.completedAt || s.createdAt)
      }));

      const merged = [...pSessions, ...iSessions]
        .sort((a, b) => b.displayDate.getTime() - a.displayDate.getTime())
        .slice(0, 50);

      setPracticeHistory(merged);
    } catch {
      // silently fail
    }
  };

  const nextSet = () => {
    setCurrentSetIndex((prev) => (prev + 1) % Math.max(1, featuredSets.length));
  };
  const prevSet = () => {
    setCurrentSetIndex((prev) => (prev - 1 + featuredSets.length) % Math.max(1, featuredSets.length));
  };

  useEffect(() => {
    if (featuredSets.length <= 1) return;
    const timer = setInterval(nextSet, 5000);
    return () => clearInterval(timer);
  }, [featuredSets.length]);

  const currentSet = featuredSets[currentSetIndex];

  const handlePracticeClick = (question: Question) => {
    navigate(`/questions/${question.id}/practice`, { state: { question, language: 'vi' } });
  };
  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const res = await api.post('/questions', {
        question: newQuestionText
      });
      setIsCreateModalOpen(false);
      setNewQuestionText('');
      navigate(`/questions/${res.data.id}/practice`, { state: { question: res.data, language: newQuestionLang } });
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tạo câu hỏi.');
    } finally {
      setIsCreating(false);
    }
  };

  const industriesList = ['Tuyển dụng', 'IT - Phần mềm', 'Kế toán', 'Marketing', 'Ngân hàng', 'Nhân sự', 'Tài chính', 'Kinh doanh'];
  
  const filteredList = questions.filter((q) =>
    searchText
      ? q.question.toLowerCase().includes(searchText.toLowerCase()) ||
        q.industry.toLowerCase().includes(searchText.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(searchText.toLowerCase()))
      : true
  );

  return (
    <div style={{ maxWidth: '1440px', padding: '0 2rem', margin: '0 auto', color: '#fff' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#fff' }}>
          Ngân hàng câu hỏi
        </h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
          Luyện tập từng câu hỏi phỏng vấn từ Ngân hàng câu hỏi cùng AI để từng bước chinh phục buổi phỏng vấn thực tế.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SEARCH & FILTERS */}
          <div className="dashboard-panel" style={{ padding: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Tìm kiếm câu hỏi..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: '#fff' }}
              />
              <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'industry' ? null : 'industry')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '100px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <BriefcaseIcon /> {filterIndustry || 'Tuyển dụng'} <ChevronDown size={14} />
                </button>
                {openDropdown === 'industry' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', zIndex: 10, width: '200px' }}>
                    {industriesList.map(ind => (
                      <div 
                        key={ind} 
                        onClick={() => handleIndustryChange(ind)}
                        style={{ padding: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px', background: filterIndustry === ind ? 'rgba(139, 92, 246, 0.1)' : 'transparent', color: filterIndustry === ind ? 'var(--primary)' : '#fff' }}
                      >
                        {ind}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'difficulty' ? null : 'difficulty')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '100px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <ChartIcon /> {filterDifficulty === 'medium' ? 'Trung bình' : filterDifficulty === 'easy' ? 'Dễ' : filterDifficulty === 'hard' ? 'Khó' : 'Cấp độ kinh nghiệm'} <ChevronDown size={14} />
                </button>
                {openDropdown === 'difficulty' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', zIndex: 10, width: '200px' }}>
                    {['easy', 'medium', 'hard'].map(d => (
                      <div 
                        key={d} 
                        onClick={() => handleDifficultyChange(d)}
                        style={{ padding: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px', background: filterDifficulty === d ? 'rgba(139, 92, 246, 0.1)' : 'transparent', color: filterDifficulty === d ? 'var(--primary)' : '#fff' }}
                      >
                        {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Trung bình' : 'Khó'}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  padding: '0.5rem 1rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '100px', 
                  color: '#fff', 
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '14px', height: '14px', border: '1px solid var(--text-secondary)', borderRadius: '3px' }}></div>
                Hiển thị câu hỏi chung
              </button>

              {(filterDifficulty || filterIndustry || searchText) && (
                <button 
                  onClick={clearAllFilters}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' }}
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* LIST */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hiển thị <strong>{filteredList.length}</strong> Kết quả</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '100px', color: '#fff', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '12px', height: '1.5px', background: 'currentColor' }}></div>
                    <div style={{ width: '8px', height: '1.5px', background: 'currentColor' }}></div>
                    <div style={{ width: '4px', height: '1.5px', background: 'currentColor' }}></div>
                  </span> 
                  Phổ biến nhất <ChevronDown size={14} />
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{ background: '#5c56f5', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <Plus size={16} /> Thêm câu hỏi
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Đang tải...</div>
              ) : filteredList.map(q => (
                <div key={q.id} className="dashboard-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '100px' }}>
                        {q.difficulty === 'hard' ? 'KHÓ' : q.difficulty === 'medium' ? 'TRUNG BÌNH' : 'DỄ'}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {q.industry}
                      </span>
                      {q.tags[0] && (
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                          {q.tags[0]}
                        </span>
                      )}
                    </div>
                    
                    <h4 style={{ 
                      margin: '0 0 0.75rem', 
                      fontSize: '1.05rem', 
                      fontWeight: 600, 
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {q.question}
                    </h4>
                    
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BookOpen size={14} /> BP</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><PlayCircle size={14} /> 2 lần luyện tập</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handlePracticeClick(q)}
                    style={{ padding: '0.6rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '100px', color: '#fff', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
                  >
                    Luyện tập
                  </button>
                </div>
              ))}
            </div>
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

          {/* LUYỆN TẬP PHỎNG VẤN */}
          <div className="dashboard-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="#5c56f5" /> Luyện tập phỏng vấn
              </h3>
              <Link to="/interview-sets" style={{ fontSize: '0.85rem', color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              {/* Left Arrow */}
              {featuredSets.length > 1 && (
                <button 
                  onClick={prevSet}
                  style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', zIndex: 2 }}
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              <div 
                key={currentSetIndex}
                style={{ 
                  padding: '1.25rem 1rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px', 
                  margin: '0 0.5rem',
                  animation: 'carouselFade 0.3s ease-in-out forwards'
                }}
              >
                <style>
                  {`
                    @keyframes carouselFade {
                      from { opacity: 0.3; }
                      to { opacity: 1; }
                    }
                    html[data-theme='dark'] button.pill-btn-override,
                    .app-shell button.pill-btn-override,
                    button.pill-btn-override {
                      border-radius: 100px !important;
                    }
                  `}
                </style>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: '#121316', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6', textAlign: 'center', fontWeight: 'bold' }}>
                      {currentSet?.company?.charAt(0) || 'E'}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ 
                      margin: '0 0 0.25rem', fontSize: '1rem', color: '#fff', lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {currentSet?.title || user?.targetRole || 'Quản lý Kiểm soát Chất lượng'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentSet?.company || 'Công ty hàng đầu trong lĩnh vực của bạn'}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem 0', marginBottom: '1rem', gap: '0.5rem' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>{currentSet?.questionCount || 10}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CÂU HỎI</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>{currentSet?.durationMinutes || 30}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PHÚT</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>
                      {currentSet?.difficulty === 'hard' ? 'Khó' : currentSet?.difficulty === 'easy' ? 'Dễ' : 'Vừa'}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ĐỘ KHÓ</span>
                  </div>
                </div>

                <button 
                  className="pill-btn-override"
                  onClick={() => {
                    if (currentSet?._id) {
                      navigate(`/interview-sets/${currentSet._id}/prep`, { state: { set: currentSet } });
                    } else {
                      navigate('/interview');
                    }
                  }}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.7rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  Bắt đầu luyện tập <ArrowRight size={16} />
                </button>
              </div>

              {/* Right Arrow */}
              {featuredSets.length > 1 && (
                <button 
                  onClick={nextSet}
                  style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', zIndex: 2 }}
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Dots */}
            {featuredSets.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                {featuredSets.map((_, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      width: currentSetIndex === idx ? '16px' : '6px', 
                      height: '6px', 
                      background: currentSetIndex === idx ? '#5c56f5' : 'var(--text-secondary)', 
                      borderRadius: currentSetIndex === idx ? '10px' : '50%', 
                      opacity: currentSetIndex === idx ? 1 : 0.5,
                      transition: 'all 0.3s ease'
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* LỊCH SỬ LUYỆN TẬP */}
          <div className="dashboard-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Headphones size={18} color="#5c56f5" /> Lịch sử luyện tập
              </h3>
            </div>

            {practiceHistory.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                <Headphones size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>Chưa có buổi luyện tập nào</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '250px' }}>
                  Bắt đầu buổi luyện tập đầu tiên để xem tiến trình của bạn tại đây
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {practiceHistory.map((session, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => session._type === 'interview' ? navigate(`/interview/${session.id}/result`) : navigate(`/questions/${session.questionId}/result?sessionId=${session._id}`)}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {session._type === 'interview' ? `Lộ trình phỏng vấn: ${session.specialization || session.industry || 'Chung'}` : (session.topic || 'Câu hỏi tùy chỉnh')}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {session.displayDate.toLocaleDateString('vi-VN')}</span>
                        {session._type === 'practice' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {Math.round(session.durationSeconds || 0)} giây</span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BookOpen size={12} /> {session.totalQuestions || 0} câu hỏi</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {session._type === 'practice' ? (
                        <div style={{ background: session.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: session.passed ? '#10b981' : '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {session.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {session.overallScore} ĐIỂM
                        </div>
                      )}
                      <ArrowRight size={16} color="var(--text-secondary)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>


      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: '1rem' }}>
          <div style={{ background: '#121316', width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)', position: 'relative' }}>
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(92, 86, 245, 0.1)', color: '#5c56f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Plus size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', margin: '0 0 0.5rem' }}>Tạo câu hỏi mới</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Tạo câu hỏi riêng để luyện tập kỹ năng phỏng vấn.</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Câu hỏi</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  value={newQuestionText}
                  onChange={(e) => {
                    if (e.target.value.length <= 2000) setNewQuestionText(e.target.value);
                  }}
                  placeholder="Nhập câu hỏi bạn muốn luyện tập..."
                  style={{ width: '100%', minHeight: '120px', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', resize: 'vertical' }}
                />
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {newQuestionText.length}/2000
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Ngôn ngữ</label>
              <div style={{ position: 'relative' }}>
                <select 
                  value={newQuestionLang}
                  onChange={(e) => setNewQuestionLang(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', appearance: 'none' }}
                >
                  <option value="vi" style={{ background: '#121316' }}>VN Tiếng Việt</option>
                  <option value="en" style={{ background: '#121316' }}>US Tiếng Anh</option>
                </select>
                <ChevronDown size={16} color="var(--text-secondary)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                style={{ padding: '0.8rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '100px', color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateQuestion}
                disabled={!newQuestionText.trim() || isCreating}
                style={{ padding: '0.8rem', background: '#5c56f5', border: 'none', borderRadius: '100px', color: '#fff', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: (!newQuestionText.trim() || isCreating) ? 'not-allowed' : 'pointer', opacity: (!newQuestionText.trim() || isCreating) ? 0.6 : 1 }}
              >
                {isCreating ? 'Đang tạo...' : <><PlayCircle size={18} /> Tạo & Luyện tập</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple icons for the dropdown buttons
function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"></path>
      <path d="M18 17V9"></path>
      <path d="M13 17V5"></path>
      <path d="M8 17v-3"></path>
    </svg>
  );
}
