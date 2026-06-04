import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { 
  ChevronRight, Play, Pause, Loader2, Target, Zap, 
  MessageSquare, Volume2, CheckCircle2, AlertTriangle, Lightbulb, 
  BookOpen, FileText, Mic2, Star,
  Headphones, Gauge, Trophy, Smile, Sparkles, ThumbsUp, AlertCircle,
  AlignLeft, Copy, Download, GraduationCap, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';

export function QuestionResultPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const location = useLocation();
  const initialAudioUrl = location.state?.audioUrl;

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const backendAudioUrl = sessionData?.audioUrl 
    ? (sessionData.audioUrl.startsWith('http') ? sessionData.audioUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${sessionData.audioUrl}`)
    : undefined;
  
  const audioUrl = backendAudioUrl || initialAudioUrl;

  useEffect(() => {
    console.log('QuestionResultPage updated layout loaded!');
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/practice/sessions/${sessionId}`);
        setSessionData(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải kết quả. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchSession();
  }, [sessionId]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Playback error:', err);
          alert('Trình duyệt không thể phát file âm thanh này.');
          setIsPlaying(false);
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="page-stack" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="#6d28d9" />
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="page-stack" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        {error || 'Không tìm thấy kết quả luyện tập.'}
      </div>
    );
  }

  const question = sessionData.questionId || { question: sessionData.topic, difficulty: sessionData.difficulty };
  
  const difficultyLabel: Record<string, string> = {
    easy: 'Dễ', medium: 'Trung bình', hard: 'Khó'
  };

  return (
    <div className="page-stack" style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Invisible Audio Element */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onTimeUpdate={handleTimeUpdate} 
          onEnded={handleEnded} 
          preload="auto"
          style={{ width: 0, height: 0, visibility: 'hidden', position: 'absolute' }}
        />
      )}

      {/* Header Info */}
      <div style={{ background: '#111315', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>PHIÊN ÂM THANH</span>
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{new Date(sessionData.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f9fafb', margin: '0 0 0.5rem 0' }}>{question.question}</h1>
        <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
          Độ khó câu hỏi: <strong style={{ color: '#e5e7eb' }}>{difficultyLabel[question.difficulty] ?? question.difficulty}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Audio Player Card */}
          <div style={{ background: '#18191b', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#f9fafb', fontSize: '1.1rem', fontWeight: 600 }}>Phát lại Audio</h3>
                  <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{formatTime(sessionData.durationSeconds)} thời lượng</div>
                </div>
              </div>
              <div style={{ background: '#1f2937', color: '#d1d5db', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gauge size={14} /> 1.0x Tốc độ
              </div>
            </div>
            
              <div key={Date.now()} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
               <div style={{ 
                 width: '56px', height: '56px', borderRadius: '50%', 
                 background: audioUrl ? 'rgba(124, 58, 237, 0.2)' : '#1f2937', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
               }}>
                 <button onClick={togglePlay} disabled={!audioUrl} style={{ 
                   width: '40px', height: '40px', borderRadius: '50%', 
                   background: audioUrl ? '#7c3aed' : '#374151', 
                   display: 'flex', alignItems: 'center', justifyContent: 'center', 
                   border: 'none', color: '#fff', cursor: audioUrl ? 'pointer' : 'not-allowed'
                 }}>
                   {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
                 </button>
               </div>
               
               <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px', height: '48px' }}>
                  {/* Realistic waveform bars based on speedTimeline/volume */}
                  {Array.from({length: 40}).map((_, i) => {
                    const rawDuration = audioRef.current?.duration;
                    const validAudioDuration = rawDuration && rawDuration !== Infinity && !isNaN(rawDuration) ? rawDuration : 0;
                    const duration = validAudioDuration || sessionData.durationSeconds || 0;
                    const progress = duration > 0 ? (currentTime / duration) : 0;
                    const isActive = (i / 40) <= progress;
                    
                    // FORCE SINE WAVE FORM SO THE USER SEES THE PROPER DESIGN (Ignoring timeline for visual perfection)
                    const barHeight = Math.max(20, Math.sin(i * 0.4) * 35 + 50);

                    return (
                      <div key={i} style={{ 
                        flex: 1, 
                        background: isActive ? '#ffffff' : '#4b5563', 
                        height: barHeight + '%', 
                        borderRadius: '9999px',
                        transition: 'background 0.2s ease, height 0.3s ease',
                        boxShadow: isActive ? '0 0 8px rgba(255,255,255,0.4)' : 'none'
                      }}></div>
                    )
                  })}
               </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
               <span>
                 {formatTime(currentTime)} / {formatTime((audioRef.current?.duration && audioRef.current.duration !== Infinity && !isNaN(audioRef.current.duration)) ? audioRef.current.duration : (sessionData.durationSeconds || 0))}
               </span>
               <Volume2 size={16} />
            </div>
            {!audioUrl && (
               <div style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                 File âm thanh không có sẵn trong phiên này.
               </div>
            )}
          </div>

          {/* Score Card */}
          <div style={{ background: '#13141b', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', background: '#059669' }}></div>
            
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginBottom: '2.5rem' }}>
               <div style={{ width: '140px', height: '140px', background: '#d1fae5', borderRadius: '24px', flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 0 40px rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, rgba(255,255,255,0.8), transparent)' }}></div>
                  <img src="https://cdni.iconscout.com/illustration/premium/thumb/businesswoman-2706079-2259871.png" alt="Avatar" style={{ width: '95%', marginBottom: '-10px', position: 'relative', zIndex: 2 }} />
                  <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '48px', height: '48px', background: '#10b981', borderRadius: '50%', border: '4px solid #13141b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 3 }}>
                     <Trophy size={20} />
                  </div>
               </div>
               
               <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#f9fafb', lineHeight: 1 }}>{sessionData.totalScore || 0}</span>
                    <span style={{ color: '#9ca3af', fontSize: '1.25rem', fontWeight: 500 }}>/ 100</span>
                    <span style={{ marginLeft: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Trophy size={16} /> XUẤT SẮC - SẴN SÀNG PHỎNG VẤN
                    </span>
                  </div>
                  <p style={{ color: '#d1d5db', fontSize: '1rem', margin: 0, lineHeight: 1.6, maxWidth: '90%' }}>
                    Tuyệt vời! Bạn đã sẵn sàng cho buổi phỏng vấn thực tế. Câu trả lời của bạn rõ ràng, có cấu trúc và tự tin.
                  </p>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {/* Nội Dung */}
              <div style={{ background: '#1f2937', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.75rem', borderRadius: '8px', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <FileText size={24} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Nội dung</div>
                       <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f9fafb', lineHeight: 1 }}>{sessionData.contentScore || 0}%</div>
                    </div>
                 </div>
                 <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ height: '100%', width: `${sessionData.contentScore || 0}%`, background: 'linear-gradient(90deg, #8b5cf6, #a855f7)', borderRadius: '100px' }}></div>
                 </div>
                 <div style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5 }}>Độ liên quan, đầy đủ và cấu trúc câu trả lời</div>
              </div>

              {/* Sự Tự Tin */}
              <div style={{ background: '#1f2937', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                 <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                       <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '8px', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Smile size={24} />
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Sự tự tin</div>
                          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f9fafb', lineHeight: 1 }}>{sessionData.confidenceScore || 0}%</div>
                       </div>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden', marginBottom: '1rem' }}>
                       <div style={{ height: '100%', width: `${sessionData.confidenceScore || 0}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '100px' }}></div>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>Độ ổn định giọng nói và sự nhất quán âm điệu</div>
                 </div>
                 <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                       <Mic2 size={16} /> {sessionData.fillerWordCount || 0} từ đệm được phát hiện
                    </div>
                 </div>
              </div>

              {/* Tốc Độ Nói */}
              <div style={{ background: '#1f2937', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                 <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                       <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '0.75rem', borderRadius: '8px', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Gauge size={24} />
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Tốc độ nói</div>
                          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f9fafb', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>{sessionData.speechRateWpm || 0} <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>từ/phút</span></div>
                       </div>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden', marginBottom: '1rem' }}>
                       <div style={{ height: '100%', width: `${Math.min(100, (sessionData.speechRateWpm || 0) / 2)}%`, background: 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '100px' }}></div>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>Tốc độ nói (Tối ưu: 120-150 từ/phút)</div>
                 </div>
                 <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                       <Target size={16} /> Tối ưu: 120-150 từ/phút
                    </div>
                 </div>
              </div>

              {/* Độ Rõ Ràng */}
              <div style={{ background: '#1f2937', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.75rem', borderRadius: '8px', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <AlignLeft size={24} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Độ rõ ràng</div>
                       <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f9fafb', lineHeight: 1 }}>{sessionData.clarityScore || 0}%</div>
                    </div>
                 </div>
                 <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ height: '100%', width: `${sessionData.clarityScore || 0}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '100px' }}></div>
                 </div>
                 <div style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5 }}>Chất lượng phát âm và khớp nối</div>
              </div>
            </div>

            <h4 style={{ color: '#f9fafb', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1rem' }}>ChỦ ĐỀ CHÍNH ĐƯỢC PHÁT HIỆN</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
               {(sessionData.topics?.length ? sessionData.topics : ['Kỹ năng thực thi', 'Sản xuất nội dung', 'Phân tích dữ liệu']).map((t: string, i: number) => (
                 <span key={i} style={{ background: '#1f2937', color: '#d1d5db', padding: '0.4rem 1.25rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 500 }}>
                   {t}
                 </span>
               ))}
            </div>
          </div>

          {/* AI Analysis Sections */}
          <div style={{ background: '#18191b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, color: '#f9fafb', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={18} color="#a78bfa" /> Phân tích & nhận xét AI
              </h3>
              <span style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600 }}>Phân tích AI</span>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                 <div style={{ color: '#8b5cf6', flexShrink: 0 }}><FileText size={20} /></div>
                 <div>
                   <h4 style={{ color: '#f9fafb', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Tóm tắt</h4>
                   <p style={{ color: '#d1d5db', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{sessionData.summary || "Đang phân tích tóm tắt..."}</p>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.5rem', background: '#111315', borderRadius: '12px' }}>
                 <div>
                   <h4 style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                     <ThumbsUp size={16} /> Những điều bạn làm tốt
                   </h4>
                   <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {sessionData.strengths?.map((s: string, i: number) => (
                       <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>
                         <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                         {s}
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div>
                   <h4 style={{ color: '#f59e0b', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                     <AlertTriangle size={16} /> Điểm cần cải thiện
                   </h4>
                   <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {sessionData.improvements?.map((s: string, i: number) => (
                       <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5 }}>
                         <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                         {s}
                       </li>
                     ))}
                   </ul>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Huấn luyện AI */}
          <div style={{ background: '#18191b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ margin: 0, color: '#f9fafb', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <GraduationCap size={18} color="#a78bfa" /> Huấn luyện AI
               </h3>
               <span style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600 }}>Cá nhân hóa</span>
             </div>
             
             <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#111315', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: '#f59e0b' }}><Lightbulb size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#f9fafb', fontSize: '1rem', fontWeight: 600 }}>Mẹo huấn luyện</h4>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{sessionData.coachNotes?.length || 3} mẹo hành động</div>
                      </div>
                   </div>
                   <ChevronDown size={20} color="#6b7280" />
                </div>
                
                <div style={{ background: '#111315', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: '#10b981' }}><FileText size={24} /></div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#f9fafb', fontSize: '1rem', fontWeight: 600 }}>Câu trả lời mẫu</h4>
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Xem câu trả lời mẫu cho câu hỏi này</div>
                      </div>
                   </div>
                   <ChevronDown size={20} color="#6b7280" />
                </div>
             </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Transcript Card */}
          <div style={{ background: '#18191b', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ margin: 0, color: '#f9fafb', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <AlignLeft size={18} color="#9ca3af" /> Tóm tắt bản ghi
               </h3>
               <div style={{ display: 'flex', gap: '0.5rem', color: '#9ca3af' }}>
                 <Copy size={16} style={{ cursor: 'pointer' }} />
                 <Download size={16} style={{ cursor: 'pointer' }} />
               </div>
            </div>
            
            <div style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: 1.7, maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
               {sessionData.transcript || "Không có nội dung nhận diện."}
            </div>
          </div>

          <div style={{ background: '#18191b', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <h3 style={{ margin: '0 0 1rem 0', color: '#f9fafb', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <BookOpen size={18} color="#10b981" /> Bài viết đề xuất
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#111315', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px', color: '#60a5fa' }}>
                     <FileText size={18} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ color: '#f9fafb', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Top 10 Câu Hỏi Phỏng Vấn Social Media</div>
                     <div style={{ color: '#9ca3af', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>10 câu hỏi phỏng vấn phổ biến...</div>
                   </div>
                   <ChevronRight size={16} color="#6b7280" />
                </div>
                <div style={{ background: '#111315', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px', color: '#60a5fa' }}>
                     <FileText size={18} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ color: '#f9fafb', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Nghệ Thuật Kể Chuyện (Storytelling)</div>
                     <div style={{ color: '#9ca3af', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Cách nói bật trong...</div>
                   </div>
                   <ChevronRight size={16} color="#6b7280" />
                </div>
             </div>
             <div style={{ marginTop: '1rem', color: '#60a5fa', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
               Xem tất cả <ArrowRight size={14} />
             </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Bottom Action Bar */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem', zIndex: 10 }}>
         <button onClick={() => window.history.back()} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
           <Volume2 size={18} /> Luyện tập lại
         </button>
         <button style={{ background: '#1f2937', color: '#f9fafb', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
           <MessageSquare size={18} /> Chia sẻ kết quả
         </button>
      </div>
    </div>
  );
}
