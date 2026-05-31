import {
  ArrowRight,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Library,
  ListChecks,
  LogOut,
  Settings,
  Mic,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Zap,
  MonitorPlay
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { to: '/questions', label: 'Ngân hàng câu hỏi', icon: ListChecks },
  { to: '/interview-sets', label: 'Luyện tập phỏng vấn', icon: MonitorPlay },
  { to: '/packages', label: 'Gói dịch vụ', icon: CreditCard },
  { to: '/practice', label: 'Luyện tập nói', icon: Mic },
  { to: '/cv', label: 'Hồ sơ CV', icon: BriefcaseBusiness }
];

const pageMeta = {
  '/dashboard': {
    label: 'Trang chủ',
    title: 'Trang chủ',
    caption: 'Toàn bộ tiến độ trong một nơi'
  },
  '/interview-sets': {
    label: 'Luyện tập phỏng vấn',
    title: 'Luyện tập phỏng vấn',
    caption: 'Các bài test từ những công ty hàng đầu'
  },
  '/packages': {
    label: 'Gói dịch vụ',
    title: 'Gói dịch vụ',
    caption: 'Nâng cấp tài khoản của bạn'
  },
  '/practice': {
    label: 'Luyện tập',
    title: 'Luyện tập AI',
    caption: 'Phòng thoại, ghi âm và chấm điểm'
  },
  '/cv': {
    label: 'CV',
    title: 'Phòng CV',
    caption: 'CV thành dữ liệu luyện tập'
  },
  '/profile': {
    label: 'Hồ sơ',
    title: 'Hồ sơ cá nhân',
    caption: 'Ngữ cảnh cho AI'
  },
  '/admin': {
    label: 'Quản trị',
    title: 'Quản trị hệ thống',
    caption: 'Điều hành và theo dõi toàn bộ'
  }
} as const;

const getRouteKey = (pathname: string) => {
  if (pathname.startsWith('/interview-sets')) return 'interview-sets';
  if (pathname.startsWith('/packages')) return 'packages';
  if (pathname.startsWith('/practice')) return 'practice';
  if (pathname.startsWith('/cv')) return 'cv';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'dashboard';
};

const getPageMeta = (pathname: string) => {
  if (pathname.startsWith('/interview-sets')) return pageMeta['/interview-sets'];
  if (pathname.startsWith('/packages')) return pageMeta['/packages'];
  if (pathname.startsWith('/practice')) return pageMeta['/practice'];
  if (pathname.startsWith('/cv')) return pageMeta['/cv'];
  if (pathname.startsWith('/profile')) return pageMeta['/profile'];
  if (pathname.startsWith('/admin')) return pageMeta['/admin'];
  return pageMeta['/dashboard'];
};

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const meta = getPageMeta(location.pathname);
  const routeKey = getRouteKey(location.pathname);
  const roleLabel = isAdmin ? 'Quản trị viên' : 'Học viên';
  const roleSubtitle = isAdmin
    ? user?.isRootAdmin
      ? 'Quản trị viên gốc'
      : 'Điều hành hệ thống'
    : user?.targetRole || 'Lộ trình cá nhân';
  const todayLabel = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date());

  const quickSignals = [
    `Chuỗi ${user?.streak ?? 0} ngày`,
    `${user?.weeklyXp ?? 0} XP tuần`,
    `${user?.energy ?? 0}/5 năng lượng`
  ];

  return (
    <div className={`app-shell workspace-overhaul app-shell-${routeKey}`}>
      <aside className="sidebar-card workspace-rail new-sidebar">
        <div className="new-sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <img src="/logo.png" alt="SpeakAI Logo" style={{ width: 32, height: 32 }} />
            </div>
            <span className="brand-text">SpeakAI</span>
          </div>
        </div>

        <div className="new-sidebar-nav">
          <nav className="side-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `new-nav-pill${isActive ? ' active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {isAdmin ? (
              <NavLink to="/admin" className={({ isActive }) => `new-nav-pill${isActive ? ' active' : ''}`}>
                <ShieldCheck size={20} />
                <span>Quản trị hệ thống</span>
              </NavLink>
            ) : null}
          </nav>
        </div>

        
        <Link to="/profile" className="new-sidebar-profile" style={{ textDecoration: 'none' }}>
          <div className="profile-avatar">
            {user?.name?.substring(0, 2).toUpperCase() || '09'}
          </div>
          <div className="profile-info">
            <h4 className="profile-name">{user?.name || '0986_Nguyễn Duy K...'}</h4>
            <span className="profile-meta">{user?.remainingInterviews ?? 0} lượt</span>
          </div>
          <div className="profile-settings" title="Cài đặt">
            <Settings size={18} />
          </div>
        </Link>
      </aside>

      <div className="main-column workspace-stage">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: 'none' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            {location.pathname === '/dashboard' || location.pathname === '/' ? 'Trang chủ' : 
             location.pathname.includes('/questions') ? 'Ngân hàng câu hỏi' : 
             location.pathname.includes('/interview-sets') ? 'Luyện tập phỏng vấn' : 
             location.pathname.includes('/practice') || location.pathname.includes('/interview') ? 'Luyện tập' : 
             location.pathname.includes('/profile') ? 'Hồ sơ cá nhân' : 'Trang chủ'}
          </div>
          <div className="workspace-stage-tools" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
          </div>
        </header>

        <section className="workspace-stage-body" style={{ padding: '2rem' }}>
          <main className="main-content">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}
