import { Navigate, Outlet } from 'react-router-dom';
import { isDemoAdminAuthenticated } from '../modules/Authentication/services/auth.service';

function ProtectedRoute() {
  return isDemoAdminAuthenticated() ? <Outlet /> : <Navigate replace to="/login" />;
}

export default ProtectedRoute;