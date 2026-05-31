import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { api } from '../lib/api';

interface Package {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  period: string;
  desc: string;
  features: string[];
  isPopular: boolean;
  color: string;
  interviewAttempts: number;
  active: boolean;
  sortOrder: number;
}

export function AdminPackagesPage() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [promotionEndTime, setPromotionEndTime] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '', price: 0, originalPrice: 0, period: '', desc: '',
    features: '', isPopular: false, color: '#6c63ff', interviewAttempts: 1, active: true, sortOrder: 0
  });

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const [pkgRes, promoRes] = await Promise.all([
        api.get('/packages/admin/list'),
        api.get('/packages/promotion')
      ]);
      setPackages(pkgRes.data.packages);
      if (promoRes.data.endTime) {
        // Format for datetime-local input (YYYY-MM-DDThh:mm)
        const date = new Date(promoRes.data.endTime);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        setPromotionEndTime(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleUpdatePromotion = async () => {
    try {
      await api.post('/packages/admin/promotion', { endTime: promotionEndTime });
      alert('Đã cập nhật giờ hết hạn khuyến mãi thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật giờ hết hạn.');
    }
  };

  const openModal = (pkg?: Package) => {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        ...pkg,
        features: pkg.features.join('\n')
      });
    } else {
      setEditingPkg(null);
      setFormData({
        name: '', price: 0, originalPrice: 0, period: '1 lần', desc: '',
        features: '', isPopular: false, color: '#6c63ff', interviewAttempts: 1, active: true, sortOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPkg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean)
      };

      if (editingPkg) {
        await api.put(`/packages/admin/${editingPkg._id}`, payload);
      } else {
        await api.post('/packages/admin/create', payload);
      }
      closeModal();
      fetchPackages();
    } catch (error) {
      alert('Đã xảy ra lỗi khi lưu.');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói này?')) return;
    try {
      await api.delete(`/packages/admin/${id}`);
      fetchPackages();
    } catch (error) {
      alert('Lỗi khi xóa');
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Quản lý Gói dịch vụ</h2>
          <p className="muted-text">Tạo và cấu hình các gói thanh toán trên hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Giờ hết hạn KM:</label>
            <input 
              type="datetime-local" 
              className="text-input" 
              style={{ padding: '0.3rem', fontSize: '0.9rem' }}
              value={promotionEndTime} 
              onChange={e => setPromotionEndTime(e.target.value)} 
            />
            <button className="secondary-button" style={{ padding: '0.3rem 0.6rem' }} onClick={handleUpdatePromotion}>Lưu</button>
          </div>
          <button className="primary-button" onClick={() => openModal()}>
            <Plus size={18} /> Thêm gói mới
          </button>
        </div>
      </header>

      <section className="panel-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <p>Đang tải...</p>
        ) : packages.length === 0 ? (
          <p className="muted-text text-center py-4">Chưa có gói dịch vụ nào. Hãy tạo mới.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table w-100" style={{ textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Tên gói</th>
                  <th style={{ padding: '1rem' }}>Giá</th>
                  <th style={{ padding: '1rem' }}>Thời hạn</th>
                  <th style={{ padding: '1rem' }}>Số lượt</th>
                  <th style={{ padding: '1rem' }}>Nổi bật</th>
                  <th style={{ padding: '1rem' }}>Trạng thái</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: pkg.color }}></div>
                        {pkg.name}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>{pkg.price.toLocaleString('vi-VN')}đ</td>
                    <td style={{ padding: '1rem' }}>{pkg.period}</td>
                    <td style={{ padding: '1rem' }}>+{pkg.interviewAttempts}</td>
                    <td style={{ padding: '1rem' }}>
                      {pkg.isPopular ? <span className="badge badge-primary">Phổ biến</span> : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {pkg.active ? (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={16} /> Hoạt động
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={16} /> Vô hiệu
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="icon-button" onClick={() => openModal(pkg)} title="Sửa"><Edit2 size={18} /></button>
                      <button className="icon-button" onClick={() => handleDelete(pkg._id)} style={{ color: 'var(--danger)' }} title="Xóa"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingPkg ? 'Sửa gói dịch vụ' : 'Thêm gói mới'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tên gói *</label>
                  <input type="text" className="text-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Màu sắc (Hex)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8 }} />
                    <input type="text" className="text-input" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Giá bán (VNĐ) *</label>
                  <input type="number" className="text-input" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Giá gốc (VNĐ)</label>
                  <input type="number" className="text-input" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Số lượt cộng thêm *</label>
                  <input type="number" className="text-input" required min={1} value={formData.interviewAttempts} onChange={e => setFormData({...formData, interviewAttempts: Number(e.target.value)})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Thời hạn (vd: 14 ngày)</label>
                  <input type="text" className="text-input" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input type="number" className="text-input" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả ngắn</label>
                <input type="text" className="text-input" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Quyền lợi (Mỗi dòng 1 quyền lợi)</label>
                <textarea className="text-input" rows={4} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Phỏng vấn không giới hạn&#10;Phân tích điểm yếu&#10;Hỗ trợ 24/7"></textarea>
              </div>

              <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} />
                  Gói nổi bật (Popular)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                  Đang hoạt động
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="ghost-button" onClick={closeModal}>Hủy</button>
                <button type="submit" className="primary-button">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
