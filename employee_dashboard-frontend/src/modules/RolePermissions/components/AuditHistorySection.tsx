/**
 * AuditHistorySection Component
 * Comprehensive audit trail recording individual permission mutations, previous vs new values,
 * administrative actors, and timestamps.
 */

import React, { useState } from 'react';
import { History, Search, Filter, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuditHistoryItem, AppModule } from '../types/rolePermissions.types';
import { APP_MODULES } from '../constants/rolePermissions.constants';

interface AuditHistorySectionProps {
  audits: AuditHistoryItem[];
}

export const AuditHistorySection: React.FC<AuditHistorySectionProps> = ({ audits }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedAdmin, setSelectedAdmin] = useState<string>('All');

  const adminOptions = Array.from(new Set(audits.map((a) => a.adminName)));

  const filteredAudits = audits.filter((item) => {
    const matchesSearch =
      item.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.permissionChanged.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.adminName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'All' || item.module === selectedModule;
    const matchesAdmin = selectedAdmin === 'All' || item.adminName === selectedAdmin;

    return matchesSearch && matchesModule && matchesAdmin;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedModule('All');
    setSelectedAdmin('All');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mb-8">
      {/* Header */}
      <div className="p-5 border-b border-[#E5E7EB] bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Audit History</h3>
            <p className="text-xs text-[#6B7280]">
              Immutable audit records for compliance, security inspections, and privilege change tracking.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="py-1.5 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Modules</option>
            {APP_MODULES.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Admin Filter */}
          <select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="py-1.5 px-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Admins</option>
            {adminOptions.map((admin) => (
              <option key={admin} value={admin}>
                {admin}
              </option>
            ))}
          </select>

          {(searchTerm || selectedModule !== 'All' || selectedAdmin !== 'All') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider select-none">
              <th className="py-3 px-5">Timestamp</th>
              <th className="py-3 px-4">Admin Name</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">Permission Changed</th>
              <th className="py-3 px-4 text-center">Previous Value</th>
              <th className="py-3 px-3 text-center">→</th>
              <th className="py-3 px-5 text-center">New Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filteredAudits.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No audit history records found matching criteria.
                </td>
              </tr>
            ) : (
              filteredAudits.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{item.adminName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-100">
                      {item.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {item.module}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.permissionChanged}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        item.previousValue
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.previousValue ? 'Granted' : 'Denied'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400">
                    <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                  </td>
                  <td className="py-3 px-5 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        item.newValue
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                          : 'bg-rose-100 text-rose-700 ring-1 ring-rose-300'
                      }`}
                    >
                      {item.newValue ? 'Granted' : 'Denied'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditHistorySection;
