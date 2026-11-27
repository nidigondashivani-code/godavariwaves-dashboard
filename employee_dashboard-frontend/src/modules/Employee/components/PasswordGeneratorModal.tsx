import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Send,
  X,
} from 'lucide-react';
import { Employee } from '../types/employee.types';
import { generateTemporaryPassword } from '../utils/employee.utils';
import { validatePassword, validateConfirmPassword } from '../utils/employeeValidation';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onPasswordReset: (
    newPassword: string,
    confirmPassword: string,
    sendEmail: boolean
  ) => Promise<boolean> | boolean | void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  employee,
  onClose,
  onPasswordReset,
}) => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && employee) {
      setPassword('');
      setConfirmPassword('');
      setCopied(false);
      setTouched({});
      setIsSubmitting(false);
    }
  }, [isOpen, employee?.id]);

  if (!isOpen || !employee) return null;

  const passwordError = validatePassword(password);
  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
  const isFormValid = !passwordError && !confirmPasswordError;

  const getFieldBorderClass = (field: 'password' | 'confirmPassword', error: string | null) => {
    if (!touched[field]) return 'border-slate-300 focus:ring-blue-600';
    return error
      ? 'border-rose-500 focus:ring-rose-500'
      : 'border-emerald-500 focus:ring-emerald-500';
  };

  const handleRegenerate = () => {
    const generated = generateTemporaryPassword(10);
    setPassword(generated);
    setConfirmPassword(generated);
    setTouched({ password: true, confirmPassword: true });
    setCopied(false);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (sendEmail: boolean) => {
    setTouched({ password: true, confirmPassword: true });
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onPasswordReset(password, confirmPassword, sendEmail);
      if (result !== false) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-blue-700">
            <div className="p-2 bg-blue-50 rounded-lg">
              <KeyRound className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
              <p className="text-xs text-slate-500">
                {employee.firstName} {employee.lastName} ({employee.employeeId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider">
                New Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-blue-700 font-medium">Editable or Auto-generate</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setTouched((prev) => ({ ...prev, password: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="Enter strong password (min 8 chars)..."
                  className={`w-full bg-white px-3 py-2 border rounded-lg font-mono text-sm tracking-wider text-slate-900 focus:outline-none focus:ring-2 ${getFieldBorderClass(
                    'password',
                    passwordError
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Password"
                  className={`p-2 rounded-lg transition flex items-center gap-1 ${
                    copied
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && passwordError && (
                <p className="mt-1 text-xs text-rose-600">{passwordError}</p>
              )}
              {touched.password && !passwordError && (
                <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strong password policy met
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setTouched((prev) => ({ ...prev, confirmPassword: true }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                  placeholder="Re-enter password..."
                  className={`w-full bg-white px-3 py-2 border rounded-lg font-mono text-sm tracking-wider text-slate-900 focus:outline-none focus:ring-2 ${getFieldBorderClass(
                    'confirmPassword',
                    confirmPasswordError
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.confirmPassword && confirmPasswordError && (
                <p className="mt-1 text-xs text-rose-600">{confirmPasswordError}</p>
              )}
              {touched.confirmPassword && !confirmPasswordError && (
                <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>8+ chars, upper, lower, number, special char, no spaces</span>
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline shrink-0 ml-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Auto-Generate
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isFormValid || isSubmitting}
            onClick={() => handleSave(false)}
            className="px-3.5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            Set Password
          </button>
          <button
            type="button"
            disabled={!isFormValid || isSubmitting}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            Send Email & Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordGeneratorModal;
