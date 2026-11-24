/**
 * DepartmentsPage Component
 * Enterprise Departments Module for Godavari Wave HRMS.
 * Enhanced with Integrated Team Lead Management, Responsive Summary Cards,
 * Interactive Click Filtering, Breadcrumb Filter Trails & Active Filter Chips.
 *
 * Strictly 4 core departments (Software Development, Digital Marketing, Sales, Administration).
 * Graphic Designer is a designation under Digital Marketing, NOT a separate department.
 * No HR, No Finance, No CEO. Admin manages the organization.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Download,
  RotateCcw,
  Layers,
  BarChart3,
  Activity,
  UserCheck,
} from 'lucide-react';
import {
  DepartmentActivity,
  DepartmentFilterOptions,
  DepartmentItem,
  DepartmentSummaryMetrics,
  TeamLeadMember,
} from '../types/department.types';
import { departmentService } from '../services/department.service';
import DepartmentSummaryCards, { DepartmentCardFilterType } from '../components/DepartmentSummaryCards';
import DepartmentBreadcrumbTrail from '../components/DepartmentBreadcrumbTrail';
import DepartmentActiveFilterChips from '../components/DepartmentActiveFilterChips';
import DepartmentCardGrid from '../components/DepartmentCardGrid';
import DepartmentTable from '../components/DepartmentTable';
import DepartmentDetailsDrawer from '../components/DepartmentDetailsDrawer';
import DepartmentTeamModal from '../components/DepartmentTeamModal';
import DepartmentTeamLeadsDrawer from '../components/DepartmentTeamLeadsDrawer';
import ManageTeamLeadsDrawer from '../components/ManageTeamLeadsDrawer';
import TeamLeadProfileModal from '../components/TeamLeadProfileModal';
import RemoveTeamLeadConfirmationModal from '../components/RemoveTeamLeadConfirmationModal';
import DepartmentAnalytics from '../components/DepartmentAnalytics';
import RecentActivitiesSection from '../components/RecentActivitiesSection';
import DepartmentFilterBar from '../components/DepartmentFilterBar';
import EditDepartmentModal from '../components/EditDepartmentModal';
import {
  ToastNotification,
  ToastMessage,
  ToastType,
} from '../../Employee/components/ToastNotification';

const INITIAL_FILTERS: DepartmentFilterOptions = {
  searchQuery: '',
  teamLead: 'All',
  status: 'All',
  minEmployees: 0,
};

export const DepartmentsPage: React.FC = () => {
  // State
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [metrics, setMetrics] = useState<DepartmentSummaryMetrics>(
    departmentService.getSummaryMetrics()
  );
  const [activities, setActivities] = useState<DepartmentActivity[]>([]);

  // Interactive Card & Filter State
  const [activeCard, setActiveCard] = useState<DepartmentCardFilterType | null>('total-depts');
  const [filters, setFilters] = useState<DepartmentFilterOptions>(INITIAL_FILTERS);

  // Drawer / Modal States
  // 1. Details Drawer
  const [selectedDeptForDetails, setSelectedDeptForDetails] = useState<DepartmentItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 2. Team Leads Drawer
  const [selectedDeptForTeamLeads, setSelectedDeptForTeamLeads] = useState<DepartmentItem | null>(null);
  const [isTeamLeadsDrawerOpen, setIsTeamLeadsDrawerOpen] = useState(false);

  // 3. Manage Team Leads Drawer
  const [selectedDeptForManage, setSelectedDeptForManage] = useState<DepartmentItem | null>(null);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);

  // 4. Team Lead Profile Modal
  const [selectedLeadForProfile, setSelectedLeadForProfile] = useState<TeamLeadMember | null>(null);
  const [isLeadProfileModalOpen, setIsLeadProfileModalOpen] = useState(false);

  // 5. Team Lead Removal Confirmation Modal
  const [leadToRemove, setLeadToRemove] = useState<{ deptId: string; lead: TeamLeadMember } | null>(null);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  // 6. Manage Employees / View Team Modal
  const [selectedDeptForTeam, setSelectedDeptForTeam] = useState<DepartmentItem | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // 7. Edit Department Modal
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<DepartmentItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'cards' | 'table' | 'analytics'>('cards');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: ToastType = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-dept-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Data
  const loadData = () => {
    const fetched = departmentService.getDepartments();
    setDepartments(fetched);
    setMetrics(departmentService.getSummaryMetrics());
    setActivities(departmentService.getRecentActivities());

    // Keep active selected department in sync
    if (selectedDeptForDetails) {
      const refreshed = fetched.find((d) => d.id === selectedDeptForDetails.id);
      if (refreshed) setSelectedDeptForDetails(refreshed);
    }
    if (selectedDeptForTeamLeads) {
      const refreshed = fetched.find((d) => d.id === selectedDeptForTeamLeads.id);
      if (refreshed) setSelectedDeptForTeamLeads(refreshed);
    }
    if (selectedDeptForManage) {
      const refreshed = fetched.find((d) => d.id === selectedDeptForManage.id);
      if (refreshed) setSelectedDeptForManage(refreshed);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Sorted Departments
  const filteredDepartments = useMemo(() => {
    const list = departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        dept.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        dept.teamLeads.some((tl) => tl.name.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      const matchesLead =
        filters.teamLead === 'All' ||
        dept.teamLeads.some((tl) => tl.name === filters.teamLead);
      const matchesStatus = filters.status === 'All' || dept.status === filters.status;
      const matchesSize = dept.totalEmployees >= filters.minEmployees;

      // Card specific filter constraints
      let matchesCard = true;
      if (activeCard === 'depts-without-leads') {
        matchesCard = dept.teamLeads.length === 0;
      } else if (activeCard === 'total-team-leads') {
        matchesCard = dept.teamLeads.length > 0;
      }

      return matchesSearch && matchesLead && matchesStatus && matchesSize && matchesCard;
    });

    // Sort order based on active card
    if (activeCard === 'total-emp') {
      list.sort((a, b) => b.totalEmployees - a.totalEmployees);
    } else if (activeCard === 'active-projects') {
      list.sort((a, b) => b.activeProjectsCount - a.activeProjectsCount);
    }

    return list;
  }, [departments, filters, activeCard]);

  // Card click triggers
  const handleSelectSummaryCard = (card: DepartmentCardFilterType) => {
    setActiveCard(card);

    if (card === 'total-depts') {
      setFilters(INITIAL_FILTERS);
      showToast('Showing All Departments', 'Displaying all 4 core organization divisions.', 'info');
    } else if (card === 'total-emp') {
      showToast('Employee Distribution', 'Departments ordered by total workforce headcount.', 'info');
    } else if (card === 'total-team-leads') {
      setFilters((prev) => ({ ...prev, teamLead: 'All' }));
      showToast('Team Leads Active', 'Showing divisions with active Team Leads assigned (6 Leads Total).', 'info');
    } else if (card === 'depts-without-leads') {
      showToast('Divisions Without Leads', 'Filtering for departments needing leadership assignment.', 'info');
    } else if (card === 'active-projects') {
      showToast('Active Initiatives', 'Departments prioritized by active project volume.', 'info');
    }
  };

  const handleResetAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setActiveCard('total-depts');
  };

  const handleRemoveFilter = (key: keyof DepartmentFilterOptions) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'searchQuery' ? '' : key === 'minEmployees' ? 0 : 'All',
    }));
  };

  // Handlers
  const handleViewDetails = (dept: DepartmentItem) => {
    setSelectedDeptForDetails(dept);
    setIsDetailsOpen(true);
  };

  const handleViewTeamLeads = (dept: DepartmentItem) => {
    setSelectedDeptForTeamLeads(dept);
    setIsTeamLeadsDrawerOpen(true);
  };

  const handleManageTeamLeads = (dept: DepartmentItem) => {
    setSelectedDeptForManage(dept);
    setIsManageDrawerOpen(true);
  };

  const handleViewTeam = (dept: DepartmentItem) => {
    setSelectedDeptForTeam(dept);
    setIsTeamModalOpen(true);
  };

  const handleEditDepartment = (dept: DepartmentItem) => {
    setSelectedDeptForEdit(dept);
    setIsEditModalOpen(true);
  };

  const handleViewLeadProfile = (lead: TeamLeadMember) => {
    setSelectedLeadForProfile(lead);
    setIsLeadProfileModalOpen(true);
  };

  // Team Lead Assignment
  const handleAssignTeamLead = (departmentId: string, employeeId: string) => {
    const res = departmentService.assignTeamLead(departmentId, employeeId, 'Admin User');
    if (res.success) {
      loadData();
      showToast('Team Lead Assigned', res.message, 'success');
    } else {
      showToast('Assignment Error', res.message, 'error');
    }
  };

  // Trigger Remove Confirmation
  const handleTriggerRemoveLead = (departmentId: string, lead: TeamLeadMember) => {
    setLeadToRemove({ deptId: departmentId, lead });
    setIsRemoveConfirmOpen(true);
  };

  // Confirm Team Lead Removal
  const handleConfirmRemoveLead = () => {
    if (!leadToRemove) return;
    const res = departmentService.removeTeamLead(leadToRemove.deptId, leadToRemove.lead.id, 'Admin User');
    if (res.success) {
      loadData();
      setIsRemoveConfirmOpen(false);
      setLeadToRemove(null);
      showToast('Team Lead Removed', res.message, 'info');
    } else {
      showToast('Removal Error', res.message, 'error');
    }
  };

  // Save Department Parameters
  const handleSaveDepartment = (id: string, updates: Partial<DepartmentItem>) => {
    const res = departmentService.updateDepartment(id, updates, 'Admin User');
    if (res.success) {
      loadData();
      showToast('Department Updated', res.message, 'success');
    } else {
      showToast('Update Failed', res.message, 'error');
    }
  };

  // Export JSON
  const handleExportDepartments = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(departments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `GodavariWave_Departments_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export Complete', 'Department directory exported.', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />

      {/* Page Header Bar with Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-1.5">
            <DepartmentBreadcrumbTrail
              activeCard={activeCard}
              teamLead={filters.teamLead}
              status={filters.status}
              minEmployees={filters.minEmployees}
              searchQuery={filters.searchQuery}
              activeTab={activeTab}
              onResetAll={handleResetAllFilters}
            />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">
              Department Management
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-200">
              4 Core Divisions
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Department governance, leadership appointments, workforce allocation, and project metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportDepartments}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-[#111827] border border-[#E5E7EB] rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Directory
          </button>
        </div>
      </div>

      {/* 1. Dashboard Summary Cards (Responsive & Interactive 5 Cards) */}
      <DepartmentSummaryCards
        metrics={metrics}
        activeCard={activeCard}
        onSelectCard={handleSelectSummaryCard}
      />

      {/* 2. Filter Bar */}
      <DepartmentFilterBar
        departments={departments}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={handleResetAllFilters}
      />

      {/* 3. Active Filter Chips & Feedback Bar */}
      <DepartmentActiveFilterChips
        filters={filters}
        activeCard={activeCard}
        filteredCount={filteredDepartments.length}
        totalDepartmentsCount={departments.length}
        onRemoveFilter={handleRemoveFilter}
        onResetAll={handleResetAllFilters}
      />

      {/* 4. View Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cards'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Department Cards ({filteredDepartments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'table'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Department Table
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'analytics'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Workforce Analytics & Distribution
        </button>
      </div>

      {/* 5. Main Content Views or Empty State */}
      {filteredDepartments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-sm">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No departments found for the selected criteria.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {activeCard === 'depts-without-leads'
              ? 'Optimal Leadership Coverage: All 4 organizational divisions currently have dedicated and active Team Leads assigned.'
              : 'Try adjusting your search criteria, switching active summary cards, or clearing applied filters.'}
          </p>
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
          >
            Reset Filters
          </button>
        </div>
      ) : activeTab === 'cards' ? (
        <>
          <DepartmentCardGrid
            departments={filteredDepartments}
            onViewDetails={handleViewDetails}
            onViewTeamLeads={handleViewTeamLeads}
            onManageTeamLeads={handleManageTeamLeads}
          />
          <DepartmentAnalytics />
        </>
      ) : activeTab === 'table' ? (
        <DepartmentTable
          departments={filteredDepartments}
          onViewDetails={handleViewDetails}
          onEditDepartment={handleEditDepartment}
          onManageEmployees={handleViewTeam}
        />
      ) : (
        <DepartmentAnalytics />
      )}

      {/* Recent Activities Section */}
      <RecentActivitiesSection activities={activities} />

      {/* 1. Department Details Drawer (Enhanced with Team Leads Card) */}
      <DepartmentDetailsDrawer
        department={selectedDeptForDetails}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onViewTeam={handleViewTeam}
        onRemoveLead={(deptId, lead) => handleTriggerRemoveLead(deptId, lead)}
        onViewLeadProfile={handleViewLeadProfile}
      />

      {/* 2. Team Leads Drawer (Triggered by "Team Leads" button) */}
      <DepartmentTeamLeadsDrawer
        department={selectedDeptForTeamLeads}
        isOpen={isTeamLeadsDrawerOpen}
        onClose={() => setIsTeamLeadsDrawerOpen(false)}
        onViewProfile={handleViewLeadProfile}
        onRemoveLead={(deptId, lead) => handleTriggerRemoveLead(deptId, lead)}
        onOpenManage={(dept) => {
          setIsTeamLeadsDrawerOpen(false);
          setSelectedDeptForManage(dept);
          setIsManageDrawerOpen(true);
        }}
      />

      {/* 3. Manage Team Leads Drawer (Triggered by "Manage" button) */}
      <ManageTeamLeadsDrawer
        department={selectedDeptForManage}
        isOpen={isManageDrawerOpen}
        onClose={() => setIsManageDrawerOpen(false)}
        onAssignLead={(deptId, empId) => handleAssignTeamLead(deptId, empId)}
        onRemoveLead={(deptId, teamLeadId) => {
          const dept = departments.find((d) => d.id === deptId);
          const lead = dept?.teamLeads.find((l) => l.id === teamLeadId);
          if (lead) handleTriggerRemoveLead(deptId, lead);
        }}
      />

      {/* 4. Team Lead Profile Modal */}
      <TeamLeadProfileModal
        lead={selectedLeadForProfile}
        isOpen={isLeadProfileModalOpen}
        onClose={() => setIsLeadProfileModalOpen(false)}
      />

      {/* 5. Team Lead Removal Confirmation Modal */}
      <RemoveTeamLeadConfirmationModal
        isOpen={isRemoveConfirmOpen}
        lead={leadToRemove?.lead || null}
        onClose={() => {
          setIsRemoveConfirmOpen(false);
          setLeadToRemove(null);
        }}
        onConfirm={handleConfirmRemoveLead}
      />

      {/* 6. View Team / Department Employees Modal */}
      <DepartmentTeamModal
        department={selectedDeptForTeam}
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      {/* 7. Edit Department Modal */}
      <EditDepartmentModal
        department={selectedDeptForEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(id, updates) => handleSaveDepartment(id, updates)}
      />
    </div>
  );
};

export default DepartmentsPage;
