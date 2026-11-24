import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Building2,
  Briefcase,
  Download,
  FileSpreadsheet,
  Printer,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Trash2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  DepartmentType,
  Employee,
  EmployeeFilterOptions,
  SortField,
  SortOrder,
} from '../types/employee.types';
import employeeService from '../services/employee.service';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeFilterBar from '../components/EmployeeFilterBar';
import AddEmployeeDrawer from '../components/AddEmployeeDrawer';
import EditEmployeeDrawer from '../components/EditEmployeeDrawer';
import EmployeeDetailsDrawer from '../components/EmployeeDetailsDrawer';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import DeactivateConfirmationModal from '../components/DeactivateConfirmationModal';
import PasswordGeneratorModal from '../components/PasswordGeneratorModal';
import ToastNotification, { ToastMessage } from '../components/ToastNotification';
import { ResponsiveSummaryCards, SummaryCardType } from '../components/ResponsiveSummaryCards';
import DepartmentFilterDrawer from '../components/DepartmentFilterDrawer';
import DesignationFilterDrawer from '../components/DesignationFilterDrawer';
import BreadcrumbFilterTrail from '../components/BreadcrumbFilterTrail';
import ActiveFilterChips from '../components/ActiveFilterChips';
import designationService from '../services/designation.service';
import { exportEmployeesToExcel, exportEmployeesToPdf } from '../utils/employee.utils';
import { extractApiError } from '../../../api/apiClient';

const INITIAL_FILTERS: EmployeeFilterOptions = {
  searchQuery: '',
  department: '',
  designation: '',
  role: '',
  employmentType: '',
  status: '',
  dashboardAccess: 'all',
  joiningDateFrom: '',
  joiningDateTo: '',
};

export const ManageEmployeesPage: React.FC = () => {
  // Master employee state
  const [employees, setEmployees] = useState<Employee[]>(() => employeeService.getEmployees());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Interactive Card & Filter matrix state
  const [activeCard, setActiveCard] = useState<SummaryCardType | null>('total');
  const [isDepartmentDrawerOpen, setIsDepartmentDrawerOpen] = useState(false);
  const [isDesignationDrawerOpen, setIsDesignationDrawerOpen] = useState(false);

  // Modals & Drawers state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [togglingStatusEmployee, setTogglingStatusEmployee] = useState<Employee | null>(null);
  const [passwordResetEmployee, setPasswordResetEmployee] = useState<Employee | null>(null);

  // Pagination & Sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('employeeId');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filters state
  const [filters, setFilters] = useState<EmployeeFilterOptions>(INITIAL_FILTERS);

  const refreshEmployees = async () => {
    try {
      const synced = await employeeService.syncFromBackend();
      setEmployees(synced);
    } catch {
      setEmployees(employeeService.getEmployees());
    }
  };

  const [designationVersion, setDesignationVersion] = useState(0);

  useEffect(() => {
    refreshEmployees();
  }, []);

  useEffect(() => {
    return designationService.subscribe(() => {
      setDesignationVersion((v) => v + 1);
    });
  }, []);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Metrics (with live configured designation count)
  const metrics = useMemo(() => {
    const base = employeeService.getMetrics();
    return {
      ...base,
      designationCount: designationService.getAllDesignations().length,
    };
  }, [employees, designationVersion]);

  // Filtering Logic
  const filteredEmployees = useMemo(() => {
    const now = new Date('2026-11-24T23:59:59');

    return employees.filter((emp) => {
      // Search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query);
        const matchesId = emp.employeeId.toLowerCase().includes(query);
        const matchesEmail = emp.companyEmail.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesEmail) return false;
      }

      // Department
      if (filters.department && emp.department !== filters.department) return false;

      // Designation
      if (filters.designation && emp.designation !== filters.designation) return false;

      // Role
      if (filters.role && emp.role !== filters.role) return false;

      // Employment Type
      if (filters.employmentType && emp.employmentType !== filters.employmentType) return false;

      // Status
      if (filters.status && emp.status !== filters.status) return false;

      // Dashboard Access
      if (filters.dashboardAccess === 'enabled' && !emp.dashboardAccess) return false;
      if (filters.dashboardAccess === 'disabled' && emp.dashboardAccess) return false;

      // Standard Joining Date range
      if (filters.joiningDateFrom && emp.joiningDate < filters.joiningDateFrom) return false;
      if (filters.joiningDateTo && emp.joiningDate > filters.joiningDateTo) return false;

      return true;
    });
  }, [employees, filters]);

  // Sorting Logic
  const sortedEmployees = useMemo(() => {
    const list = [...filteredEmployees];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'employeeId':
          comparison = a.employeeId.localeCompare(b.employeeId, undefined, { numeric: true });
          break;
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'designation':
          comparison = a.designation.localeCompare(b.designation);
          break;
        case 'joiningDate':
          comparison = a.joiningDate.localeCompare(b.joiningDate);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'dashboardAccess':
          comparison = Number(a.dashboardAccess) - Number(b.dashboardAccess);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredEmployees, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedEmployees.map((e) => e.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedEmployees.map((e) => e.id));
      setSelectedIds(selectedIds.filter((id) => !pageIds.has(id)));
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Card Click Handlers
  const handleSelectSummaryCard = (card: SummaryCardType) => {
    setCurrentPage(1);

    if (card === 'total') {
      setActiveCard('total');
      setFilters(INITIAL_FILTERS);
      addToast('info', 'Showing All Employees', 'All filters cleared.');
    } else if (card === 'active') {
      setActiveCard('active');
      setFilters((prev) => ({ ...prev, status: 'Active' }));
    } else if (card === 'departments') {
      setIsDepartmentDrawerOpen(true);
    } else if (card === 'designations') {
      setIsDesignationDrawerOpen(true);
    }
  };

  // Department Selection from Drawer
  const handleSelectDepartment = (department: DepartmentType) => {
    setActiveCard('departments');
    setFilters((prev) => ({ ...prev, department, designation: '' }));
    setCurrentPage(1);
    addToast('info', 'Department Filter Applied', `Showing employees in ${department}.`);
  };

  // Designation Selection from Drawer
  const handleSelectDesignation = (designation: string, department?: DepartmentType) => {
    setActiveCard('designations');
    setFilters((prev) => ({
      ...prev,
      designation,
      ...(department ? { department } : {}),
    }));
    setCurrentPage(1);
    addToast('info', 'Designation Filter Applied', `Showing all ${designation}s.`);
  };

  // Reset all filters
  const handleResetAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setActiveCard('total');
    setCurrentPage(1);
  };

  // Remove individual filter chip
  const handleRemoveFilter = (filterKey: keyof EmployeeFilterOptions) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: filterKey === 'dashboardAccess' ? 'all' : '',
    }));
    setCurrentPage(1);
  };

  // CRUD Event Handlers (backed by real MySQL Express APIs — never fake success or store plaintext passwords)
  const handleSaveNewEmployee = async (
    data: Omit<Employee, 'id' | 'createdAt' | 'employmentHistory' | 'loginHistory'>
  ) => {
    try {
      const result = await employeeService.createEmployeeOnBackend({
        employee_code: data.employeeId,
        first_name: data.firstName,
        last_name: data.lastName,
        company_email: data.companyEmail,
        phone: data.mobileNumber,
        department_name: data.department,
        designation_title: data.designation,
        role_name: data.role,
        employment_type: data.employmentType,
        employment_status: data.status || 'Active',
        joining_date: data.joiningDate,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        address: data.address || null,
        dashboard_access: data.role === 'Admin' ? 'both' : 'employee',
        dashboard_access_enabled: Boolean(data.dashboardAccess),
        temporary_password: data.temporaryPassword,
      });
      await refreshEmployees();
      const creds = result?.generatedCredentials;
      addToast(
        'success',
        'Employee Created in MySQL',
        `${data.firstName} ${data.lastName} (${data.employeeId}) saved securely.${
          creds?.temporaryPassword ? ' Temporary credentials are ready for first login.' : ''
        }`
      );
    } catch (err) {
      addToast('error', 'Failed to Create Employee', extractApiError(err, 'Unable to save employee to database.'));
    }
  };

  const handleSaveEditEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const numericId = Number(id);
      if (Number.isFinite(numericId) && numericId > 0) {
        await employeeService.updateEmployeeOnBackend(numericId, {
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.mobileNumber,
          employment_type: updates.employmentType,
          employment_status: updates.status,
          joining_date: updates.joiningDate,
          date_of_birth: updates.dateOfBirth,
          address: updates.address,
        });
      }
      await refreshEmployees();
      addToast('success', 'Employee Updated', 'Employee record updated in database.');
    } catch (err) {
      addToast('error', 'Update Failed', extractApiError(err, 'Unable to update employee.'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      await employeeService.softDeleteEmployeeOnBackend(Number(deletingEmployee.id));
      await refreshEmployees();
      setSelectedIds((prev) => prev.filter((id) => id !== deletingEmployee.id));
      addToast(
        'info',
        'Employee Archived',
        `${deletingEmployee.firstName} ${deletingEmployee.lastName} was soft-deleted.`
      );
      setDeletingEmployee(null);
    } catch (err) {
      addToast('error', 'Delete Failed', extractApiError(err, 'Unable to archive employee.'));
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await employeeService.bulkActionOnBackend(selectedIds.map(Number), 'delete');
      await refreshEmployees();
      addToast('info', 'Employees Archived', `${selectedIds.length} employees have been archived.`);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
    } catch (err) {
      addToast('error', 'Bulk Delete Failed', extractApiError(err));
    }
  };

  const handleToggleStatus = async (emp: Employee, reason?: string) => {
    try {
      if (emp.status === 'Active') {
        await employeeService.deactivateEmployeeOnBackend(Number(emp.id), reason || 'Deactivated');
        addToast(
          'warning',
          'Employee Deactivated',
          `Access revoked for ${emp.firstName} ${emp.lastName} (${reason || 'Deactivated'}).`
        );
      } else {
        await employeeService.activateEmployeeOnBackend(Number(emp.id));
        addToast(
          'success',
          'Employee Activated',
          `Active status restored for ${emp.firstName} ${emp.lastName}.`
        );
      }
      await refreshEmployees();
    } catch (err) {
      addToast('error', 'Status Update Failed', extractApiError(err));
    }
  };

  const handleToggleDashboardAccess = async (emp: Employee, newAccess: boolean) => {
    try {
      await employeeService.toggleDashboardAccessOnBackend(Number(emp.id), newAccess);
      await refreshEmployees();
      addToast(
        'info',
        'Dashboard Access Updated',
        `${emp.firstName} ${emp.lastName}'s dashboard access is now ${
          newAccess ? 'Enabled' : 'Disabled'
        }.`
      );
    } catch (err) {
      addToast('error', 'Access Update Failed', extractApiError(err));
    }
  };

  const handleResetPassword = async (newPassword: string, sendEmail: boolean) => {
    if (!passwordResetEmployee) return;
    try {
      await employeeService.resetPasswordOnBackend(Number(passwordResetEmployee.id), newPassword);
      await refreshEmployees();
      addToast(
        'success',
        'Password Reset Successfully',
        `New hashed password saved for ${passwordResetEmployee.firstName}.${
          sendEmail ? ' Ready to share with ' + passwordResetEmployee.companyEmail : ''
        }`
      );
      setPasswordResetEmployee(null);
    } catch (err) {
      addToast('error', 'Password Reset Failed', extractApiError(err));
    }
  };

  const handleBulkAction = async (
    action: 'activate' | 'deactivate' | 'enableAccess' | 'disableAccess'
  ) => {
    try {
      await employeeService.bulkActionOnBackend(selectedIds.map(Number), action);
      await refreshEmployees();
      const actionLabels: Record<string, string> = {
        activate: 'Activated',
        deactivate: 'Deactivated',
        enableAccess: 'Dashboard Access Enabled',
        disableAccess: 'Dashboard Access Disabled',
      };
      addToast(
        'success',
        'Bulk Action Completed',
        `${selectedIds.length} employees updated (${actionLabels[action]}).`
      );
      setSelectedIds([]);
    } catch (err) {
      addToast('error', 'Bulk Action Failed', extractApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb Filter Trail */}
          <div className="mb-1.5">
            <BreadcrumbFilterTrail
              activeCard={activeCard}
              department={filters.department}
              designation={filters.designation}
              status={filters.status}
              onResetAll={handleResetAllFilters}
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Employee Directory & Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise administration portal: Manage personnel, departmental assignments, and dashboard access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportEmployeesToExcel(filteredEmployees)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition"
            title="Export filtered records to Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => exportEmployeesToPdf(filteredEmployees)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition"
            title="Print or export to PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDesignationDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition"
            title="Manage and configure company designations"
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Designations</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive Summary Cards */}
      <ResponsiveSummaryCards
        metrics={metrics}
        activeCard={activeCard}
        onSelectCard={handleSelectSummaryCard}
      />

      {/* 3. Filter Bar */}
      <EmployeeFilterBar
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetAllFilters}
        totalFilteredCount={filteredEmployees.length}
      />

      {/* 4. Active Filter Chips & Feedback Bar */}
      <ActiveFilterChips
        filters={filters}
        activeCard={activeCard}
        filteredCount={filteredEmployees.length}
        totalCount={employees.length}
        onRemoveFilter={handleRemoveFilter}
        onResetAll={handleResetAllFilters}
      />

      {/* 6. Table Toolbar (Bulk actions & view mode) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 animate-in fade-in">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {selectedIds.length} Selected
              </span>

              <button
                onClick={() => handleBulkAction('activate')}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition"
              >
                Activate
              </button>

              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition"
              >
                Deactivate
              </button>

              <button
                onClick={() => handleBulkAction('enableAccess')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Enable Access
              </button>

              <button
                onClick={() => handleBulkAction('disableAccess')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Disable Access
              </button>

              <button
                onClick={() => setIsBulkDeleteOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>

              <button
                onClick={() => {
                  const selectedEmps = employees.filter((e) => selectedIds.includes(e.id));
                  exportEmployeesToExcel(selectedEmps, 'Selected_Employees');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredEmployees.length}</strong> matching records
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Rows per page */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'table'
                  ? 'bg-white shadow text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'cards'
                  ? 'bg-white shadow text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. Main Content: Table or Cards or Empty State */}
      {employees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-3 shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Employees in Directory
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Your employee directory is clean. Click below to add your first company employee.
          </p>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Employee</span>
          </button>
        </div>
      ) : paginatedEmployees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No employees found for the selected criteria.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search criteria, switching active summary cards, or clearing applied filters.
          </p>
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <EmployeeTable
          employees={paginatedEmployees}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onViewProfile={(emp) => setViewingEmployee(emp)}
          onEdit={(emp) => setEditingEmployee(emp)}
          onResetPassword={(emp) => setPasswordResetEmployee(emp)}
          onToggleStatus={(emp) => setTogglingStatusEmployee(emp)}
          onDelete={(emp) => setDeletingEmployee(emp)}
          onToggleDashboardAccess={handleToggleDashboardAccess}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              isSelected={selectedIds.includes(emp.id)}
              onSelect={(checked) => handleSelectOne(emp.id, checked)}
              onViewProfile={() => setViewingEmployee(emp)}
              onEdit={() => setEditingEmployee(emp)}
              onResetPassword={() => setPasswordResetEmployee(emp)}
              onToggleStatus={() => setTogglingStatusEmployee(emp)}
              onDelete={() => setDeletingEmployee(emp)}
              onToggleDashboardAccess={(newVal) => handleToggleDashboardAccess(emp, newVal)}
            />
          ))}
        </div>
      )}

      {/* 8. Pagination Controls */}
      {filteredEmployees.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
          <div>
            Showing{' '}
            <strong className="text-slate-900">
              {Math.min((currentPage - 1) * pageSize + 1, filteredEmployees.length)}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-900">
              {Math.min(currentPage * pageSize, filteredEmployees.length)}
            </strong>{' '}
            of <strong className="text-slate-900">{filteredEmployees.length}</strong> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 9. Drawers & Modals */}
      {/* Department Filter Drawer */}
      <DepartmentFilterDrawer
        isOpen={isDepartmentDrawerOpen}
        onClose={() => setIsDepartmentDrawerOpen(false)}
        onSelectDepartment={handleSelectDepartment}
        selectedDepartment={filters.department}
        employees={employees}
      />

      {/* Designation Filter & Management Drawer */}
      <DesignationFilterDrawer
        isOpen={isDesignationDrawerOpen}
        onClose={() => setIsDesignationDrawerOpen(false)}
        onSelectDesignation={handleSelectDesignation}
        selectedDesignation={filters.designation}
        employees={employees}
        onEmployeesUpdated={refreshEmployees}
        onAddToast={addToast}
      />

      <AddEmployeeDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveNewEmployee}
        existingEmployees={employees}
      />

      <EditEmployeeDrawer
        isOpen={Boolean(editingEmployee)}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSave={handleSaveEditEmployee}
        existingEmployees={employees}
      />

      <EmployeeDetailsDrawer
        isOpen={Boolean(viewingEmployee)}
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onEdit={(emp) => {
          setViewingEmployee(null);
          setEditingEmployee(emp);
        }}
        onResetPassword={(emp) => {
          setPasswordResetEmployee(emp);
        }}
        onToggleStatus={(emp) => handleToggleStatus(emp)}
      />

      {/* Single Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={Boolean(deletingEmployee)}
        employee={deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={isBulkDeleteOpen}
        employee={null}
        isBulk={true}
        bulkCount={selectedIds.length}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
      />

      {/* Deactivate / Activate Confirmation */}
      <DeactivateConfirmationModal
        isOpen={Boolean(togglingStatusEmployee)}
        employee={togglingStatusEmployee}
        isActivating={togglingStatusEmployee?.status === 'Inactive'}
        onClose={() => setTogglingStatusEmployee(null)}
        onConfirm={(reason) => {
          if (togglingStatusEmployee) handleToggleStatus(togglingStatusEmployee, reason);
        }}
      />

      {/* Password Reset Modal */}
      <PasswordGeneratorModal
        isOpen={Boolean(passwordResetEmployee)}
        employee={passwordResetEmployee}
        onClose={() => setPasswordResetEmployee(null)}
        onPasswordReset={handleResetPassword}
      />

      {/* Toast Notifications System */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default ManageEmployeesPage;
