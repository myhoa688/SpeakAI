import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

export interface PracticeLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  onSelectLanguage: (langCode: string, remember: boolean) => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English', subLabel: 'Nhận phản hồi bằng tiếng Anh', short: 'US' },
  { code: 'vi-VN', label: 'Tiếng Việt', subLabel: 'Nhận phản hồi bằng tiếng Việt', short: 'VN' },
  { code: 'ja-JP', label: '日本語', subLabel: 'Nhận phản hồi bằng tiếng Nhật', short: 'JP' },
  { code: 'zh-CN', label: 'Tiếng Trung', subLabel: 'Nhận phản hồi bằng tiếng Trung', short: 'CN' },
  { code: 'ko-KR', label: 'Tiếng Hàn', subLabel: 'Nhận phản hồi bằng tiếng Hàn', short: 'KR' }
];

// Custom Translation Icon to match the image
const TranslationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

export function PracticeLanguageModal({ isOpen, onClose, questionText, onSelectLanguage }: PracticeLanguageModalProps) {
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRemember(localStorage.getItem('rememberPracticeLanguage') === 'true');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: '#18191b',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.25rem 1.5rem 0.75rem', position: 'relative', textAlign: 'center', flexShrink: 0 }}>
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', top: '1.25rem', right: '1.25rem', 
              background: 'transparent', border: 'none', 
              color: 'var(--text-secondary)', cursor: 'pointer',
              padding: '0.25rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <X size={20} />
          </button>
          
          <div style={{ 
            width: '40px', height: '40px', 
            background: '#5c56f5', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            <div style={{ transform: 'scale(0.8)' }}>
              <TranslationIcon />
            </div>
          </div>
          
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Chọn ngôn ngữ luyện tập</h3>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem' }}>
            Phản hồi AI sẽ được cung cấp bằng ngôn ngữ bạn chọn
          </p>
        </div>

        <div style={{ padding: '0 1.5rem 1.25rem' }}>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.2)', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            color: '#e5e7eb', 
            fontSize: '0.85rem', 
            lineHeight: 1.4,
            marginBottom: '0.75rem',
            textAlign: 'left'
          }}>
            {questionText}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang.code, remember)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.6rem 1rem',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#5c56f5';
                  e.currentTarget.style.background = 'rgba(92, 86, 245, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ 
                  width: '36px', 
                  fontWeight: 700, 
                  fontSize: '0.95rem', 
                  color: '#f9fafb',
                  flexShrink: 0
                }}>
                  {lang.short}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{lang.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{lang.subLabel}</div>
                </div>
                <ArrowRight size={16} color="#9ca3af" />
              </button>
            ))}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
              <input 
                type="checkbox" 
                id="rememberLanguage" 
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ 
                  width: '18px', height: '18px', cursor: 'pointer',
                  accentColor: '#5c56f5',
                  borderRadius: '4px'
                }}
              />
              <label htmlFor="rememberLanguage" style={{ color: '#9ca3af', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                Ghi nhớ lựa chọn của tôi
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
