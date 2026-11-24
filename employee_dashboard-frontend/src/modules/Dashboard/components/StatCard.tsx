import type { LucideIcon } from 'lucide-react';

export type StatCardTone = 'blue' | 'green' | 'rose' | 'amber' | 'violet' | 'cyan';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: StatCardTone;
  id?: string;
}

const toneStyles: Record<StatCardTone, { icon: string; accent: string; label: string }> = {
  blue: { icon: 'bg-blue-50 text-blue-600', accent: 'bg-blue-500', label: 'text-blue-700' },
  green: { icon: 'bg-emerald-50 text-emerald-600', accent: 'bg-emerald-500', label: 'text-emerald-700' },
  rose: { icon: 'bg-rose-50 text-rose-600', accent: 'bg-rose-500', label: 'text-rose-700' },
  amber: { icon: 'bg-amber-50 text-amber-600', accent: 'bg-amber-500', label: 'text-amber-700' },
  violet: { icon: 'bg-violet-50 text-violet-600', accent: 'bg-violet-500', label: 'text-violet-700' },
  cyan: { icon: 'bg-cyan-50 text-cyan-700', accent: 'bg-cyan-500', label: 'text-cyan-700' },
};

function StatCard({ title, value, description, icon: Icon, tone, id }: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <article
      className="group relative scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
      id={id}
    >
      <div aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${styles.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium leading-5 text-slate-500">{title}</p>
          <p className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${styles.icon}`}>
          <Icon aria-hidden="true" className="h-[21px] w-[21px]" strokeWidth={1.9} />
        </span>
      </div>
      <p className={`mt-4 text-[11px] font-medium ${styles.label}`}>{description}</p>
    </article>
  );
}

export default StatCard;