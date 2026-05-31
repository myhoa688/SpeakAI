import { Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Question = {
  _id: string;
  industryGroup: string;
  industry: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPublished: boolean;
  tags: string[];
  slug?: string;
  createdAt: string;
};

type FormData = {
  industryGroup: string;
  industry: string;
  specialization: string;
  question: string;
  guidance: string;
  sampleAnswer: string;
  difficulty: string;
  tags: string;
  slug: string;
  isPublished: boolean;
};

const EMPTY: FormData = { industryGroup: '', industry: '', specialization: '', question: '', guidance: '', sampleAnswer: '', difficulty: 'medium', tags: '', slug: '', isPublished: true };
const DIFF_LABEL: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const DIFF_COLOR: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      if (filterDiff) params.difficulty = filterDiff;
      if (filterPublished !== '') params.isPublished = filterPublished;
      const res = await api.get('/admin/questions', { params });
      setQuestions(res.data.questions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setErr('Không thể tải danh sách câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(1); setPage(1); }, [search, filterDiff, filterPublished]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal('create'); setErr(''); };
  const openEdit = (q: Question) => {
    setForm({ industryGroup: q.industryGroup, industry: q.industry, specialization: '', question: q.question, guidance: '', sampleAnswer: '', difficulty: q.difficulty, tags: q.tags.join(', '), slug: q.slug || '', isPublished: q.isPublished });
    setEditing(q); setModal('edit'); setErr('');
  };

  const save = async () => {
    if (!form.question.trim() || !form.industry.trim()) { setErr('Vui lòng điền câu hỏi và ngành nghề.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (modal === 'create') {
        await api.post('/admin/questions', payload);
        setMsg('Tạo câu hỏi thành công.');
      } else {
        await api.put(`/admin/questions/${editing!._id}`, payload);
        setMsg('Cập nhật thành công.');
      }
      setModal(null);
      await load(page);
    } catch (e: any) {
      setErr(e.response?.data?.message ?? 'Lỗi lưu câu hỏi.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (q: Question) => {
    try {
      await api.patch(`/admin/questions/${q._id}/publish`, { isPublished: !q.isPublished });
      await load(page);
    } catch { setErr('Lỗi cập nhật trạng thái.'); }
  };

  const del = async (q: Question) => {
    if (!window.confirm(`Xóa câu hỏi: "${q.question.slice(0, 60)}..."?`)) return;
    try {
      await api.delete(`/admin/questions/${q._id}`);
      setMsg('Đã xóa câu hỏi.');
      await load(page);
    } catch { setErr('Lỗi xóa câu hỏi.'); }
  };

  const inputStyle = { width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Ngân hàng câu hỏi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{total} câu hỏi</p>
        </div>
        <button type="button" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          <Plus size={16} /> Thêm câu hỏi
        </button>
      </div>

      {msg && <p style={{ color: '#22c55e', marginBottom: 12 }}>{msg}</p>}
      {err && !modal && <p style={{ color: '#ef4444', marginBottom: 12 }}>{err}</p>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm câu hỏi..." style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
        <select value={filterPublished} onChange={e => setFilterPublished(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đã xuất bản</option>
          <option value="false">Ẩn</option>
        </select>
      </div>

      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Đang tải...</p> : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Câu hỏi', 'Ngành', 'Độ khó', 'Trạng thái', 'Hành động'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 12px', maxWidth: 400 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question}</div>
                      {q.slug && <div style={{ fontSize: 11, color: 'var(--accent-primary)', marginTop: 4 }}>/{q.slug}</div>}
                      {q.tags.length > 0 && <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>{q.tags.slice(0, 3).map(t => <span key={t} style={{ fontSize: 11, padding: '2px 6px', background: '#18191b', borderRadius: 4, color: 'var(--text-tertiary)' }}>{t}</span>)}</div>}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{q.industry}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#18191b', color: DIFF_COLOR[q.difficulty] }}>{DIFF_LABEL[q.difficulty]}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#18191b', color: q.isPublished ? '#22c55e' : '#ef4444' }}>{q.isPublished ? 'Xuất bản' : 'Ẩn'}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => openEdit(q)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}><Pencil size={14} /></button>
                        <button type="button" onClick={() => togglePublish(q)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: q.isPublished ? '#f59e0b' : '#22c55e', display: 'flex', alignItems: 'center' }}>{q.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        <button type="button" onClick={() => del(q)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>Không có câu hỏi nào.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button type="button" disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === 1 ? 0.4 : 1 }}>←</button>
              <span style={{ padding: '6px 14px', color: 'var(--text-secondary)', fontSize: 14 }}>Trang {page} / {totalPages}</span>
              <button type="button" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: page === totalPages ? 0.4 : 1 }}>→</button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{modal === 'create' ? 'Thêm câu hỏi' : 'Sửa câu hỏi'}</h3>
              <button type="button" onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            {err && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: 13 }}>{err}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Câu hỏi *</label><textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div><label style={labelStyle}>SEO Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="cau-hoi-mau" style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Nhóm ngành</label><input value={form.industryGroup} onChange={e => setForm(f => ({ ...f, industryGroup: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Ngành nghề *</label><input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Chuyên môn</label><input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Gợi ý trả lời</label><textarea value={form.guidance} onChange={e => setForm(f => ({ ...f, guidance: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div><label style={labelStyle}>Câu trả lời mẫu</label><textarea value={form.sampleAnswer} onChange={e => setForm(f => ({ ...f, sampleAnswer: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Độ khó</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={inputStyle}>
                    <option value="easy">Dễ</option><option value="medium">Trung bình</option><option value="hard">Khó</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Tags (cách nhau bởi dấu phẩy)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="react, frontend, ..." style={inputStyle} /></div>
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
