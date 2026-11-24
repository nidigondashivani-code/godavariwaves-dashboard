import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { extractApiError } from '../../../api/apiClient';

interface LoginFormErrors {
  email: string;
  password: string;
}

const validateEmail = (value: string): string => {
  if (!value.trim()) {
    return 'Company email is required.';
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
    ? ''
    : 'Enter a valid company email address.';
};

const validatePassword = (value: string): string =>
  value.length > 0 ? '' : 'Password is required.';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const errors: LoginFormErrors = {
    email: touched.email || submitted ? validateEmail(email) : '',
    password: touched.password || submitted ? validatePassword(password) : '',
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setAuthError('');

    if (validateEmail(email) || validatePassword(password)) {
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email.trim(), password, rememberMe);
      const isAdminUser =
        (user.role === 'Admin' || user.role === 'HR') &&
        (user.dashboardAccess === 'admin' || user.dashboardAccess === 'both');

      if (isAdminUser) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (error) {
      setAuthError(extractApiError(error, 'Invalid email or password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = (value: string) => {
    setEmail(value);
    setAuthError('');
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setAuthError('');
  };

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit}>
      <div>
        <label htmlFor="company-email" className="mb-1.5 block text-[13px] font-medium text-slate-700">
          Company Email
        </label>
        <div className="relative">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
          <input
            autoComplete="email"
            className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 sm:h-11 sm:text-[13px] ${
              errors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 hover:border-slate-300'
            }`}
            id="company-email"
            name="email"
            onBlur={() => setTouched((previous) => ({ ...previous, email: true }))}
            onChange={(event) => updateEmail(event.target.value)}
            placeholder="you@company.com"
            type="email"
            value={email}
            aria-describedby={errors.email ? 'company-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
          />
        </div>
        {errors.email && (
          <p className="login-error-enter mt-1.5 text-xs font-medium text-rose-600" id="company-email-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
          <input
            autoComplete="current-password"
            className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 sm:h-11 sm:text-[13px] ${
              errors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 hover:border-slate-300'
            }`}
            id="password"
            name="password"
            onBlur={() => setTouched((previous) => ({ ...previous, password: true }))}
            onChange={(event) => updatePassword(event.target.value)}
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={Boolean(errors.password)}
          />
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
            ) : (
              <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="login-error-enter mt-1.5 text-xs font-medium text-rose-600" id="password-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 pt-0.5">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
          <input
            checked={rememberMe}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-600/30"
            onChange={(event) => setRememberMe(event.target.checked)}
            type="checkbox"
          />
          Remember me
        </label>
      </div>

      {authError && (
        <p className="login-error-enter rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs leading-5 text-rose-700" role="alert">
          {authError}
        </p>
      )}

      <button
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 active:translate-y-0 disabled:cursor-wait disabled:opacity-80 sm:h-11 sm:text-[13px]"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? (
          <>
            <LoaderCircle aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

    </form>
  );
}

export default LoginForm;
