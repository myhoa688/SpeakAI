import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, HelpCircle, FolderArchive, Activity, Home, LogOut, PackageSearch, CreditCard, Star } from 'lucide-react';
import './AdminLayout.css';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/admin/users', icon: Users, label: 'Người dùng' },
    { path: '/admin/questions', icon: HelpCircle, label: 'Ngân hàng câu hỏi' },
    { path: '/admin/interview-sets', icon: FolderArchive, label: 'Bộ đề phỏng vấn' },
    { path: '/admin/sessions', icon: Activity, label: 'Phiên luyện tập' },
    { path: '/admin/packages', icon: PackageSearch, label: 'Quản lý gói dịch vụ' },
    { path: '/admin/transactions', icon: CreditCard, label: 'Quản lý giao dịch' },
    { path: '/admin/ratings', icon: Star, label: 'Đánh giá' },
  ];

  return (
    <div className="admin-layout-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <span className="logo-icon">S</span>
            <span className="logo-text">SpeakAI Admin</span>
          </Link>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <Home size={20} />
            <span>Về trang chính</span>
          </Link>
          <button type="button" onClick={handleLogout} className="admin-nav-item logout-btn">
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="topbar-search">
            {/* Can implement global search here later */}
          </div>
          <div className="topbar-user">
            <div className="user-info">
              <span className="user-name">{user?.name || 'Admin'}</span>
              <span className="user-role">{user?.isRootAdmin ? 'Root Admin' : 'Quản trị viên'}</span>
            </div>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="admin-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
