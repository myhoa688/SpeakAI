import { Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type InterviewSet = {
  _id: string;
  title: string;
  company: string;
  industry: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  durationMinutes: number;
  experienceLevel: string;
  logoUrl?: string;
  isPublished: boolean;
  attemptCount: number;
  averageScore: number;
};

type FormData = {
  title: string;
  company: string;
  industry: string;
  category: string;
  difficulty: string;
  questionCount: string;
  durationMinutes: string;
  experienceLevel: string;
  jobDescription: string;
  logoUrl: string;
  tags: string;
  isPublished: boolean;
};

const EMPTY: FormData = { title: '', company: '', industry: '', category: 'general', difficulty: 'medium', questionCount: '5', durationMinutes: '15', experienceLevel: 'junior', jobDescription: '', logoUrl: '', tags: '', isPublished: true };
const DIFF_COLOR: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const DIFF_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const CAT_LABEL: Record<string, string> = { technical: 'Kỹ thuật', behavioral: 'Hành vi', management: 'Quản lý', general: 'Tổng quát' };

export function AdminInterviewSets() {
  const [sets, setSets] = useState<InterviewSet[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<InterviewSet | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      if (filterDiff) params.difficulty = filterDiff;
      if (filterPublished !== '') params.isPublished = filterPublished;
      const res = await api.get('/admin/interview-sets', { params });
      setSets(res.data.sets);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setErr('Không thể tải danh sách bộ đề.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(1); setPage(1); }, [search, filterDiff, filterPublished]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal('create'); setErr(''); setMsg(''); };
  const openEdit = (s: InterviewSet) => {
    setForm({ title: s.title, company: s.company, industry: s.industry, category: s.category, difficulty: s.difficulty, questionCount: String(s.questionCount), durationMinutes: String(s.durationMinutes), experienceLevel: s.experienceLevel, jobDescription: '', logoUrl: s.logoUrl || '', tags: '', isPublished: s.isPublished });
    setEditing(s); setModal('edit'); setErr(''); setMsg('');
  };

  const save = async () => {
    if (!form.title.trim() || !form.company.trim()) { setErr('Vui lòng điền tiêu đề và công ty.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form, questionCount: Number(form.questionCount), durationMinutes: Number(form.durationMinutes), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (modal === 'create') {
        await api.post('/admin/interview-sets', payload);
        setMsg('Tạo bộ đề thành công.');
      } else {
        await api.put(`/admin/interview-sets/${editing!._id}`, payload);
        setMsg('Cập nhật thành công.');
      }
      setModal(null);
      await load(page);
    } catch (e: any) {
      setErr(e.response?.data?.message ?? 'Lỗi lưu bộ đề.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.jobDescription.trim()) {
      setErr('Vui lòng nhập Tiêu đề, Công ty và JD (Job Description) trước khi dùng AI.');
      return;
    }
    setGenerating(true);
    setErr('');
    try {
      const res = await api.post('/admin/interview-sets/generate-from-jd', {
        jdText: form.jobDescription,
        company: form.company,
        title: form.title,
        industry: form.industry,
        experienceLevel: form.experienceLevel,
        difficulty: form.difficulty,
        questionCount: form.questionCount
      });
      setMsg(`Tạo thành công ${res.data.questions?.length || 12} câu hỏi từ JD.`);
      setModal(null);
      await load(1);
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Lỗi khi gọi AI. Vui lòng thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const togglePublish = async (s: InterviewSet) => {
    try {
      await api.patch(`/admin/interview-sets/${s._id}/publish`, { isPublished: !s.isPublished });
      await load(page);
    } catch { setErr('Lỗi cập nhật trạng thái.'); }
  };

  const del = async (s: InterviewSet) => {
    if (!window.confirm(`Xóa bộ đề: "${s.title}"?`)) return;
    try {
      await api.delete(`/admin/interview-sets/${s._id}`);
      setMsg('Đã xóa bộ đề.');
      await load(page);
    } catch { setErr('Lỗi xóa bộ đề.'); }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Bộ đề phỏng vấn</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{total} bộ đề</p>
        </div>
        <button type="button" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          <Plus size={16} /> Thêm bộ đề
        </button>
      </div>

      {msg && <p style={{ color: '#22c55e', marginBottom: 12 }}>{msg}</p>}
      {err && !modal && <p style={{ color: '#ef4444', marginBottom: 12 }}>{err}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bộ đề..." style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Tất cả độ khó</option>
          <option value="easy">Dễ</option><option value="medium">Trung bình</option><option value="hard">Khó</option>
        </select>
        <select value={filterPublished} onChange={e => setFilterPublished(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Xuất bản</option><option value="false">Ẩn</option>
        </select>
      </div>

      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Đang tải...</p> : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Bộ đề', 'Công ty', 'Loại / Độ khó', 'Câu hỏi', 'Lượt thử', 'Trạng thái', 'Hành động'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sets.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 12px', maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{s.industry}</div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {s.logoUrl ? (
                          <img src={s.logoUrl} alt={s.company} style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'contain', background: '#fff' }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>{s.company.charAt(0)}</div>
                        )}
                        <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.company}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{CAT_LABEL[s.category] ?? s.category}</div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#18191b', color: DIFF_COLOR[s.difficulty] }}>{DIFF_LABEL[s.difficulty]}</span>
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'center' }}>{s.questionCount} câu / {s.durationMinutes} phút</td>
                    <td style={{ padding: '12px 12px', textAlign: 'center' }}>{s.attemptCount}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#18191b', color: s.isPublished ? '#22c55e' : '#ef4444' }}>{s.isPublished ? 'Xuất bản' : 'Ẩn'}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => openEdit(s)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}><Pencil size={14} /></button>
                        <button type="button" onClick={() => togglePublish(s)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: s.isPublished ? '#f59e0b' : '#22c55e', display: 'flex', alignItems: 'center' }}>{s.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        <button type="button" onClick={() => del(s)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sets.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>Không có bộ đề nào.</td></tr>}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button type="button" disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === 1 ? 0.4 : 1 }}>←</button>
              <span style={{ padding: '6px 14px', color: 'var(--text-secondary)', fontSize: 14 }}>Trang {page} / {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === totalPages ? 0.4 : 1 }}>→</button>
            </div>
          )}
        </>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 28, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{modal === 'create' ? 'Thêm bộ đề' : 'Sửa bộ đề'}</h3>
              <button type="button" onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            {err && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: 13 }}>{err}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Tiêu đề *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Công ty *</label><input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Ngành nghề</label><input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Loại phỏng vấn</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                    <option value="general">Tổng quát</option><option value="technical">Kỹ thuật</option><option value="behavioral">Hành vi</option><option value="management">Quản lý</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Độ khó</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={inputStyle}>
                    <option value="easy">Dễ</option><option value="medium">Trung bình</option><option value="hard">Khó</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Số câu hỏi</label><input type="number" min={1} max={30} value={form.questionCount} onChange={e => setForm(f => ({ ...f, questionCount: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Thời gian (phút)</label><input type="number" min={5} value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Cấp độ kinh nghiệm</label>
                  <select value={form.experienceLevel} onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))} style={inputStyle}>
                    <option value="fresher">Fresher</option><option value="junior">Junior</option><option value="mid">Mid-level</option><option value="senior">Senior</option><option value="lead">Lead</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>URL Logo công ty</label><input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." style={inputStyle} /></div>
                <div><label style={labelStyle}>Tags (cách nhau bởi dấu phẩy)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="react, frontend, ..." style={inputStyle} /></div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Mô tả công việc (JD)</label>
                  <button type="button" onClick={handleGenerateAI} disabled={generating} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', cursor: generating ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, opacity: generating ? 0.7 : 1 }}>
                    {generating ? 'Đang phân tích...' : '✨ Tạo câu hỏi bằng AI'}
                  </button>
                </div>
                <textarea value={form.jobDescription} onChange={e => setForm(f => ({ ...f, jobDescription: e.target.value }))} rows={5} placeholder="Dán nội dung Job Description vào đây..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
                Xuất bản ngay
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModal(null)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 14 }}>Hủy</button>
              <button type="button" onClick={save} disabled={saving} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--accent-primary)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, opacity: saving ? 0.7 : 1 }}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
