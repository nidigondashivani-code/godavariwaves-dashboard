import {
  UsersRound,
  UserCheck,
  UserX,
  Clock3,
  CalendarOff,
  ClipboardList,
  ListTodo,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import StatCard, { type StatCardTone } from '../components/StatCard';
import UpcomingBirthdays from '../components/UpcomingBirthdays';
import UpcomingHolidaysList from '../components/UpcomingHolidaysList';
import {
  dashboardMetrics,
  todayHoliday,
  upcomingBirthdays,
} from '../constants/dashboard.constants';

const workforceCards: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: StatCardTone;
  id: string;
}[] = [
  {
    title: 'Total Employees',
    value: dashboardMetrics.totalEmployees,
    description: 'Across all departments',
    icon: UsersRound,
    tone: 'blue',
    id: 'module-total-employees',
  },
  {
    title: 'Present Today',
    value: dashboardMetrics.presentToday,
    description: 'Attendance overview',
    icon: UserCheck,
    tone: 'green',
    id: 'module-present-today',
  },
  {
    title: 'Absent Today',
    value: dashboardMetrics.absentToday,
    description: 'Attendance overview',
    icon: UserX,
    tone: 'rose',
    id: 'module-absent-today',
  },
  {
    title: 'Late Employees',
    value: dashboardMetrics.lateEmployees,
    description: 'Attendance overview',
    icon: Clock3,
    tone: 'amber',
    id: 'module-late-employees',
  },
  {
    title: 'Employees On Leave',
    value: dashboardMetrics.employeesOnLeave,
    description: 'Currently on approved leave',
    icon: CalendarOff,
    tone: 'violet',
    id: 'module-employees-on-leave',
  },
];

const pendingRequestCards: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: StatCardTone;
  id: string;
}[] = [
  {
    title: 'Pending Leave Requests',
    value: dashboardMetrics.pendingLeaveRequests,
    description: 'Awaiting admin review',
    icon: ClipboardList,
    tone: 'amber',
    id: 'module-pending-leave-requests',
  },
  {
    title: 'Pending Task Updates',
    value: dashboardMetrics.pendingTaskUpdates,
    description: 'Awaiting admin review',
    icon: ListTodo,
    tone: 'blue',
    id: 'module-pending-task-updates',
  },
];

function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-7">
        <div className="mb-1">
          <h2 className="scroll-mt-24 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl" id="dashboard-overview">
            Dashboard Overview
          </h2>
        </div>

        {/* Section 1: Workforce & Attendance Overview (Modules 1-5) */}
        <section aria-labelledby="workforce-overview-heading" className="scroll-mt-24" id="workforce-overview">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500" id="workforce-overview-heading">
                Workforce & Attendance Overview
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                5 metrics
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {workforceCards.map((card) => <StatCard {...card} key={card.title} />)}
          </div>
        </section>

        {/* Section 2: Pending Requests & Approvals */}
        <section aria-labelledby="pending-requests-heading" className="scroll-mt-24" id="pending-requests">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500" id="pending-requests-heading">
                Pending Requests & Approvals
              </h3>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                2 action items
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {pendingRequestCards.map((card) => <StatCard {...card} key={card.title} />)}
          </div>
        </section>

        {/* Section 3: Schedules & Celebrations */}
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <UpcomingHolidaysList holiday={todayHoliday} />
          </div>
          <div className="lg:col-span-8">
            <UpcomingBirthdays birthdays={upcomingBirthdays} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
