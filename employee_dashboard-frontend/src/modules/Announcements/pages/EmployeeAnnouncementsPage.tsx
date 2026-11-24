import React, { useEffect, useState, useCallback } from 'react';
import { Megaphone, CheckCircle2, Paperclip } from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import { getAssetUrl } from '../../../config/env.config';
import {
  PageTransition,
  Card,
  Button,
  StatusBadge,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '../../../components/common/UI';
import { AnnouncementItem } from '../../../types/user.types';

export const EmployeeAnnouncementsPage: React.FC = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AnnouncementItem | null>(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      const res = await apiClient.get('/announcements/me');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const markAsRead = async (ann: AnnouncementItem) => {
    try {
      await apiClient.patch(`/announcements/${ann.id}/read`);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === ann.id ? { ...a, isRead: true } : a))
      );
      if (selected?.id === ann.id) setSelected({ ...ann, isRead: true });
      showToast('Announcement marked as read.', 'success');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading announcements..." />;

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">
          Company Announcements
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Stay informed with official updates, policies, and department announcements.
        </p>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Megaphone className="w-7 h-7" />}
            title="No Announcements Yet"
            description="Company-wide and department announcements will appear here once published."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card
              key={a.id}
              hoverable
              className={`p-6 cursor-pointer ${
                !a.isRead ? 'border-l-4 border-l-[#2563EB]' : ''
              }`}
            >
              <div
                onClick={() => setSelected(a)}
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={a.category} />
                    {a.target_audience === 'Department' && a.department?.name && (
                      <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#374151]">
                        {a.department.name}
                      </span>
                    )}
                    {!a.isRead && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
                        NEW
                      </span>
                    )}
                  </div>
                  <h3 className="text-[18px] font-semibold text-[#111827]">{a.title}</h3>
                  <p className="text-[14px] text-[#374151] line-clamp-2">{a.content}</p>
                  <p className="text-[12px] text-[#9CA3AF]">
                    Published:{' '}
                    {a.published_at
                      ? new Date(a.published_at).toLocaleString()
                      : new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!a.isRead ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(a);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Read
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#10B981]">
                      <CheckCircle2 className="w-4 h-4" /> Read
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || ''}
        subtitle={
          selected?.published_at
            ? `Published on ${new Date(selected.published_at).toLocaleString()}`
            : undefined
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.category} />
              <span className="text-[12px] text-[#6B7280]">
                Audience: {selected.target_audience === 'All' ? 'All Employees' : selected.department?.name}
              </span>
            </div>
            <p className="text-[14px] text-[#374151] whitespace-pre-wrap leading-relaxed">
              {selected.content}
            </p>
            {selected.attachment_url && (
              <a
                href={getAssetUrl(selected.attachment_url) || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#DBEAFE] text-[#1E3A8A] text-[13px] font-semibold hover:bg-[#BFDBFE] transition"
              >
                <Paperclip className="w-4 h-4" /> Download Attachment
              </a>
            )}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F1F5F9]">
              {!selected.isRead && (
                <Button onClick={() => markAsRead(selected)}>
                  <CheckCircle2 className="w-4 h-4" /> Mark as Read
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
};

export default EmployeeAnnouncementsPage;
