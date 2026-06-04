import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, Clock, BrainCircuit, Mic, UploadCloud, 
  ChevronRight, PlayCircle, FileText, CheckCircle2, Loader2, Sparkles, Zap 
} from 'lucide-react';
import { api } from '../lib/api';

const LANGUAGES = [
  { code: 'vi', label: 'VN', text: 'Tiếng Việt' },
  { code: 'en', label: 'US', text: 'English' },
  { code: 'ja', label: 'JP', text: '日本語' },
  { code: 'zh', label: 'CN', text: '中文' },
  { code: 'zh', label: 'CN', text: '中文' },
  { code: 'ko', label: 'KR', text: '한국어' }
];

interface CV {
  _id: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
}

export function InterviewPrepPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: setId } = useParams<{ id?: string }>();
  
  // Data from state (either Custom Mock or Predefined Set)
  const state = location.state as { 
    set?: any, 
    analysisContext?: any,
    jobDescription?: string,
    cvText?: string,
    language?: string
  } || {};

  const isFromSet = !!setId && !!state.set;
  const analysisContext = state.analysisContext;

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [language, setLanguage] = useState(state.language || 'vi');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [isDescOpen, setIsDescOpen] = useState(false);

  useEffect(() => {
    if (!isFromSet) return;
    const fetchCvs = async () => {
      try {
        const res = await api.get('/cvs');
        const list = res.data.cvs;
        setCvs(list);
        if (list.length > 0) {
          const defaultCv = list.find((c: CV) => c.isDefault) || list[0];
          setSelectedCvId(defaultCv._id);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchCvs();
  }, [isFromSet]);

  const title = isFromSet ? state.set?.title : analysisContext?.jobTitle || 'Vị trí Ứng tuyển';
  const company = isFromSet ? state.set?.company : 'Công ty Mock Interview';
  const duration = isFromSet ? state.set?.durationMinutes : 30;
  const questions = isFromSet ? state.set?.questionCount : 10;
  const difficulty = isFromSet ? state.set?.difficulty : 'medium';
  const jobDescriptionText = isFromSet ? state.set?.jobDescription : (state.jobDescription || analysisContext?.jobDescription || 'Chưa có mô tả chi tiết cho công việc này.');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const formData = new FormData();
      formData.append('difficulty', difficulty);
      formData.append('language', language);
      
      if (isFromSet) {
        if (state.set) {
          formData.append('jobDescription', JSON.stringify(state.set));
          formData.append('interviewSetId', state.set._id);
        }
        if (cvFile) {
          formData.append('cv', cvFile);
        } else if (selectedCvId) {
          formData.append('cvId', selectedCvId);
        }
      } else {
        if (state.analysisContext) {
          formData.append('analysisContext', JSON.stringify(state.analysisContext));
        }
        if (state.jobDescription) {
          formData.append('jdText', state.jobDescription);
        }
        if (state.cvText) {
          formData.append('cvText', state.cvText);
        }
      }

      const res = await api.post('/interviews/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const sessionId = res.data.sessionId as string;

      navigate(`/interview/${sessionId}/prejoin`);
    } catch (err: any) {
      if (err.response?.data?.code === 'NO_INTERVIEW_ATTEMPTS') {
        alert(err.response.data.message);
        navigate('/packages');
      } else {
        setError(err.response?.data?.message || 'Không thể bắt đầu luyện tập');
        setStarting(false);
      }
    }
  };

  return (
    <div className="page-stack" style={{ maxWidth: '1300px', margin: '0 auto' }}>


      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Sẵn sàng cho buổi luyện tập</h2>
        <p className="muted-text">~{duration} Phút</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div className="detail-stack" style={{ gap: '1.5rem' }}>
          
          <section className="panel-card" style={{ padding: '2rem', background: '#18191b', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
              <Building2 size={18} /> Chi tiết phỏng vấn
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--surface-sunken)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{title}</h3>
                <p className="muted-text" style={{ margin: 0 }}>{company}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-sunken)', padding: '1rem', borderRadius: '8px' }}>
                <Clock size={20} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{duration}</strong>
                <span className="muted-text" style={{ fontSize: '0.8rem' }}>Phút</span>
              </div>
              <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-sunken)', padding: '1rem', borderRadius: '8px' }}>
                <FileText size={20} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{questions}</strong>
                <span className="muted-text" style={{ fontSize: '0.8rem' }}>Câu hỏi</span>
              </div>
              <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-sunken)', padding: '1rem', borderRadius: '8px' }}>
                <BrainCircuit size={20} color="var(--danger)" style={{ margin: '0 auto 0.5rem' }} />
                <strong style={{ display: 'block', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                  {difficulty === 'hard' ? 'Khó' : difficulty === 'easy' ? 'Dễ' : 'Trung bình'}
                </strong>
                <span className="muted-text" style={{ fontSize: '0.8rem' }}>Độ khó</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <span className="tag-chip" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>Phù hợp Văn hóa</span>
              <span className="tag-chip" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>Kỹ năng Kỹ thuật</span>
              <span className="tag-chip" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>Hành vi</span>
              <span className="tag-chip" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>Giải quyết Vấn đề</span>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
              <div 
                onClick={() => setIsDescOpen(!isDescOpen)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem', padding: '1rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16} /> Mô tả công việc</span>
                <ChevronRight size={16} style={{ transform: isDescOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              {isDescOpen && (
                <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {jobDescriptionText}
                </div>
              )}
            </div>
          </section>

          <section className="panel-card" style={{ padding: '2rem', background: '#18191b', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
              <Clock size={18} /> Quy trình phỏng vấn
            </div>
            
            <div style={{ paddingLeft: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1.6rem', top: '1rem', bottom: '1rem', width: '2px', background: 'var(--border)', zIndex: 0 }}></div>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Giới thiệu</h4>
                  <p className="muted-text" style={{ margin: 0, fontSize: '0.85rem' }}>Gặp gỡ người phỏng vấn AI</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Câu hỏi phỏng vấn</h4>
                  <p className="muted-text" style={{ margin: 0, fontSize: '0.85rem' }}>{questions} câu hỏi cần trả lời</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>Kết thúc</h4>
                  <p className="muted-text" style={{ margin: 0, fontSize: '0.85rem' }}>Tóm tắt và phản hồi</p>
                </div>
              </div>
            </div>
          </section>

          <section style={{ padding: '1.5rem', border: '1px solid var(--primary)', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Sparkles size={18} /> Mẹo để thành công
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Tìm không gian yên tĩnh, đủ ánh sáng</li>
              <li>Đặt camera ngang tầm mắt</li>
              <li>Nói rõ ràng và không vội vàng</li>
              <li>Sử dụng phương pháp STAR cho câu hỏi hành vi</li>
            </ul>
          </section>
        </div>

        {/* Right Column */}
        <div className="detail-stack" style={{ gap: '1.5rem' }}>
          {isFromSet && (
            <section className="panel-card" style={{ padding: '2rem', background: '#18191b', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>
                <Sparkles size={18} color="var(--primary)" /> Cá nhân hóa câu hỏi phỏng vấn dựa trên CV
              </div>
              <p className="muted-text" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Chọn CV của bạn để hệ thống tạo ra các câu hỏi phỏng vấn phù hợp với kinh nghiệm và kỹ năng thực tế của bạn.
              </p>
              
              <div style={{ padding: '1.5rem', background: '#121316', borderRadius: '8px' }}>
                {cvs.length > 0 && !cvFile && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Chọn hồ sơ đã lưu:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {cvs.map(cv => (
                        <div 
                          key={cv._id} 
                          onClick={() => setSelectedCvId(cv._id)}
                          style={{ 
                            padding: '1rem', 
                            border: selectedCvId === cv._id ? '1px solid #7c3aed' : '1px solid var(--border)', 
                            borderRadius: '8px', 
                            background: selectedCvId === cv._id ? 'rgba(124, 58, 237, 0.05)' : 'var(--surface-sunken)', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(124, 58, 237, 0.15)', borderRadius: '8px', color: '#7c3aed' }}>
                              <FileText size={20} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: '#eef5ff', fontSize: '0.95rem' }}>{cv.fileName}</span>
                                {cv.isDefault && <span style={{ fontSize: '0.7rem', background: '#7c3aed', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Mặc định</span>}
                              </div>
                              <div className="muted-text" style={{ fontSize: '0.8rem' }}>Tải lên: {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</div>
                            </div>
                          </div>
                          {selectedCvId === cv._id && <CheckCircle2 color="#7c3aed" size={24} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cvFile && (
                  <div style={{ padding: '1rem', border: '1px solid #7c3aed', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, color: '#eef5ff', fontSize: '0.95rem' }}>{cvFile.name}</span>
                          <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#eef5ff', fontWeight: 600 }}>
                            <Zap size={12} fill="#eef5ff" /> Mới tải lên
                          </span>
                        </div>
                        <div className="muted-text" style={{ fontSize: '0.8rem' }}>{(cvFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <button onClick={() => setCvFile(null)} style={{ padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }} title="Bỏ chọn">
                      <CheckCircle2 color="#121316" fill="#7c3aed" size={24} />
                    </button>
                  </div>
                )}
                
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center', borderTop: cvs.length > 0 ? '1px dashed var(--border)' : 'none' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#eef5ff', fontSize: '0.95rem' }}>
                    Hoặc tải lên hồ sơ mới
                  </h4>
                  <p className="muted-text" style={{ fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                    Hồ sơ mới tải lên sẽ được dùng cho phỏng vấn này
                  </p>
                  <div style={{ display: 'inline-block', position: 'relative' }}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => { handleFileChange(e); setSelectedCvId(null); }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <button type="button" className="primary-button" style={{ background: '#7c3aed', borderColor: '#7c3aed', padding: '0.6rem 1.2rem', borderRadius: '8px' }}>
                      <UploadCloud size={16} /> Tải lên hồ sơ
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <button 
            className="primary-button" 
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center' }}
            onClick={handleStart}
            disabled={starting}
          >
            {starting ? (
              <><Loader2 size={20} className="spinner" /> Đang chuẩn bị...</>
            ) : (
              <>Tiếp tục <ChevronRight size={20} /></>
            )}
          </button>
          <p className="muted-text" style={{ textAlign: 'center', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>
            Bạn sẽ kiểm tra micro trước khi bắt đầu
          </p>

        </div>
      </div>

      {/* Removed the loading modal from here since it will be in PrejoinPage now */}
    </div>
  );
}
