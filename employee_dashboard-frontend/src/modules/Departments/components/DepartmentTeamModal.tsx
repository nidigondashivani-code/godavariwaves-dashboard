/**
 * DepartmentTeamModal Component
 * Modal dialog showing the dedicated employee roster for a selected department.
 * Columns: Photo, ID, Name, Designation, Email, Phone, Joining Date, Status.
 * Includes instant search and pagination.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { DepartmentEmployee, DepartmentItem } from '../types/department.types';
import { departmentService } from '../services/department.service';

interface DepartmentTeamModalProps {
  department: DepartmentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DepartmentTeamModal: React.FC<DepartmentTeamModalProps> = ({
  department,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const employees = useMemo(() => {
    if (!department) return [];
    return departmentService.getEmployeesByDepartment(department.name);
  }, [department]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginated = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (!isOpen || !department) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-[#E5E7EB] z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
              style={{ backgroundColor: department.accentColor }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111827]">
                  {department.name} Team Roster
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A]">
                  {department.totalEmployees} Employees Total
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Active staff members and assigned designations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, ID, designation..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider select-none sticky top-0 z-10">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No employees found in this department matching your search.
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    {/* Photo & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <span className="font-bold text-slate-900">{emp.name}</span>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {emp.employeeId}
                    </td>

                    {/* Designation */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          emp.designation === 'Graphic Designer'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.designation}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-slate-600">
                      {emp.email}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-slate-600">
                      {emp.phone}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3 px-4 text-slate-600">
                      {emp.joiningDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div>
            Showing {filteredEmployees.length} registered employees in {department.name}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentTeamModal;
