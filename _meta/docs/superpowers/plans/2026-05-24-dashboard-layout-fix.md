# Dashboard Layout Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the positional layout of the Dashboard to match Image 2, including the top header breadcrumb and the horizontal alignment of the welcome text with the right banner.

**Architecture:** We will modify `AppShell.tsx` to include the page title in the top header, and refactor `DashboardPage.tsx` to move the welcome header inside the left grid column so it horizontally aligns with the Hero Banner in the right grid column.

**Tech Stack:** React, CSS

---

### Task 1: Update Top Header in AppShell

**Files:**
- Modify: `e:/speak/DOANCOSO/doancoso/frontend/src/components/AppShell.tsx`

- [ ] **Step 1: Update the header structure**

We need to add the breadcrumb/title to the left side of the header. We can extract the current route name from the `routeKey` or `location.pathname`. For the dashboard, it is "Trang chủ".

```tsx
// Find the header section in AppShell.tsx:
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {/* Simple breadcrumb logic based on pathname */}
            {location.pathname === '/dashboard' || location.pathname === '/' ? 'Trang chủ' : 
             location.pathname.includes('/questions') ? 'Ngân hàng câu hỏi' : 
             location.pathname.includes('/practice') ? 'Luyện tập' : 
             location.pathname.includes('/profile') ? 'Hồ sơ cá nhân' : 'Trang chủ'}
          </div>
          <div className="workspace-stage-tools" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
          </div>
        </header>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/AppShell.tsx
git commit -m "style: update AppShell header to match image 2 layout"
```

### Task 2: Align Dashboard Welcome Text

**Files:**
- Modify: `e:/speak/DOANCOSO/doancoso/frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Move the Welcome Header inside the left column**

In `DashboardPage.tsx`, move the welcome header `div` (which contains `Chào mừng trở lại` and badges) into the left column of the `dashboard-grid`, right above the `{/* STAT CARDS */}` div. 
Additionally, remove the badges "GOLD RANK" and "Trạng thái: Sẵn sàng phỏng vấn" if they do not match Image 2's clean look, or simply keep them inline but ensure the parent div is inside the left column so the top of the left column aligns with the top of the right column (Hero Banner).

```tsx
// Inside DashboardPage.tsx:
// Replace the top-level header and grid start with this:

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LÊN LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                Chào mừng trở lại, {user?.name || 'Bạn'}!
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Đây là tổng quan về hành trình chuẩn bị phỏng vấn của bạn
              </p>
            </div>
          </div>

          {/* STAT CARDS */}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DashboardPage.tsx
git commit -m "style: align dashboard welcome text with right column banner"
```
