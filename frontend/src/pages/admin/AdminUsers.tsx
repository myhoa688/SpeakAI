import { Ban, Crown, Search, Shield, ShieldOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  totalXp: number;
  weeklyXp: number;
  streak: number;
  energy: number;
  targetRole: string;
  subscriptionPlan?: 'free' | 'premium';
  createdAt: string;
  isDisabled: boolean;
  disabledReason: string;
  isRootAdmin: boolean;
};

const fmt = (d: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch {
      setErr('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
  }, [users, search]);

  const toggleStatus = async (u: User) => {
    if (u.isRootAdmin) return;
    let reason = '';
    if (!u.isDisabled) {
      reason = window.prompt('Lý do khóa tài khoản:')?.trim() ?? '';
    }
    setProcessingId(u.id);
    setErr(''); setMsg('');
    try {
      const res = await api.patch(`/admin/users/${u.id}/status`, { isDisabled: !u.isDisabled, reason });
      setMsg(res.data.message);
      await load();
    } catch (e: any) {
      setErr(e.response?.data?.message ?? 'Lỗi cập nhật trạng thái.');
    } finally {
      setProcessingId('');
    }
  };

  const toggleRole = async (u: User) => {
    if (u.isRootAdmin) return;
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Đổi role của ${u.name} thành ${newRole === 'admin' ? 'Quản trị viên' : 'Thành viên'}?`)) return;
    setProcessingId(u.id);
    setErr(''); setMsg('');
    try {
      const res = await api.patch(`/admin/users/${u.id}/role`, { role: newRole });
      setMsg(`Đã đổi role thành công.`);
      await load();
    } catch (e: any) {
      setErr(e.response?.data?.message ?? 'Lỗi cập nhật role.');
    } finally {
      setProcessingId('');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Quản lý Người dùng</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{users.length} tài khoản</p>
      </div>

      {msg && <p style={{ color: 'var(--success-color, #22c55e)', marginBottom: 12 }}>{msg}</p>}
      {err && <p style={{ color: 'var(--danger-color, #ef4444)', marginBottom: 12 }}>{err}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Đang tải...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Người dùng', 'Role', 'Gói dịch vụ', 'XP / Streak', 'Ngày tạo', 'Trạng thái', 'Hành động'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#18191b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#18191b', color: u.isRootAdmin ? '#eab308' : u.role === 'admin' ? '#818cf8' : 'var(--text-secondary)' }}>
                      {u.isRootAdmin ? 'Root Admin' : u.role === 'admin' ? 'Admin' : 'Thành viên'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: u.subscriptionPlan === 'premium' ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(217, 119, 6, 0.2))' : '#18191b', color: u.subscriptionPlan === 'premium' ? '#eab308' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                      {u.subscriptionPlan === 'premium' && <Crown size={12} />}
                      {u.subscriptionPlan === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontWeight: 600 }}>{u.totalXp.toLocaleString()} XP</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{u.streak} ngày streak</div>
                  </td>
                  <td style={{ padding: '12px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmt(u.createdAt)}</td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#18191b', color: u.isRootAdmin ? '#eab308' : u.isDisabled ? '#ef4444' : '#22c55e' }}>
                      {u.isRootAdmin ? 'Bảo vệ' : u.isDisabled ? 'Đang khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        disabled={u.isRootAdmin || processingId === u.id}
                        onClick={() => toggleStatus(u)}
                        title={u.isDisabled ? 'Mở khóa' : 'Khóa tài khoản'}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: u.isRootAdmin ? 'not-allowed' : 'pointer', color: u.isDisabled ? '#22c55e' : '#ef4444', opacity: u.isRootAdmin ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      >
                        {u.isDisabled ? <><ShieldOff size={14} /> Mở khóa</> : <><Ban size={14} /> Khóa</>}
                      </button>
                      <button
                        type="button"
                        disabled={u.isRootAdmin || processingId === u.id}
                        onClick={() => toggleRole(u)}
                        title={u.role === 'admin' ? 'Hạ xuống thành viên' : 'Nâng lên admin'}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: u.isRootAdmin ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)', opacity: u.isRootAdmin ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      >
                        {u.role === 'admin' ? <><ShieldOff size={14} /> Hạ role</> : <><Shield size={14} /> Nâng Admin</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>Không tìm thấy người dùng nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
