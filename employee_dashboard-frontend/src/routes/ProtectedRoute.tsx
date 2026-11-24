import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/UI';

function ProtectedRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner label="Verifying Admin session..." />;
  if (!isAuthenticated) return <Navigate replace to="/admin/login" />;
  if (!isAdmin) return <Navigate replace to="/forbidden" />;
  return <Outlet />;
}

export default ProtectedRoute;
