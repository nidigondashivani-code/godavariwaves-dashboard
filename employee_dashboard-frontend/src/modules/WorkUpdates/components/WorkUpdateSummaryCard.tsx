import type { LucideIcon } from 'lucide-react';
import type { WorkUpdateFilter } from '../types/workUpdate.types';

interface WorkUpdateSummaryCardProps {
  label: string;
  count: number;
  description: string;
  icon: LucideIcon;
  tone: 'blue' | 'green' | 'amber' | 'violet' | 'cyan' | 'rose';
  filter: WorkUpdateFilter;
  active: boolean;
  onSelect: (filter: WorkUpdateFilter) => void;
}

const toneStyles = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
  cyan: 'bg-cyan-50 text-cyan-700',
  rose: 'bg-rose-50 text-rose-700',
};

function WorkUpdateSummaryCard({
  label,
  count,
  description,
  icon: Icon,
  tone,
  filter,
  active,
  onSelect,
}: WorkUpdateSummaryCardProps) {
  return (
    <button
      aria-pressed={active}
      className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
        active ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
      }`}
      onClick={() => onSelect(filter)}
      type="button"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </span>
      <span className="mt-3 block text-3xl font-bold tracking-tight text-slate-900">
        {count.toLocaleString()}
      </span>
      <span className="mt-2 block text-[11px] leading-4 text-slate-500">{description}</span>
    </button>
  );
}

export default WorkUpdateSummaryCard;
