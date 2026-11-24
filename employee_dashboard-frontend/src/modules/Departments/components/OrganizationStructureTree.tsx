/**
 * OrganizationStructureTree Component
 * Visual, clean hierarchy representation:
 * Administrator
 * ├── Software Development
 * ├── Digital Marketing
 * │      ├── SEO Executive
 * │      ├── Social Media Executive
 * │      ├── Content Writer
 * │      └── Graphic Designer
 * ├── Sales
 * └── Administration
 *
 * STRICT POLICY: No CEO, No HR, No Finance. Graphic Designer is under Digital Marketing.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Code2,
  Megaphone,
  TrendingUp,
  Building2,
  Users,
  Search,
  Share2,
  FileText,
  Palette,
  Info,
} from 'lucide-react';

export const OrganizationStructureTree: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#111827]">Organization Hierarchy</h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-100">
              Direct Governance
            </span>
          </div>
          <p className="text-xs text-[#6B7280]">
            Flat, direct leadership structure without unnecessary layers (No CEO, HR, or Finance).
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-slate-200">
          <Info className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Admin manages the entire organization</span>
        </div>
      </div>

      {/* Visual Hierarchy Diagram */}
      <div className="flex flex-col items-center">
        {/* Level 1: Administrator Root Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1E3A8A] text-white px-6 py-3.5 rounded-2xl shadow-md border-2 border-blue-400/30 flex items-center gap-3.5 w-72 justify-center z-10"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-tight">Administrator</h4>
            <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-medium">
              Direct Organizational Governance
            </span>
          </div>
        </motion.div>

        {/* Stem down from Admin */}
        <div className="w-0.5 h-8 bg-blue-200" />

        {/* Level 2: Horizontal Bar connecting 4 Departments */}
        <div className="w-full max-w-4xl border-t-2 border-blue-200 relative mb-4">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#2563EB]" />
        </div>

        {/* Level 2: 4 Core Department Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
          {/* Node 1: Software Development */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-blue-200" />
            <div className="bg-[#F8FAFC] border-2 border-blue-200 rounded-2xl p-4 w-full shadow-xs text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto mb-2 font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">Software Development</h5>
              <p className="text-[10px] text-slate-500">Lead: Rahul Sharma</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                48 Members
              </span>
            </div>
          </div>

          {/* Node 2: Digital Marketing (with Designations Tree!) */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-sky-200" />
            <div className="bg-sky-50/50 border-2 border-sky-300 rounded-2xl p-4 w-full shadow-xs text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2 font-bold">
                <Megaphone className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">Digital Marketing</h5>
              <p className="text-[10px] text-slate-500">Lead: Priya Patel</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                32 Members
              </span>

              {/* Designations Sub-Tree for Digital Marketing */}
              <div className="pt-3 border-t border-sky-200/80 mt-2 space-y-1.5 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-900 block text-center">
                  Department Designations:
                </span>
                <div className="flex items-center gap-1.5 text-[11px] bg-white p-1.5 rounded-lg border border-sky-100 text-slate-700 font-medium">
                  <Search className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">SEO Executive</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] bg-white p-1.5 rounded-lg border border-sky-100 text-slate-700 font-medium">
                  <Share2 className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">Social Media Executive</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] bg-white p-1.5 rounded-lg border border-sky-100 text-slate-700 font-medium">
                  <FileText className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">Content Writer</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] bg-purple-50 p-1.5 rounded-lg border border-purple-200 text-purple-900 font-bold">
                  <Palette className="w-3 h-3 text-purple-600 shrink-0" />
                  <span className="truncate">Graphic Designer ⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node 3: Sales */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-emerald-200" />
            <div className="bg-[#F8FAFC] border-2 border-emerald-200 rounded-2xl p-4 w-full shadow-xs text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">Sales</h5>
              <p className="text-[10px] text-slate-500">Lead: Rajesh Verma</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                30 Members
              </span>
            </div>
          </div>

          {/* Node 4: Administration */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-purple-200" />
            <div className="bg-[#F8FAFC] border-2 border-purple-200 rounded-2xl p-4 w-full shadow-xs text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2 font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">Administration</h5>
              <p className="text-[10px] text-slate-500">Lead: Sneha Rao</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                15 Members
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationStructureTree;
