import { useState, useEffect } from 'react';
import { Camera, ChevronDown, Lock, LogOut, Bell, Languages, User, AlertTriangle, ReceiptText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import './ProfilePage.css';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    dob: '',
    bio: '',
    avatarUrl: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' && transactions.length === 0) {
      setLoadingTransactions(true);
      api.get('/transactions/my-history')
        .then(res => setTransactions(res.data.transactions || []))
        .catch(err => console.error('Failed to fetch transactions', err))
        .finally(() => setLoadingTransactions(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: (user as any).phone || '',
      dob: (user as any).dob || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || ''
    });
  }, [user]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.patch('/users/profile', form);
      updateUser(response.data.user);
      setMessage(t('profilePage.savingSuccess', 'Cập nhật thành công.'));
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('profilePage.savingError', 'Không thể cập nhật hồ sơ.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('profilePage.confirmDelete', 'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.'))) {
      // Implement delete account logic here
      alert(t('profilePage.deleteNotImplemented', 'Tính năng xóa tài khoản đang được phát triển.'));
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-page-header">
        <h1>{t('profilePage.accountManagement', 'Quản lý tài khoản')}</h1>
        <p>{t('profilePage.accountManagementDesc', 'Quản lý cài đặt và tùy chọn tài khoản')}</p>
      </div>

      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          {t('profilePage.editProfileInfo', 'Chỉnh sửa Thông tin hồ sơ')}
        </button>
        <button 
          className={`profile-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {t('profilePage.purchaseHistory', 'Lịch sử mua hàng')}
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-content-grid">
          {/* Left Column: Form */}
          <div className="profile-card">
            <div className="profile-card-header">
              <User size={18} />
              {t('profilePage.profileInfoTitle', 'Thông tin hồ sơ')}
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="profile-avatar-section">
                <div className="profile-avatar-circle">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="Avatar" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                  <div className="profile-avatar-edit-btn">
                    <Camera size={14} />
                  </div>
                </div>
                <div className="profile-avatar-info">
                  <h3>{t('profilePage.profilePicture', 'Ảnh hồ sơ')}</h3>
                  <p>{t('profilePage.profilePictureHint', 'JPG, PNG hoặc GIF. Tối đa 2MB.')}</p>
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label required">{t('profilePage.fullNameLabel', 'Họ và tên')}</label>
                <input 
                  className="profile-input" 
                  value={form.name} 
                  onChange={e => handleChange('name', e.target.value)} 
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-label">{t('profilePage.emailLabel', 'Email')}</label>
                <input 
                  className="profile-input" 
                  value={user?.email || ''} 
                  disabled 
                />
                <span className="profile-input-hint">{t('profilePage.emailCannotChange', 'Không thể thay đổi email')}</span>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group" style={{ marginBottom: 0 }}>
                  <label className="profile-label">{t('profilePage.phoneLabel', 'Điện thoại')}</label>
                  <input 
                    className="profile-input" 
                    value={form.phone} 
                    onChange={e => handleChange('phone', e.target.value)} 
                  />
                </div>
                <div className="profile-form-group" style={{ marginBottom: 0 }}>
                  <label className="profile-label">{t('profilePage.dobLabel', 'Ngày sinh')}</label>
                  <input 
                    type="date"
                    className="profile-input" 
                    value={form.dob} 
                    onChange={e => handleChange('dob', e.target.value)} 
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">{t('profilePage.bioLabel', 'Giới thiệu')}</label>
                <textarea 
                  className="profile-textarea" 
                  value={form.bio} 
                  onChange={e => handleChange('bio', e.target.value)} 
                />
                <span className="profile-input-hint">{t('profilePage.bioHint', 'Viết giới thiệu ngắn về bản thân (tối đa 1000 ký tự)')}</span>
              </div>

              {message && <p style={{ color: '#22c55e', fontSize: 14, marginTop: 16 }}>{message}</p>}
              {error && <p style={{ color: '#ef4444', fontSize: 14, marginTop: 16 }}>{error}</p>}

              <div className="profile-save-wrapper">
                <button type="submit" className="profile-save-btn" disabled={loading}>
                  {loading ? t('profilePage.savingBtn', 'Đang lưu...') : t('profilePage.saveBtn', 'Lưu thay đổi')}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Settings & Actions */}
          <div className="profile-settings-column">
            <div className="profile-accordion">
              <div className="profile-accordion-title">
                <Languages size={18} className="profile-accordion-icon" />
                {t('profilePage.languageSettings', 'Cài đặt ngôn ngữ')}
              </div>
              <ChevronDown size={18} className="profile-chevron" />
            </div>

            <div className="profile-accordion">
              <div className="profile-accordion-title">
                <Lock size={18} className="profile-accordion-icon" />
                {t('profilePage.changePassword', 'Đổi mật khẩu')}
              </div>
              <ChevronDown size={18} className="profile-chevron" />
            </div>

            <div className="profile-accordion">
              <div className="profile-accordion-title">
                <Bell size={18} className="profile-accordion-icon" />
                {t('profilePage.notificationOptions', 'Tùy chọn thông báo')}
              </div>
              <ChevronDown size={18} className="profile-chevron" />
            </div>

            <div className="profile-action-card" style={{ marginTop: 24 }}>
              <div className="profile-action-header">
                <LogOut size={18} style={{ color: '#a1a1aa' }} />
                {t('profilePage.logoutTitle', 'Đăng xuất')}
              </div>
              <div className="profile-action-content">
                <div className="profile-action-info">
                  <h4>{t('profilePage.logoutTitle', 'Đăng xuất')}</h4>
                  <p>{t('profilePage.logoutDesc', 'Đăng xuất khỏi tài khoản trên thiết bị này.')}</p>
                </div>
                <button className="profile-btn-outline" onClick={logout}>
                  {t('profilePage.logoutBtn', 'Đăng xuất')}
                </button>
              </div>
            </div>

            <div className="profile-danger-card" onClick={handleDeleteAccount} style={{ marginTop: 24 }}>
              <AlertTriangle size={18} />
              {t('profilePage.dangerAction', 'Hành động không thể hoàn tác')}
            </div>
            
            <div className="profile-action-card" style={{ marginTop: 8, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div className="profile-action-content">
                <div className="profile-action-info">
                  <h4 style={{ color: '#fff' }}>{t('profilePage.deleteAccountTitle', 'Xóa tài khoản')}</h4>
                  <p>{t('profilePage.deleteAccountDesc', 'Khi bạn xóa tài khoản, không thể khôi phục lại. Vui lòng cân nhắc kỹ.')}</p>
                </div>
                <button className="profile-btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleDeleteAccount}>
                  {t('profilePage.deleteAccountBtn', 'Xóa tài khoản')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="profile-card">
          <div className="profile-card-header">
            <ReceiptText size={18} className="profile-accordion-icon" />
            {t('profilePage.purchaseHistory', 'Lịch sử mua hàng')}
          </div>
          
          {loadingTransactions ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>Đang tải...</div>
          ) : transactions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Mã giao dịch</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Gói dịch vụ</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Số tiền</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Ngày giao dịch</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px', fontFamily: 'monospace' }}>{tx.transactionCode || tx.orderCode}</td>
                      <td style={{ padding: '16px' }}>{tx.packageId?.name || 'Gói dịch vụ'}</td>
                      <td style={{ padding: '16px' }}>{tx.amount?.toLocaleString('vi-VN')} đ</td>
                      <td style={{ padding: '16px' }}>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: tx.status === 'completed' ? 'rgba(34,197,94,0.1)' : tx.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: tx.status === 'completed' ? '#22c55e' : tx.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                        }}>
                          {tx.status === 'completed' ? 'Thành công' : tx.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="profile-empty-state">
              <div className="profile-empty-icon">
                <ReceiptText size={24} />
              </div>
              <div className="profile-empty-text">
                {t('profilePage.noPurchaseHistory', 'Chưa có lịch sử mua hàng')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
