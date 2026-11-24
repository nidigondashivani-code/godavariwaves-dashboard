import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/UI';
import { useAuth } from '../context/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isEmployee } = useAuth();

  const goHome = () => {
    if (isAdmin) navigate('/admin');
    else if (isEmployee) navigate('/employee/dashboard');
    else navigate('/employee/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="gw-card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-[24px] font-bold text-[#111827]">Access Denied (403)</h1>
        <p className="text-[14px] text-[#6B7280] mt-2">
          You do not have permission to access this portal or resource.
        </p>
        <div className="mt-6">
          <Button onClick={goHome}>
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
