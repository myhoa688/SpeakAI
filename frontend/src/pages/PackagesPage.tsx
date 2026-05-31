import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Check, CheckCircle, X, QrCode, Copy, Info, ChevronRight, MonitorPlay, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
}

export function PackagesPage() {
  const { t } = useTranslation();
  const { user, token, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promotionEndTime, setPromotionEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [transactionCode, setTransactionCode] = useState('');
  const [orderCode, setOrderCode] = useState<number>(0);
  const [currentPackageId, setCurrentPackageId] = useState('');
  const [payosInfo, setPayosInfo] = useState<{ bin: string, accountNumber: string, accountName: string, amount: number, description: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle'|'pending'|'completed'|'cancelled'>('idle');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const [pkgRes, promoRes] = await Promise.all([
          api.get('/packages'),
          api.get('/packages/promotion')
        ]);
        setPackages(pkgRes.data.packages);
        if (promoRes.data.endTime) {
          const end = new Date(promoRes.data.endTime);
          setPromotionEndTime(end);
          if (end.getTime() < new Date().getTime()) {
            setIsExpired(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (!promotionEndTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = promotionEndTime.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }
      setIsExpired(false);

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [promotionEndTime]);

  // Polling for payment status — chỉ chạy khi modal đang mở và đang chờ thanh toán
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;
    if (isModalOpen && orderCode && transactionCode && currentPackageId && paymentStatus === 'pending') {
      pollInterval = setInterval(async () => {
        try {
          const res = await api.post('/transactions/verify', {
            orderCode,
            packageId: currentPackageId,
            transactionCode
          });
          if (res.data.status === 'completed') {
            setPaymentStatus('completed');
            clearInterval(pollInterval);
            setIsModalOpen(false);
            alert('✅ Thanh toán thành công! Bạn đã được cộng thêm lượt phỏng vấn.');
            window.location.reload();
          } else if (res.data.status === 'cancelled') {
            setPaymentStatus('cancelled');
            clearInterval(pollInterval);
            setIsModalOpen(false);
            alert('❌ Giao dịch đã bị hủy.');
          }
        } catch (error) {
          console.error('Polling error', error);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval!);
  }, [isModalOpen, orderCode, transactionCode, currentPackageId, paymentStatus]);

  const handleSelectPackage = async (pkg: Package) => {
    if (!user) {
      navigate('/login?redirect=/packages');
      return;
    }
    try {
      setIsProcessing(true);
      const res = await api.post('/transactions/create', { packageId: pkg._id });
      setSelectedPkg(pkg);
      setTransactionCode(res.data.transactionCode);
      setOrderCode(res.data.orderCode);
      setCurrentPackageId(pkg._id);

      setPayosInfo({
        bin: res.data.bin,
        accountNumber: res.data.accountNumber,
        accountName: res.data.accountName,
        amount: res.data.amount,
        description: res.data.description
      });

      setPaymentStatus('pending');
      setIsModalOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (payosInfo?.description) {
      navigator.clipboard.writeText(payosInfo.description);
      alert('Đã sao chép mã thanh toán!');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '100%', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        <span>Trang chủ</span>
        <ChevronRight size={14} />
        <span style={{ color: 'rgba(255,255,255,0.9)' }}>Gói dịch vụ</span>
      </div>

      {/* Hero Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ 
          display: 'inline-block',
          backgroundColor: '#1b0f36', 
          color: '#e9d5ff', 
          padding: '0.4rem 1rem', 
          borderRadius: '99px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}>
          Gói luyện phỏng vấn AI
        </div>
        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>Đầu tư cho sự nghiệp</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: '0' }}>
          Luyện phỏng vấn cùng AI — đánh giá chi tiết từng câu trả lời, phân tích điểm mạnh & yếu, giúp bạn tự tin chinh phục nhà tuyển dụng.
        </p>
      </section>

      {/* Features 2-column Section */}
      <section style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '6rem' }}>
        {/* Left Column */}
        <div style={{ flex: 1 }}>

          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: '#1b0f36', 
            color: '#e9d5ff', 
            padding: '0.4rem 1rem', 
            borderRadius: '99px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <span>★</span> Quyền lợi đạt được
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 2rem 0', lineHeight: 1.3 }}>
            Nâng cấp kỹ năng phỏng vấn toàn<br/>diện với AI
          </h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              'Hướng dẫn trả lời câu hỏi theo phương pháp STAR',
              'Tips hướng dẫn trả lời đạt hiệu quả cao',
              'Hiểu được mục đích của nhà tuyển dụng qua các câu hỏi',
              'Đánh giá cá nhân hoá giúp bạn cải thiện câu trả lời',
              'Phân tích cá nhân hoá điểm mạnh, điểm yếu của bạn',
              'AI phân tích chi tiết câu trả lời như Nội dung, độ rõ ràng, Liên quan, Tự tin',
              'Xem lại video và bản ghi dạng text câu trả lời'
            ].map((text, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                <div style={{ color: '#a78bfa', marginTop: '2px' }}>
                  <CheckCircle size={18} strokeWidth={2.5} />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column (Macbook Image) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ 
            width: '100%',
            maxWidth: '550px',
            transform: 'perspective(1000px) rotateY(-2deg) rotateX(2deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/dashboard-mockup.png" 
              alt="Dashboard Preview" 
              style={{ width: '100%', display: 'block', objectFit: 'contain' }} 
            />
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 4rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Đang tải danh sách gói...</div>
        ) : (
          <div style={{ 
            backgroundColor: '#1b1411', // Dark brownish tint
            border: '1px solid #c25e00', 
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Orange Banner */}
            <div style={{ 
              backgroundColor: '#c25e00', 
              color: '#fff', 
              padding: '1rem 1.5rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} /> Kết thúc sau
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700 }}>
                <span style={{ backgroundColor: '#a14d00', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                  {timeLeft.days.toString().padStart(2, '0')}
                </span>:
                <span style={{ backgroundColor: '#a14d00', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>:
                <span style={{ backgroundColor: '#a14d00', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>:
                <span style={{ backgroundColor: '#a14d00', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Inner Content */}
            <div style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: '#f59e0b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 500 }}>
                <Info size={16} /> Tất cả gói đều bao gồm phản hồi AI và câu hỏi theo ngành
              </div>
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 3rem 0', fontWeight: 800 }}>So sánh nhanh các gói</h2>

              {isExpired ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', width: '100%' }}>
                  <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.25rem', fontWeight: 500 }}>Hiện chưa có gói dịch vụ nào.</h3>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  gap: '1.5rem',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  width: '100%',
                  flexWrap: 'wrap'
                }}>
                  {packages.map((pkg, idx) => {
                    const isPopular = pkg.isPopular; // STRICTLY FROM DB
                    return (
                    <div key={pkg._id} style={{
                      backgroundColor: '#161821', // Dark blue-ish gray
                      border: isPopular ? `1px solid ${pkg.color || '#6366f1'}` : '1px solid #2d3142',
                      boxShadow: isPopular ? `0 0 20px ${pkg.color || '#6366f1'}33` : 'none',
                      borderRadius: '16px',
                      padding: '2.5rem 2rem',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      minWidth: '280px',
                      maxWidth: '320px'
                    }}>
                      {isPopular && (
                        <div style={{
                          position: 'absolute',
                          top: '-14px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: pkg.color || '#6366f1',
                          color: 'white',
                          padding: '6px 20px',
                          borderRadius: '99px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Phổ biến nhất
                        </div>
                      )}

                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700 }}>{pkg.name}</h3>
                    
                    {pkg.originalPrice > pkg.price && (
                      <div style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {pkg.originalPrice.toLocaleString('vi-VN')}đ
                      </div>
                    )}
                    
                    <div style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                      {pkg.price.toLocaleString('vi-VN')} <span style={{ fontSize: '1.5rem', textDecoration: 'underline' }}>đ</span>
                    </div>

                    {pkg.originalPrice > pkg.price && (
                      <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem' }}>
                        Tiết kiệm {Math.round((1 - pkg.price/pkg.originalPrice) * 100)}%
                      </div>
                    )}

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                        <div style={{ color: pkg.color || "#818cf8", flexShrink: 0, marginTop: '2px' }}><MonitorPlay size={18} /></div>
                        <span><strong>{pkg.interviewAttempts} lượt</strong> luyện tập mô phỏng 1 buổi phỏng vấn thực tế</span>
                      </li>
                      {pkg.features.map((feature, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                          <div style={{ color: pkg.color || "#818cf8", flexShrink: 0, marginTop: '2px' }}><Check size={18} /></div>
                          {feature}
                        </li>
                      ))}
                      <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: 'auto' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0, marginTop: '2px' }}><Clock size={18} /></div>
                        {pkg.period}
                      </li>
                    </ul>

                    <button 
                      onClick={() => handleSelectPackage(pkg)}
                      style={{
                        backgroundColor: isPopular ? (pkg.color || '#6366f1') : 'transparent',
                        border: isPopular ? `1px solid ${pkg.color || '#6366f1'}` : '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        width: '100%'
                      }}
                      onMouseOver={e => !isPopular && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                      onMouseOut={e => !isPopular && (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {t('packages.buyNow', "Mua ngay")}
                    </button>
                  </div>
                )})}
              </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Payment Modal */}
      {isModalOpen && selectedPkg && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#1b132f', padding: '1.5rem', borderRadius: '16px', border: '1px solid #372061', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#c4b5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}>
                <span>←</span> Quay lại
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600 }}>
                <QrCode size={14} /> Thanh toán QR an toàn
              </div>
            </div>

            <div style={{ textAlign: 'left', marginTop: '0.5rem' }}>
              <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>{selectedPkg?.price.toLocaleString('vi-VN')} <span style={{ textDecoration: 'underline' }}>đ</span></h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: '0 0 0 100px', marginTop: '-15px' }}>thanh toán một lần</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
              <div style={{ padding: '0.8rem', backgroundColor: '#fff', borderRadius: '16px', display: 'inline-block' }}>
                {payosInfo && (
                  <img 
                    src={`https://img.vietqr.io/image/${payosInfo.bin}-${payosInfo.accountNumber}-compact.png?amount=${payosInfo.amount}&addInfo=${payosInfo.description}&accountName=${encodeURIComponent(payosInfo.accountName)}`} 
                    alt="QR Code PayOS" 
                    style={{ width: '220px', height: '220px', display: 'block' }} 
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: '#f59e0b', 
                border: '1px solid rgba(245, 158, 11, 0.3)', 
                padding: '0.5rem 1.5rem', 
                borderRadius: '99px', 
                fontSize: '0.9rem', 
                fontWeight: 600 
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                Đang chờ thanh toán...
              </div>
            </div>

            <div style={{ backgroundColor: '#130d21', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem', textAlign: 'center' }}>
                Nội dung chuyển khoản • Nhấn để sao chép
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '1px' }}>{payosInfo?.description || transactionCode}</span>
                <button onClick={copyToClipboard} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.2rem' }}>
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Đơn hàng của bạn</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#130d21', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{selectedPkg?.name || 'Package'}</span>
                <CheckCircle size={18} color="#10b981" />
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
