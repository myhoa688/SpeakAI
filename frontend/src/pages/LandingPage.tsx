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
  Users
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { api } from '../lib/api';

const COMPANIES = [
  'VNG', 'Shopee', 'MoMo', 'Techcombank', 'FPT Software',
  'Tiki', 'Grab', 'VinGroup', 'VNPT', 'Viettel', 'Zalo', 'VNPAY'
];

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
    title: 'Bảng xếp hạng năng lực',
    desc: 'Biết mình đang ở đâu. Hệ thống gamification đánh giá bạn nằm trong top bao nhiêu % ứng viên.',
    icon: Trophy
  }
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [stats, setStats] = useState({
    totalSets: 150,
    totalAttempts: 25000,
    totalQuestions: 15000,
    totalCompanies: 120,
    rating: 4.9
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
                  <strong>{stats.rating}/5.0</strong>
                  <span>Đánh giá học viên</span>
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

                <div className="x-floating-card bot-card">
                  <div className="x-fc-icon purple"><Trophy size={20} /></div>
                  <div className="x-fc-body">
                    <strong>Kết quả bài test</strong>
                    <span>Bạn thuộc Top 5% ứng viên! 🚀</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE */}
      <section className="x-marquee-section">
        <p className="x-marquee-title">Câu hỏi được tổng hợp từ các đợt tuyển dụng của</p>
        <div className="x-marquee-container">
          <div className="x-marquee-content">
            {[...COMPANIES, ...COMPANIES].map((company, i) => (
              <span key={i} className="x-marquee-item">{company}</span>
            ))}
          </div>
        </div>
      </section>

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

      {/* INTERVIEW SETS SECTION */}
      <section id="interview-sets" className="x-features-section" style={{ background: 'transparent' }}>
        <div className="x-container">
          <div className="x-section-header centered">
            <h2 className="x-section-title">Bộ phỏng vấn nổi bật</h2>
            <p className="x-section-desc">Luyện tập theo bộ câu hỏi thực tế từ các kỳ thi tuyển dụng.</p>
          </div>
          
          <div className="x-features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="x-feature-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>Business Analyst (BA)</strong>
                <span className="text-success" style={{ padding: '0.25rem 0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>15 Câu hỏi</span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>Tổng hợp câu hỏi phỏng vấn vị trí Phân tích nghiệp vụ, đánh giá tư duy logic và kỹ năng giải quyết vấn đề.</p>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--teal-strong)', fontWeight: 600, textDecoration: 'none' }}>Luyện tập ngay <ArrowRight size={16} /></Link>
            </div>
            
            <div className="x-feature-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>Frontend Developer</strong>
                <span className="text-success" style={{ padding: '0.25rem 0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>20 Câu hỏi</span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>Câu hỏi về React, Vue, Javascript core và kỹ năng xây dựng giao diện tối ưu hiệu năng.</p>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--teal-strong)', fontWeight: 600, textDecoration: 'none' }}>Luyện tập ngay <ArrowRight size={16} /></Link>
            </div>
            
            <div className="x-feature-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>Marketing Executive</strong>
                <span className="text-success" style={{ padding: '0.25rem 0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>12 Câu hỏi</span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>Kiểm tra kiến thức Digital Marketing, Content và kỹ năng lập kế hoạch chiến dịch truyền thông.</p>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--teal-strong)', fontWeight: 600, textDecoration: 'none' }}>Luyện tập ngay <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/interview-sets" className="x-btn-ghost">Xem tất cả bộ phỏng vấn</Link>
          </div>
        </div>
      </section>

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
      <section className="x-footer-cta">
        <div className="x-container centered">
          <h2>Sẵn sàng nhận được Offer Letter?</h2>
          <p>Hàng ngàn ứng viên đã thành công. Đến lượt bạn rồi.</p>
          <Link to="/register" className="x-btn-primary x-btn-lg x-btn-glow" style={{ marginTop: '2rem' }}>
            Bắt đầu luyện tập miễn phí
            <Sparkles size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
