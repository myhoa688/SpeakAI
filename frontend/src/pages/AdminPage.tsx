import { Activity, Ban, Crown, Power, ShieldCheck, Users, Waves, Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import './AdminPage.css';
import { api } from '../lib/api';

type AdminOverview = {
  stats: {
    usersCount: number;
    adminsCount: number;
    disabledUsersCount: number;
    sessionsThisWeek: number;
  };
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    weeklyXp: number;
    streak: number;
    energy: number;
    isDisabled: boolean;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    totalXp: number;
    isDisabled: boolean;
    isRootAdmin: boolean;
  }>;
  recentSessions: Array<{
    id: string;
    practiceType: string;
    topic: string;
    totalScore: number;
    xpEarned: number;
    createdAt: string;
    user: { name?: string; email?: string };
  }>;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  streak: number;
  totalXp: number;
  weeklyXp: number;
  energy: number;
  targetRole: string;
  createdAt: string;
  isDisabled: boolean;
  disabledAt?: string | null;
  disabledReason: string;
  isRootAdmin: boolean;
};

const getRoleLabel = (role: string) => (role === 'admin' ? 'Quản trị viên' : 'Thành viên');
const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

export function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'xp' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const [overviewResponse, usersResponse, sessionsResponse] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/sessions')
      ]);

      setOverview(overviewResponse.data);
      setUsers(usersResponse.data.users);
      setSessions(sessionsResponse.data.sessions);
    } catch (loadError: any) {
      setError(loadError.response?.data?.message ?? 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.isRootAdmin) {
      setError('Không thể vô hiệu hóa tài khoản quản trị viên gốc.');
      return;
    }

    let reason = '';
    if (!user.isDisabled) {
      reason = window.prompt('Nhập lý do vô hiệu hóa tài khoản này:')?.trim() ?? '';
    }

    setProcessingId(user.id);
    setError('');
    setMessage('');

    try {
      const response = await api.patch(`/admin/users/${user.id}/status`, {
        isDisabled: !user.isDisabled,
        reason
      });
      setMessage(response.data.message);
      await loadAdminData();
    } catch (toggleError: any) {
      setError(toggleError.response?.data?.message ?? 'Không thể cập nhật trạng thái tài khoản.');
    } finally {
      setProcessingId('');
    }
  };

  const handleSort = (column: 'name' | 'xp' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = users;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }
    
    return [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'xp') {
        comparison = a.totalXp - b.totalXp;
      } else if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [users, searchTerm, sortBy, sortOrder]);

  if (loading) {
    return <div className="v2-admin-page">Đang tải dữ liệu...</div>;
  }

  if (!overview) {
    return <div className="v2-admin-page v2-alert error">{error || 'Không có dữ liệu quản trị.'}</div>;
  }

  const disableRate = overview.stats.usersCount
    ? Math.round((overview.stats.disabledUsersCount / overview.stats.usersCount) * 100)
    : 0;
  const sessionDensity = overview.stats.usersCount
    ? (overview.stats.sessionsThisWeek / overview.stats.usersCount).toFixed(1)
    : '0.0';

  return (
    <div className="v2-admin-page">
      <div className="v2-page-header">
        <h1 className="v2-page-title">Tổng quan hệ thống</h1>
        <p className="v2-page-desc">Theo dõi hoạt động, dữ liệu thành viên và các phiên luyện tập.</p>
      </div>

      {message && <div className="v2-alert success">{message}</div>}
      {error && <div className="v2-alert error">{error}</div>}

      <div className="v2-grid-metrics">
        <div className="v2-card v2-metric-card">
          <div className="v2-metric-label">Tổng thành viên</div>
          <div className="v2-metric-value">{overview.stats.usersCount}</div>
          <div className="v2-metric-sub">Bao gồm {overview.stats.adminsCount} quản trị viên</div>
        </div>
        <div className="v2-card v2-metric-card">
          <div className="v2-metric-label">Phiên trong tuần</div>
          <div className="v2-metric-value">{overview.stats.sessionsThisWeek}</div>
          <div className="v2-metric-sub">Mật độ: {sessionDensity} / người dùng</div>
        </div>
        <div className="v2-card v2-metric-card">
          <div className="v2-metric-label">Tài khoản bị vô hiệu</div>
          <div className="v2-metric-value">{overview.stats.disabledUsersCount}</div>
          <div className="v2-metric-sub">Tỷ lệ: {disableRate}% toàn hệ thống</div>
        </div>
      </div>

      <div className="v2-grid-main">
        {/* Left Column: Users Table */}
        <div className="v2-card">
          <div className="v2-card-header">
            <h3 className="v2-card-title"><Users size={16} /> Quản lý tài khoản</h3>
          </div>
          <div className="v2-table-toolbar">
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="v2-input"
            />
          </div>
          <div className="v2-table-wrapper">
            <table className="v2-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                  <th onClick={() => handleSort('xp')} className="sortable">XP {sortBy === 'xp' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="v2-user-cell">
                        <div className="v2-avatar">{item.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p>{item.name}</p>
                          <span>{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="v2-badge gray">{item.isRootAdmin ? 'Root' : getRoleLabel(item.role)}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{item.totalXp}</strong>
                    </td>
                    <td>
                      {item.isRootAdmin ? (
                        <span className="v2-badge gray">Bảo vệ</span>
                      ) : item.isDisabled ? (
                        <span className="v2-badge red">Đã khóa</span>
                      ) : (
                        <span className="v2-badge green">Hoạt động</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`v2-btn ${item.isDisabled ? 'outline' : 'danger'}`}
                        disabled={item.isRootAdmin || processingId === item.id}
                        onClick={() => handleToggleStatus(item)}
                      >
                        {processingId === item.id ? '...' : item.isDisabled ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Leaderboard & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="v2-card">
            <div className="v2-card-header">
              <h3 className="v2-card-title"><Crown size={16} /> Top XP Tuần</h3>
            </div>
            <div className="v2-list">
              {overview.topUsers.slice(0, 3).map((item, index) => (
                <div key={item.id} className="v2-list-item">
                  <div className="v2-user-cell">
                    <div className={`v2-avatar ${index < 3 ? `rank-${index + 1}` : ''}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p>{item.name}</p>
                      <span>{item.email}</span>
                    </div>
                  </div>
                  <div className="v2-list-item-meta">
                    <strong>{item.weeklyXp} XP</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="v2-card">
            <div className="v2-card-header">
              <h3 className="v2-card-title"><Activity size={16} /> Phiên luyện tập gần đây</h3>
            </div>
            <div className="v2-list">
              {sessions.slice(0, 4).map((item) => (
                <div key={item.id} className="v2-list-item">
                  <div className="v2-list-item-content">
                    <p>{item.user?.name || item.user?.email || 'N/A'}</p>
                    <span>{item.topic}</span>
                  </div>
                  <div className="v2-list-item-meta">
                    <strong style={{ color: '#3b82f6' }}>{item.totalScore}/100</strong>
                    <span style={{ color: '#71717a' }}>{formatShortDate(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
