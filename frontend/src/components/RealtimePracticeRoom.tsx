import {
  Bot,
  LoaderCircle,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Sparkles,
  Volume2,
  Waves,
  WandSparkles
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { api } from '../lib/api';
import type { Difficulty, PracticeType } from '../types';

type RealtimePracticeRoomProps = {
  practiceType: PracticeType;
  difficulty: Difficulty;
  topic: string;
};

type VoiceMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const practiceLabels: Record<PracticeType, string> = {
  presentation: 'Thuyết trình',
  interview: 'Phỏng vấn'
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó'
};

const createMessageId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Hỗ trợ SpeechRecognition (Chrome, Edge, Safari)
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function RealtimePracticeRoom({ practiceType, difficulty, topic }: RealtimePracticeRoomProps) {
  const [status, setStatus] = useState<'idle' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
  const [phase, setPhase] = useState('Chưa mở phòng hội thoại');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [userDraft, setUserDraft] = useState('');
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Refs cho Recognition và Synthesis
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const isComponentMounted = useRef(true);

  const browserSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      stopAll();
    };
  }, []);

  const stopAll = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  };

  const appendMessage = (role: VoiceMessage['role'], text: string) => {
    const normalized = text.trim();
    if (!normalized) return;

    setMessages((current) => {
      return [...current.slice(-9), { id: createMessageId(), role, text: normalized }];
    });
  };

  // Hàm gọi AI lấy phản hồi
  const getAiResponse = async (userText: string, currentHistory: VoiceMessage[]) => {
    setStatus('thinking');
    setPhase('SpeakAI đang suy nghĩ...');

    try {
      // Format history cho API: { question, answer }
      // Lịch sử hiện tại: [Assistant(chào), User(trả lời), Assistant(hỏi), User(trả lời)...]
      const history = [];
      for (let i = 0; i < currentHistory.length; i += 2) {
        const assistantMsg = currentHistory[i];
        const userMsg = currentHistory[i + 1];
        if (assistantMsg && userMsg) {
          history.push({ question: assistantMsg.text, answer: userMsg.text });
        }
      }

      const response = await api.post('/ai/interview/next-question', {
        difficulty,
        history,
        targetRole: '', 
        topic
      });

      const nextQuestion = response.data.nextQuestion;
      const fullText = nextQuestion.reply 
        ? `${nextQuestion.reply} ${nextQuestion.question}` 
        : nextQuestion.question;

      appendMessage('assistant', fullText);
      speak(fullText);
    } catch (err: any) {
      setError('Không thể kết nối với trí tuệ nhân tạo. Hãy thử lại.');
      setStatus('ready');
    }
  };

  // Hàm đọc to văn bản
  const speak = (text: string) => {
    if (!synthesisRef.current) return;

    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = synthesisRef.current.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => {
      if (!isComponentMounted.current) return;
      setStatus('speaking');
      setAssistantSpeaking(true);
      setPhase('SpeakAI đang trả lời');
    };

    utterance.onend = () => {
      if (!isComponentMounted.current) return;
      setAssistantSpeaking(false);
      startListening(); 
    };

    utterance.onerror = () => {
      if (!isComponentMounted.current) return;
      setAssistantSpeaking(false);
      setStatus('ready');
      setPhase('Sẵn sàng cho lượt tiếp theo');
    };

    synthesisRef.current.speak(utterance);
  };

  // Hàm bắt đầu lắng nghe
  const startListening = () => {
    if (!browserSupported || isMuted || !isComponentMounted.current) {
      setStatus('ready');
      setPhase('SpeakAI đang lắng nghe (Micro tắt)');
      return;
    }

    stopAll();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'vi-VN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setStatus('listening');
      setPhase('Đang nghe bạn nói...');
      setUserDraft('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const final = event.results[i][0].transcript;
          setUserDraft(final);
          recognition.stop();
          handleUserSpeechDone(final);
          return;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setUserDraft(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('STT Error:', event.error);
      if (event.error !== 'no-speech') {
        setStatus('ready');
        setPhase('Không nghe rõ, vui lòng thử lại');
      } else {
        setStatus('ready');
        setPhase('Sẵn sàng cho lượt tiếp theo');
      }
    };

    recognition.onend = () => {
      if (status === 'listening') {
        setStatus('ready');
        setPhase('Sẵn sàng cho lượt tiếp theo');
      }
    };

    recognition.start();
  };

  const handleUserSpeechDone = (text: string) => {
    if (!text.trim()) return;
    appendMessage('user', text);
    setMessages(prev => {
      const newMessages = [...prev.slice(-9), { id: createMessageId(), role: 'user' as const, text }];
      getAiResponse(text, newMessages);
      return newMessages;
    });
    setUserDraft('');
  };

  const startRoom = () => {
    setError('');
    setMessages([]);
    setStatus('ready');
    setPhase('Phòng hội thoại đã sẵn sàng');
    
    const welcome = `Chào bạn! Tôi là SpeakAI. Chúng ta sẽ cùng luyện tập ${practiceLabels[practiceType].toLowerCase()} về chủ đề "${topic}". Bạn đã sẵn sàng chưa?`;
    appendMessage('assistant', welcome);
    speak(welcome);
  };

  const stopRoom = () => {
    stopAll();
    setStatus('idle');
    setPhase('Phiên hội thoại đã kết thúc');
    setMessages([]);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      if (recognitionRef.current) recognitionRef.current.stop();
    } else if (status === 'ready') {
      startListening();
    }
  };

  const statusLabel = 
    status === 'idle' ? 'Chưa mở phòng' : 
    status === 'listening' ? 'Đang nghe' : 
    status === 'thinking' ? 'Đang suy nghĩ' : 
    status === 'speaking' ? 'Đang trả lời' : 'Trực tuyến';

  const voicePanelTitle = 
    status === 'listening' ? 'SpeakAI đang lắng nghe' :
    status === 'thinking' ? 'Đang phân tích ý tưởng...' :
    status === 'speaking' ? 'SpeakAI đang phản hồi' :
    status === 'ready' ? 'Sẵn sàng hội thoại' : 'Phòng hội thoại Voice';

  return (
    <section className="panel-card realtime-room-card">
      <div className="realtime-room-header">
        <div>
          <p className="eyebrow">Phòng hội thoại giả lập Real-time (Free Mode)</p>
          <h3>Giao tiếp giọng nói với SpeakAI & Groq</h3>
        </div>
        <span className={`realtime-state-pill ${status === 'idle' ? '' : 'ready'}`}>
          <Radio size={14} className={status !== 'idle' ? 'spin' : ''} />
          {statusLabel}
        </span>
      </div>

      <div className="realtime-room-stage">
        <div className="realtime-room-core">
          <div className="realtime-core-topline">
            <span className={`realtime-core-dot ${status !== 'idle' ? 'ready' : ''}`} />
            <span>Voice studio (Browser STT/TTS)</span>
          </div>

          <div className="realtime-voice-card">
            <div className={`realtime-orb ${status === 'speaking' ? 'assistant-active' : ''} ${status === 'listening' ? 'user-active' : ''} ${status !== 'idle' ? 'connected' : ''}`}>
              <span className="realtime-orb-ring" />
              <span className="realtime-orb-center">SA</span>
            </div>

            <div className="realtime-voice-copy">
              <span>Hệ thống phản hồi tức thì</span>
              <strong>{voicePanelTitle}</strong>
              <p>{status === 'idle' ? 'Nhấn nút bên dưới để bắt đầu luyện nói miễn phí.' : phase}</p>
            </div>
          </div>

          <div className="realtime-core-metrics">
            <span>
              <Radio size={14} />
              {statusLabel}
            </span>
            <span>
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
              {isMuted ? 'Micro tắt' : 'Micro mở'}
            </span>
          </div>
        </div>

        <div className="realtime-room-console">
          <div className="realtime-phase-card">
            <strong>{phase}</strong>
            <p>{topic}</p>
          </div>

          <div className="realtime-status-grid">
            <article className="realtime-status-card">
              <span>Chế độ</span>
              <strong>{practiceLabels[practiceType]}</strong>
            </article>
            <article className="realtime-status-card">
              <span>Độ khó</span>
              <strong>{difficultyLabels[difficulty]}</strong>
            </article>
            <article className="realtime-status-card">
              <span>STT Engine</span>
              <strong>Browser Native</strong>
            </article>
            <article className="realtime-status-card">
              <span>LLM Engine</span>
              <strong>Groq / Llama 3</strong>
            </article>
            <article className="realtime-status-card">
              <span>TTS Engine</span>
              <strong>Web Speech</strong>
            </article>
            <article className="realtime-status-card">
              <span>Trạng thái</span>
              <strong>{isMuted ? 'Tạm dừng' : 'Đang chạy'}</strong>
            </article>
          </div>

          <div className="realtime-toolbar">
            <button type="button" className="primary-button" onClick={startRoom} disabled={status === 'listening' || status === 'thinking'}>
              <Sparkles size={18} />
              {status === 'idle' ? 'Bắt đầu hội thoại' : 'Làm mới phiên'}
            </button>
            <button type="button" className="ghost-button" onClick={toggleMute} disabled={status === 'idle'}>
              {isMuted ? <Mic size={16} /> : <MicOff size={16} />}
              {isMuted ? 'Bật micro' : 'Tắt micro'}
            </button>
            <button type="button" className="ghost-button" onClick={() => speak("Tôi đang lắng nghe bạn đây, hãy cứ tự nhiên nhé.")} disabled={status === 'idle' || status === 'speaking'}>
              <WandSparkles size={16} />
              AI nhắc nhở
            </button>
            <button type="button" className="ghost-button" onClick={stopRoom} disabled={status === 'idle'}>
              <PhoneOff size={16} />
              Kết thúc
            </button>
          </div>

          <div className="realtime-capability-row">
            <span className="badge-soft">
              <Bot size={14} />
              AI phản hồi bằng tiếng Việt
            </span>
            <span className="badge-soft">
              <Waves size={14} />
              Phát âm tự động từ trình duyệt
            </span>
            <span className="badge-soft">
              <Volume2 size={14} />
              Nhận diện giọng nói chính xác
            </span>
          </div>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="realtime-log-shell">
        <div className="realtime-log-head">
          <div>
            <p className="eyebrow">Dòng hội thoại</p>
            <h4>Lịch sử trò chuyện</h4>
          </div>
          <span className="badge-soft">
            {messages.length} lượt
          </span>
        </div>

        <div className="realtime-message-log">
          {!messages.length && !userDraft ? (
            <div className="realtime-empty-state">
              <p>Mở phòng và bắt đầu nói. SpeakAI sẽ phản hồi lại bằng giọng nói ngay trong phiên thông qua công nghệ STT/TTS miễn phí.</p>
            </div>
          ) : null}

          {messages.map((message) => (
            <article key={message.id} className={`realtime-message ${message.role}`}>
              <span>{message.role === 'assistant' ? 'SpeakAI' : 'Bạn'}</span>
              <strong>{message.text}</strong>
            </article>
          ))}

          {userDraft ? (
            <article className="realtime-message user draft">
              <span>Bạn (Đang nghe...)</span>
              <strong>{userDraft}</strong>
            </article>
          ) : null}
        </div>
      </div>

      {!browserSupported ? <p className="error-text">Trình duyệt của bạn không hỗ trợ công nghệ nhận diện giọng nói (STT). Hãy sử dụng Chrome hoặc Edge để trải nghiệm tốt nhất.</p> : null}

      <audio className="realtime-hidden-audio" />
    </section>
  );
}
