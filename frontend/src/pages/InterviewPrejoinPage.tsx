import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, Video, VideoOff, Settings, PlayCircle, Loader2, Lightbulb, CheckCircle2, ArrowLeft, ChevronDown, Bot, FileText, User } from 'lucide-react';
import { api } from '../lib/api';
import './InterviewPrejoinPage.css';

export function InterviewPrejoinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const [deviceError, setDeviceError] = useState('');
  
  // States cho Layout mới
  const [session, setSession] = useState<any>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [audioDetected, setAudioDetected] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(1); // 1=room ready, 2=script loading, 3=agent joining
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Fetch session details
    api.get(`/interviews/${id}/result`)
      .then(res => setSession(res.data))
      .catch(err => console.error(err));
      
    getDevices();
  }, [id]);

  useEffect(() => {
    startCameraAndMic(selectedMic, isCameraOn);
    return () => stopMedia();
  }, [selectedMic, isCameraOn]);

  const getDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); // Ask permission first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      if (audioInputs.length > 0) {
        setSelectedMic(audioInputs[0].deviceId);
      }
    } catch (err) {
      setDeviceError('Không thể lấy danh sách thiết bị. Vui lòng cấp quyền.');
    }
  };

  const startCameraAndMic = async (micId: string, camera: boolean) => {
    stopMedia();
    setDeviceError('');
    try {
      const constraints: MediaStreamConstraints = {
        audio: micId ? { deviceId: { exact: micId } } : true,
        video: camera
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setupAudioMeter(mediaStream);
    } catch (err) {
      // Nếu tắt camera, vẫn cần lấy luồng audio để test mic
      if (!camera && micId) {
        try {
           const audioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: micId } } });
           setStream(audioStream);
           setupAudioMeter(audioStream);
        } catch (e) {
           setDeviceError('Không thể kết nối Micro.');
        }
      } else {
        setDeviceError('Vui lòng cấp quyền Camera và Micro.');
      }
    }
  };

  const setupAudioMeter = (mediaStream: MediaStream) => {
    try {
      // Only proceed if there is an audio track
      if (mediaStream.getAudioTracks().length === 0) return;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      let loudFrames = 0;

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        
        const currentVol = Math.min(100, Math.max(0, (average / 128) * 100));
        setMicVolume(currentVol);
        
        if (currentVol > 30) {
           loudFrames++;
           if (loudFrames > 10) {
             setAudioDetected(true);
           }
        } else {
           loudFrames = 0;
        }
        
        animationRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();
    } catch (err) {
      console.error('Audio meter error:', err);
    }
  };

  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const handleJoin = async () => {
    if (!audioDetected) return;
    setIsGeneratingScript(true);
    setLoadingProgress(0);
    setLoadingStep(2); // Bước 1 (phòng) đã xong, sang bước 2 (kịch bản)

    // Smooth progress animation: tăng dần lên 90% trong lúc chờ API
    let progress = 0;
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        // Tăng nhanh ở đầu, chậm dần khi gần 90%
        const remaining = 90 - prev;
        const increment = Math.max(0.3, remaining * 0.04);
        const next = Math.min(90, prev + increment);
        progress = next;
        return next;
      });
    }, 200);

    try {
      const res = await api.post(`/interviews/${id}/generate-script`);
      
      // Dừng interval, hoàn thành 100%
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setLoadingProgress(100);
      
      if (res.data.currentQuestion) {
        sessionStorage.setItem(`interview_q_${id}`, JSON.stringify(res.data.currentQuestion));
      }

      // Bước 3: Agent tham gia
      setTimeout(() => {
        setLoadingStep(3);
        setTimeout(() => {
          stopMedia();
          navigate(`/interview/${id}`);
        }, 1000);
      }, 600);
      
    } catch (err) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsGeneratingScript(false);
      setLoadingProgress(0);
      setLoadingStep(1);
      setDeviceError('Có lỗi xảy ra khi tạo kịch bản, vui lòng thử lại.');
    }
  };

  // Generate visualizer bars (50 bars)
  const visualizerBars = Array.from({ length: 40 }).map((_, i) => {
    // Math to make a wave shape based on mic volume
    const center = 20;
    const distance = Math.abs(i - center);
    const maxBarHeight = Math.max(4, 30 - distance * 1.5);
    const activeHeight = Math.max(4, (micVolume / 100) * maxBarHeight);
    
    // Add some random noise for realism
    const noise = (Math.random() * 0.4 + 0.8);
    const finalHeight = micVolume > 5 ? activeHeight * noise : 4;

    return (
      <div 
        key={i} 
        className="visualizer-bar" 
        style={{ height: `${finalHeight}px`, opacity: micVolume > 5 ? 1 : 0.3 }}
      />
    );
  });

  if (!session) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0914' }}>
        <Loader2 size={40} className="spinner" color="#4f46e5" />
      </div>
    );
  }

  const jobTitle = session.topic || session.specialization || 'Ứng viên Vị trí';
  const company = session.company || 'Công ty Công nghệ';
  const totalQuestions = session.totalQuestions || 10;
  const estDuration = totalQuestions * 2;
  const difficultyLabel = session.difficulty === 'hard' ? 'Khó' : session.difficulty === 'easy' ? 'Dễ' : 'Trung bình';

  return (
    <div className="prejoin-page-wrapper">
      <div className="prejoin-modal">
        
        {/* Left Column */}
        <div className="prejoin-left">
          <div className="prejoin-logo">
            <div style={{ display: 'flex', gap: '2px' }}>
              <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '2px' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '2px' }}></div>
            </div>
            SpeakAI
          </div>

          <div className="prejoin-badges">
            <span className="prejoin-badge">
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }}></div>
              PHỎNG VẤN
            </span>
            <span className={`prejoin-badge difficulty ${session.difficulty}`}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
              {difficultyLabel}
            </span>
          </div>

          <div className="prejoin-job-info">
            <div className="prejoin-company-logo">
              <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.2rem', fontStyle: 'italic' }}>VN</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="prejoin-job-title" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal', lineHeight: '1.3' }}>{jobTitle}</h2>
              <p className="prejoin-company-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company}</p>
            </div>
          </div>

          <div className="prejoin-stats-row">
            <div className="prejoin-stat-card">
              <div className="prejoin-stat-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                CÂU HỎI
              </div>
              <div className="prejoin-stat-value">{totalQuestions}</div>
            </div>
            <div className="prejoin-stat-card">
              <div className="prejoin-stat-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                THỜI GIAN
              </div>
              <div className="prejoin-stat-value">~{estDuration}m</div>
            </div>
          </div>

          <div className="prejoin-stat-card">
             <div className="prejoin-stat-label" style={{ marginBottom: '0.2rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l6 6"></path><path d="M4 14l6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="M22 22l-5-10-5 10"></path><path d="M14 18h6"></path></svg>
                NGÔN NGỮ PHỎNG VẤN
             </div>
             <div className="prejoin-stat-value" style={{ fontSize: '1.1rem' }}>VN Tiếng Việt</div>
          </div>

          <div className="prejoin-tips-card">
            <div className="prejoin-tips-title">
              <Lightbulb size={18} color="#94a3b8" /> Mẹo hay
            </div>
            <ul className="prejoin-tips-list">
              <li>Tìm không gian yên tĩnh</li>
              <li>Nói rõ ràng và đều đặn</li>
              <li>Sử dụng phương pháp STAR cho câu hỏi hành vi</li>
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="prejoin-right">
          <div className="prejoin-video-container">
            <div className="prejoin-live-badge">
              <div className="live-dot"></div> LIVE
            </div>
            {stream && isCameraOn ? (
              <video 
                ref={(el) => {
                  if (el && el.srcObject !== stream) {
                    el.srcObject = stream;
                  }
                }} 
                autoPlay playsInline muted 
                className="prejoin-video" 
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                <VideoOff size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <span>Camera đã tắt</span>
              </div>
            )}
          </div>

          <div className="prejoin-controls-row">
            <div className="prejoin-control-box">
              <div className="prejoin-control-label">
                <Mic size={14} /> CHỌN MICRO
              </div>
              <div className="prejoin-select-wrapper">
                <select 
                  className="prejoin-select"
                  value={selectedMic}
                  onChange={e => setSelectedMic(e.target.value)}
                >
                  {audioDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.substring(0, 5)}...`}
                    </option>
                  ))}
                  {audioDevices.length === 0 && <option value="">Mặc định</option>}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} pointerEvents="none" />
              </div>
            </div>
            
            <div className="prejoin-control-box">
              <div className="prejoin-control-label">
                <Video size={14} /> CAMERA
              </div>
              <div className="prejoin-toggle-row">
                <div className="prejoin-toggle-text">
                  <Video size={16} color={isCameraOn ? "#818cf8" : "#94a3b8"} /> Bật ghi hình
                </div>
                <label className="switch">
                  <input type="checkbox" checked={isCameraOn} onChange={e => setIsCameraOn(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="prejoin-audio-test">
            <div className="prejoin-audio-status">
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8' }}></div>
              Đang nghe — Hãy nói để kiểm tra
            </div>
            <div className="prejoin-visualizer">
              {visualizerBars}
            </div>
          </div>

          <div className="prejoin-divider"></div>

          <div className="prejoin-footer">
            <div className="prejoin-footer-stats">
              <span>KIỂM TRA ÂM THANH</span>
              <span>{Math.round((micVolume / 100) * 100 - 100)} dB</span>
            </div>
            <div className="prejoin-actions">
              <button className="prejoin-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Quay lại
              </button>
              <button 
                className={`prejoin-start-btn ${audioDetected ? 'ready' : ''}`}
                onClick={handleJoin}
                disabled={!audioDetected}
              >
                {audioDetected ? (
                  <>Bắt đầu phỏng vấn <PlayCircle size={18} /></>
                ) : (
                  <><PlayCircle size={18} /> Đang chờ âm thanh...</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* OVERLAY LOADING MODAL */}
      {isGeneratingScript && (
        <div className="prejoin-loading-overlay">
          <div className="prejoin-loading-modal">
             <div className="loading-header">
                <div className="loading-icon"><Bot size={32} color="#818cf8" /></div>
                <h3>Đang chuẩn bị phòng phỏng vấn</h3>
                <p>Vui lòng chờ trong giây lát...</p>
             </div>
             
             <div className="loading-body">
                <div className="loading-step">
                  <div className="step-icon done"><Settings size={16} /></div>
                  <div className="step-text">
                     <h4>Chuẩn bị phòng phỏng vấn</h4>
                     <p className="success">Phòng đã sẵn sàng</p>
                  </div>
                  <div className="step-status"><CheckCircle2 size={18} color="#10b981" /></div>
                </div>

                {/* Bước 2 — đang xử lý kịch bản */}
                <div className="loading-step">
                  <div className={`step-icon ${loadingStep >= 3 ? 'done' : 'active'}`}>
                     <FileText size={16} />
                  </div>
                  <div className="step-text">
                     <h4>Chuẩn bị kịch bản phỏng vấn</h4>
                     <p className={loadingStep >= 3 ? 'success' : ''}>{loadingStep >= 3 ? 'Kịch bản đã sẵn sàng' : 'Đang xử lý...'}</p>
                  </div>
                  <div className="step-status">
                    {loadingStep >= 3 ? <CheckCircle2 size={18} color="#10b981" /> : <Loader2 size={18} className="spinner" color="#6366f1" />}
                  </div>
                </div>

                {/* Bước 3 — agent tham gia */}
                <div className="loading-step" style={{ borderBottom: 'none' }}>
                  <div className={`step-icon ${loadingStep >= 3 ? 'active' : ''}`}>
                     <User size={16} />
                  </div>
                  <div className="step-text">
                     <h4>Agent tham gia phỏng vấn</h4>
                     <p>{loadingStep >= 3 ? 'Đang kết nối Agent...' : 'Đang chờ...'}</p>
                  </div>
                  <div className="step-status">
                    {loadingStep >= 3 ? <Loader2 size={18} className="spinner" color="#6366f1" /> : <div className="empty-circle"></div>}
                  </div>
                </div>

                <div className="progress-container">
                   <div className="progress-header">
                      <span>{loadingStep === 2 ? 'Đang chuẩn bị kịch bản...' : 'Đang kết nối Agent...'}</span>
                      <span>{Math.round(loadingProgress)}%</span>
                   </div>
                   <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${loadingProgress}%` }}></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
