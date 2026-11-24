import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  Clock,
  Check,
} from 'lucide-react';
import { LeaveRequest, LeaveReportType } from '../types/leave.types';
import { LEAVE_DEPARTMENTS } from '../constants/leave.constants';
import { exportLeaveToExcel, exportLeaveToPDF } from '../utils/leaveExport.utils';
import leaveService from '../services/leave.service';

interface LeaveReportsModalProps {
  isOpen: boolean;
  requests: LeaveRequest[];
  onClose: () => void;
}

export const LeaveReportsModal: React.FC<LeaveReportsModalProps> = ({
  isOpen,
  requests,
  onClose,
}) => {
  const [reportType, setReportType] = useState<LeaveReportType>('monthly');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [month, setMonth] = useState<number>(11);
  const [year, setYear] = useState<number>(2026);
  const [searchEmployee, setSearchEmployee] = useState<string>('');

  const reportTabs: Array<{ id: LeaveReportType; label: string; icon: React.ElementType; desc: string }> = [
    {
      id: 'daily',
      label: 'Daily Leave Report',
      icon: Calendar,
      desc: 'Employees on leave today and immediate shift availability.',
    },
    {
      id: 'monthly',
      label: 'Monthly Leave Report',
      icon: BarChart3,
      desc: 'Consolidated leave breakdown and trends for the current month.',
    },
    {
      id: 'employee',
      label: 'Employee Leave Report',
      icon: Users,
      desc: 'Individual employee leave consumption and detailed timeline.',
    },
    {
      id: 'pending',
      label: 'Pending Requests Report',
      icon: Clock,
      desc: 'Actionable audit of pending leave applications awaiting approval.',
    },
  ];

  // Filter requests based on selected report parameters
  const filteredData = useMemo(() => {
    let result = [...requests];

    if (selectedDept !== 'All Departments') {
      result = result.filter((r) => r.department === selectedDept);
    }

    if (reportType === 'daily') {
      const today = '2026-11-24';
      result = result.filter(
        (r) => r.status === 'Approved' && r.startDate <= today && today <= r.endDate
      );
    } else if (reportType === 'pending') {
      result = result.filter((r) => r.status === 'Pending');
    } else if (reportType === 'monthly') {
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
      result = result.filter(
        (r) => r.startDate.startsWith(monthPrefix) || r.appliedDate.startsWith(monthPrefix)
      );
    } else if (reportType === 'employee') {
      if (searchEmployee.trim()) {
        const q = searchEmployee.toLowerCase();
        result = result.filter(
          (r) =>
            r.employeeName.toLowerCase().includes(q) ||
            r.employeeId.toLowerCase().includes(q)
        );
      }
    }

    return result;
  }, [requests, reportType, selectedDept, month, year, searchEmployee]);

  if (!isOpen) return null;

  const currentTab = reportTabs.find((t) => t.id === reportType);

  const handleExportExcel = () => {
    exportLeaveToExcel(filteredData, `GodavariWave_${reportType}_Report`);
  };

  const handleExportPDF = () => {
    exportLeaveToPDF(`${currentTab?.label || 'Leave Management Report'}`, filteredData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Leave Management Reports & Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Generate executive attendance & leave audit reports in Excel and PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Tabs (Horizontal Scrollable) */}
        <div className="px-5 pt-3 border-b border-slate-200 flex gap-2 overflow-x-auto bg-slate-50/40 shrink-0">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = reportType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReportType(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                  isSelected
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Department Filter
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 text-slate-700"
            >
              {LEAVE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {reportType === 'monthly' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Month & Year
              </label>
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-1/2 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-1/2 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
          )}

          {reportType === 'employee' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Search Employee Name / ID
              </label>
              <input
                type="text"
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                placeholder="e.g. Aarav, EMP-101"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          )}

          <div className="flex items-end justify-end gap-2 sm:col-start-3">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Report Preview Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Report Scope: <strong>{currentTab?.desc}</strong>
            </span>
            <span>
              Matching Records: <strong>{filteredData.length}</strong>
            </span>
          </div>

          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
              No leave records found matching the report criteria.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Leave Type</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.slice(0, 8).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {req.employeeName}{' '}
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({req.employeeId})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{req.department}</td>
                      <td className="py-2 px-3">{req.leaveType}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {req.startDate} to {req.endDate} ({req.totalDays}d)
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : req.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 8 && (
                <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50 border-t border-slate-200">
                  + {filteredData.length - 8} more records included in full export
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveReportsModal;
