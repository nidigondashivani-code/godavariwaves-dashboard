import { Link } from 'react-router-dom';
import CompanyLogo from '../../../components/common/CompanyLogo';
import LoginForm from '../components/LoginForm';

function EmployeeLoginPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F8FAFC] px-4 py-5 sm:min-h-screen sm:px-6 sm:py-8">
      <style>{`
        @keyframes login-card-enter {
          from { opacity: 0; transform: translateY(12px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes login-logo-enter {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes login-error-enter {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card-enter { animation: login-card-enter 480ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .login-logo-enter { animation: login-logo-enter 520ms ease-out 100ms both; }
        .login-error-enter { animation: login-error-enter 180ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .login-card-enter, .login-logo-enter, .login-error-enter { animation: none; }
        }
      `}</style>
      <section className="login-card-enter w-full max-w-[440px] rounded-2xl border border-slate-200/80 bg-white px-5 py-6 shadow-[0_18px_55px_-30px_rgba(27,43,78,0.34)] transition-shadow duration-300 hover:shadow-[0_24px_65px_-30px_rgba(27,43,78,0.4)] sm:px-9 sm:py-8">
        <div className="text-center">
          <div className="login-logo-enter mx-auto flex h-[52px] w-[210px] items-center justify-center">
            <CompanyLogo className="max-h-full max-w-full object-contain" />
          </div>
          <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 sm:mt-2 sm:text-base">
            Godavari Waves
          </h1>
        </div>

        <div className="mb-5 mt-6 text-center sm:mb-6 sm:mt-7">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            Employee portal
          </p>
          <h2 className="text-[1.65rem] font-semibold tracking-tight text-slate-900">
            Employee Login
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
            Welcome back! Sign in to your employee account.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Administrator?{' '}
            <Link
              className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              to="/admin/login"
            >
              Sign in to Admin Portal
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default EmployeeLoginPage;
