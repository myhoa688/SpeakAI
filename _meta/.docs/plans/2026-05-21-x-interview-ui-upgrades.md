# 6 UI Upgrades Implementation Plan (x-interview design)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai 6 tính năng UI cho SpeakAI theo design pattern của ReUI và visual style của x-interview.com.
**Architecture:** Frontend React/Vite. Không cài Tailwind, sử dụng Vanilla CSS Modules (`common.css`, `styles.css`) với hệ thống CSS Custom Properties (Design Tokens) trích xuất từ x-interview.
**Tech Stack:** React, Vite, CSS Modules, Lucide React (icons).

---

## Task 1: Setup Design Tokens (x-interview style)

**Files:**
- Modify: `e:\speak\DOANCOSO\doancoso\frontend\src\index.css`

- [ ] **Step 1: Write the failing test** (N/A for CSS, manual verify)
- [ ] **Step 2: Write minimal implementation**

```css
/* In index.css */
:root {
  /* x-interview Design System Colors */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-primary-light: #818cf8;
  --color-primary-surface: rgba(99, 102, 241, 0.1);
  --color-bg-page: #fafafa;
  --color-bg-card: #ffffff;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-border: #e5e7eb;
  
  /* Status */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Layout & Shadows */
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-button: 9999px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --transition-normal: 200ms;
  
  /* Font */
  --font-family: 'Inter', system-ui, sans-serif;
}

body.dark {
  --color-bg-page: #0a0a0a;
  --color-bg-card: #171717;
  --color-text-primary: #ffffff;
  --color-text-secondary: #9ca3af;
  --color-border: rgba(55, 65, 81, 0.5);
}

/* Utilities */
.xi-btn-primary {
  background: linear-gradient(135deg, var(--color-primary), #7c3aed);
  color: white;
  border-radius: var(--radius-button);
  padding: 0.5rem 1.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}
.xi-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}
.xi-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) ease;
}
.xi-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(99, 102, 241, 0.3);
}
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/index.css
git commit -m "style: add x-interview design tokens"
```

---

## Task 2: Onboarding Stepper (1/6)

**Files:**
- Modify: `e:\speak\DOANCOSO\doancoso\frontend\src\pages\OnboardingPage.tsx`
- Modify: `e:\speak\DOANCOSO\doancoso\frontend\src\pages\OnboardingPage.css`

- [ ] **Step 1: Write CSS for Stepper**

```css
/* OnboardingPage.css */
.xi-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}
.xi-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  gap: 0.5rem;
}
.xi-step-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--color-bg-page);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
}
.xi-step.active .xi-step-circle {
  border-color: var(--color-primary);
  background: var(--color-primary-surface);
  color: var(--color-primary);
}
.xi-step.completed .xi-step-circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
.xi-step-line {
  position: absolute;
  top: 1rem;
  left: 2rem;
  right: 2rem;
  height: 2px;
  background: var(--color-border);
  z-index: 0;
}
.xi-step-line-progress {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}
```

- [ ] **Step 2: Implement Stepper in TSX**
```tsx
// In OnboardingPage.tsx, replace dots with:
<div className="xi-stepper">
  <div className="xi-step-line">
    <div className="xi-step-line-progress" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
  </div>
  <div className={`xi-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
    <div className="xi-step-circle">{step > 1 ? '✓' : '1'}</div>
    <span>Ngành nghề</span>
  </div>
  <div className={`xi-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
    <div className="xi-step-circle">{step > 2 ? '✓' : '2'}</div>
    <span>Kinh nghiệm</span>
  </div>
  <div className={`xi-step ${step === 3 ? 'active' : ''}`}>
    <div className="xi-step-circle">3</div>
    <span>Hoàn thành</span>
  </div>
</div>
```

- [ ] **Step 3: Commit**
```bash
git add frontend/src/pages/OnboardingPage.tsx frontend/src/pages/OnboardingPage.css
git commit -m "feat: implement x-interview stepper for onboarding"
```

---

*(Các tasks 3-7 cho Admin Data Grid, Filters, Timeline, Badges, Upload zone sẽ được implement tuần tự tương tự)*
