import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}> = ({ children, className = '', hoverable = false }) => (
  <div className={`gw-card ${hoverable ? 'gw-card-hover' : ''} ${className}`}>{children}</div>
);

export const AnimatedCounter: React.FC<{ value: number; decimals?: number; suffix?: string }> = ({
  value,
  decimals = 0,
  suffix = '',
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = Number.isFinite(value) ? value : 0;
    const duration = 500;
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = start + (end - start) * (1 - Math.pow(1 - progress, 3));
      setDisplay(current);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <span>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className = '',
}) => {
  const normalized = (status || '').toLowerCase();
  let style = 'bg-[#F1F5F9] text-[#374151] border-[#E5E7EB]';

  if (
    ['present', 'approved', 'completed', 'active', 'published', 'acknowledged', 'low'].includes(
      normalized
    )
  ) {
    style = 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
  } else if (
    ['pending', 'pending review', 'late', 'half day', 'medium', 'scheduled', 'revision required'].includes(
      normalized
    )
  ) {
    style = 'bg-[#FFF7ED] text-[#D97706] border-[#FDE68A]';
  } else if (['rejected', 'absent', 'urgent', 'high', 'terminated', 'cancelled', 'inactive'].includes(normalized)) {
    style = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
  } else if (['in progress', 'on leave', 'holiday', 'meeting', 'event', 'info', 'general'].includes(normalized)) {
    style = 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${style} ${className}`}
    >
      {status}
    </span>
  );
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
  }
> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const sizeCls =
    size === 'sm'
      ? 'px-3 py-1.5 text-[13px]'
      : size === 'lg'
      ? 'px-5 py-3 text-[15px]'
      : 'px-4 py-2.5 text-[14px]';

  const variantCls =
    variant === 'primary'
      ? 'gw-btn-primary'
      : variant === 'secondary'
      ? 'gw-btn-secondary'
      : variant === 'danger'
      ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[12px] font-semibold transition'
      : variant === 'success'
      ? 'bg-[#10B981] hover:bg-[#059669] text-white rounded-[12px] font-semibold transition'
      : 'text-[#374151] hover:bg-[#F1F5F9] rounded-[12px] font-medium transition';

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 ${sizeCls} ${variantCls} disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ open, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25 }}
          className={`relative z-10 w-full ${maxWidth} bg-white gw-modal border border-[#E5E7EB] max-h-[90vh] flex flex-col overflow-hidden`}
        >
          <div className="flex items-start justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-[18px] font-semibold text-[#111827]">{title}</h3>
              {subtitle && <p className="text-[13px] text-[#6B7280] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#111827] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, children }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg bg-white gw-drawer h-full flex flex-col overflow-hidden"
        >
          <div className="flex items-start justify-between px-6 py-5 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-[18px] font-semibold text-[#111827]">{title}</h3>
              {subtitle && <p className="text-[13px] text-[#6B7280] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#111827] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
    <div className="w-14 h-14 rounded-2xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center mb-4">
      {icon}
    </div>
    <h4 className="text-[16px] font-semibold text-[#111827]">{title}</h4>
    <p className="text-[14px] text-[#6B7280] mt-1 max-w-md">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#6B7280]">
    <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
    <span className="text-[14px] font-medium">{label}</span>
  </div>
);
