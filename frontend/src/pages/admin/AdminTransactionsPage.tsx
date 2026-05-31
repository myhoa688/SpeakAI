import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../../lib/api';

interface Transaction {
  _id: string;
  userId: { _id: string; name: string; email: string };
  packageId: { _id: string; name: string };
  amount: number;
  transactionCode: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/transactions/admin/list');
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Xác nhận đã nhận được tiền và cộng lượt cho user này?')) return;
    try {
      await api.post(`/transactions/admin/${id}/approve`);
      fetchTransactions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi duyệt giao dịch');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy giao dịch này?')) return;
    try {
      await api.post(`/transactions/admin/${id}/cancel`);
      fetchTransactions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi hủy giao dịch');
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h2>Quản lý Giao dịch</h2>
        <p className="muted-text">Kiểm tra đơn hàng chờ thanh toán và duyệt cộng lượt phỏng vấn</p>
      </header>

      <section className="panel-card" style={{ padding: '1.5rem' }}>
        {isLoading ? (
          <p>Đang tải danh sách giao dịch...</p>
        ) : transactions.length === 0 ? (
          <p className="muted-text text-center py-4">Chưa có giao dịch nào.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table w-100" style={{ textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Mã GD</th>
                  <th style={{ padding: '1rem' }}>Người mua</th>
                  <th style={{ padding: '1rem' }}>Gói dịch vụ</th>
                  <th style={{ padding: '1rem' }}>Số tiền</th>
                  <th style={{ padding: '1rem' }}>Trạng thái</th>
                  <th style={{ padding: '1rem' }}>Thời gian tạo</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600 }}>{txn.transactionCode}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{txn.userId?.name || 'User ẩn'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{txn.userId?.email || ''}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{txn.packageId?.name || 'Gói đã xóa'}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#a78bfa' }}>
                      {txn.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {txn.status === 'completed' && (
                        <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <CheckCircle2 size={14} /> Hoàn thành
                        </span>
                      )}
                      {txn.status === 'cancelled' && (
                        <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <XCircle size={14} /> Đã hủy
                        </span>
                      )}
                      {txn.status === 'pending' && (
                        <span style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(251,191,36,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <Clock size={14} /> Chờ thanh toán
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      {new Date(txn.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {txn.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="primary-button" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'var(--success)' }}
                            onClick={() => handleApprove(txn._id)}
                          >
                            Duyệt
                          </button>
                          <button 
                            className="ghost-button" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                            onClick={() => handleCancel(txn._id)}
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
