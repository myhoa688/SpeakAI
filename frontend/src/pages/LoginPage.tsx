import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function LoginPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (submitError: any) {
      setError(submitError.response?.data?.message ?? 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100%', background: 'var(--page)', color: 'var(--ink)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Left Panel - Branding (Solid Indigo/Purple) */}
      <div 
        style={{ 
          flex: '0 0 50%', 
          width: '50%',
          background: '#4f46e5', // Solid indigo matching X-Interview
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="hide-on-mobile"
      >
        {/* Subtle geometric background patterns */}
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
        <div style={{ position: 'absolute', bottom: '20%', right: '25%', width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '15%', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>
        <div style={{ position: 'absolute', top: '25%', right: '15%', width: '10px', height: '10px', border: '2px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }}></div>

        <div style={{ maxWidth: '650px', textAlign: 'center', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', background: '#fff', padding: '6px' }}>
              <img src="/logo.png" alt="SpeakAI Logo" style={{ width: '100%', height: '100%' }} />
            </div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>SpeakAI</h1>
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '1.25rem', whiteSpace: 'nowrap' }}>
            Chinh phục buổi phỏng vấn tiếp theo cùng AI
          </h2>
          
          <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, margin: '0 auto', whiteSpace: 'nowrap' }}>
            Nhận phản hồi cá nhân hóa, xây dựng sự tự tin và tiến gần hơn đến công<br />việc mơ ước qua các buổi phỏng vấn thử thông minh.
          </p>
        </div>
        
        <div style={{ position: 'absolute', bottom: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
          © 2026 SpeakAI Soft
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div 
        style={{ 
          flex: '0 0 50%', 
          width: '50%',
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          background: 'var(--page)',
          overflowY: 'auto'
        }}
      >
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
          <button 
            type="button" 
            onClick={toggleTheme} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', padding: '0.5rem' }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Tối' : 'Sáng'}
          </button>
        </div>

        {/* Form Centered Container */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '440px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--ink)' }}>Đăng nhập</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nhập thông tin đăng nhập để truy cập tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', padding: '1.75rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
              
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ink)' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '14px', top: '13px', width: '18px', height: '18px', color: 'var(--muted)' }}>
                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                    <polyline points="3 7 12 13 21 7"></polyline>
                  </svg>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-sunken)', color: 'var(--ink)', fontSize: '0.95rem', transition: 'all 0.2s' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Mật khẩu</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>Quên mật khẩu?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '14px', top: '13px', width: '18px', height: '18px', color: 'var(--muted)' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-sunken)', color: 'var(--ink)', fontSize: '0.95rem', transition: 'all 0.2s' }}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '11px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.875rem' }}>
                  <input type="checkbox" id="remember" style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--border)', cursor: 'pointer' }} />
                  <label htmlFor="remember" style={{ fontSize: '0.85rem', color: 'var(--muted)', cursor: 'pointer' }}>Ghi nhớ đăng nhập</label>
                </div>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.875rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>{error}</p>}

              <button 
                type="submit" 
                style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600, background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                disabled={loading}
              >
                <LogIn size={18} /> {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>Hoặc đăng nhập với</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              </div>

              <button 
                type="button" 
                style={{ 
                  width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', 
                  background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--ink)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' 
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng nhập với Google
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Bạn chưa có tài khoản? <Link to="/register" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
