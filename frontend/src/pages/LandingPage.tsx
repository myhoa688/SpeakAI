import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Mic2,
  Sparkles,
  Target,
  Trophy,
  Users,
  PlayCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { api } from '../lib/api';



const FAQS = [
  {
    q: 'SpeakAI khác gì so với tự tập trước gương?',
    a: 'SpeakAI đóng vai trò như một người phỏng vấn thực thụ: lắng nghe, phân tích tốc độ/âm lượng giọng nói, đặt câu hỏi xoáy sâu (follow-up) dựa trên chính câu trả lời của bạn, và chấm điểm chi tiết.'
  },
  {
    q: 'Câu hỏi phỏng vấn được lấy từ đâu?',
    a: 'Ngân hàng câu hỏi được tổng hợp từ JD thực tế của hơn 100+ công ty hàng đầu (VNG, Shopee, Techcombank...) và liên tục cập nhật bởi AI.'
  },
  {
    q: 'Hệ thống có hỗ trợ tiếng Việt không?',
    a: 'Có. SpeakAI được tối ưu đặc biệt cho tiếng Việt, nhận diện chính xác ngữ điệu, từ lóng công sở và các thuật ngữ chuyên ngành.'
  },
  {
    q: 'Tôi có thể dùng thử miễn phí không?',
    a: 'Bạn có thể tạo tài khoản và nhận ngay 5 lượt luyện tập miễn phí mỗi ngày. Nâng cấp lên gói Pro để không giới hạn lượt tập.'
  }
];

const FEATURES = [
  {
    title: 'Phòng phỏng vấn Realtime',
    desc: 'Trải nghiệm áp lực phỏng vấn thật với AI. Trả lời bằng giọng nói, AI sẽ phản hồi và hỏi xoáy sâu ngay lập tức.',
    icon: Mic2
  },
  {
    title: 'Phân tích & Chấm điểm',
    desc: 'Báo cáo chi tiết về tốc độ nói (WPM), khoảng dừng, từ thừa (filler words) và cấu trúc câu trả lời.',
    icon: Target
  },
  {
    title: 'Bộ câu hỏi theo JD thực tế',
    desc: 'Hàng ngàn bộ phỏng vấn được thiết kế chuẩn xác theo từng vị trí của các công ty công nghệ, tài chính hàng đầu.',
    icon: BriefcaseBusiness
  },
  {
    title: 'Lưu trữ & Dịch thuật tự động',
    desc: 'Lưu lại toàn bộ file ghi âm phiên phỏng vấn và cung cấp bản dịch transcript chính xác giúp bạn ôn tập dễ dàng.',
    icon: Sparkles
  }
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [stats, setStats] = useState({
    totalSets: 0,
    totalAttempts: 0,
    totalQuestions: 0,
    totalCompanies: 0,
    companies: [] as string[],
    totalUsers: 0,
    featuredSets: [] as any[],
    popularQuestions: [] as any[]
  });

  useEffect(() => {
    api.get('/interview-sets/stats').then(res => {
      if (res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="landing-x-wrapper">
      {/* HEADER */}
      <header className="x-header">
        <div className="x-container x-header-inner">
          <div className="x-logo">
            <img src="/logo.png" alt="SpeakAI Logo" style={{ width: 32, height: 32 }} />
            <strong>SpeakAI</strong>
          </div>
          <nav className="x-nav-desktop">
            <a href="#features">Tính năng</a>
            <a href="#interview-sets">Bộ phỏng vấn</a>
            <a href="#faq">Hỏi đáp</a>
          </nav>
          <div className="x-header-actions">
            <ThemeToggle />
            <Link to="/login" className="x-btn-ghost">Đăng nhập</Link>
            <Link to="/register" className="x-btn-primary">Bắt đầu miễn phí</Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="x-hero">
        <div className="x-container">
          <div className="x-hero-grid">
            <div className="x-hero-content">
              <div className="x-hero-badge">
                <Sparkles size={14} className="x-icon-spin" />
                <span>Nền tảng luyện phỏng vấn AI #1 Việt Nam</span>
              </div>
              <h1 className="x-hero-title">
                Vượt qua mọi vòng phỏng vấn với <span>Sự Tự Tin</span>
              </h1>
              <p className="x-hero-desc">
                Luyện tập trả lời phỏng vấn bằng giọng nói với AI. Nhận phản hồi chi tiết về phát âm, nội dung và phản xạ ngay lập tức. Sẵn sàng chinh phục mọi nhà tuyển dụng.
              </p>
              <div className="x-hero-cta-group">
                <Link to="/register" className="x-btn-primary x-btn-lg">
                  Luyện tập ngay miễn phí
                  <ArrowRight size={18} />
                </Link>
                <p className="x-hero-micro">Không cần thẻ tín dụng • Miễn phí 5 lượt/ngày</p>
              </div>

              {/* Stats Ribbon */}
              <div className="x-stats-ribbon">
                <div className="x-stat-item">
                  <strong>{stats.totalQuestions.toLocaleString()}+</strong>
                  <span>Câu hỏi phỏng vấn</span>
                </div>
                <div className="x-stat-divider" />
                <div className="x-stat-item">
                  <strong>{stats.totalAttempts.toLocaleString()}+</strong>
                  <span>Lượt luyện tập</span>
                </div>
                <div className="x-stat-divider" />
                <div className="x-stat-item">
                  <strong>{stats.totalUsers.toLocaleString()}+</strong>
                  <span>Học viên tin dùng</span>
                </div>
              </div>
            </div>

            <div className="x-hero-visual">
              <div className="x-hero-card-stack">
                <div className="x-floating-card top-card">
                  <div className="x-fc-icon"><BriefcaseBusiness size={20} /></div>
                  <div className="x-fc-body">
                    <strong>VNG - Frontend Developer</strong>
                    <span>Đang mô phỏng phỏng vấn...</span>
                  </div>
                </div>
                
                <div className="x-floating-card mid-card">
                  <div className="x-fc-icon green"><CheckCircle2 size={20} /></div>
                  <div className="x-fc-body">
                    <strong>Phân tích giọng nói</strong>
                    <span>Tốc độ: 125 WPM (Tuyệt vời)</span>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </section>

      {stats.companies && stats.companies.length > 0 && (
        <section className="x-marquee-section">
          <p className="x-marquee-title">Câu hỏi được tổng hợp từ các đợt tuyển dụng của</p>
          <div className="x-marquee-container">
            <div className="x-marquee-content">
              {[...stats.companies, ...stats.companies, ...stats.companies, ...stats.companies].slice(0, 20).map((company, i) => (
                <span key={i} className="x-marquee-item">{company}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION */}
      <section id="features" className="x-features-section">
        <div className="x-container">
          <div className="x-section-header centered">
            <h2 className="x-section-title">Nâng cấp kỹ năng toàn diện</h2>
            <p className="x-section-desc">SpeakAI mang đến trải nghiệm phỏng vấn sát với thực tế nhất.</p>
          </div>

          <div className="x-features-grid">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="x-feature-card">
                  <div className="x-feature-icon-wrapper">
                    <Icon size={24} />
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POPULAR QUESTIONS SECTION */}
      {stats.popularQuestions && stats.popularQuestions.length > 0 && (
        <section id="popular-questions" className="x-features-section">
          <div className="x-container">
            <div className="x-section-header">
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--teal-strong)', textTransform: 'uppercase', letterSpacing: '1px' }}>Luyện tập ngay</span>
              <h2 className="x-section-title" style={{ textAlign: 'left', marginTop: '0.5rem' }}>Câu hỏi phổ biến</h2>
            </div>
            
            <div className="x-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
              {stats.popularQuestions.map((q, i) => (
                <div key={i} className="x-feature-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <HelpCircle size={16} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{q.question}</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.industryGroup || 'General'}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: q.difficulty === 'hard' ? '#ef4444' : q.difficulty === 'medium' ? '#f59e0b' : '#10b981', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          {q.difficulty.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/practice`} className="x-btn-ghost" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Mic2 size={14} /> Thử ngay
                  </Link>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/practice" className="x-btn-ghost" style={{ borderRadius: '24px' }}>Xem tất cả Câu hỏi <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* INTERVIEW SETS SECTION */}
      {stats.featuredSets && stats.featuredSets.length > 0 && (
        <section id="interview-sets" className="x-features-section" style={{ background: 'transparent' }}>
          <div className="x-container">
            <div className="x-section-header centered">
              <h2 className="x-section-title">Bộ phỏng vấn nổi bật</h2>
              <p className="x-section-desc">Luyện tập theo bộ câu hỏi thực tế từ các kỳ thi tuyển dụng.</p>
            </div>
            
            <div className="x-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {stats.featuredSets.map((set, i) => (
                <div key={i} className="x-feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BriefcaseBusiness size={20} className="text-primary" />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.1rem', display: 'block', color: 'var(--text-primary)' }}>{set.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{set.company}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: '1.1rem' }}>{set.questionCount}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Câu hỏi</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: '1.1rem' }}>{set.durationMinutes}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phút</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: set.difficulty === 'hard' ? '#ef4444' : set.difficulty === 'medium' ? '#f59e0b' : '#10b981', textTransform: 'capitalize' }}>
                        {set.difficulty === 'hard' ? 'Khó' : set.difficulty === 'medium' ? 'T.Bình' : 'Dễ'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Độ khó</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <CheckCircle2 size={14} className="text-success" /> Mô tả công việc
                    </span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {set.jobDescription}
                    </p>
                  </div>

                  <Link to={`/interview-sets/${set._id}`} className="x-btn-ghost" style={{ justifyContent: 'center', width: '100%', borderRadius: '24px' }}>
                    Bắt đầu luyện tập <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/interview-sets" className="x-btn-ghost" style={{ borderRadius: '24px' }}>Xem tất cả bộ phỏng vấn</Link>
            </div>
          </div>
        </section>
      )}

      {/* DASHBOARD PREVIEW */}
      <section className="x-preview-section">
        <div className="x-container">
          <div className="x-preview-box">
            <div className="x-preview-content">
              <h2>Mọi thứ bạn cần trong một Dashboard</h2>
              <p>Quản lý lịch sử, theo dõi sự tiến bộ qua từng ngày và xem chi tiết đánh giá cho mỗi câu trả lời.</p>
              <ul className="x-check-list">
                <li><CheckCircle2 size={18} className="text-success" /> Lưu trữ âm thanh mọi phiên luyện</li>
                <li><CheckCircle2 size={18} className="text-success" /> Bản dịch transcript chính xác</li>
                <li><CheckCircle2 size={18} className="text-success" /> Gợi ý câu trả lời tốt hơn (Mẫu STAR)</li>
              </ul>
              <Link to="/register" className="x-btn-primary" style={{ marginTop: '1.5rem' }}>
                Khám phá ngay <ArrowRight size={18} />
              </Link>
            </div>
            <div className="x-preview-image">
              <div className="x-mock-dashboard">
                <div className="x-mock-header"><LayoutDashboard size={16}/> SpeakAI Dashboard</div>
                <div className="x-mock-body">
                  <div className="x-mock-chart"></div>
                  <div className="x-mock-list">
                    <div className="x-mock-item"></div>
                    <div className="x-mock-item"></div>
                    <div className="x-mock-item"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="x-faq-section">
        <div className="x-container x-faq-container">
          <div className="x-section-header centered">
            <h2 className="x-section-title">Câu hỏi thường gặp</h2>
          </div>
          
          <div className="x-faq-list">
            {FAQS.map((faq, i) => (
              <div 
                key={i} 
                className={`x-faq-item ${openFaq === i ? 'active' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="x-faq-question">
                  <strong>{faq.q}</strong>
                  <ChevronDown size={20} className="x-faq-icon" />
                </div>
                <div className="x-faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="x-footer-cta" style={{ padding: '6rem 0' }}>
        <div className="x-container">
          <div style={{ 
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(29, 78, 216, 0.1) 100%)', 
            borderRadius: '24px', 
            padding: '4rem',
            display: 'flex',
            gap: '4rem',
            alignItems: 'center',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ flex: 1, zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <Sparkles size={14} className="text-primary" /> Miễn phí 100% để bắt đầu
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>Bắt đầu luyện tập ngay hôm nay và nhận việc mơ ước</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
                Thử công cụ phỏng vấn thử miễn phí ngay hôm nay. Bắt đầu luyện tập và cải thiện kỹ năng ngay lập tức.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="x-btn-primary x-btn-lg" style={{ borderRadius: '24px' }}>
                  Đăng ký — Miễn phí <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="x-btn-ghost x-btn-lg" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.05)' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: 18, height: 18, marginRight: '0.5rem' }} /> Tiếp tục với Google
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} className="text-success" /> Miễn phí</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} className="text-success" /> AI đánh giá sau phỏng vấn</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} className="text-success" /> 20,000+ câu hỏi</span>
              </div>
            </div>
            
            <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }} className="x-hide-mobile">
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -20, left: -40, background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span> Thử phỏng vấn ngay
                </div>
                <img src="/dashboard-preview.png" alt="Preview" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div style={{ position: 'absolute', bottom: -20, right: -20, background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', width: '250px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Sparkles size={14} className="text-primary" /> Nhận phản hồi từ AI ngay sau mỗi buổi luyện tập
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Quy trình rõ ràng, giao diện trực quan và trải nghiệm chỉn chu giúp bạn tập trung cải thiện qua từng buổi phỏng vấn.</p>
                </div>
              </div>
            </div>
            
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: '50%', left: '20%', width: '300px', height: '300px', background: 'var(--primary-color)', opacity: 0.1, filter: 'blur(100px)', transform: 'translate(-50%, -50%)', borderRadius: '50%' }}></div>
          </div>
        </div>
      </section>
    </div>
  );
}
