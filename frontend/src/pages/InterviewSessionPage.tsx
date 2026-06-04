import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, CheckCircle2, Loader2, Mic, MicOff, PhoneOff, Send, Keyboard } from 'lucide-react';
import { api } from '../lib/api';
import { saveVideo } from '../lib/indexedDB';
import { Joyride, STATUS } from 'react-joyride';

interface CurrentQuestion {
  index: number;
  total: number;
  question: string;
  reply?: string;
  reason: string;
  challenge: string;
  suggestedFocus: string[];
}

type SessionStatus = 'loading' | 'active' | 'listening' | 'submitting' | 'completed' | 'error';

export function InterviewSessionPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<SessionStatus>('loading');
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(120);
  const [hintsOpen, setHintsOpen] = useState(true);
  const [predefinedQuestions, setPredefinedQuestions] = useState<any[]>([]);
  // Track all questions seen so far for the roadmap
  const [questionHistory, setQuestionHistory] = useState<Array<{ index: number; question: string, reason?: string }>>([]);

  // Tour State
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(() => {
    return localStorage.getItem('hideInterviewTour') === 'true';
  });
  const [runTour, setRunTour] = useState(false);
  const statusRef = useRef<SessionStatus>('loading');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  
  // Camera và Audio
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tourCompleted) {
      if (status === 'active' && countdown === null && sessionTimer === 0) {
        setCountdown(5); // Auto start countdown when tour ends
      }
      timer = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        setQuestionTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [tourCompleted, status, countdown, sessionTimer]);

  const hasStartedListeningRef = useRef(false);

  // Reset question timer and countdown when question changes
  useEffect(() => {
    if (currentQuestion) {
      setQuestionTimer(120);
      setCountdown(null); // reset so countdown starts fresh
      hasStartedListeningRef.current = false;
      // Track in history
      setQuestionHistory(prev => {
        const exists = prev.find(h => h.index === currentQuestion.index);
        if (!exists) return [...prev, { index: currentQuestion.index, question: currentQuestion.question, reason: currentQuestion.reason }];
        return prev;
      });
    }
  }, [currentQuestion?.index]);

  // Chia nhóm câu hỏi lộ trình
  const getRoadmapGroups = (total: number) => {
    const q1 = Math.floor(total * 0.16) || 1; // VD: 2/12
    const q2 = q1 + (Math.floor(total * 0.34) || 3); // VD: 4/12
    const q3 = q2 + (Math.floor(total * 0.25) || 2); // VD: 3/12
    return [
      { name: 'PHÙ HỢP VĂN HÓA', startIndex: 0, endIndex: q1 },
      { name: 'KỸ NĂNG KỸ THUẬT', startIndex: q1, endIndex: q2 },
      { name: 'HÀNH VI', startIndex: q2, endIndex: q3 },
      { name: 'GIẢI QUYẾT VẤN ĐỀ', startIndex: q3, endIndex: total }
    ].filter(g => g.startIndex < g.endIndex);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (status === 'active' && tourCompleted && countdown === null && !isSpeaking && !hasStartedListeningRef.current) {
      setCountdown(5);
    }
  }, [status, tourCompleted, countdown, isSpeaking]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0 && status === 'active' && !isSpeaking) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && status === 'active' && !isSpeaking) {
      hasStartedListeningRef.current = true;
      startListening();
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown, status, isSpeaking]);

  useEffect(() => {
    if (questionTimer === 0 && status !== 'submitting' && status !== 'error' && status !== 'loading') {
      document.getElementById('hidden-submit-btn')?.click();
    }
  }, [questionTimer, status]);

  useEffect(() => {
    if (!tourCompleted && status === 'active' && currentQuestion) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tourCompleted, status, currentQuestion]);

  // Anti-beacon hack: If react-joyride ignores disableBeacon, auto-click it
  useEffect(() => {
    if (runTour) {
      const clickBeacon = () => {
        const beacon = document.querySelector('button[title="Open the dialog"]') || document.querySelector('[class*="beacon"] button') || document.querySelector('.react-joyride__beacon');
        if (beacon) {
          (beacon as HTMLElement).click();
        }
      };
      const interval = setInterval(clickBeacon, 100);
      setTimeout(() => clearInterval(interval), 3000); // stop trying after 3 seconds
      return () => clearInterval(interval);
    }
  }, [runTour]);
  
  const tourSteps: any[] = [
    {
      target: '#hints-panel-step',
      content: 'Nhấn vào đây để xem gợi ý trả lời theo phương pháp STAR: Tình huống, Nhiệm vụ, Hành động và Kết quả.',
      title: 'Gợi ý trả lời',
      placement: 'right',
      disableBeacon: true
    },
    {
      target: '#record-btn-step',
      content: 'Khi sẵn sàng, nhấn nút này để bắt đầu ghi âm câu trả lời của bạn.',
      title: 'Bắt đầu trả lời',
      placement: 'top',
      disableBeacon: true
    },
    {
      target: '#submit-btn-step',
      content: 'Sau khi trả lời xong, nhấn nút này để gửi và chuyển sang câu tiếp theo. Chúc bạn phỏng vấn thành công!',
      title: 'Gửi câu trả lời',
      placement: 'top',
      disableBeacon: true
    }
  ];

  const handleTourCallback = (data: any) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status) || action === 'close') {
      setRunTour(false);
      setTourCompleted(true);
      if (dontShowAgain) {
        localStorage.setItem('hideInterviewTour', 'true');
      }
    }
  };
  const [error, setError] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(true);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const noAnswerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const submittingRef = useRef(false);
  const answerRef = useRef('');
  
  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  // Camera và Audio đã được chuyển lên trên

  const recognitionRef = useRef<any>(null);
  const transcriptOffset = useRef('');
  const isIntentionalStopRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswer((transcriptOffset.current ? transcriptOffset.current + ' ' : '') + currentTranscript);
        
        // Cancel 10s no-answer timer
        if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
      };

      recognition.onend = () => {
        if (statusRef.current === 'listening' && !isIntentionalStopRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Lỗi khi khởi động lại recognition', e);
          }
        } else {
          setStatus(prev => {
            if (prev === 'listening') return 'active';
            return prev;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Trình duyệt chặn Micro. Bạn vẫn có thể gõ câu trả lời vào khung bên dưới.');
          setStatus('active');
        }
      };

      recognitionRef.current = recognition;
    }

    void loadInitialQuestion();
    startCamera();
    return () => {
      stopCamera();
      isIntentionalStopRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
    };
  }, [id, autoSubmit]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    transcriptOffset.current = answerRef.current;
    isIntentionalStopRef.current = false;
    try {
      recognitionRef.current.start();
      setStatus('listening');
      setError('');
      
      // Bắt đầu ghi hình khi bắt đầu lắng nghe
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        videoChunksRef.current = [];
        mediaRecorderRef.current.start(1000); // slice data every 1s
      }

      // Remove 10s no-answer timer to let user think as long as they want
    } catch (err) {
      console.error(err);
    }
  };

  const isFetchingTTSRef = useRef(false);

  const speakText = async (text: string) => {
    if (isFetchingTTSRef.current) return;
    try {
      isFetchingTTSRef.current = true;
      setIsSpeaking(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await api.post('/ai/tts', { text }, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
      startListening();
    } finally {
      isFetchingTTSRef.current = false;
    }
  };

  const lastSpokenIndex = useRef<number>(-1);

  useEffect(() => {
    if (currentQuestion && lastSpokenIndex.current !== currentQuestion.index && tourCompleted) {
      lastSpokenIndex.current = currentQuestion.index;
      const textToSpeak = currentQuestion.reply 
        ? `${currentQuestion.reply}. Câu hỏi tiếp theo: ${currentQuestion.question}` 
        : currentQuestion.question;
      speakText(textToSpeak);
    }
  }, [currentQuestion?.index, tourCompleted]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Trình duyệt chặn Camera/Micro. Vui lòng truy cập bằng localhost hoặc cấu hình HTTPS.');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      
      // Khởi tạo MediaRecorder để lưu video cục bộ
      try {
        const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) videoChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn('MediaRecorder not supported for video/webm:', err);
        // Fallback for Safari if needed
        try {
          const fallbackRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/mp4' });
          fallbackRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) videoChunksRef.current.push(e.data);
          };
          mediaRecorderRef.current = fallbackRecorder;
        } catch (e2) {
          console.error('Cannot init MediaRecorder');
        }
      }
    } catch (err) {
      setError('Vui lòng cấp quyền Camera/Micro trên trình duyệt để tiếp tục.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const loadInitialQuestion = async () => {
    try {
      const res = await api.get(`/interviews/${id!}/result`);
      if (res.data.status === 'completed') {
        navigate(`/interview/${id!}/result`);
        return;
      }
      if (res.data.predefinedQuestions) {
        setPredefinedQuestions(res.data.predefinedQuestions);
      }
      const stored = sessionStorage.getItem(`interview_q_${id}`);
      if (stored) {
        setCurrentQuestion(JSON.parse(stored) as CurrentQuestion);
      }
      setStatus('active');
    } catch {
      setError('Không thể tải phiên phỏng vấn.');
      setStatus('error');
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(`interview_q_${id}`);
    if (stored) {
      try {
        setCurrentQuestion(JSON.parse(stored) as CurrentQuestion);
        if (status === 'loading') setStatus('active');
      } catch {
        if (status === 'loading') setStatus('active');
      }
    }
  }, [id]);

  const handleFallbackSubmit = async () => {
    // Gọi khi hết 10s mà không có câu trả lời
    setAnswer("Tôi không có câu trả lời cho câu hỏi này, vui lòng chuyển câu tiếp theo.");
    setTimeout(() => {
      document.getElementById('hidden-submit-btn')?.click();
    }, 100);
  };

  const handleSubmitAnswer = async () => {
    if (submittingRef.current) return;
    
    let finalAnswer = answerRef.current.trim();
    if (!finalAnswer) {
      if (questionTimer === 0) {
        finalAnswer = "Thí sinh không đưa ra câu trả lời.";
      } else {
        setError('Vui lòng nhập hoặc ghi âm câu trả lời của bạn trước khi nộp.');
        return;
      }
    }

    submittingRef.current = true;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);

    isIntentionalStopRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Ngưng ghi hình và lưu vào IndexedDB
    let stopVideoPromise = Promise.resolve();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      stopVideoPromise = new Promise<void>((resolve) => {
        mediaRecorderRef.current!.onstop = async () => {
          const mimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
          const blob = new Blob(videoChunksRef.current, { type: mimeType });
          await saveVideo(id!, currentQuestion?.index ?? 0, blob);
          videoChunksRef.current = [];
          resolve();
        };
        mediaRecorderRef.current!.stop();
      });
    }
    
    setStatus('submitting');
    setError('');

    try {
      await stopVideoPromise; // Wait for video to be saved locally
      const res = await api.post(`/interviews/${id!}/answer`, { answer: finalAnswer });

      if (res.data.completed) {
        sessionStorage.removeItem(`interview_q_${id}`);
        navigate(`/interview/${id!}/result`);
        return;
      }

      const nextQ = res.data.nextQuestion as CurrentQuestion;
      sessionStorage.setItem(`interview_q_${id}`, JSON.stringify(nextQ));
      setCurrentQuestion(nextQ);
      setAnswer('');
      setStatus('active');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
      setStatus('active');
    } finally {
      submittingRef.current = false;
    }
  };

  if (status === 'loading' || (status === 'active' && !currentQuestion)) {
    return (
      <div className="page-stack">
        <div className="panel-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="spin-icon" />
          <p style={{ marginTop: '1rem' }}>Đang thiết lập phòng phỏng vấn...</p>
        </div>
      </div>
    );
  }

  if (status === 'error' && !currentQuestion) {
    return (
      <div className="page-stack">
        <div className="panel-card error-text">{error || 'Không tìm thấy phiên phỏng vấn.'}</div>
      </div>
    );
  }

  const q = currentQuestion!;
  
  const CustomTooltip = ({
    index,
    step,
    backProps,
    primaryProps,
    tooltipProps,
    isLastStep,
  }: any) => (
    <div {...tooltipProps} style={{
      background: '#1a1625',
      borderRadius: '12px',
      padding: '20px',
      width: '320px',
      color: '#fff',
      boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{step.title}</h3>
      <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>{step.content}</p>
      
      {isLastStep && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={dontShowAgain}
            onChange={(e) => {
              setDontShowAgain(e.target.checked);
              if (e.target.checked) {
                localStorage.setItem('hideInterviewTour', 'true');
              } else {
                localStorage.removeItem('hideInterviewTour');
              }
            }}
            style={{ width: '16px', height: '16px', flexShrink: 0, margin: 0, padding: 0, accentColor: '#6366f1', cursor: 'pointer' }}
          />
          Không hiển thị lần sau
        </label>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{index + 1} of {tourSteps.length}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          {index > 0 && (
            <button {...backProps} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              &larr; Previous
            </button>
          )}
          <button 
            {...primaryProps} 
            onClick={(e) => {
              if (isLastStep) {
                setRunTour(false);
                setTourCompleted(true);
              }
              if (primaryProps.onClick) {
                primaryProps.onClick(e);
              }
            }}
            style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
            {isLastStep ? 'Bắt đầu' : 'Tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="live-interview-shell">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        showSkipButton={false}
        disableOverlayClose={true}
        spotlightPadding={8}
        tooltipComponent={CustomTooltip}
        locale={{ back: t('session.tourPrevious', 'Trước'), close: t('session.tourClose', 'Đóng'), last: t('session.tourStart', 'Bắt đầu'), next: t('session.tourNext', 'Tiếp theo'), skip: t('session.tourSkip', 'Bỏ qua') }}
        styles={{
          options: {
            primaryColor: '#6366f1',
            backgroundColor: '#1e1b2e',
            textColor: '#fff',
            arrowColor: '#1a1625',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          spotlight: {
            // borderRadius is not valid for SVG element
          }
        }}
        callback={handleTourCallback}
      />

        {/* LEFT PANEL: HINTS - collapsible */}
        <aside id="hints-panel-step" className="live-panel hints-panel" style={{ width: hintsOpen ? '320px' : '0px', minWidth: hintsOpen ? '320px' : '0px', background: '#13111c', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', transition: 'min-width 0.3s ease, width 0.3s ease' }}>
          {/* Collapsible Tab */}
          <button onClick={() => setHintsOpen(p => !p)} style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', background: '#13111c', border: '1px solid rgba(255,255,255,0.05)', borderLeft: 'none', borderRadius: '0 14px 14px 0', padding: '0.9rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', zIndex: 20, whiteSpace: 'nowrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.82 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#e2e8f0', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '1px' }}>Gợi ý</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={hintsOpen ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/></svg>
          </button>

          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ width: '30px', height: '30px', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.82 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Gợi ý trả lời</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            {/* Skeleton loading while AI generates next hints */}
            {status === 'submitting' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', width: '55%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                {[1,2,3,4].map(k => (
                  <div key={k} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ height: '11px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <div style={{ height: '11px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[1,2,3].map(k => <div key={k} style={{ height: '11px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', width: k === 3 ? '60%' : '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
                </div>
              </div>
            ) : (
              <>
                {/* CẤU TRÚC CÂU TRẢ LỜI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>CẤU TRÚC CÂU TRẢ LỜI</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '14px', bottom: '14px', width: '1.5px', background: 'rgba(255,255,255,0.05)' }}></div>

                  {/* START */}
                  <div style={{ display: 'flex', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '4px', padding: '1px 5px', fontSize: '0.58rem', fontWeight: 'bold', height: 'fit-content', flexShrink: 0, marginTop: '2px' }}>START</div>
                    <div style={{ flex: 1, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      {q.reason || 'Bắt đầu bằng việc bày tỏ sự hào hứng và niềm đam mê.'}
                    </div>
                  </div>

                  {/* AI-generated focus points */}
                  {q.suggestedFocus?.map((focus, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, alignSelf: 'center' }}>{focus}</div>
                    </div>
                  ))}

                  {/* END */}
                  <div style={{ display: 'flex', gap: '0.85rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', borderRadius: '4px', padding: '1px 5px', fontSize: '0.58rem', fontWeight: 'bold', height: 'fit-content', flexShrink: 0, marginTop: '2px' }}>END</div>
                    <div style={{ flex: 1, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      Tái khẳng định sự cam kết và mong muốn đóng góp lâu dài của bạn.
                    </div>
                  </div>
                </div>

                {/* Time distribution note */}
                <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.7rem 0.85rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic' }}>
                    Phân bổ thời gian hợp lý cho từng phần, đảm bảo bạn nói đủ ý trong vòng 120 giây.
                  </div>
                </div>

                {/* MẸO QUAN TRỌNG - AI-generated from challenge field */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '1.25rem 0 0.75rem 0' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>MẸO QUAN TRỌNG</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {(q.challenge ? q.challenge.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10).slice(0, 4) : [
                    'Sử dụng ngôn ngữ cơ thể tự nhiên.',
                    'Giọng nói tự tin, ngắt nghỉ đúng chỗ.',
                    'Kết nối với mục tiêu của công ty.'
                  ]).map((tip, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.55 }}>
                      <span style={{ color: '#eab308', marginTop: '1px', flexShrink: 0 }}>•</span>
                      <span>{tip.trim()}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

      {/* CENTER PANEL: LIVE STAGE */}
      <main className="live-panel" style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <span style={{ color: '#a1a1aa' }}>💼</span>
            <span style={{ fontWeight: 600 }}>Technical Trainee</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff' }}>
            <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
            <span style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{formatTime(sessionTimer)}</span>
          </div>
        </div>

        <div className="camera-stage" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center', flex: 1, maxHeight: '400px' }}>
          <div id="interviewer-avatar-step" className="avatar-card" style={{ width: '320px', height: '320px', borderRadius: '24px', padding: 0, overflow: 'hidden', position: 'relative', background: '#1a1625', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <img src="/assets/interviewer_avatar.png" alt="Interviewer Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="participant-tag" style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.5rem 1.5rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`indicator ${isSpeaking ? 'speaking' : ''}`} style={{ background: '#3b82f6' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>SpeakAI</span>
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.18 4.18l15.64 15.64M19.82 4.18L4.18 19.82"/></svg>
          </div>
          <div id="camera-card-step" className="camera-card" style={{ width: '320px', height: '320px', borderRadius: '24px', padding: 0, overflow: 'hidden', position: 'relative', background: '#1a1625', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            {stream ? (
              <video 
                ref={(el) => {
                  if (el && el.srcObject !== stream) {
                    el.srcObject = stream;
                  }
                }} 
                autoPlay playsInline muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ color: '#a1a1aa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 1rem', textAlign: 'center' }}>
                <MicOff size={32} style={{ marginBottom: '1rem' }} />
                <span>{error || 'Không tìm thấy Camera'}</span>
              </div>
            )}
            <div className="participant-tag" style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={18} color={status === 'listening' ? '#10b981' : '#a1a1aa'} />
            </div>
          </div>
        </div>

        <div className="transcript-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <div id="transcript-step" style={{ background: '#13111c', padding: '1.5rem 2rem', borderRadius: '30px', display: 'flex', gap: '1.5rem', alignItems: 'center', width: '100%', maxWidth: '800px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
             <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
              <div className="indicator speaking" style={{ background: '#ef4444', width: '8px', height: '8px' }} />
              {formatTime(questionTimer)}
            </div>
             <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '24px' }}></div>
             <div style={{ flex: 1, fontSize: '1.2rem', lineHeight: 1.5, filter: countdown !== null && countdown > 0 ? 'blur(2px)' : 'none', transition: 'filter 0.3s ease' }}>
               {tourCompleted ? q.question : (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#64748b' }}>Đang đợi bắt đầu...</span>
                  </div>
               )}
             </div>

             {/* Countdown Overlay */}
             {countdown !== null && countdown > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0, 0, 0, 0.75)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  color: 'white',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', fontWeight: 600 }}>Hãy suy nghĩ câu trả lời của bạn...</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="36" height="36" viewBox="0 0 36 36" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset={94.2 * (1 - countdown / 5)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                      </svg>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{countdown}</span>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Tự động ghi âm sau</span>
                  </div>
                </div>
             )}
          </div>
          
          <div className="live-controls" style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', background: '#13111c', padding: '0.5rem 1rem', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button id="record-btn-step" type="button" className="record-btn" onClick={startListening} disabled={status !== 'active'} style={{ background: status === 'active' ? '#10b981' : '#064e3b', color: status === 'active' ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', borderRadius: '30px', padding: '0.75rem 2rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', cursor: status === 'active' ? 'pointer' : 'not-allowed' }}>
              <Mic size={18} /> Bắt đầu ghi âm
            </button>
            <button id="submit-btn-step" type="button" className="submit-answer-btn" onClick={() => document.getElementById('hidden-submit-btn')?.click()} disabled={status !== 'listening'} style={{ background: status === 'listening' ? '#6366f1' : '#312e81', color: status === 'listening' ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', borderRadius: '30px', padding: '0.75rem 2rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', cursor: status === 'listening' ? 'pointer' : 'not-allowed' }}>
              {status === 'listening' ? <span className="indicator speaking" style={{ background: 'white', width: '10px', height: '10px' }} /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />}
              Nộp câu trả lời
            </button>
            {status === 'submitting' && (
               <div style={{ position: 'absolute', top: '-40px', background: '#6366f1', color: 'white', borderRadius: '30px', padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                 <Loader2 size={16} className="spin-icon" /> Đang phân tích...
               </div>
            )}
            <button type="button" onClick={() => navigate('/dashboard')} title="Rời phòng" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <PhoneOff size={20} />
            </button>
          </div>
          <button id="hidden-submit-btn" style={{ display: 'none' }} onClick={handleSubmitAnswer}></button>
        </div>
      </main>

      {/* RIGHT PANEL: ROADMAP */}
      <aside className="live-panel steps-panel" style={{ width: '300px', minWidth: '300px', background: '#13111c', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Lộ trình phỏng vấn</h3>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold' }}>
            Bước {q.index + 1} / {q.total}
          </div>
        </div>
        <div className="live-panel-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {getRoadmapGroups(q.total).map((group, gIdx) => {
             const items = Array.from({ length: q.total }).map((_, i) => i).filter(i => i >= group.startIndex && i < group.endIndex);
             if (items.length === 0) return null;
             const completedInGroup = items.filter(i => i < q.index).length;

             return (
                <div key={gIdx} style={{ marginBottom: '1.75rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', color: '#4b5563', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        {group.name}
                      </div>
                      <span>{completedInGroup}/{items.length}</span>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '11px', top: '12px', bottom: '12px', width: '2px', background: 'rgba(255,255,255,0.04)' }}></div>
                      
                      {items.map(i => {
                        let stepStatus = '';
                        if (i < q.index) stepStatus = 'completed';
                        else if (i === q.index) stepStatus = 'active';

                        const historyItem = questionHistory.find(h => h.index === i);
                        const isVisible = stepStatus === 'completed' || stepStatus === 'active';

                        return (
                          <div key={i} style={{ display: 'flex', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ 
                               width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                               background: stepStatus === 'active' ? '#6366f1' : stepStatus === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                               border: stepStatus === 'completed' ? '1.5px solid #10b981' : stepStatus === 'active' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                               color: stepStatus === 'active' ? 'white' : stepStatus === 'completed' ? '#10b981' : '#4b5563',
                               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold',
                            }}>
                               {stepStatus === 'completed' ? <CheckCircle2 size={13} /> : (i + 1)}
                            </div>
                            <div style={{ 
                              flex: 1,
                              background: stepStatus === 'active' ? 'rgba(255,255,255,0.03)' : 'transparent',
                              padding: stepStatus === 'active' ? '0.65rem' : '0.1rem 0',
                              borderRadius: '8px',
                              border: stepStatus === 'active' ? '1px solid rgba(99,102,241,0.2)' : 'none',
                              filter: isVisible ? 'none' : 'blur(4px)',
                              userSelect: isVisible ? 'auto' : 'none',
                            }}>
                               {stepStatus === 'active' && (
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                   <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{group.name}</span>
                                   <span style={{ color: '#ef4444', fontSize: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                     <div style={{ width: '5px', height: '5px', background: '#ef4444', borderRadius: '50%' }}></div>
                                     ĐANG LÀM
                                   </span>
                                 </div>
                               )}
                               <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.82rem', color: isVisible ? (stepStatus === 'active' ? '#fff' : '#e2e8f0') : '#4b5563', fontWeight: stepStatus === 'active' ? 700 : 500, lineHeight: 1.3 }}>
                                 {(() => {
                                   if (!isVisible) return 'Câu hỏi đang chờ...';
                                   const predefinedQ = predefinedQuestions[i];
                                   const rawTitle = predefinedQ?.reason || historyItem?.reason || predefinedQ?.question || historyItem?.question || 'Đang xử lý...';
                                   return rawTitle.slice(0, 70) + (rawTitle.length > 70 ? '...' : '');
                                 })()}
                               </h4>
                               {stepStatus === 'completed' && (
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
                                   <CheckCircle2 size={11} color="#10b981" />
                                   <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Hoàn thành</span>
                                 </div>
                               )}
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
             );
          })}
        </div>
      </aside>
    </div>
  );
}
