import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Award, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

interface HistorySession {
  id: string;
  industry: string;
  specialization: string;
  difficulty: string;
  overallScore: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: string;
}

const difficultyLabel: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó'
};

const getScoreClass = (score: number) => {
  if (score >= 75) return 'success';
  if (score >= 55) return 'warning';
  return 'danger';
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateString));
};

export function InterviewHistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/interviews/history');
      setSessions(res.data?.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="section-heading">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="var(--primary)" />
            Lịch sử phỏng vấn
          </h2>
          <p className="muted-text">Xem lại các bộ phỏng vấn đã hoàn thành, rút kinh nghiệm và tiếp tục luyện tập.</p>
        </div>
        <Link to="/interview" className="primary-button">
          <RefreshCw size={16} />
          Bắt đầu phiên mới
        </Link>
      </div>

      {loading ? (
        <div className="panel-card" style={{ textAlign: 'center', padding: '3rem' }}>Đang tải lịch sử...</div>
      ) : sessions.length === 0 ? (
        <div className="panel-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <History size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
          <h3>Chưa có lịch sử</h3>
          <p className="muted-text" style={{ marginBottom: '1.5rem' }}>Bạn chưa hoàn thành phiên phỏng vấn nào. Hãy bắt đầu luyện tập ngay!</p>
          <Link to="/interview" className="primary-button">Phỏng vấn ngay</Link>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
          {sessions.map((s) => (
            <Link key={s.id} to={`/interview/${s.id}/result`} className="panel-card elevated-surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit', padding: '1.25rem 1.5rem', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', 
                  background: 'var(--surface-sunken)', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', justifyContent: 'center',
                  border: `2px solid var(--${getScoreClass(s.overallScore)})`
                }}>
                  <strong style={{ fontSize: '1.2rem', color: `var(--${getScoreClass(s.overallScore)})` }}>{s.overallScore}</strong>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{s.specialization || s.industry || 'Luyện tập chung'}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                    <span className="badge-soft">{difficultyLabel[s.difficulty] || s.difficulty}</span>
                    <span>{s.totalQuestions} câu hỏi</span>
                    <span>•</span>
                    <span>{s.completedAt ? formatDate(s.completedAt) : ''}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)' }}>
                  <Zap size={16} />
                  <strong>+{s.xpEarned} XP</strong>
                </div>
                <ChevronRight color="var(--text-tertiary)" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
