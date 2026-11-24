import React from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';

interface LeaveLayoutProps {
  children: React.ReactNode;
}

export const LeaveLayout: React.FC<LeaveLayoutProps> = ({ children }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default LeaveLayout;
