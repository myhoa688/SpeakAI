import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { 
  ChevronRight, ChevronDown, ChevronUp, Mic, MessageSquare, 
  BriefcaseBusiness, Building2, Lightbulb, AlertTriangle, HelpCircle, 
  Clock, Heart, Loader2, Pause, Square, RotateCcw, Send, Play
} from 'lucide-react';
import { api } from '../lib/api';

const TranslationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

export function QuestionPracticePage() {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    recordingState,
    durationSeconds,
    audioBlob,
    audioUrl,
    volumeSamples,
    error: recordingError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  const [showHint, setShowHint] = useState(true);
  const [showSample, setShowSample] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(true);
  const [showMistakes, setShowMistakes] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/questions/${id}`);
        setQuestionData(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải câu hỏi. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuestion();
  }, [id]);

  const handleAnalyze = async () => {
    if (!questionData) return;
    setIsAnalyzing(true);
    try {
      // 1. Gửi âm thanh/transcript giả lập để API phân tích
      const formData = new FormData();
      formData.append('questionId', questionData._id || id || '');
      formData.append('practiceType', 'interview');
      formData.append('difficulty', questionData.difficulty || 'medium');
      formData.append('topic', questionData.question || '');
      formData.append('durationSeconds', durationSeconds.toString());
      formData.append('language', 'vi');
      formData.append('volumeSamples', JSON.stringify(volumeSamples));
      
      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.webm');
      } else {
        alert('Vui lòng ghi âm trước khi phân tích!');
        setIsAnalyzing(false);
        return;
      }

      const aiRes = await api.post('/ai/practice-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (aiRes.data?.analysisToken) {
        // 2. Lưu lại phiên luyện tập
        const sessionRes = await api.post('/practice/sessions', {
          analysisToken: aiRes.data.analysisToken
        });
        
        // 3. Chuyển sang trang kết quả
        navigate(`/questions/${id}/result?sessionId=${sessionRes.data.session._id}`, { state: { audioUrl } });
      } else {
        // Bản ghi âm quá ngắn (dưới 12 giây) hoặc chưa đủ dữ liệu để lưu phiên
        const notice = aiRes.data?.notice || 'Bản ghi âm quá ngắn (cần ít nhất 12 giây). Vui lòng ghi âm lại.';
        alert(notice);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi phân tích. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

    if (isAnalyzing) {
      return (
        <div className="page-stack" style={{ padding: '2rem' }}>
          <style>
            {`
              @keyframes bounceDot {
                0%, 100% { transform: translateY(0); opacity: 0.5; }
                50% { transform: translateY(-4px); opacity: 1; }
              }
              .dot-animate {
                animation: bounceDot 1s infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .animate-spin {
                animation: spin 1s linear infinite;
              }
            `}
          </style>
          
          {/* Breadcrumb giả lập phía trên cho giống screenshot */}
          <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem', fontWeight: 500 }}>
            Ngân hàng câu hỏi <ChevronRight size={14} style={{ marginTop: '2px' }} /> <span style={{ color: '#e5e7eb' }}>Kết quả</span>
          </div>

          <div style={{
            background: '#1a1f28', 
            borderRadius: '16px', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            padding: '3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '3rem',
            boxShadow: '0 20px 44px rgba(0,0,0,0.3)'
          }}>
            {/* Left: Image Box */}
            <div style={{
              position: 'relative',
              background: '#e0e7ff',
              borderRadius: '24px',
              padding: '1.5rem',
              width: '260px',
              height: '260px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
              border: '10px solid #141721',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(0,0,0,0.05)'
            }}>
              <img 
                src="https://cdni.iconscout.com/illustration/premium/thumb/data-analysis-4268364-3561001.png" 
                alt="Analyzing" 
                style={{ width: '120%', height: '120%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} 
              />
              
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                right: '-8px',
                background: '#3b82f6',
                borderRadius: '14px',
                width: '56px',
                height: '56px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.4)',
                border: '4px solid #141721'
              }}>
                <Loader2 size={24} className="animate-spin" color="#fff" strokeWidth={3} />
              </div>
            </div>

            {/* Right: Text content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                width: 'fit-content'
              }}>
                <Loader2 size={14} className="animate-spin" /> ĐANG XỬ LÝ
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                Đang phân tích câu trả lời
              </h2>

              <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>
                AI đang đánh giá câu trả lời của bạn. Thường mất 30-60 giây.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span className="dot-animate" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', animationDelay: '0s' }}></span>
                  <span className="dot-animate" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', animationDelay: '0.2s' }}></span>
                  <span className="dot-animate" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', animationDelay: '0.4s' }}></span>
                </div>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Trang sẽ tự động làm mới khi phân tích hoàn tất.
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '1rem' }}>
          <Loader2 size={40} className="animate-spin" color="#6d28d9" />
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>
            Đang tải...
          </div>
        </div>
      );
    }

  if (error || !questionData) {
    return (
      <div className="page-stack" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        {error || 'Không tìm thấy câu hỏi.'}
      </div>
    );
  }

  return (
    <div className="page-stack" style={{ paddingBottom: '80px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        <Link to="/questions" style={{ color: 'inherit', textDecoration: 'none' }}>Ngân hàng câu hỏi</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#fff', fontWeight: 600 }}>Phiên luyện tập</span>
      </div>

      {/* Language Selector */}
      <div className="" style={{ background: '#18191b', backgroundImage: 'none', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 44px rgba(3, 10, 20, 0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e5e7eb', fontWeight: 600, fontSize: '0.95rem' }}>
          <div style={{ background: 'rgba(92, 86, 245, 0.2)', padding: '0.5rem', borderRadius: '8px', display: 'flex', color: '#8b5cf6' }}>
             <TranslationIcon />
          </div>
          Ngôn ngữ luyện tập
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['English', 'Tiếng Việt', '日本語', '中文', '한국어'].map(lang => (
            <button key={lang} style={{
              background: lang === 'Tiếng Việt' ? '#5c56f5' : 'transparent',
              color: lang === 'Tiếng Việt' ? '#fff' : '#e5e7eb',
              border: lang !== 'Tiếng Việt' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 340px', alignItems: 'start', gap: '1.5rem' }}>
        {/* Main Content (Left Column) */}
        <div className="detail-stack" style={{ gap: '1rem' }}>
          <div className="" style={{ background: '#18191b', backgroundImage: 'none', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 44px rgba(3, 10, 20, 0.28)' }}>
            
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ 
                background: questionData.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.2)' : questionData.difficulty === 'medium' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                color: questionData.difficulty === 'hard' ? '#ef4444' : questionData.difficulty === 'medium' ? '#facc15' : '#22c55e', 
                padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' 
              }}>
                {questionData.difficulty === 'hard' ? 'Khó' : questionData.difficulty === 'medium' ? 'Trung bình' : 'Dễ'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', margin: '0 0 2rem', lineHeight: 1.5, color: '#f9fafb', fontWeight: 600 }}>
              {questionData.question}
            </h2>

            {/* Rich Analysis Layout (từ dữ liệu thật) */}
            {questionData.analysis ? (
              <>
                {/* Gợi ý từ X Interview */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showHint ? '1rem' : 0 }}
                    onClick={() => setShowHint(!showHint)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontWeight: 600, fontSize: '0.95rem' }}>
                      <Lightbulb size={18} /> Gợi ý từ X Interview
                    </div>
                    {showHint ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                  </div>

                  {showHint && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* INTERVIEWER ĐANG ĐÁNH GIÁ */}
                      {questionData.analysis?.interviewerEvaluation?.length > 0 && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.25rem' }}>
                          <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                            <HelpCircle size={14} /> INTERVIEWER ĐANG ĐÁNH GIÁ
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {questionData.analysis.interviewerEvaluation.map((ev: string, idx: number) => (
                              <li key={idx}>{ev}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CẤU TRÚC TRẢ LỜI */}
                      {questionData.analysis?.answerStructure && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.25rem' }}>
                          <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg> 
                            CẤU TRÚC TRẢ LỜI
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {questionData.analysis.answerStructure.open && (
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '2px', minWidth: '35px', textAlign: 'center' }}>MỞ</div>
                                <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>{questionData.analysis.answerStructure.open}</div>
                              </div>
                            )}
                            
                            {questionData.analysis.answerStructure.points?.map((pt: string, idx: number) => (
                              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, minWidth: '35px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', marginTop: '2px' }}>{idx + 1}</div>
                                <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>{pt}</div>
                              </div>
                            ))}

                            {questionData.analysis.answerStructure.close && (
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '2px', minWidth: '35px', textAlign: 'center' }}>KẾT</div>
                                <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>{questionData.analysis.answerStructure.close}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* GỢI Ý QUAN TRỌNG */}
                {questionData.analysis?.importantTips?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showTips ? '1rem' : 0 }}
                      onClick={() => setShowTips(!showTips)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f97316', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                        <Lightbulb size={18} /> GỢI Ý QUAN TRỌNG
                      </div>
                      {showTips ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                    </div>

                    {showTips && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {questionData.analysis.importantTips.map((tip: any, idx: number) => {
                          let tipColor = '#d1d5db';
                          let tipBg = 'rgba(255,255,255,0.05)';
                          if (tip.priority === 'HIGH') {
                            tipColor = '#ef4444';
                            tipBg = 'transparent';
                          } else if (tip.priority === 'MEDIUM') {
                            tipColor = '#a855f7';
                            tipBg = 'transparent';
                          }
                          return (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', alignItems: 'flex-start' }}>
                              <span style={{ border: `1px solid ${tipColor}`, color: tipColor, background: tipBg, fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{tip.priority}</span>
                              <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>{tip.content}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* CÂU HỎI FOLLOW-UP CÓ THỂ GẶP */}
                {questionData.analysis?.followUpQuestions?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showFollowUp ? '1rem' : 0 }}
                      onClick={() => setShowFollowUp(!showFollowUp)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f97316', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                        <HelpCircle size={18} /> CÂU HỎI FOLLOW-UP CÓ THỂ GẶP
                      </div>
                      {showFollowUp ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                    </div>

                    {showFollowUp && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {questionData.analysis.followUpQuestions.map((q: string, idx: number) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', alignItems: 'center' }}>
                            <div style={{ background: '#f97316', color: '#fff', fontSize: '0.75rem', fontWeight: 700, width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>{idx + 1}</div>
                            <div style={{ color: '#f97316', fontSize: '0.9rem' }}>{q}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* LỖI THƯỜNG GẶP */}
                {questionData.analysis?.commonMistakes?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', paddingBottom: '1rem' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showMistakes ? '1rem' : 0 }}
                      onClick={() => setShowMistakes(!showMistakes)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                        <AlertTriangle size={18} /> LỖI THƯỜNG GẶP
                      </div>
                      {showMistakes ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                    </div>

                    {showMistakes && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {questionData.analysis.commonMistakes.map((mistake: string, idx: number) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', alignItems: 'flex-start' }}>
                            <div style={{ color: '#ef4444', marginTop: '2px' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg></div>
                            <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>{mistake}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Fallback to legacy fields if analysis does not exist */}
                {questionData.guidance && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showHint ? '1rem' : 0 }}
                      onClick={() => setShowHint(!showHint)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontWeight: 600, fontSize: '0.95rem' }}>
                        <Lightbulb size={18} /> Gợi ý trả lời
                      </div>
                      {showHint ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                    </div>

                    {showHint && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.25rem' }}>
                        <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {questionData.guidance}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {questionData.sampleAnswer && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showSample ? '1rem' : 0 }}
                      onClick={() => setShowSample(!showSample)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                        <HelpCircle size={18} /> Câu trả lời mẫu
                      </div>
                      {showSample ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                    </div>

                    {showSample && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.25rem' }}>
                        <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {questionData.sampleAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* Right Sidebar */}
        <div className="detail-stack" style={{ gap: '1.5rem' }}>
          
          {/* Việc làm gợi ý */}
          <div className="" style={{ background: '#18191b', backgroundImage: 'none', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 44px rgba(3, 10, 20, 0.28)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.25rem 0.75rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: 0, color: '#e5e7eb', fontWeight: 600 }}>
                <BriefcaseBusiness size={18} color="#60a5fa" /> Việc làm gợi ý
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#a78bfa', cursor: 'pointer', fontWeight: 500 }}>Xem tất cả</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { title: 'Trợ lý Luật sư', company: 'Công ty Luật TNHH Everest • Hà Nội, Hưng Yên' },
                { title: 'Luật sư cộng sự', company: 'Công ty Luật TNHH Everest • Hà Nội, Hưng Yên' }
              ].map((job, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.55rem', letterSpacing: '-0.5px' }}>Everest</span>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#f9fafb' }}>{job.title}</h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>{job.company}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 500 }}>Thỏa thuận</span>
                        <span style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 500 }}>Làm việc từ xa</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#6b7280" />
                </div>
              ))}
            </div>
          </div>

          {/* Luyện tập phỏng vấn */}
          <div className="" style={{ background: '#18191b', backgroundImage: 'none', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 44px rgba(3, 10, 20, 0.28)' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 1rem 0', color: '#e5e7eb', fontWeight: 600 }}>Luyện tập phỏng vấn</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Sinh viên năm 3 ngành công nghệ thông tin', company: 'Unknown Company', q: '12 CÂU HỎI', min: '24 PHÚT', diff: 'Dễ' },
                { title: 'Business Development Executive', company: 'Công ty TNHH ABC', q: '12 CÂU HỎI', min: '30 PHÚT', diff: 'Trung Bình' }
              ].map((pack, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={20} color="#3b82f6" />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#f9fafb', lineHeight: 1.4 }}>{pack.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{pack.company}</p>
                      </div>
                    </div>
                    <Heart size={16} color="#9ca3af" />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem 0', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f9fafb', fontWeight: 700, fontSize: '0.85rem' }}>{pack.q.split(' ')[0]}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>CÂU HỎI</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f9fafb', fontWeight: 700, fontSize: '0.85rem' }}>{pack.min.split(' ')[0]}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>PHÚT</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f9fafb', fontWeight: 700, fontSize: '0.85rem' }}>{pack.diff}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>ĐỘ KHÓ</div>
                    </div>
                  </div>
                  
                  <button style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e7eb', borderRadius: '100px', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Bắt đầu luyện tập <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Câu hỏi liên quan */}
          <div className="" style={{ background: '#18191b', backgroundImage: 'none', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 44px rgba(3, 10, 20, 0.28)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.25rem 0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', margin: 0, color: '#e5e7eb', fontWeight: 600 }}>Câu hỏi liên quan</h3>
              <span style={{ fontSize: '0.8rem', color: '#a78bfa', cursor: 'pointer', fontWeight: 500 }}>Xem tất cả</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {questionData.relatedQuestions && questionData.relatedQuestions.length > 0 ? (
                questionData.relatedQuestions.map((q: any, idx: number) => (
                  <Link to={`/questions/${q.id}/practice`} key={idx} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ marginTop: '2px', flexShrink: 0, width: '18px', height: '18px', background: 'rgba(168,85,247,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <HelpCircle size={12} color="#a855f7" />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#f9fafb', lineHeight: 1.4, fontWeight: 500 }}>{q.question}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: q.difficulty === 'hard' ? '#ef4444' : q.difficulty === 'medium' ? '#fbbf24' : '#34d399', fontWeight: 600, textTransform: 'capitalize' }}>
                            {q.difficulty === 'hard' ? 'Khó' : q.difficulty === 'medium' ? 'Trung bình' : 'Dễ'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#6b7280" style={{ flexShrink: 0, marginTop: '2px' }} />
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '1rem 1.25rem', color: '#9ca3af', fontSize: '0.85rem' }}>Không có câu hỏi liên quan.</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sticky Recording Bar */}
      <div style={{ 
        position: 'fixed', bottom: '20px', left: '260px', right: '0', 
        display: 'flex', justifyContent: 'center', zIndex: 100, pointerEvents: 'none'
      }}>
        <div style={{ 
          background: '#1a1f28', borderRadius: '100px', padding: '0.75rem 1.5rem', 
          display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'auto',
          minWidth: recordingState === 'idle' ? '640px' : 'auto', 
          justifyContent: recordingState === 'idle' ? 'space-between' : 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Left section: Timer (khi đang ghi/tạm dừng/đã ghi) and Audio (if recorded) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {(recordingState === 'recording' || recordingState === 'paused' || recordingState === 'recorded') && (
                <>
                  {(recordingState === 'recording' || recordingState === 'paused') && (
                    <div style={{ 
                      width: '8px', height: '8px', background: recordingState === 'recording' ? '#ef4444' : '#f59e0b', borderRadius: '50%', 
                      boxShadow: recordingState === 'recording' ? '0 0 8px rgba(239,68,68,0.8)' : 'none'
                    }}></div>
                  )}
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', whiteSpace: 'nowrap' }}>
                    {Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:{(durationSeconds % 60).toString().padStart(2, '0')} <span style={{ color: '#6b7280', fontWeight: 500 }}>/ 04:00</span>
                  </span>
                </>
              )}

              {recordingState === 'recorded' && audioUrl && (
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.25rem 1rem', display: 'flex', alignItems: 'center', minWidth: '300px' }}>
                  <audio controls style={{ height: '36px', outline: 'none', width: '100%' }} src={audioUrl}></audio>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {recordingState === 'idle' && (
              <button 
                onClick={startRecording}
                style={{ 
                  background: '#5c56f5', border: 'none', padding: '0.65rem 2.5rem', borderRadius: '100px', 
                  color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(92,86,245,0.3)', whiteSpace: 'nowrap'
                }}>
                <Mic size={18} fill="currentColor" /> Bắt đầu ghi âm
              </button>
            )}
            
            
            {recordingState === 'recording' && (
              <>
                <button 
                  onClick={pauseRecording}
                  style={{ 
                    background: '#374151', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', 
                    color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                  <Pause size={16} fill="currentColor" /> Tạm dừng
                </button>
                <button 
                  onClick={stopRecording}
                  style={{ 
                    background: '#991b1b', border: 'none', 
                    padding: '0.75rem 1.5rem', borderRadius: '12px', 
                    color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                  <Square size={14} fill="none" strokeWidth={2.5} /> Kết thúc
                </button>
                <button style={{ 
                  border: 'none', color: '#fff', 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', 
                  fontWeight: 600, fontSize: '0.95rem', background: '#8b5cf6', 
                  padding: '0.75rem 1.5rem', borderRadius: '12px'
                }}>
                  <MessageSquare size={16} fill="currentColor" /> Gửi phản hồi
                </button>
              </>
            )}

            {recordingState === 'paused' && (
              <>
                <button 
                  onClick={resumeRecording}
                  style={{ 
                    background: '#6d28d9', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', 
                    color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.3)', whiteSpace: 'nowrap'
                  }}>
                  <Play size={16} fill="none" stroke="currentColor" strokeWidth={2.5} /> Tiếp tục
                </button>
                <button 
                  onClick={stopRecording}
                  style={{ 
                    background: '#991b1b', border: 'none', 
                    padding: '0.75rem 1.5rem', borderRadius: '12px', 
                    color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                  <Square size={14} fill="none" strokeWidth={2.5} /> Kết thúc
                </button>
                <button style={{ 
                  border: 'none', color: '#fff', 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', 
                  fontWeight: 600, fontSize: '0.95rem', background: '#8b5cf6', 
                  padding: '0.75rem 1.5rem', borderRadius: '12px'
                }}>
                  <MessageSquare size={16} fill="currentColor" /> Gửi phản hồi
                </button>
              </>
            )}

            {recordingState === 'recorded' && (
              <>
                <button 
                  onClick={resetRecording}
                  style={{ 
                    background: 'transparent', border: 'none', color: '#e5e7eb',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem', whiteSpace: 'nowrap'
                  }}>
                  <RotateCcw size={16} /> Ghi lại
                </button>

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  style={{ 
                  background: '#6d28d9', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', 
                  color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.3)', whiteSpace: 'nowrap'
                }}>
                  {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                  {isAnalyzing ? 'Đang gửi...' : 'Gửi để phân tích'}
                </button>
              </>
            )}
          </div>
          </div>

          {recordingState === 'idle' && (
            <button style={{ 
              border: 'none', color: '#fff', 
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', 
              fontWeight: 600, fontSize: '0.9rem', background: '#6d28d9', 
              padding: '0.65rem 1.25rem', borderRadius: '100px',
              boxShadow: '0 4px 14px rgba(109,40,217,0.3)'
            }}>
              <MessageSquare size={16} fill="currentColor" /> Gửi phản hồi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
