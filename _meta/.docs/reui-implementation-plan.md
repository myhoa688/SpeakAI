# Áp dụng ReUI Patterns vào SpeakAI

Tham khảo design/UX pattern từ [reui.io](https://reui.io) để nâng cấp UI hiện tại mà **không cài Tailwind** — giữ nguyên stack React + Vite + Vanilla CSS.

---

## Phạm vi thay đổi

6 nâng cấp UI, theo thứ tự ưu tiên tác động người dùng:

| # | Tính năng | ReUI Pattern | File thay đổi |
|---|---|---|---|
| 1 | Onboarding | **Stepper** | `OnboardingPage.tsx` |
| 2 | Admin Users | **Data Grid** | `AdminPage.tsx` |
| 3 | Question Bank | **Filters** | `QuestionBankPage.tsx` |
| 4 | Interview Result | **Timeline** | `InterviewResultPage.tsx` |
| 5 | Dashboard | **Frame + Badge** | `DashboardPage.tsx` |
| 6 | CV Analyzer | **File Upload** | `CvAnalyzerPage.tsx` |

---

## Chi tiết từng nâng cấp

---

### 1 — Onboarding Stepper (ReUI: Stepper)

**Vấn đề hiện tại:** Chỉ có 2 chấm step-dot rất nhỏ, không cho thấy ngữ cảnh và tiến trình rõ ràng.

**Sẽ làm:**
- Thay thế `onboarding-step-dot` + `onboarding-step-line` bằng **Stepper ngang** đầy đủ theo pattern ReUI:
  - Step có số + label + trạng thái (active / complete / pending)
  - Connector line giữa các step animated
  - Step 1: "Ngành nghề" — Step 2: "Kinh nghiệm" — Step 3 (mới): "Hoàn thành" (confirmation screen)
- Thêm **Step 3** là màn hình xác nhận lựa chọn trước khi submit
- Progress bar tổng thể phía trên card

**File:** `frontend/src/pages/OnboardingPage.tsx`

---

### 2 — Admin Data Grid (ReUI: Data Grid)

**Vấn đề hiện tại:** Danh sách user là các `article` card xếp chồng, không sort/filter, khó quét thông tin khi nhiều user.

**Sẽ làm:**
- Chuyển danh sách user thành **bảng Data Grid**:
  - Cột: Avatar initials | Tên + Email | Vai trò | XP | Streak | Trạng thái | Hành động
  - **Sort** theo cột (XP, tên, ngày tạo)
  - **Filter** thanh tìm kiếm inline
  - **Row highlight** khi hover
  - Sticky header khi scroll

**File:** `frontend/src/pages/AdminPage.tsx`

---

### 3 — Question Bank Filters (ReUI: Filters)

**Vấn đề hiện tại:** Bộ lọc chỉ có độ khó, nằm trong sidebar ẩn.

**Sẽ làm:**
- **Filter bar ngang** phía trên list
- Chips lọc: Độ khó | Ngành | Tags
- **Active filter chips** (xóa từng filter riêng lẻ)
- Filter count badge

**File:** `frontend/src/pages/QuestionBankPage.tsx`

---

### 4 — Interview Result Timeline (ReUI: Timeline)

**Vấn đề hiện tại:** Danh sách câu hỏi/câu trả lời là accordion cards chồng nhau.

**Sẽ làm:**
- **Timeline vertical** với connector line
- Node màu xanh (≥75) / vàng (55-74) / đỏ (<55) theo điểm
- Score badge bên phải node

**File:** `frontend/src/pages/InterviewResultPage.tsx`

---

### 5 — Dashboard Frame + Badge (ReUI: Frame, Badge)

**Sẽ làm:**
- Badge animated pulse cho goal "Sẵn sàng"
- Rank badge gold/silver/bronze leaderboard

**File:** `frontend/src/pages/DashboardPage.tsx`

---

### 6 — CV Analyzer File Upload (ReUI: File Upload)

**Sẽ làm:**
- Drag & Drop zone đầy đủ với preview
- File preview sau khi chọn
- Error state khi file không hợp lệ

**File:** `frontend/src/pages/CvAnalyzerPage.tsx`

---

## Thứ tự thực hiện

1. Onboarding Stepper → UX quan trọng, user mới thấy đầu tiên
2. Admin Data Grid → Tăng hiệu quả quản lý rõ rệt
3. Question Bank Filters → Tăng khả năng tìm kiếm
4. Interview Timeline → Kết quả phỏng vấn trực quan hơn
5. Dashboard Badges → Gamification rõ ràng hơn
6. CV File Upload → Polish UX upload

> **Note:** Tất cả thay đổi chỉ là UI — logic nghiệp vụ, API call, state management giữ nguyên.
