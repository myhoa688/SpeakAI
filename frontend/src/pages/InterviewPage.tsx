import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, UploadCloud, File, CheckCircle2, Zap } from 'lucide-react';
import { api } from '../lib/api';

interface CV {
  _id: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
}

const LANGUAGES = [
  { code: 'vi', label: 'VN', text: 'Tiếng Việt' },
  { code: 'en', label: 'US', text: 'English' },
  { code: 'ja', label: 'JP', text: '日本語' },
  { code: 'zh', label: 'CN', text: '中文' },
  { code: 'ko', label: 'KR', text: '한국어' }
];

export function InterviewPage() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [language, setLanguage] = useState('vi');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File CV quá lớn. Tối đa 10MB.');
        return;
      }
      setCvFile(file);
      setError('');
    }
  };

  const handleCreate = async () => {
    if (!jobDescription.trim() && !cvFile && !selectedCvId) {
      setError('Vui lòng cung cấp ít nhất Mô tả công việc (JD) hoặc tải lên CV.');
      return;
    }
    setError('');
    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      if (jobDescription.trim()) {
        formData.append('jdText', jobDescription);
      }
      if (cvFile) {
        formData.append('cv', cvFile);
      } else if (selectedCvId) {
        formData.append('cvId', selectedCvId);
      }
      
      const res = await api.post('/interviews/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Redirect to preparation page with analysis context
      navigate('/interview/prep', {
        state: {
          analysisContext: res.data,
          jobDescription: jobDescription,
          cvText: res.data.cvText,
          language: language
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Lỗi khi phân tích CV và JD.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="page-stack" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Giả lập phỏng vấn thực tế</h2>
        <p className="muted-text">Hệ thống tự động xây dựng câu hỏi phỏng vấn dựa trên CV và yêu cầu tuyển dụng. Bạn có thể thực hành trả lời, nhận phản hồi chi tiết và tự tin hơn khi bước vào buổi phỏng vấn thật.</p>
      </div>

      <div className="detail-stack" style={{ gap: '1.5rem' }}>
        
        {/* Box 1: JD */}
        <section className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Mô tả công việc</span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <textarea
              className="text-input"
              style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
              placeholder="Dán mô tả công việc tại đây. Bao gồm yêu cầu, trách nhiệm và kỹ năng cần thiết để tạo câu hỏi phỏng vấn tốt hơn..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="muted-text" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {jobDescription.length} / 50 ký tự tối thiểu
            </div>
          </div>
        </section>

        {/* Box 2: CV */}
        <section className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <File size={16} color="#7c3aed" />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Chọn hồ sơ ứng viên</span>
            </div>
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <button type="button" className="primary-button" style={{ padding: '0.5rem 1rem', background: '#7c3aed', borderColor: '#7c3aed', borderRadius: '8px' }}>
                <FileText size={16} /> Tải CV
              </button>
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: '#121316' }}>
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

        {/* Box 3: Language */}
        <section className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Ngôn ngữ phỏng vấn</span>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`panel-card ${language === lang.code ? 'lang-selected' : ''}`}
                style={{
                  flex: '1 1 calc(20% - 1rem)',
                  minWidth: '120px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: language === lang.code ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: language === lang.code ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                }}
                onClick={() => setLanguage(lang.code)}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{lang.label}</span>
                <span className="muted-text" style={{ fontSize: '0.85rem' }}>{lang.text}</span>
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button 
          className="primary-button" 
          style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', justifyContent: 'center' }}
          onClick={handleCreate}
          disabled={analyzing}
        >
          {analyzing ? (
            <><Loader2 size={20} className="spinner" /> Đang phân tích dữ liệu...</>
          ) : (
            <>✨ Tạo phỏng vấn</>
          )}
        </button>

      </div>

      {analyzing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Loader2 size={48} color="var(--primary)" className="spinner" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Đang phân tích dữ liệu...</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '400px', textAlign: 'center' }}>
            Hệ thống đang đọc hiểu CV của bạn và đối chiếu với yêu cầu công việc. Quá trình này có thể mất vài giây.
          </p>
        </div>
      )}
    </div>
  );
}
