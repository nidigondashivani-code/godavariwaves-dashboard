import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-[14px] border bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] ${
                t.type === 'success'
                  ? 'border-[#A7F3D0]'
                  : t.type === 'error'
                  ? 'border-[#FECACA]'
                  : 'border-[#BFDBFE]'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-[#0EA5E9] shrink-0 mt-0.5" />}
              <p className="text-[14px] text-[#111827] font-medium flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-[#9CA3AF] hover:text-[#374151] transition"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
