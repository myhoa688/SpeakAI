# X-Interview Clone — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng SpeakAI thành nền tảng luyện phỏng vấn AI giống x-interview.com — có Interview Sets catalog, Landing page chuyên nghiệp với stats + marquee logos + featured sets, Dashboard tích hợp, hệ thống scoring gamification "Top X%", và trang Packages.

**Architecture:** Frontend React + Vite (TypeScript), Backend Express + MongoDB (TypeScript). Dùng pattern có sẵn: `api` axios wrapper ở frontend, `authRequired` middleware ở backend, Mongoose models.

**Tech Stack:** React, React Router, Lucide React, Recharts, Express, Mongoose, Groq AI SDK (đã có sẵn).

---

## GAP Analysis vs X-Interview

| Tính năng X-Interview | Trạng thái | Cần làm |
|---|---|---|
| Interview Sets (catalog JD thật) | ❌ Không có | ✅ Task 1+2+3 |
| Landing page: stats + trust logos + FAQ | ⚠️ Thiếu | ✅ Task 5 |
| Dashboard widget Interview Sets | ❌ Không có | ✅ Task 6 |
| Sidebar: Bộ phỏng vấn + Gói dịch vụ | ⚠️ Thiếu | ✅ Task 4+8 |
| Result: "Top X%!" ranking badge | ❌ Không có | ✅ Task 7 |
| Packages/Pricing page | ❌ Không có | ✅ Task 8 |

---

## File Structure Overview

### Backend — New/Modified
- **[NEW]** `backend/src/models/InterviewSet.ts` — Mongoose schema
- **[NEW]** `backend/src/routes/interviewSetRoutes.ts` — List/detail/stats APIs
- **[NEW]** `backend/src/scripts/seedInterviewSets.ts` — 12 seed sets
- **[MOD]** `backend/src/app.ts` — Mount `/api/interview-sets`

### Frontend — New/Modified
- **[NEW]** `frontend/src/pages/InterviewSetsPage.tsx` — Catalog page
- **[NEW]** `frontend/src/pages/PackagesPage.tsx` — Pricing page
- **[MOD]** `frontend/src/pages/LandingPage.tsx` — Complete overhaul
- **[MOD]** `frontend/src/pages/DashboardPage.tsx` — Add featured sets widget
- **[MOD]** `frontend/src/pages/InterviewResultPage.tsx` — Top X% badge
- **[MOD]** `frontend/src/components/AppShell.tsx` — Sidebar nav update
- **[MOD]** `frontend/src/App.tsx` — New routes
- **[MOD]** `frontend/src/types.ts` — InterviewSet type
- **[MOD]** `frontend/src/styles.css` — New component CSS

---

## Task 1: InterviewSet Model + Seed Data

**Files:**
- Create: `backend/src/models/InterviewSet.ts`
- Create: `backend/src/scripts/seedInterviewSets.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Tạo Mongoose Schema**

```typescript
// backend/src/models/InterviewSet.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewSet extends Document {
  title: string;
  company: string;
  industry: string;
  category: 'technical' | 'behavioral' | 'management' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  durationMinutes: number;
  jobDescription: string;
  tags: string[];
  isPublished: boolean;
  attemptCount: number;
  averageScore: number;
  createdAt: Date;
}

const InterviewSetSchema = new Schema<IInterviewSet>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    industry: { type: String, required: true },
    category: { type: String, enum: ['technical', 'behavioral', 'management', 'general'], default: 'general' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questionCount: { type: Number, default: 5 },
    durationMinutes: { type: Number, default: 15 },
    jobDescription: { type: String, required: true },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    attemptCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const InterviewSet = mongoose.model<IInterviewSet>('InterviewSet', InterviewSetSchema);
```

- [ ] **Step 2: Tạo seed script với 12 sets thực tế**

```typescript
// backend/src/scripts/seedInterviewSets.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { InterviewSet } from '../models/InterviewSet.js';

const sets = [
  {
    title: 'Frontend Developer (React)',
    company: 'VNG Corporation',
    industry: 'Công nghệ thông tin',
    category: 'technical', difficulty: 'medium',
    questionCount: 5, durationMinutes: 15,
    tags: ['React', 'TypeScript', 'JavaScript', 'CSS'],
    attemptCount: 1240, averageScore: 72,
    jobDescription: `Vị trí: Frontend Developer\nCông ty: VNG Corporation\n\nYêu cầu:\n- 2+ năm kinh nghiệm với React và TypeScript\n- Thành thạo HTML5, CSS3, responsive design\n- Kinh nghiệm với REST APIs và state management (Redux, Zustand)\n- Quen thuộc với Git, CI/CD pipeline\n\nƯu tiên:\n- Kinh nghiệm với Next.js, Vite\n- Hiểu biết về Web Performance Optimization`,
  },
  {
    title: 'Backend Developer (Node.js)',
    company: 'Shopee Vietnam',
    industry: 'Thương mại điện tử',
    category: 'technical', difficulty: 'hard',
    questionCount: 5, durationMinutes: 20,
    tags: ['Node.js', 'MongoDB', 'Redis', 'Microservices'],
    attemptCount: 890, averageScore: 65,
    jobDescription: `Vị trí: Backend Developer (Node.js)\nCông ty: Shopee Vietnam\n\nYêu cầu:\n- 3+ năm kinh nghiệm Node.js\n- Kinh nghiệm sâu về MongoDB/PostgreSQL\n- Hiểu biết về Redis, message queues (Kafka/RabbitMQ)\n- Kinh nghiệm deploy trên AWS/GCP, Docker, Kubernetes`,
  },
  {
    title: 'Data Analyst',
    company: 'MoMo E-Wallet',
    industry: 'Fintech',
    category: 'technical', difficulty: 'medium',
    questionCount: 5, durationMinutes: 15,
    tags: ['SQL', 'Python', 'Excel', 'Power BI'],
    attemptCount: 650, averageScore: 68,
    jobDescription: `Vị trí: Data Analyst\nCông ty: MoMo\n\nYêu cầu:\n- Thành thạo SQL (queries phức tạp, optimization)\n- Python (Pandas, NumPy, Matplotlib)\n- Kinh nghiệm với BI tools (Power BI, Tableau)\n- Tư duy phân tích và trình bày dữ liệu rõ ràng`,
  },
  {
    title: 'Product Manager',
    company: 'Grab Vietnam',
    industry: 'Công nghệ - Logistics',
    category: 'management', difficulty: 'hard',
    questionCount: 5, durationMinutes: 20,
    tags: ['Product Strategy', 'Agile', 'OKRs', 'User Research'],
    attemptCount: 430, averageScore: 61,
    jobDescription: `Vị trí: Product Manager\nCông ty: Grab Vietnam\n\nYêu cầu:\n- 3+ năm kinh nghiệm PM tại tech company\n- Kinh nghiệm với Agile/Scrum, A/B testing\n- Khả năng phân tích data và đưa ra quyết định product\n- Kỹ năng giao tiếp và thuyết phục xuất sắc`,
  },
  {
    title: 'UI/UX Designer',
    company: 'FPT Software',
    industry: 'Công nghệ thông tin',
    category: 'technical', difficulty: 'easy',
    questionCount: 5, durationMinutes: 15,
    tags: ['Figma', 'User Research', 'Design System', 'Prototyping'],
    attemptCount: 780, averageScore: 75,
    jobDescription: `Vị trí: UI/UX Designer\nCông ty: FPT Software\n\nYêu cầu:\n- 2+ năm kinh nghiệm UX/UI design\n- Thành thạo Figma (Auto Layout, Components, Variants)\n- Portfolio thể hiện process design rõ ràng\n- Hiểu biết về design principles và accessibility`,
  },
  {
    title: 'DevOps Engineer',
    company: 'VinAI Research',
    industry: 'AI - Công nghệ',
    category: 'technical', difficulty: 'hard',
    questionCount: 5, durationMinutes: 20,
    tags: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    attemptCount: 320, averageScore: 58,
    jobDescription: `Vị trí: DevOps Engineer\nCông ty: VinAI Research\n\nYêu cầu:\n- 3+ năm kinh nghiệm DevOps/SRE\n- Thành thạo AWS hoặc GCP, Kubernetes (EKS/GKE)\n- Infrastructure as Code (Terraform)\n- Monitoring (Prometheus, Grafana, ELK stack)`,
  },
  {
    title: 'Business Analyst',
    company: 'Vietcombank',
    industry: 'Tài chính - Ngân hàng',
    category: 'behavioral', difficulty: 'medium',
    questionCount: 5, durationMinutes: 15,
    tags: ['Requirements Analysis', 'SQL', 'Banking Domain', 'BPMN'],
    attemptCount: 560, averageScore: 70,
    jobDescription: `Vị trí: Business Analyst\nCông ty: Vietcombank\n\nYêu cầu:\n- 2+ năm kinh nghiệm BA tại ngân hàng hoặc fintech\n- Hiểu biết nghiệp vụ ngân hàng (core banking, payment, credit)\n- Kỹ năng viết tài liệu rõ ràng (BRD, FRD, User Stories)\n- Thành thạo SQL cơ bản`,
  },
  {
    title: 'QA Engineer',
    company: 'Techcombank',
    industry: 'Tài chính - Ngân hàng',
    category: 'technical', difficulty: 'easy',
    questionCount: 5, durationMinutes: 15,
    tags: ['Manual Testing', 'Selenium', 'Postman', 'JIRA', 'Agile'],
    attemptCount: 890, averageScore: 74,
    jobDescription: `Vị trí: QA Engineer\nCông ty: Techcombank\n\nYêu cầu:\n- 2+ năm kinh nghiệm QA/testing\n- Kinh nghiệm automation testing (Selenium, Playwright, Cypress)\n- Hiểu biết về API testing với Postman\n- Kinh nghiệm test banking applications là lợi thế`,
  },
  {
    title: 'Full Stack Developer',
    company: 'Tiki',
    industry: 'Thương mại điện tử',
    category: 'technical', difficulty: 'medium',
    questionCount: 5, durationMinutes: 15,
    tags: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
    attemptCount: 1050, averageScore: 71,
    jobDescription: `Vị trí: Full Stack Developer\nCông ty: Tiki\n\nYêu cầu:\n- 2+ năm kinh nghiệm full-stack (React + Node.js)\n- Thành thạo SQL và NoSQL databases\n- Hiểu biết về RESTful APIs và GraphQL\n- Kinh nghiệm với Docker, Git workflow`,
  },
  {
    title: 'Marketing Manager (Digital)',
    company: 'VinGroup',
    industry: 'Đa ngành',
    category: 'management', difficulty: 'medium',
    questionCount: 5, durationMinutes: 15,
    tags: ['Digital Marketing', 'SEO/SEM', 'Social Media', 'Analytics'],
    attemptCount: 410, averageScore: 69,
    jobDescription: `Vị trí: Digital Marketing Manager\nCông ty: VinGroup\n\nYêu cầu:\n- 4+ năm kinh nghiệm digital marketing\n- Thành thạo Google Analytics, Google Ads, Facebook Ads Manager\n- Kinh nghiệm SEO technical và content\n- Kỹ năng phân tích data và đưa ra insights`,
  },
  {
    title: 'HR Business Partner',
    company: 'Samsung Vietnam',
    industry: 'Điện tử - Sản xuất',
    category: 'behavioral', difficulty: 'medium',
    questionCount: 5, durationMinutes: 15,
    tags: ['Talent Acquisition', 'Employee Relations', 'Performance Management', 'HRBP'],
    attemptCount: 290, averageScore: 67,
    jobDescription: `Vị trí: HR Business Partner\nCông ty: Samsung Vietnam\n\nYêu cầu:\n- 3+ năm kinh nghiệm HR trong môi trường sản xuất\n- Hiểu biết về luật lao động Việt Nam\n- Kinh nghiệm tuyển dụng khối lượng lớn\n- Tiếng Anh và/hoặc tiếng Hàn là lợi thế`,
  },
  {
    title: 'Mobile Developer (React Native)',
    company: 'Be Group',
    industry: 'Công nghệ - Giao thông',
    category: 'technical', difficulty: 'medium',
    questionCount: 5, durationMinutes: 15,
    tags: ['React Native', 'iOS', 'Android', 'Redux', 'Maps SDK'],
    attemptCount: 480, averageScore: 69,
    jobDescription: `Vị trí: Mobile Developer (React Native)\nCông ty: Be Group\n\nYêu cầu:\n- 2+ năm kinh nghiệm React Native\n- Hiểu biết native iOS (Swift) hoặc Android (Kotlin) là lợi thế\n- Kinh nghiệm publish app lên App Store và Google Play\n- Hiểu biết về deep linking và push notifications`,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');
  await InterviewSet.deleteMany({});
  console.log('Cleared existing InterviewSets');
  await InterviewSet.insertMany(sets);
  console.log(`Seeded ${sets.length} InterviewSets`);
  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
```

- [ ] **Step 3: Thêm script vào backend/package.json**

Trong mục `"scripts"` của `backend/package.json`, thêm:
```json
"seed:interview-sets": "tsx src/scripts/seedInterviewSets.ts"
```

- [ ] **Step 4: Chạy seed và xác nhận**

```bash
cd backend && npm run seed:interview-sets
```

Expected output:
```
Connected to MongoDB
Cleared existing InterviewSets
Seeded 12 InterviewSets
Done!
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/InterviewSet.ts backend/src/scripts/seedInterviewSets.ts backend/package.json
git commit -m "feat: add InterviewSet model and seed 12 realistic Vietnamese interview sets"
```

---

## Task 2: Interview Sets API Routes

**Files:**
- Create: `backend/src/routes/interviewSetRoutes.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Tạo routes file**

```typescript
// backend/src/routes/interviewSetRoutes.ts
import { Router } from 'express';
import { InterviewSet } from '../models/InterviewSet.js';

const router = Router();

// GET /api/interview-sets?industry=...&difficulty=...&search=...&featured=true&limit=12&page=1
router.get('/', async (req, res) => {
  const { industry, difficulty, category, search, limit = '12', page = '1', featured } = req.query as Record<string, string>;

  const filter: Record<string, any> = { isPublished: true };
  if (industry) filter.industry = { $regex: industry, $options: 'i' };
  if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) filter.difficulty = difficulty;
  if (category) filter.category = category;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { company: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } }
  ];

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const sortBy = featured === 'true' ? { attemptCount: -1 } : { createdAt: -1 };

  const [sets, total] = await Promise.all([
    InterviewSet.find(filter).sort(sortBy as any).skip((pageNum - 1) * limitNum).limit(limitNum).select('-jobDescription').lean(),
    InterviewSet.countDocuments(filter)
  ]);

  return res.json({ sets, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

// GET /api/interview-sets/stats
router.get('/stats', async (_req, res) => {
  const [totalSets, attemptsAgg] = await Promise.all([
    InterviewSet.countDocuments({ isPublished: true }),
    InterviewSet.aggregate([{ $group: { _id: null, total: { $sum: '$attemptCount' } } }])
  ]);
  return res.json({ totalSets, totalAttempts: attemptsAgg[0]?.total ?? 0, totalQuestions: 20000, totalCompanies: 129, rating: 4.9 });
});

// GET /api/interview-sets/:id
router.get('/:id', async (req, res) => {
  const set = await InterviewSet.findById(req.params.id).lean();
  if (!set || !set.isPublished) return res.status(404).json({ message: 'Không tìm thấy bộ phỏng vấn.' });
  return res.json(set);
});

export default router;
```

- [ ] **Step 2: Mount route trong app.ts**

```typescript
// backend/src/app.ts — thêm:
import interviewSetRoutes from './routes/interviewSetRoutes.js';
// Thêm sau các routes khác:
app.use('/api/interview-sets', interviewSetRoutes);
```

- [ ] **Step 3: Test API**

```bash
curl http://localhost:5000/api/interview-sets?limit=3
# Expected: { sets: [...], pagination: { total: 12, ... } }

curl http://localhost:5000/api/interview-sets/stats
# Expected: { totalSets: 12, totalAttempts: ..., totalQuestions: 20000, ... }
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/interviewSetRoutes.ts backend/src/app.ts
git commit -m "feat: add interview sets API (list + filter + stats + detail)"
```

---

## Task 3: InterviewSetsPage Frontend

**Files:**
- Modify: `frontend/src/types.ts`
- Create: `frontend/src/pages/InterviewSetsPage.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Thêm types**

Thêm vào cuối `frontend/src/types.ts`:
```typescript
export interface InterviewSet {
  _id: string;
  title: string;
  company: string;
  industry: string;
  category: 'technical' | 'behavioral' | 'management' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  durationMinutes: number;
  tags: string[];
  attemptCount: number;
  averageScore: number;
  createdAt: string;
}

export interface InterviewSetsStats {
  totalSets: number;
  totalAttempts: number;
  totalQuestions: number;
  totalCompanies: number;
  rating: number;
}
```

- [ ] **Step 2: Tạo InterviewSetsPage.tsx**

```tsx
// frontend/src/pages/InterviewSetsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, Clock, Filter, Loader2, PlayCircle, Search, Star, Users } from 'lucide-react';
import { api } from '../lib/api';
import type { InterviewSet } from '../types';

const DIFFICULTY_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' } as const;
const DIFFICULTY_CLASS = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' } as const;
const CATEGORY_LABEL = { technical: 'Kỹ thuật', behavioral: 'Hành vi', management: 'Quản lý', general: 'Tổng quát' } as const;
const INDUSTRY_OPTIONS = ['Tất cả', 'Công nghệ thông tin', 'Tài chính - Ngân hàng', 'Thương mại điện tử', 'Fintech', 'AI - Công nghệ', 'Đa ngành', 'Điện tử - Sản xuất', 'Công nghệ - Logistics', 'Công nghệ - Giao thông'];

export function InterviewSetsPage() {
  const navigate = useNavigate();
  const [sets, setSets] = useState<InterviewSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('Tất cả');
  const [difficulty, setDifficulty] = useState('');

  const loadSets = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '20' };
      if (search.trim()) params.search = search.trim();
      if (industry !== 'Tất cả') params.industry = industry;
      if (difficulty) params.difficulty = difficulty;
      const res = await api.get('/interview-sets', { params });
      setSets(res.data.sets);
    } catch { setSets([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { void loadSets(); }, 300);
    return () => clearTimeout(timer);
  }, [search, industry, difficulty]);

  const handleStart = (set: InterviewSet) => {
    navigate('/interview', { state: { fromSet: true, setId: set._id, setTitle: set.title, setCompany: set.company, difficulty: set.difficulty } });
  };

  return (
    <div className="page-stack">
      <section className="panel-card">
        <p className="eyebrow">Luyện tập phỏng vấn</p>
        <h2 style={{ margin: '0.25rem 0 0.5rem' }}>Bộ phỏng vấn theo JD thực tế</h2>
        <p className="muted-text">Luyện tập với JD từ các công ty hàng đầu Việt Nam. AI hỏi đúng trọng tâm từng vị trí.</p>
      </section>

      <section className="panel-card" style={{ padding: '1rem 1.5rem' }}>
        <div className="isets-filter-bar">
          <div className="isets-search-wrap">
            <Search size={16} />
            <input type="text" placeholder="Tìm theo vị trí, công ty, kỹ năng..." value={search} onChange={e => setSearch(e.target.value)} className="isets-search-input" />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="filter-select">
              {INDUSTRY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="filter-select">
              <option value="">Mọi độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="panel-card" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} className="spinner" color="var(--primary)" />
        </div>
      ) : sets.length === 0 ? (
        <div className="panel-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <BriefcaseBusiness size={40} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
          <p className="muted-text">Không tìm thấy bộ phỏng vấn phù hợp.</p>
        </div>
      ) : (
        <div className="isets-grid">
          {sets.map(set => (
            <article key={set._id} className="isets-card panel-card">
              <div className="isets-card-header">
                <div className="isets-company-badge">{set.company.charAt(0)}</div>
                <div>
                  <h3 className="isets-card-title">{set.title}</h3>
                  <p className="isets-card-company">{set.company}</p>
                </div>
              </div>
              <div className="isets-tags">{set.tags.slice(0, 3).map(t => <span key={t} className="tag-chip">{t}</span>)}{set.tags.length > 3 && <span className="tag-chip">+{set.tags.length - 3}</span>}</div>
              <div className="isets-meta">
                <span className={`status-badge ${DIFFICULTY_CLASS[set.difficulty]}`}>{DIFFICULTY_LABEL[set.difficulty]}</span>
                <span className="isets-meta-item"><BriefcaseBusiness size={13} />{CATEGORY_LABEL[set.category]}</span>
                <span className="isets-meta-item"><Clock size={13} />{set.durationMinutes} phút</span>
              </div>
              <div className="isets-stats">
                <span className="isets-stat"><Users size={13} />{set.attemptCount.toLocaleString('vi-VN')} lượt</span>
                <span className="isets-stat"><Star size={13} fill="var(--warning)" color="var(--warning)" />TB {set.averageScore}/100</span>
                <span className="isets-stat">{set.questionCount} câu hỏi</span>
              </div>
              <button type="button" className="primary-button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleStart(set)}>
                <PlayCircle size={16} />Bắt đầu luyện tập
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Thêm CSS vào styles.css**

```css
/* ===== INTERVIEW SETS PAGE ===== */
.isets-filter-bar { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.isets-search-wrap { display: flex; align-items: center; gap: 0.5rem; background: var(--surface-sunken); border: 1px solid var(--border); border-radius: 9999px; padding: 0.5rem 1rem; flex: 1; min-width: 200px; color: var(--text-secondary); }
.isets-search-input { border: none; background: transparent; outline: none; color: var(--text-primary); font-size: 0.9rem; flex: 1; }
.filter-select { background: var(--surface-sunken); border: 1px solid var(--border); border-radius: 8px; padding: 0.4rem 0.75rem; color: var(--text-primary); font-size: 0.85rem; cursor: pointer; }
.isets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
.isets-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; transition: all 0.2s ease; }
.isets-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-color: rgba(99,102,241,0.3); }
.isets-card-header { display: flex; gap: 0.75rem; align-items: flex-start; }
.isets-company-badge { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), #7c3aed); color: white; font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.isets-card-title { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); line-height: 1.4; margin: 0; }
.isets-card-company { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }
.isets-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.isets-meta { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.isets-meta-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.78rem; color: var(--text-secondary); }
.isets-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.isets-stat { display: flex; align-items: center; gap: 0.25rem; font-size: 0.78rem; color: var(--text-secondary); }
/* Difficulty badges */
.status-badge.badge-easy { background: rgba(16,185,129,0.12); color: #059669; }
.status-badge.badge-medium { background: rgba(245,158,11,0.12); color: #d97706; }
.status-badge.badge-hard { background: rgba(239,68,68,0.12); color: #dc2626; }
```

- [ ] **Step 4: Thêm route vào App.tsx**

```tsx
// Thêm import:
import { InterviewSetsPage } from './pages/InterviewSetsPage';
// Thêm trong <Route element={<AppShell />}>:
<Route path="/interview-sets" element={<InterviewSetsPage />} />
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/InterviewSetsPage.tsx frontend/src/types.ts frontend/src/App.tsx frontend/src/styles.css
git commit -m "feat: add Interview Sets catalog page with filter and search"
```

---

## Task 4: Sidebar Navigation Update

**Files:**
- Modify: `frontend/src/components/AppShell.tsx`

- [ ] **Step 1: Xem AppShell hiện tại**

```bash
grep -n "navLinks\|NavItem\|to=" frontend/src/components/AppShell.tsx | head -30
```

- [ ] **Step 2: Thêm 2 nav items mới**

Tìm phần `navLinks` array hoặc navigation list trong `AppShell.tsx`. Thêm:

```tsx
// Thêm import icon ở đầu file nếu chưa có:
import { BriefcaseBusiness, ShoppingBag } from 'lucide-react';

// Thêm vào navLinks array (sau item /interview hoặc tương đương):
{ to: '/interview-sets', icon: BriefcaseBusiness, label: 'Bộ phỏng vấn' },
// Thêm cuối cùng hoặc trước Blog/Admin:
{ to: '/packages', icon: ShoppingBag, label: 'Gói dịch vụ' },
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/AppShell.tsx
git commit -m "feat: add Interview Sets and Packages links to sidebar navigation"
```

---

## Task 5: Landing Page Overhaul (X-Interview Style)

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Xóa toàn bộ nội dung cũ và viết lại LandingPage.tsx**

```tsx
// frontend/src/pages/LandingPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BrainCircuit, BriefcaseBusiness, CheckCircle2, FileSearch, Mic2, Sparkles, Star, Trophy, Users, Zap } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { api } from '../lib/api';
import type { InterviewSet, InterviewSetsStats } from '../types';

const TRUST_COMPANIES = ['FPT Software', 'VNG Corporation', 'VinAI', 'Shopee', 'Grab', 'MoMo', 'Tiki', 'Techcombank', 'Vietcombank', 'Samsung', 'Be Group', 'VinGroup'];

const HOW_IT_WORKS = [
  { step: '01', icon: BriefcaseBusiness, title: 'Chọn bộ phỏng vấn', desc: 'Chọn vị trí từ catalog JD thực tế của 100+ công ty hàng đầu Việt Nam.' },
  { step: '02', icon: Mic2, title: 'Luyện tập với AI', desc: 'AI đóng vai chuyên gia tuyển dụng, hỏi câu hỏi cá nhân hóa từ JD và CV.' },
  { step: '03', icon: BarChart3, title: 'Nhận đánh giá chi tiết', desc: 'Xem điểm từng câu, radar chart kỹ năng và ranking Top X%.' },
];

const FEATURES = [
  { icon: BriefcaseBusiness, title: 'Interview Sets theo JD thực', desc: 'Luyện với JD thật từ FPT, VNG, Shopee, Grab và 100+ công ty hàng đầu Việt Nam.' },
  { icon: BrainCircuit, title: 'AI hỏi nối tiếp thông minh', desc: 'AI điều chỉnh câu hỏi theo câu trả lời trước, tạo áp lực như phỏng vấn thật.' },
  { icon: FileSearch, title: 'Phân tích CV + JD', desc: 'Xác định kỹ năng khớp, thiếu và gợi ý trọng tâm cần chuẩn bị.' },
  { icon: BarChart3, title: 'Radar chart đánh giá kỹ năng', desc: 'Điểm chi tiết: nội dung, sự rõ ràng, chuyên môn, tự tin.' },
  { icon: Trophy, title: 'Xếp hạng & Gamification', desc: 'Ranking Top X%, XP, streak và bảng xếp hạng tuần.' },
  { icon: Zap, title: 'Real-time transcription', desc: 'Nhận bản ghi giọng nói tức thì qua Whisper AI để xem lại câu trả lời.' },
];

const FAQ = [
  { q: 'AI chấm điểm phỏng vấn như thế nào?', a: 'AI phân tích theo 4 tiêu chí: nội dung (40%), độ rõ ràng (20%), chuyên môn (20%), tự tin (20%). Mỗi tiêu chí được chấm 0–100, cho điểm tổng và feedback cụ thể.' },
  { q: 'Tôi cần chuẩn bị gì trước khi luyện tập?', a: 'Chỉ cần microphone và camera. Có thể upload CV để AI cá nhân hóa câu hỏi. Không cần cài thêm phần mềm.' },
  { q: 'Khác gì so với chỉ ôn câu hỏi thông thường?', a: 'SpeakAI mô phỏng áp lực phỏng vấn thực tế: bạn phải nói, bị ghi lại, và AI phản biện dựa trên câu trả lời trước — giống phỏng vấn thật 90%.' },
];

export function LandingPage() {
  const [stats, setStats] = useState<InterviewSetsStats | null>(null);
  const [featuredSets, setFeaturedSets] = useState<InterviewSet[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    void api.get('/interview-sets/stats').then(r => setStats(r.data)).catch(() => {});
    void api.get('/interview-sets?featured=true&limit=6').then(r => setFeaturedSets(r.data.sets)).catch(() => {});
  }, []);

  const statBlocks = [
    { label: 'Câu hỏi trong ngân hàng', value: '20K+' },
    { label: 'Lượt luyện tập', value: stats ? `${Math.floor(stats.totalAttempts / 1000)}K+` : '10K+' },
    { label: 'Công ty đối tác', value: '129+' },
    { label: 'Đánh giá', value: '4.9/5 ⭐' },
  ];

  return (
    <div className="landing-xinterview">
      {/* TOPBAR */}
      <header className="lxi-topbar">
        <div className="lxi-brand">
          <span className="lxi-brand-mark">SA</span>
          <div><strong>SpeakAI</strong><span>Luyện phỏng vấn cùng AI</span></div>
        </div>
        <nav className="lxi-nav">
          <a href="#tinh-nang">Tính năng</a>
          <a href="#bo-phong-van">Bộ phỏng vấn</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="lxi-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="ghost-button">Đăng nhập</Link>
          <Link to="/register" className="primary-button">Đăng ký miễn phí</Link>
        </div>
      </header>

      {/* HERO */}
      <section className="lxi-hero">
        <div className="lxi-hero-overlay" />
        <div className="lxi-hero-content">
          <div className="lxi-hero-badges">
            <span className="lxi-float-badge lxi-badge-score"><Star size={14} fill="#f59e0b" color="#f59e0b" />Điểm AI: 89/100</span>
            <span className="lxi-float-badge lxi-badge-rank"><Trophy size={14} />Top 10%!</span>
          </div>
          <p className="lxi-eyebrow">SpeakAI — AI Interview Platform</p>
          <h1>Chinh phục mọi buổi phỏng vấn cùng AI</h1>
          <p className="lxi-lead">Luyện tập với JD thực tế từ FPT, Shopee, Grab và 100+ công ty hàng đầu Việt Nam. AI chấm điểm từng câu và giúp bạn cải thiện từng ngày.</p>
          <div className="lxi-hero-social-proof">
            <div className="lxi-avatar-stack">{['A','B','C','D','E'].map(l => <span key={l} className="lxi-avatar">{l}</span>)}</div>
            <span><strong>10,000+</strong> lượt luyện tập</span>
            <span className="lxi-rating"><Star size={14} fill="#f59e0b" color="#f59e0b" />4.9/5</span>
          </div>
          <div className="lxi-cta-row">
            <Link to="/register" className="primary-button large-button"><Sparkles size={18} />Bắt đầu luyện tập →</Link>
            <Link to="/login" className="ghost-button large-button">Xem không gian luyện tập</Link>
          </div>
        </div>
      </section>

      {/* TRUST MARQUEE */}
      <section className="lxi-trust-strip">
        <div className="lxi-marquee-track">
          {[...TRUST_COMPANIES, ...TRUST_COMPANIES].map((c, i) => <span key={i} className="lxi-trust-logo">{c}</span>)}
        </div>
      </section>

      {/* STATS RIBBON */}
      <section className="lxi-stats-ribbon">
        {statBlocks.map(s => (
          <div key={s.label} className="lxi-stat-block"><strong>{s.value}</strong><span>{s.label}</span></div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="lxi-section">
        <div className="lxi-section-head">
          <div><p className="lxi-eyebrow">Quy trình</p><h2>3 bước đến buổi phỏng vấn tự tin</h2></div>
        </div>
        <div className="lxi-how-grid">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
            <article key={step} className="lxi-how-card">
              <div className="lxi-how-step">{step}</div>
              <div className="lxi-how-icon"><Icon size={22} /></div>
              <h3>{title}</h3><p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="tinh-nang" className="lxi-section lxi-features-section">
        <div className="lxi-section-head" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <p className="lxi-eyebrow">Tính năng</p><h2>Bộ công cụ luyện phỏng vấn toàn diện</h2>
        </div>
        <div className="lxi-features-grid">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="lxi-feature-card">
              <div className="lxi-feature-icon"><Icon size={20} /></div>
              <h3>{title}</h3><p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURED SETS */}
      {featuredSets.length > 0 && (
        <section id="bo-phong-van" className="lxi-section">
          <div className="lxi-section-head">
            <div><p className="lxi-eyebrow">Bộ phỏng vấn nổi bật</p><h2>Luyện theo JD thực từ công ty hàng đầu</h2></div>
            <Link to="/register" className="ghost-button">Xem tất cả <ArrowRight size={16} /></Link>
          </div>
          <div className="lxi-sets-grid">
            {featuredSets.map(set => (
              <article key={set._id} className="lxi-set-card">
                <div className="lxi-set-header">
                  <div className="lxi-set-badge">{set.company.charAt(0)}</div>
                  <div><h4>{set.title}</h4><p>{set.company}</p></div>
                </div>
                <div className="isets-tags">{set.tags.slice(0, 3).map(t => <span key={t} className="tag-chip">{t}</span>)}</div>
                <div className="lxi-set-footer">
                  <span className={`status-badge badge-${set.difficulty}`}>{{ easy: 'Dễ', medium: 'TB', hard: 'Khó' }[set.difficulty]}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{set.attemptCount.toLocaleString('vi-VN')} lượt</span>
                </div>
                <Link to="/register" className="primary-button" style={{ display: 'flex', justifyContent: 'center' }}>Bắt đầu luyện tập</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="lxi-section">
        <div className="lxi-section-head" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <p className="lxi-eyebrow">Câu hỏi thường gặp</p><h2>Bạn đang thắc mắc?</h2>
        </div>
        <div className="lxi-faq-list">
          {FAQ.map((item, i) => (
            <div key={i} className="lxi-faq-item">
              <button type="button" className="lxi-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {item.q}<span className={`lxi-faq-chevron ${faqOpen === i ? 'open' : ''}`}>▼</span>
              </button>
              {faqOpen === i && <p className="lxi-faq-a">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lxi-section lxi-cta-final">
        <h2>Tạo tài khoản và mở phiên luyện đầu tiên.</h2>
        <div className="lxi-cta-row">
          <Link to="/register" className="primary-button large-button"><Users size={18} />Đăng ký miễn phí</Link>
          <Link to="/login" className="ghost-button large-button">Tôi đã có tài khoản</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lxi-footer">
        <div className="lxi-footer-brand"><span className="lxi-brand-mark" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>SA</span><span>SpeakAI — Luyện phỏng vấn cùng AI</span></div>
        <div className="lxi-footer-links"><Link to="/login">Đăng nhập</Link><Link to="/register">Đăng ký</Link><a href="#faq">FAQ</a></div>
        <p className="muted-text" style={{ fontSize: '0.8rem' }}>© 2026 SpeakAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Thêm CSS landing page vào styles.css**

```css
/* ===== LANDING PAGE — X-INTERVIEW STYLE ===== */
.landing-xinterview { min-height: 100vh; background: var(--bg); }
.lxi-topbar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); gap: 1rem; }
[data-theme="dark"] .lxi-topbar, .dark .lxi-topbar { background: rgba(10,10,10,0.9); }
.lxi-brand { display: flex; align-items: center; gap: 0.75rem; }
.lxi-brand-mark { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), #7c3aed); color: white; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lxi-brand strong { display: block; font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
.lxi-brand span { font-size: 0.75rem; color: var(--text-secondary); }
.lxi-nav { display: flex; gap: 2rem; }
.lxi-nav a { color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
.lxi-nav a:hover { color: var(--primary); }
.lxi-nav-actions { display: flex; gap: 0.75rem; align-items: center; }
/* Hero */
.lxi-hero { position: relative; min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 5rem 2rem 4rem; overflow: hidden; }
.lxi-hero-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%); pointer-events: none; }
.lxi-hero-content { position: relative; z-index: 1; max-width: 720px; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.lxi-hero-badges { display: flex; gap: 0.75rem; justify-content: center; }
.lxi-float-badge { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem; border-radius: 9999px; font-size: 0.82rem; font-weight: 600; animation: lxi-float 3s ease-in-out infinite; }
.lxi-badge-score { background: rgba(245,158,11,0.15); color: #d97706; border: 1px solid rgba(245,158,11,0.3); }
.lxi-badge-rank { background: rgba(99,102,241,0.15); color: var(--primary); border: 1px solid rgba(99,102,241,0.3); animation-delay: 1s; }
@keyframes lxi-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.lxi-eyebrow { font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); }
.lxi-hero h1 { font-size: clamp(2rem,5vw,3.2rem); font-weight: 800; line-height: 1.2; color: var(--text-primary); margin: 0; }
.lxi-lead { font-size: 1.05rem; color: var(--text-secondary); line-height: 1.7; max-width: 560px; margin: 0; }
.lxi-hero-social-proof { display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary); }
.lxi-avatar-stack { display: flex; }
.lxi-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #7c3aed); color: white; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-left: -8px; border: 2px solid var(--bg); }
.lxi-avatar:first-child { margin-left: 0; }
.lxi-rating { display: flex; align-items: center; gap: 0.25rem; font-weight: 600; color: var(--text-primary); }
.lxi-cta-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
/* Marquee */
.lxi-trust-strip { overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1rem 0; background: var(--surface); }
.lxi-marquee-track { display: flex; gap: 3rem; animation: lxi-marquee 30s linear infinite; width: max-content; }
@keyframes lxi-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.lxi-trust-logo { font-weight: 600; font-size: 0.9rem; color: var(--text-secondary); white-space: nowrap; opacity: 0.7; }
/* Stats */
.lxi-stats-ribbon { display: grid; grid-template-columns: repeat(4,1fr); background: var(--primary); padding: 2.5rem 2rem; }
.lxi-stat-block { text-align: center; color: white; padding: 1rem; border-right: 1px solid rgba(255,255,255,0.2); }
.lxi-stat-block:last-child { border-right: none; }
.lxi-stat-block strong { display: block; font-size: 2rem; font-weight: 800; line-height: 1.1; }
.lxi-stat-block span { font-size: 0.82rem; opacity: 0.85; margin-top: 0.25rem; display: block; }
/* Sections */
.lxi-section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; }
.lxi-section-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; gap: 1rem; }
.lxi-section-head h2 { font-size: clamp(1.5rem,3vw,2rem); font-weight: 700; color: var(--text-primary); margin: 0; }
/* How */
.lxi-how-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; }
.lxi-how-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; display: flex; flex-direction: column; gap: 1rem; transition: all 0.2s; }
.lxi-how-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: rgba(99,102,241,0.3); }
.lxi-how-step { font-size: 2.5rem; font-weight: 800; color: rgba(99,102,241,0.15); line-height: 1; }
.lxi-how-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(99,102,241,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; }
.lxi-how-card h3 { font-size: 1rem; font-weight: 600; margin: 0; color: var(--text-primary); }
.lxi-how-card p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
/* Features */
.lxi-features-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 1.5rem; }
.lxi-feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s; }
.lxi-feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.lxi-feature-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(99,102,241,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; }
.lxi-feature-card h3 { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin: 0; }
.lxi-feature-card p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
/* Featured Sets */
.lxi-sets-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 1.25rem; }
.lxi-set-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s; }
.lxi-set-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); border-color: rgba(99,102,241,0.3); }
.lxi-set-header { display: flex; gap: 0.75rem; align-items: flex-start; }
.lxi-set-badge { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), #7c3aed); color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lxi-set-header h4 { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.4; }
.lxi-set-header p { font-size: 0.78rem; color: var(--text-secondary); margin: 0; }
.lxi-set-footer { display: flex; justify-content: space-between; align-items: center; }
/* FAQ */
.lxi-faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; }
.lxi-faq-item { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--surface); }
.lxi-faq-q { width: 100%; padding: 1.25rem 1.5rem; background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 1rem; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); text-align: left; }
.lxi-faq-chevron { font-size: 0.7rem; color: var(--text-secondary); transition: transform 0.2s; flex-shrink: 0; }
.lxi-faq-chevron.open { transform: rotate(180deg); }
.lxi-faq-a { padding: 0 1.5rem 1.25rem; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; margin: 0; border-top: 1px solid var(--border); padding-top: 1rem; }
/* CTA Final */
.lxi-cta-final { text-align: center; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.08)); border-radius: 24px; max-width: 100%; }
.lxi-cta-final h2 { font-size: clamp(1.5rem,3vw,2rem); font-weight: 700; color: var(--text-primary); margin: 0 0 2rem; }
/* Footer */
.lxi-footer { text-align: center; padding: 2.5rem 2rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.lxi-footer-brand { display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.88rem; }
.lxi-footer-links { display: flex; gap: 2rem; }
.lxi-footer-links a { color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; }
.lxi-footer-links a:hover { color: var(--primary); }
/* Responsive */
@media (max-width: 768px) {
  .lxi-topbar { padding: 0.75rem 1rem; }
  .lxi-nav { display: none; }
  .lxi-stats-ribbon { grid-template-columns: repeat(2,1fr); }
  .lxi-how-grid { grid-template-columns: 1fr; }
  .lxi-section { padding: 3rem 1rem; }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx frontend/src/styles.css
git commit -m "feat: overhaul landing page with hero/stats-ribbon/trust-marquee/featured-sets/FAQ (x-interview style)"
```

---

## Task 6: Dashboard — Featured Interview Sets Widget

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Thêm state và fetch vào DashboardPage**

```tsx
// Thêm import:
import type { InterviewSet } from '../types';

// Thêm state trong DashboardPage function:
const [featuredSets, setFeaturedSets] = useState<InterviewSet[]>([]);

// Thêm useEffect (sau useEffect loadDashboard):
useEffect(() => {
  void api.get('/interview-sets?featured=true&limit=4')
    .then(r => setFeaturedSets(r.data.sets))
    .catch(() => {});
}, []);
```

- [ ] **Step 2: Thêm widget vào JSX — sau section history**

```tsx
{featuredSets.length > 0 && (
  <section className="panel-card">
    <div className="section-heading compact-heading">
      <div>
        <p className="eyebrow">Bộ phỏng vấn nổi bật</p>
        <h3>Luyện theo JD thực tế</h3>
      </div>
      <Link to="/interview-sets" className="ghost-button">
        Xem tất cả <ArrowRight size={16} />
      </Link>
    </div>
    <div className="dash-sets-grid">
      {featuredSets.map(set => (
        <article key={set._id} className="dash-set-card">
          <div className="dash-set-hd">
            <div className="dash-set-badge">{set.company.charAt(0)}</div>
            <div>
              <strong>{set.title}</strong>
              <p>{set.company}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {set.tags.slice(0, 2).map(t => <span key={t} className="tag-chip">{t}</span>)}
            <span className={`status-badge badge-${set.difficulty}`}>{{ easy: 'Dễ', medium: 'TB', hard: 'Khó' }[set.difficulty]}</span>
          </div>
          <Link to="/interview-sets" className="ghost-button" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
            Luyện ngay →
          </Link>
        </article>
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 3: Thêm CSS**

```css
/* ===== DASHBOARD SETS WIDGET ===== */
.dash-sets-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap: 1rem; margin-top: 1rem; }
.dash-set-card { background: var(--surface-sunken); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all 0.2s; }
.dash-set-card:hover { border-color: rgba(99,102,241,0.3); background: var(--surface); }
.dash-set-hd { display: flex; gap: 0.6rem; align-items: flex-start; }
.dash-set-badge { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg,var(--primary),#7c3aed); color: white; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dash-set-hd strong { display: block; font-size: 0.85rem; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
.dash-set-hd p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/DashboardPage.tsx frontend/src/styles.css
git commit -m "feat: add featured interview sets widget to dashboard"
```

---

## Task 7: Result Page — Top X% Gamification

**Files:**
- Modify: `frontend/src/pages/InterviewResultPage.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Thêm helper functions trong InterviewResultPage.tsx**

```tsx
// Thêm vào đầu file, trước component:
function getTopPercentage(score: number): string {
  if (score >= 90) return 'Top 5%';
  if (score >= 80) return 'Top 15%';
  if (score >= 70) return 'Top 30%';
  if (score >= 60) return 'Top 50%';
  return 'Top 70%';
}

function getRankClass(score: number): string {
  if (score >= 80) return 'result-rank-badge rank-gold';
  if (score >= 65) return 'result-rank-badge rank-silver';
  return 'result-rank-badge rank-bronze';
}
```

- [ ] **Step 2: Thêm UI badge vào JSX — sau score display**

Tìm phần JSX hiển thị `overallScore` trong `InterviewResultPage.tsx` và thêm ngay bên dưới:

```tsx
{result.overallScore !== undefined && result.overallScore > 0 && (
  <div className="result-rank-section">
    <div className={getRankClass(result.overallScore)}>
      <Trophy size={18} />
      {getTopPercentage(result.overallScore)}!
    </div>
    <p className="result-rank-desc">
      Bạn đạt <strong>{result.overallScore}/100</strong> — vượt trội hơn phần lớn ứng viên cùng vị trí.
    </p>
  </div>
)}
```

- [ ] **Step 3: Thêm import Trophy nếu cần**

```tsx
import { ..., Trophy } from 'lucide-react';
```

- [ ] **Step 4: Thêm CSS**

```css
/* ===== RESULT RANKING ===== */
.result-rank-section { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem; border-radius: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(245,158,11,0.08)); border: 1px solid rgba(99,102,241,0.2); text-align: center; margin: 1rem 0; }
.result-rank-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.5rem; border-radius: 9999px; font-weight: 700; font-size: 1.1rem; animation: lxi-float 3s ease-in-out infinite; }
.rank-gold { background: linear-gradient(135deg,#fbbf24,#f59e0b); color: white; box-shadow: 0 4px 14px rgba(245,158,11,0.4); }
.rank-silver { background: linear-gradient(135deg,#94a3b8,#64748b); color: white; box-shadow: 0 4px 14px rgba(100,116,139,0.4); }
.rank-bronze { background: linear-gradient(135deg,#b45309,#92400e); color: white; box-shadow: 0 4px 14px rgba(180,83,9,0.3); }
.result-rank-desc { font-size: 0.88rem; color: var(--text-secondary); margin: 0; }
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/InterviewResultPage.tsx frontend/src/styles.css
git commit -m "feat: add Top X% ranking gamification badge to result page"
```

---

## Task 8: Packages/Pricing Page

**Files:**
- Create: `frontend/src/pages/PackagesPage.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/styles.css`

- [ ] **Step 1: Tạo PackagesPage.tsx**

```tsx
// frontend/src/pages/PackagesPage.tsx
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    id: 'free', name: 'Miễn phí', price: '0đ', period: 'mãi mãi',
    highlight: false, badge: null,
    features: ['3 phiên phỏng vấn AI / tháng', 'Truy cập ngân hàng câu hỏi cơ bản', 'Phân tích CV (1 lần/tháng)', 'Kết quả và điểm số chi tiết', 'Lịch sử 7 ngày gần nhất'],
    cta: 'Bắt đầu miễn phí', ctaTo: '/register', ctaClass: 'ghost-button'
  },
  {
    id: 'pro', name: 'Pro', price: '199.000đ', period: '/tháng',
    highlight: true, badge: 'Phổ biến nhất',
    features: ['Không giới hạn phiên phỏng vấn AI', 'Toàn bộ ngân hàng câu hỏi', 'Phân tích CV không giới hạn', 'Interview Sets từ công ty hàng đầu', 'Radar chart kỹ năng chi tiết', 'Lịch sử luyện tập đầy đủ', 'Ưu tiên hỗ trợ'],
    cta: 'Dùng thử 7 ngày miễn phí', ctaTo: '/register', ctaClass: 'primary-button'
  },
  {
    id: 'team', name: 'Team', price: 'Liên hệ', period: '',
    highlight: false, badge: null,
    features: ['Tất cả tính năng Pro', 'Dashboard HR phỏng vấn ứng viên bằng AI', 'Tuỳ chỉnh bộ câu hỏi theo công ty', 'Theo dõi tiến độ team', 'Báo cáo phân tích nhân sự', 'Tích hợp ATS', 'Hỗ trợ triển khai và đào tạo'],
    cta: 'Liên hệ tư vấn', ctaTo: '/register', ctaClass: 'ghost-button'
  }
];

export function PackagesPage() {
  return (
    <div className="page-stack">
      <section className="panel-card" style={{ textAlign: 'center' }}>
        <p className="eyebrow">Gói dịch vụ</p>
        <h2 style={{ margin: '0.25rem 0 0.5rem' }}>Chọn gói phù hợp với bạn</h2>
        <p className="muted-text">Bắt đầu miễn phí, nâng cấp khi bạn cần nhiều hơn.</p>
      </section>

      <div className="pkgs-grid">
        {PLANS.map(plan => (
          <article key={plan.id} className={`panel-card pkgs-card ${plan.highlight ? 'pkgs-highlight' : ''}`}>
            {plan.badge && <div className="pkgs-badge"><Sparkles size={14} />{plan.badge}</div>}
            <div className="pkgs-plan-header">
              <h3>{plan.name}</h3>
              <div className="pkgs-price"><strong>{plan.price}</strong>{plan.period && <span>{plan.period}</span>}</div>
            </div>
            <ul className="pkgs-features">
              {plan.features.map(f => (
                <li key={f}><CheckCircle2 size={16} color={plan.highlight ? 'var(--primary)' : 'var(--success)'} />{f}</li>
              ))}
            </ul>
            <Link to={plan.ctaTo} className={`${plan.ctaClass} pkgs-cta`}>
              {plan.highlight && <Zap size={16} />}{plan.cta}
            </Link>
          </article>
        ))}
      </div>

      <section className="panel-card">
        <h3 style={{ margin: '0 0 1.5rem' }}>Câu hỏi về gói dịch vụ</h3>
        <div className="pkgs-faq-grid">
          {[
            { q: 'Có thể huỷ bất cứ lúc nào không?', a: 'Có. Gói Pro tiếp tục đến hết chu kỳ thanh toán khi huỷ.' },
            { q: 'Thanh toán qua phương thức nào?', a: 'Thẻ ngân hàng nội địa (Napas), thẻ quốc tế (Visa, Mastercard) và ví MoMo.' },
            { q: 'Gói Free có hết hạn không?', a: 'Không. 3 phiên/tháng được reset mỗi đầu tháng.' },
            { q: 'Team plan phù hợp với ai?', a: 'HR muốn dùng AI sàng lọc ứng viên, hoặc công ty đào tạo kỹ năng phỏng vấn cho nhân viên.' },
          ].map(({ q, a }) => (
            <div key={q}><strong>{q}</strong><p>{a}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Thêm CSS**

```css
/* ===== PACKAGES PAGE ===== */
.pkgs-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; align-items: start; }
.pkgs-card { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; position: relative; }
.pkgs-highlight { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(99,102,241,0.2), 0 8px 32px rgba(99,102,241,0.15); }
.pkgs-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 0.35rem; background: var(--primary); color: white; padding: 0.3rem 1rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
.pkgs-plan-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.5rem; color: var(--text-primary); }
.pkgs-price { display: flex; align-items: baseline; gap: 0.35rem; }
.pkgs-price strong { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
.pkgs-price span { font-size: 0.88rem; color: var(--text-secondary); }
.pkgs-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
.pkgs-features li { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.88rem; color: var(--text-secondary); }
.pkgs-features li svg { flex-shrink: 0; margin-top: 1px; }
.pkgs-cta { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; text-align: center; text-decoration: none; }
.pkgs-faq-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.5rem; }
.pkgs-faq-grid strong { display: block; font-size: 0.9rem; margin-bottom: 0.4rem; color: var(--text-primary); }
.pkgs-faq-grid p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.6; }
@media (max-width: 768px) { .pkgs-grid { grid-template-columns: 1fr; } .pkgs-faq-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Thêm route vào App.tsx**

```tsx
import { PackagesPage } from './pages/PackagesPage';
// Trong <Route element={<AppShell />}>:
<Route path="/packages" element={<PackagesPage />} />
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/PackagesPage.tsx frontend/src/App.tsx frontend/src/styles.css
git commit -m "feat: add Packages/Pricing page with 3-tier plan layout"
```

---

## Verification Checklist

```bash
# Build check
cd frontend && npm run build
cd ../backend && npm run build

# Seed check
cd backend && npm run seed:interview-sets
```

**Manual checks:**
- [ ] Landing page: hero animations, marquee tự cuộn, stats ribbon màu indigo, 6 featured sets, FAQ accordion
- [ ] `/interview-sets`: Grid 12 cards, filter industry/difficulty hoạt động, search debounce 300ms
- [ ] Click "Bắt đầu luyện tập" → navigate `/interview` với state `fromSet:true`
- [ ] Dashboard: widget "Bộ phỏng vấn nổi bật" 4 cards
- [ ] Sidebar: có "Bộ phỏng vấn" + "Gói dịch vụ"
- [ ] Result page: badge "Top X%!" xuất hiện sau khi complete phiên
- [ ] Packages page: 3 plans, Pro highlighted với border + badge
- [ ] Mobile responsive: landing + sets grid + packages grid đều OK
