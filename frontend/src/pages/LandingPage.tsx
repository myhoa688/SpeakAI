import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Mic2,
  Sparkles,
  Target,
  Clock,
  BarChart2,
  BookOpen,
  FileText,
  Headphones,
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
    a: 'Ngân hàng câu hỏi được tổng hợp từ JD thực tế của các công ty hàng đầu và liên tục cập nhật bởi AI.'
  },
  {
    q: 'Hệ thống có hỗ trợ tiếng Việt không?',
    a: 'Có. SpeakAI được tối ưu đặc biệt cho tiếng Việt, nhận diện chính xác ngữ điệu, từ lóng công sở và các thuật ngữ chuyên ngành.'
  },
  {
    q: 'Tôi có thể dùng thử miễn phí không?',
    a: 'Bạn có thể tạo tài khoản và nhận ngay lượt luyện tập miễn phí. Nâng cấp lên gói Pro để trải nghiệm không giới hạn.'
  }
];

const FEATURES = [
  {
    title: 'Phỏng vấn thực chiến với AI',
    desc: 'Trả lời câu hỏi bằng giọng nói, AI lắng nghe và phân tích câu trả lời của bạn theo thời gian thực.',
    icon: Mic2,
    color: '#6366f1'
  },
  {
    title: 'Phân tích & Chấm điểm chi tiết',
    desc: 'Nhận báo cáo về nội dung, cấu trúc câu trả lời và gợi ý cải thiện cụ thể sau mỗi phiên.',
    icon: BarChart2,
    color: '#10b981'
  },
  {
    title: 'Ngân hàng câu hỏi thực tế',
    desc: 'Hàng trăm câu hỏi được phân loại theo ngành nghề, vị trí và mức độ kinh nghiệm.',
    icon: BookOpen,
    color: '#f59e0b'
  },
  {
    title: 'Lưu trữ & Transcript tự động',
    desc: 'Lưu lại toàn bộ phiên luyện tập kèm transcript chính xác để ôn tập về sau.',
    icon: Headphones,
    color: '#ec4899'
  }
];

const diffLabel = (d: string) => d === 'hard' ? 'Khó' : d === 'medium' ? 'Trung Bình' : 'Dễ';
const diffColor = (d: string) => d === 'hard' ? '#ef4444' : d === 'medium' ? '#f59e0b' : '#10b981';
const diffBg   = (d: string) => d === 'hard' ? 'rgba(239,68,68,0.12)' : d === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';

function AvatarLetter({ name }: { name: string }) {
  const letter = (name || 'S').charAt(0).toUpperCase();
  const colors = ['#6366f1','#10b981','#f59e0b','#ec4899','#3b82f6','#8b5cf6'];
  const color  = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: color + '22', border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.25rem', fontWeight: 700, color, flexShrink: 0
    }}>
      {letter}
    </div>
  );
}

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
                Luyện tập trả lời phỏng vấn bằng giọng nói với AI. Nhận phản hồi chi tiết về nội dung và cấu trúc câu trả lời ngay lập tức.
              </p>
              <div className="x-hero-cta-group">
                <Link to="/register" className="x-btn-primary x-btn-lg">
                  Luyện tập ngay miễn phí
                  <ArrowRight size={18} />
                </Link>
                <p className="x-hero-micro">Không cần thẻ tín dụng • Miễn phí</p>
              </div>

              {/* Stats Ribbon */}
              <div className="x-stats-ribbon">
                <div className="x-stat-item">
                  <strong>{stats.totalQuestions > 0 ? `${stats.totalQuestions.toLocaleString()}+` : '—'}</strong>
                  <span>Câu hỏi phỏng vấn</span>
                </div>
                <div className="x-stat-divider" />
                <div className="x-stat-item">
                  <strong>{stats.totalAttempts > 0 ? `${stats.totalAttempts.toLocaleString()}+` : '—'}</strong>
                  <span>Lượt luyện tập</span>
                </div>
                <div className="x-stat-divider" />
                <div className="x-stat-item">
                  <strong>{stats.totalUsers > 0 ? `${stats.totalUsers.toLocaleString()}+` : '—'}</strong>
                  <span>Học viên tin dùng</span>
                </div>
              </div>
            </div>

            <div className="x-hero-visual">
              <div className="x-hero-card-stack">
                <div className="x-floating-card top-card">
                  <div className="x-fc-icon"><BriefcaseBusiness size={20} /></div>
                  <div className="x-fc-body">
                    <strong>AI Interviewer</strong>
                    <span>Đang mô phỏng phỏng vấn...</span>
                  </div>
                </div>
                <div className="x-floating-card mid-card">
                  <div className="x-fc-icon green"><CheckCircle2 size={20} /></div>
                  <div className="x-fc-body">
                    <strong>Phân tích câu trả lời</strong>
                    <span>Cấu trúc STAR: Rõ ràng ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE - only if real companies exist */}
      {stats.companies && stats.companies.length > 0 && (
        <section className="x-marquee-section">
          <p className="x-marquee-title">Câu hỏi được tổng hợp từ các đợt tuyển dụng của</p>
          <div className="x-marquee-container">
            <div className="x-marquee-content">
              {[...stats.companies, ...stats.companies, ...stats.companies].map((company, i) => (
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
                  <div className="x-feature-icon-wrapper" style={{ background: feat.color + '18', border: `1px solid ${feat.color}33` }}>
                    <Icon size={22} style={{ color: feat.color }} />
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POPULAR QUESTIONS - styled exactly like the Question Bank page */}
      {stats.popularQuestions && stats.popularQuestions.length > 0 && (
        <section id="popular-questions" style={{ padding: '5rem 0', background: 'transparent' }}>
          <div className="x-container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--teal-strong)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Luyện tập ngay</p>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Câu hỏi phổ biến</h2>
              </div>
              <Link to="/practice" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--teal-strong)', fontWeight: 600, textDecoration: 'none' }}>
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>

            {/* List layout - giống trang Question Bank */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.popularQuestions.map((q: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1.5rem',
                  padding: '1.25rem 1.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'default'
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal-strong)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Target size={16} style={{ color: 'var(--text-secondary)' }} />
                  </div>

                  {/* Question text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.question}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.industryGroup || 'Chung'}</span>
                      {q.tags?.slice(0, 2).map((tag: string, ti: number) => (
                        <span key={ti} style={{
                          fontSize: '0.7rem', padding: '1px 7px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)'
                        }}>{tag}</span>
                      ))}
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        color: diffColor(q.difficulty), background: diffBg(q.difficulty)
                      }}>{diffLabel(q.difficulty)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link to="/practice" style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1.1rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600,
                    textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
                    transition: 'background 0.2s, border-color 0.2s'
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-strong)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal-strong)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                  >
                    <Mic2 size={14} /> Luyện tập
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED INTERVIEW SETS - styled exactly like /interview-sets page */}
      {stats.featuredSets && stats.featuredSets.length > 0 && (
        <section id="interview-sets" style={{ padding: '5rem 0', background: 'var(--bg-secondary, rgba(255,255,255,0.02))' }}>
          <div className="x-container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--teal-strong)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Bộ phỏng vấn</p>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Nổi bật nhất</h2>
              </div>
              <Link to="/interview-sets" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--teal-strong)', fontWeight: 600, textDecoration: 'none' }}>
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>

            {/* 2-column grid giống trang /interview-sets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' }}>
              {stats.featuredSets.map((set: any, i: number) => (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s, transform 0.2s'
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  {/* Header: avatar + title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                    <AvatarLetter name={set.title} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {set.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{set.company}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{
                    display: 'flex', gap: '2rem', paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem'
                  }}>
                    {[
                      { value: set.questionCount, label: 'CÂU HỎI' },
                      { value: set.durationMinutes, label: 'PHÚT' },
                      { value: diffLabel(set.difficulty), label: 'ĐỘ KHÓ', color: diffColor(set.difficulty) }
                    ].map((stat, si) => (
                      <div key={si}>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: stat.color || 'var(--text-primary)' }}>{stat.value}</p>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginTop: '2px' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Job description preview */}
                  <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={13} /> MÔ TẢ CÔNG VIỆC
                    </p>
                    <p style={{
                      margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {set.jobDescription}
                    </p>
                  </div>

                  {/* CTA button */}
                  <Link to={`/interview-sets/${set._id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.5rem', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
                  >
                    Bắt đầu luyện tập <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
      <section style={{ padding: '5rem 0' }}>
        <div className="x-container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.08) 100%)',
            borderRadius: '20px',
            padding: '4rem',
            textAlign: 'center',
            border: '1px solid rgba(99,102,241,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '400px', height: '400px', background: 'rgba(99,102,241,0.08)', filter: 'blur(80px)', transform: 'translate(-50%, -50%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.3)', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#818cf8' }}>
                <Sparkles size={13} /> Miễn phí 100% để bắt đầu
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>
                Bắt đầu luyện tập ngay hôm nay
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                Hàng chục ứng viên đã cải thiện kỹ năng với SpeakAI. Đến lượt bạn rồi.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="x-btn-primary x-btn-lg" style={{ borderRadius: '12px' }}>
                  Đăng ký miễn phí <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="x-btn-ghost x-btn-lg" style={{ borderRadius: '12px' }}>
                  Đăng nhập
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                {[
                  { icon: CheckCircle2, text: 'Miễn phí hoàn toàn' },
                  { icon: CheckCircle2, text: 'AI đánh giá tức thì' },
                  { icon: CheckCircle2, text: 'Không cần thẻ tín dụng' }
                ].map((item, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <item.icon size={14} style={{ color: '#10b981' }} /> {item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
