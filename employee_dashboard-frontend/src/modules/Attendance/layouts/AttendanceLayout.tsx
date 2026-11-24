import React from 'react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';

interface AttendanceLayoutProps {
  children: React.ReactNode;
}

export const AttendanceLayout: React.FC<AttendanceLayoutProps> = ({ children }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AttendanceLayout;
