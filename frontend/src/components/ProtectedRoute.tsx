import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

type ProtectedRouteProps = {
  adminOnly?: boolean;
};

export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="full-page-loader">SpeakAI đang khởi tạo phiên làm việc...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.onboardingCompleted && user.role !== 'admin' && !user.isRootAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
