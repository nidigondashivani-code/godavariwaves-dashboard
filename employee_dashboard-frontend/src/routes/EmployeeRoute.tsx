import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/UI';

export const EmployeeRoute: React.FC = () => {
  const { isAuthenticated, isEmployee, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Verifying Employee session..." />;
  if (!isAuthenticated) return <Navigate replace to="/employee/login" />;
  if (!isEmployee) return <Navigate replace to="/forbidden" />;
  return <Outlet />;
};

export default EmployeeRoute;
