import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Trash2, Eye, Star, Loader2, FolderOpen } from 'lucide-react';
import { api } from '../lib/api';
import './CvAnalyzerPage.css';

interface CV {
  _id: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
  createdAt: string;
}

export function CvAnalyzerPage() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCvs();
  }, []);

  const fetchCvs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cvs');
      setCvs(res.data.cvs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lấy danh sách CV');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError('');
    setMessage('');
    if (file.size > 10 * 1024 * 1024) {
      setError('File không được vượt quá 10MB');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setError('Định dạng không hợp lệ. Hỗ trợ PDF, DOC, DOCX.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      await api.post('/cvs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Tải lên thành công');
      fetchCvs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải lên CV');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/cvs/${id}/default`);
      fetchCvs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi đặt mặc định');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa CV này?')) return;
    try {
      await api.delete(`/cvs/${id}`);
      fetchCvs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xóa CV');
    }
  };

  const openFileBrowser = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="cv-page-container">
      <div className="cv-page-header">
        <h1>Hồ sơ CV</h1>
        <p>Quản lý hồ sơ CV và thư mời xin việc của bạn</p>
      </div>

      {error && <div className="cv-alert cv-alert-error"><AlertCircle size={16} />{error}</div>}
      {message && <div className="cv-alert cv-alert-success"><AlertCircle size={16} />{message}</div>}

      <div className="cv-sections-wrapper">
        {/* Upload Section */}
        <section className="cv-section-card">
          <div className="cv-section-header">
            <div className="cv-section-title">
              <UploadCloud size={20} className="icon-primary" />
              <h3>Tải lên hồ sơ</h3>
            </div>
          </div>
          
          <div className="cv-section-body">
            <div 
              className={`cv-drag-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileBrowser}
              style={{ cursor: 'pointer' }}
            >
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange} 
                disabled={uploading}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <div className="cv-drag-content">
                {uploading ? (
                  <>
                    <Loader2 className="spinner" size={48} />
                    <span style={{ marginTop: '1rem' }}>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <div className="upload-circle-icon">
                      <UploadCloud size={28} />
                    </div>
                    <p className="upload-title"><strong>Kéo và thả tệp vào đây</strong></p>
                    <p className="upload-subtitle">hoặc <span onClick={openFileBrowser} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>nhấp để duyệt</span></p>
                    <p className="upload-formats">Định dạng hỗ trợ: PDF, DOC, DOCX (Kích thước tối đa: 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CV List Section */}
        <section className="cv-section-card cv-list-section">
          <div className="cv-section-header">
            <div className="cv-section-title">
              <FolderOpen size={20} className="icon-primary" />
              <h3>Hồ sơ của tôi</h3>
            </div>
            <div className="cv-count-badge">
              {cvs.length} CV
            </div>
          </div>
          
          <div className="cv-section-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="cv-loading">
                <Loader2 className="spinner" size={24} /> Đang tải dữ liệu...
              </div>
            ) : cvs.length === 0 ? (
              <div className="cv-empty">
                <FileText size={48} />
                <p>Chưa có hồ sơ nào được tải lên</p>
              </div>
            ) : (
              <div className="cv-list">
                {cvs.map(cv => (
                  <div key={cv._id} className="cv-list-item">
                    <div className="cv-item-left">
                      <div className="cv-pdf-icon">
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px' }}>PDF</span>
                      </div>
                      <div className="cv-item-info">
                        <h4>{cv.fileName}</h4>
                        <span className="cv-date">Đã tải lên: {new Date(cv.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="cv-item-actions">
                      <a href={`http://localhost:5000${cv.fileUrl}`} target="_blank" rel="noreferrer" className="cv-action-btn" title="Xem">
                        <Eye size={20} />
                      </a>
                      <button 
                        onClick={() => handleSetDefault(cv._id)} 
                        className={`cv-action-btn ${cv.isDefault ? 'active-star' : ''}`} 
                        title={cv.isDefault ? 'CV Mặc định' : 'Đặt làm mặc định'}
                      >
                        <Star size={20} fill={cv.isDefault ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => handleDelete(cv._id)} className="cv-action-btn delete" title="Xóa">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
