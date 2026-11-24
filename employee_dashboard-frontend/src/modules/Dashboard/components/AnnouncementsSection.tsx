import { ArrowUpRight, Megaphone } from 'lucide-react';
import type { Announcement } from '../types/dashboard.types';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

const priorityStyles: Record<Announcement['priority'], { label: string; classes: string }> = {
  high: { label: 'Important', classes: 'bg-rose-50 text-rose-700 ring-rose-600/10' },
  normal: { label: 'General', classes: 'bg-blue-50 text-blue-700 ring-blue-600/10' },
  low: { label: 'Info', classes: 'bg-slate-100 text-slate-600 ring-slate-500/10' },
};

function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
  return (
    <section className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" id="announcements">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Megaphone aria-hidden="true" className="h-[19px] w-[19px]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Announcements</p>
            <p className="mt-1 text-xs text-slate-500">Latest company updates</p>
          </div>
        </div>
      </div>

      {announcements.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {announcements.map((announcement) => {
            const priority = priorityStyles[announcement.priority];

            return (
              <article
                className="group rounded-xl border border-slate-100 bg-[#fbfcfe] p-4 transition hover:border-blue-100 hover:bg-blue-50/30"
                key={announcement.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${priority.classes}`}>
                    {priority.label}
                  </span>
                  <time className="text-[10px] text-slate-400">{announcement.date}</time>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-800">{announcement.title}</h3>
                <p className="mt-1.5 min-h-10 text-xs leading-5 text-slate-500">{announcement.description}</p>
                <button
                  aria-label={`Read ${announcement.title} announcement`}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  type="button"
                >
                  Read announcement
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <Megaphone aria-hidden="true" className="mx-auto h-6 w-6 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-600">No announcements yet</p>
          <p className="mt-1 text-xs text-slate-400">Company updates will appear here.</p>
        </div>
      )}
    </section>
  );
}

export default AnnouncementsSection;
