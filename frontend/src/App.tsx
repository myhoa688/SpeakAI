import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeToggle } from './components/ThemeToggle';
import { useAuth } from './context/AuthContext';
import { AdminPage } from './pages/AdminPage';
import { AdminPackagesPage } from './pages/AdminPackagesPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { CvAnalyzerPage } from './pages/CvAnalyzerPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { InterviewPage } from './pages/InterviewPage';
import { InterviewPrejoinPage } from './pages/InterviewPrejoinPage';
import { InterviewSetsPage } from './pages/InterviewSetsPage';
import { InterviewResultPage } from './pages/InterviewResultPage';
import { InterviewSessionPage } from './pages/InterviewSessionPage';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PracticePage } from './pages/PracticePage';
import { ProfilePage } from './pages/ProfilePage';
import { PackagesPage } from './pages/PackagesPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { QuestionPracticePage } from './pages/QuestionPracticePage';
import { QuestionResultPage } from './pages/QuestionResultPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminQuestions } from './pages/admin/AdminQuestions';
import { AdminInterviewSets } from './pages/admin/AdminInterviewSets';
import { AdminSessions } from './pages/admin/AdminSessions';
import { AdminRatings } from './pages/admin/AdminRatings';
function HomeRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="full-page-loader">SpeakAI đang tải dữ liệu...</div>;
  }

  if (!user) return <LandingPage />;

  // Nếu là admin thì luôn vào /admin
  if (user.role === 'admin' || user.isRootAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Redirect về onboarding nếu chưa hoàn thành
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return <Navigate to="/dashboard" replace />;
}



// Guard cho onboarding: user đã login nhưng chưa onboarding
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="full-page-loader">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Nếu là admin thì không cần onboarding, về /admin
  if (user.role === 'admin' || user.isRootAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Nếu đã onboarding rồi, không cần vào lại
  if (user.onboardingCompleted) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Onboarding — cần login nhưng không cần AppShell */}
        <Route
          path="/onboarding"
          element={
            <OnboardingGuard>
              <OnboardingPage />
            </OnboardingGuard>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/questions" element={<QuestionBankPage />} />
            <Route path="/questions/:id/practice" element={<QuestionPracticePage />} />
            <Route path="/questions/:id/result" element={<QuestionResultPage />} />
            <Route path="/interview-sets" element={<InterviewSetsPage />} />
            <Route path="/interview-sets/:id/prep" element={<InterviewPrepPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/interview/prep" element={<InterviewPrepPage />} />
            <Route path="/interview/:id/prejoin" element={<InterviewPrejoinPage />} />
            <Route path="/interview/:id" element={<InterviewSessionPage />} />
            <Route path="/interview/history" element={<InterviewHistoryPage />} />
            <Route path="/interview/:id/result" element={<InterviewResultPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/cv" element={<CvAnalyzerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/interview-sets" element={<AdminInterviewSets />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/ratings" element={<AdminRatings />} />
            <Route path="/admin/packages" element={<AdminPackagesPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
