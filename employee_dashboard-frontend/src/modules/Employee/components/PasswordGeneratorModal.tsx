import React, { useState } from 'react';
import { KeyRound, RefreshCw, Copy, Check, Eye, EyeOff, Send, X } from 'lucide-react';
import { Employee } from '../types/employee.types';
import { generateTemporaryPassword } from '../utils/employee.utils';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onPasswordReset: (newPassword: string, sendEmail: boolean) => void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  employee,
  onClose,
  onPasswordReset,
}) => {
  const [password, setPassword] = useState<string>(() => generateTemporaryPassword(10));
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !employee) return null;

  const handleRegenerate = () => {
    setPassword(generateTemporaryPassword(10));
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (sendEmail: boolean) => {
    onPasswordReset(password, sendEmail);
    onClose();
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
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Generated Temporary Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                readOnly
                value={password}
                className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm tracking-wider text-slate-900 focus:outline-none"
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
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Requirements: 8–12 chars, upper, lower, number, special char</span>
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Generate Again
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
            onClick={() => handleSave(false)}
            className="px-3.5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            Set Password
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
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
