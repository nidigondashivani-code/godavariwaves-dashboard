import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/UI';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="gw-card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center mx-auto mb-5">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-[24px] font-bold text-[#111827]">Page Not Found (404)</h1>
        <p className="text-[14px] text-[#6B7280] mt-2">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
