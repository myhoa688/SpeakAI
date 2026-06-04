import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  AlertCircle, CheckCircle2, Clock, Sparkles, 
  Play, Volume2, Maximize, Lightbulb, ThumbsUp, 
  Target, FileText, ArrowLeft, ArrowRight, RotateCcw,
  AlignLeft, Activity, ListChecks, UserCheck, ChevronDown, ChevronRight,
  Star, X as XIcon, Send
} from 'lucide-react';
import { api } from '../lib/api';
import { getVideo } from '../lib/indexedDB';
import './InterviewResultPage.css';

interface AnswerRecord {
  question: string;
  answer: string;
  score: number;
  clarityScore?: number;
  confidenceScore?: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface SessionResult {
  sessionId: string;
  status: string;
  industry: string;
  specialization: string;
  difficulty: string;
  overallScore: number;
  summary: string;
  skillRadar?: {
    contentQuality: number;
    clarity: number;
    expertise: number;
    confidence: number;
  };
  overallStrengths: string[];
  overallImprovements: string[];
  xpEarned: number;
  answers: AnswerRecord[];
  completedAt: string;
  totalQuestions: number;
  jobDescriptionText?: string;
  company?: string;
}

export function InterviewResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Rating Modal
  const [showRating, setShowRating] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Tự động hiện popup đánh giá sau 3 giây nếu chưa đánh giá
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ratingSubmitted) {
        setShowRating(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [ratingSubmitted]);

  const submitRating = async () => {
    if (!ratingScore || !id) return;
    setRatingLoading(true);
    try {
      await api.post('/ratings', {
        sessionType: 'interview',
        sessionId: id,
        score: ratingScore,
        comment: ratingComment.trim()
      });
      setRatingSubmitted(true);
    } catch {
      // silent fail — don't block navigation
    } finally {
      setRatingLoading(false);
    }
  };

  useEffect(() => {
    void loadResult();
  }, [id]);

  useEffect(() => {
    let url: string | null = null;
    const loadVideo = async () => {
      if (!id) return;
      const blob = await getVideo(id, selectedIndex);
      if (blob) {
        url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } else {
        setVideoUrl(null);
      }
    };
    loadVideo();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [id, selectedIndex]);

  const loadResult = async () => {
    try {
      const res = await api.get(`/interviews/${id!}/result`);
      setResult(res.data as SessionResult);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Không thể tải kết quả phỏng vấn.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="panel-card" style={{ margin: '2rem' }}>Đang tải kết quả...</div>;
  if (error || !result) return <div className="panel-card error-text" style={{ margin: '2rem' }}>{error || 'Không có dữ liệu.'}</div>;

  const currentAnswer = result.answers[selectedIndex];
  if (!currentAnswer) return <div className="panel-card" style={{ margin: '2rem' }}>Chưa có câu trả lời nào.</div>;

  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const currentScoreColor = getScoreColorClass(currentAnswer.score);

  return (
    <div className="xi-result-container">
      
      {/* HEADER */}
      <div className="xi-header">
        <div className="xi-header-score">
          <div style={{ width: '40px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '0.5rem' }}></div>
          <h3>-</h3>
          <span>Tổng điểm</span>
        </div>
        
        <div className="xi-header-content">
          <h2 className="xi-header-title">Kết quả phỏng vấn</h2>
          <p className="xi-header-subtitle">
            Interview Set - {result.company ? `${result.company} ` : ''}{result.specialization || result.industry || 'Vị trí phỏng vấn'}
          </p>
          
          <div className="xi-warning-box">
            <span><AlertCircle size={16} /> Vui lòng hoàn thành tất cả câu hỏi để nhận đánh giá tổng thể</span>
            <span style={{ color: 'rgba(251, 191, 36, 0.7)', fontSize: '0.8rem', marginLeft: '24px' }}>
              {result.answers.length}/{result.totalQuestions || result.answers.length} câu hỏi đã hoàn thành
            </span>
          </div>
          
          <div className="xi-chips">
            <div className="xi-chip success">
              <CheckCircle2 size={14} /> {result.answers.length}/{result.totalQuestions || result.answers.length} câu hỏi đã trả lời
            </div>
            <div className="xi-chip">
              <Clock size={14} /> Just now
            </div>
            <div className="xi-chip" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc' }}>
              <Sparkles size={14} /> Cá nhân hóa cho bạn
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="xi-tabs">
        {result.answers.map((ans, idx) => (
          <button 
            key={idx}
            className={`xi-tab ${selectedIndex === idx ? 'active' : ''}`}
            onClick={() => setSelectedIndex(idx)}
          >
            Q{idx + 1} 
            <span className="xi-tab-score" style={{ 
              background: selectedIndex === idx ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' 
            }}>
              {ans.score}
            </span>
          </button>
        ))}
        
        {/* Placeholder for uncompleted questions if any */}
        {Array.from({ length: Math.max(0, (result.totalQuestions || result.answers.length) - result.answers.length) }).map((_, i) => (
          <button key={'unans'+i} className="xi-tab" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Q{result.answers.length + i + 1} <span className="xi-tab-score">-</span>
          </button>
        ))}
      </div>

      {/* TWO COLUMNS */}
      <div className="xi-grid">
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Question Text */}
          <div className="xi-panel" style={{ padding: '1.5rem' }}>
            <h3 className="xi-panel-title" style={{ marginBottom: '0.75rem' }}>
              <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>?</div>
              Question {selectedIndex + 1}
            </h3>
            <p className="xi-panel-subtitle" style={{ color: '#e2e8f0' }}>
              {currentAnswer.question}
            </p>
          </div>
          
          {/* Video Player / Placeholder */}
          {videoUrl ? (
            <div className="xi-video-placeholder" style={{ background: '#000' }}>
              <video 
                src={videoUrl} 
                controls 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
          ) : (
            <div className="xi-video-placeholder">
              <div className="xi-video-avatar">
                <UserCheck size={40} />
              </div>
              <div className="xi-video-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff' }}>
                  <Play size={20} cursor="pointer" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>0:00</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff' }}>
                  <Volume2 size={20} cursor="pointer" />
                  <Maximize size={20} cursor="pointer" />
                </div>
              </div>
            </div>
          )}
          <div className="xi-video-warning">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            Nếu bạn tắt camera trong lúc ghi, video xem lại có thể bị gián đoạn nhưng âm thanh vẫn đầy đủ.
          </div>
          
          {/* Gợi ý trả lời */}
          <div className="xi-tips-container">
            <div className="xi-tips-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lightbulb size={18} /> Gợi ý trả lời
              </div>
              <span style={{ fontSize: '0.8rem', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <RotateCcw size={12} /> Làm mới
              </span>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListChecks size={14} /> ANSWER STRUCTURE
            </div>
            
            <div className="xi-tips-timeline">
              <div className="xi-tips-item">
                <div className="xi-tips-node start">START</div>
                Bắt đầu bằng việc xác nhận sự hiểu biết của bạn về yêu cầu và mục tiêu của câu hỏi.
              </div>
              <div className="xi-tips-item">
                <div className="xi-tips-node">1</div>
                Liên kết trực tiếp với kinh nghiệm đã có trong CV của bạn, tập trung vào những thành tựu nổi bật nhất.
              </div>
              <div className="xi-tips-item">
                <div className="xi-tips-node">2</div>
                Đưa ra một ví dụ cụ thể (sử dụng phương pháp STAR) để chứng minh năng lực.
              </div>
              <div className="xi-tips-item">
                <div className="xi-tips-node">3</div>
                Nhấn mạnh kỹ năng mềm (giao tiếp, làm việc nhóm, giải quyết vấn đề) đã áp dụng.
              </div>
              <div className="xi-tips-item">
                <div className="xi-tips-node end">END</div>
                Tái khẳng định sự phù hợp của bạn với vị trí và mục tiêu phát triển tại công ty.
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#fbbf24', fontStyle: 'italic', display: 'flex', gap: '0.5rem' }}>
              <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              Phân bổ thời gian hợp lý cho mỗi điểm, đảm bảo trả lời đầy đủ trong 150 giây. Tập trung vào 2-3 điểm chính.
            </div>
          </div>
          
          {/* Key Tips */}
          <div className="xi-tips-container" style={{ border: 'none', padding: 0 }}>
            <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={14} /> KEY TIPS
            </div>
            
            <ul style={{ margin: 0, padding: '0 0 0 1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>Nhấn mạnh sự liên kết giữa kỹ năng của bạn và <strong>yêu cầu công việc (Job Description)</strong>.</li>
              <li>Thể hiện thái độ tích cực, tự tin và sẵn sàng học hỏi.</li>
              <li>Tránh sử dụng các câu trả lời quá chung chung; hãy luôn đính kèm dữ liệu hoặc kết quả thực tế.</li>
            </ul>
          </div>
          
        </div>
        
        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Score Box */}
          <div className="xi-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#fff' }}>
                <Activity size={18} color="#6366f1" /> Điểm câu trả lời
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: currentAnswer.score >= 50 ? (currentAnswer.score >= 75 ? '#10b981' : '#f59e0b') : '#ef4444' }}>
                {currentAnswer.score}%
              </div>
            </div>
            <div className="xi-score-bar-bg">
              <div className={`xi-score-bar-fill ${currentScoreColor}`} style={{ width: `${currentAnswer.score}%` }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Muốn cải thiện điểm số?</span>
              <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={14} /> Thử lại câu này
              </button>
            </div>
          </div>
          
          {/* AI Summary */}
          <div className="xi-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
              <Sparkles size={18} color="#6366f1" /> Tóm tắt AI
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {currentAnswer.feedback || 'Không có nhận xét chi tiết cho câu trả lời này.'}
            </p>
          </div>
          
          {/* Detailed Scores */}
          <div className="xi-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
              <Target size={18} color="#6366f1" /> Chi tiết điểm số
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div className="xi-detail-score">
                  <div className="xi-detail-score-name"><AlignLeft size={14} /> Nội dung (40%)</div>
                  <strong style={{ color: '#fff' }}>{result.skillRadar?.contentQuality || currentAnswer.score}</strong>
                </div>
                <div className="xi-score-bar-bg" style={{ height: '4px', marginTop: '4px' }}>
                  <div className={`xi-score-bar-fill`} style={{ width: `${result.skillRadar?.contentQuality || currentAnswer.score}%`, background: '#64748b' }}></div>
                </div>
              </div>
              
              <div>
                <div className="xi-detail-score">
                  <div className="xi-detail-score-name"><Volume2 size={14} /> Rõ ràng (25%)</div>
                  <strong style={{ color: '#fff' }}>{currentAnswer.clarityScore || result.skillRadar?.clarity || currentAnswer.score}</strong>
                </div>
                <div className="xi-score-bar-bg" style={{ height: '4px', marginTop: '4px' }}>
                  <div className={`xi-score-bar-fill`} style={{ width: `${currentAnswer.clarityScore || result.skillRadar?.clarity || currentAnswer.score}%`, background: '#64748b' }}></div>
                </div>
              </div>
              
              <div>
                <div className="xi-detail-score">
                  <div className="xi-detail-score-name"><CheckCircle2 size={14} /> Liên quan (20%)</div>
                  <strong style={{ color: '#fff' }}>{result.skillRadar?.expertise || currentAnswer.score}</strong>
                </div>
                <div className="xi-score-bar-bg" style={{ height: '4px', marginTop: '4px' }}>
                  <div className={`xi-score-bar-fill`} style={{ width: `${result.skillRadar?.expertise || currentAnswer.score}%`, background: '#64748b' }}></div>
                </div>
              </div>
              
              <div>
                <div className="xi-detail-score">
                  <div className="xi-detail-score-name"><UserCheck size={14} /> Tự tin (15%)</div>
                  <strong style={{ color: '#fff' }}>{currentAnswer.confidenceScore || result.skillRadar?.confidence || currentAnswer.score}</strong>
                </div>
                <div className="xi-score-bar-bg" style={{ height: '4px', marginTop: '4px' }}>
                  <div className={`xi-score-bar-fill`} style={{ width: `${currentAnswer.confidenceScore || result.skillRadar?.confidence || currentAnswer.score}%`, background: '#64748b' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Strengths */}
          <div className="xi-panel" style={{ padding: '1.25rem', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#10b981', marginBottom: '1rem' }}>
              <ThumbsUp size={18} /> Điểm mạnh
            </div>
            {currentAnswer.strengths && currentAnswer.strengths.length > 0 ? (
              <ul style={{ margin: 0, padding: '0 0 0 1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {currentAnswer.strengths.map((s, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Chưa có nhận xét điểm mạnh rõ ràng.</p>
            )}
          </div>
          
          {/* Improvements */}
          <div className="xi-panel" style={{ padding: '1.25rem', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#f59e0b', marginBottom: '1rem' }}>
              <Lightbulb size={18} /> Cần cải thiện
            </div>
            {currentAnswer.improvements && currentAnswer.improvements.length > 0 ? (
              <ul style={{ margin: 0, padding: '0 0 0 1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {currentAnswer.improvements.map((s, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>The candidate did not provide a meaningful answer to the question.</p>
            )}
          </div>
          
          {/* Transcript */}
          <div className="xi-panel" style={{ padding: '1.25rem' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#fff' }}>
                <FileText size={18} color="#6366f1" /> Bản ghi
              </div>
              <ChevronDown size={18} color="#94a3b8" style={{ transform: showTranscript ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            
            {showTranscript && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                {currentAnswer.answer || 'Không ghi nhận được âm thanh.'}
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* BOTTOM ACTION BAR */}
      <div 
        className="xi-bottom-bar" 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: '280px', 
          right: 0, 
          background: '#18191b', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          padding: '1rem 2rem', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '1rem', 
          zIndex: 99 
        }}
      >
        <button className="xi-btn xi-btn-secondary" onClick={() => { setShowRating(true); }}>
          <ArrowLeft size={16} /> Về danh sách
        </button>
        <button className="xi-btn xi-btn-primary" onClick={() => {
          if (selectedIndex < result.answers.length - 1) {
            setSelectedIndex(selectedIndex + 1);
          } else {
            setShowRating(true);
          }
        }}>
          Tiếp tục <ArrowRight size={16} />
        </button>
        <button className="xi-btn xi-btn-purple" onClick={() => setShowRating(true)}>
          <RotateCcw size={16} /> Thử lại toàn bộ
        </button>
        <button className="xi-btn" style={{ background: '#f59e0b', color: '#fff', border: 'none' }} onClick={() => setShowRating(true)}>
          <Star size={16} /> Đánh giá
        </button>
      </div>

      {/* RATING MODAL — rendered via portal to escape stacking contexts */}
      {showRating && createPortal(
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '1rem'
        }}>
          <div style={{
            background: '#141416',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 20,
            padding: '2.5rem 2rem',
            width: '100%', maxWidth: 480,
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)'
          }}>
            {ratingSubmitted ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: 52, marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 700 }}>Cảm ơn bạn đã đánh giá!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.75rem' }}>Nhận xét của bạn giúp chúng tôi cải thiện trải nghiệm tốt hơn.</p>
                <button
                  className="xi-btn xi-btn-primary"
                  style={{ margin: '0 auto' }}
                  onClick={() => setShowRating(false)}
                >
                  Xem kết quả
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: '#fff', margin: '0 0 0.3rem', fontSize: '1.2rem', fontWeight: 700 }}>Đánh giá buổi phỏng vấn</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Phản hồi của bạn giúp chúng tôi nâng cao chất lượng AI</p>
                  </div>
                  <button
                    onClick={() => setShowRating(false)}
                    style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '7px 9px', color: '#94a3b8', cursor: 'pointer', display: 'flex', lineHeight: 1 }}
                  >
                    <XIcon size={18} />
                  </button>
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <p style={{ color: '#e2e8f0', fontWeight: 600, margin: 0, fontSize: '1rem' }}>Bạn cảm thấy thế nào?</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRatingScore(s)}
                        onMouseEnter={() => setRatingHover(s)}
                        onMouseLeave={() => setRatingHover(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      >
                        <Star
                          size={40}
                          fill={(ratingHover || ratingScore) >= s ? '#FCD34D' : 'none'}
                          color={(ratingHover || ratingScore) >= s ? '#FCD34D' : 'rgba(255,255,255,0.25)'}
                          style={{ transition: 'all 0.12s' }}
                        />
                      </button>
                    ))}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, minHeight: '1.2em', fontWeight: 500 }}>
                    {ratingScore === 1 ? '😞 Rất tệ' : ratingScore === 2 ? '😕 Tệ' : ratingScore === 3 ? '😐 Bình thường' : ratingScore === 4 ? '😊 Tốt' : ratingScore === 5 ? '🔥 Xuất sắc!' : 'Di chuột hoặc bấm để chọn sao'}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Nhận xét (tuỳ chọn)</label>
                  <textarea
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về buổi phỏng vấn này..."
                    rows={3}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 10,
                      color: '#e2e8f0', fontSize: '0.9rem',
                      padding: '0.75rem 1rem', resize: 'vertical',
                      fontFamily: 'inherit', outline: 'none'
                    }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.10)')}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="xi-btn xi-btn-secondary"
                    onClick={() => setShowRating(false)}
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="button"
                    className="xi-btn xi-btn-primary"
                    disabled={!ratingScore || ratingLoading}
                    onClick={submitRating}
                    style={{ opacity: (!ratingScore || ratingLoading) ? 0.45 : 1, cursor: (!ratingScore || ratingLoading) ? 'not-allowed' : 'pointer' }}
                  >
                    <Send size={15} />
                    {ratingLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
