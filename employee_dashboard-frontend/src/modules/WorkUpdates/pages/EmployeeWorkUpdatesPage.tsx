import React, { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Paperclip, Edit3, MessageSquare } from 'lucide-react';
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
import { WorkUpdateItem } from '../../../types/user.types';

export const EmployeeWorkUpdatesPage: React.FC = () => {
  const { showToast } = useToast();
  const [updates, setUpdates] = useState<WorkUpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkUpdateItem | null>(null);
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [workDescription, setWorkDescription] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [progress, setProgress] = useState(80);
  const [hoursSpent, setHoursSpent] = useState(8);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadUpdates = useCallback(async () => {
    try {
      const url =
        statusFilter === 'All'
          ? '/work-updates/me'
          : `/work-updates/me?status=${encodeURIComponent(statusFilter)}`;
      const res = await apiClient.get(url);
      setUpdates(res.data.data || []);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const openNewModal = () => {
    setEditingItem(null);
    setWorkDate(new Date().toISOString().split('T')[0]);
    setWorkDescription('');
    setTasksCompleted('');
    setProgress(80);
    setHoursSpent(8);
    setAttachment(null);
    setModalOpen(true);
  };

  const openEditModal = (item: WorkUpdateItem) => {
    setEditingItem(item);
    setWorkDate(item.work_date);
    setWorkDescription(item.work_description);
    setTasksCompleted(item.tasks_completed || '');
    setProgress(item.progress);
    setHoursSpent(Number(item.hours_spent || 0));
    setAttachment(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDescription.trim()) {
      showToast('Work description is required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('work_date', workDate);
      formData.append('work_description', workDescription.trim());
      formData.append('tasks_completed', tasksCompleted.trim());
      formData.append('progress', String(progress));
      formData.append('hours_spent', String(hoursSpent));
      if (attachment) formData.append('attachment', attachment);

      if (editingItem) {
        await apiClient.put(`/work-updates/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Work update revised and resubmitted.', 'success');
      } else {
        await apiClient.post('/work-updates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Daily work update submitted for review!', 'success');
      }

      setModalOpen(false);
      await loadUpdates();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading daily work updates..." />;

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">Work Updates</h1>
          <p className="text-[14px] text-[#6B7280]">
            Submit daily progress reports, track review status, and address admin feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="gw-input w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button onClick={openNewModal}>
            <Plus className="w-4 h-4" /> Submit Work Report
          </Button>
        </div>
      </div>

      {updates.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-7 h-7" />}
            title="No Work Updates Submitted"
            description="Share your daily achievements, completed tasks, and work progress."
            action={<Button onClick={openNewModal}>Submit Today&apos;s Report</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {updates.map((u) => (
            <Card key={u.id} className="p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[#2563EB]">{u.work_date}</p>
                    <p className="text-[13px] text-[#6B7280] mt-0.5">
                      {Number(u.hours_spent || 0)} hrs logged · {u.progress}% progress
                    </p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>

                <p className="text-[14px] text-[#111827] mt-4 whitespace-pre-wrap leading-relaxed">
                  {u.work_description}
                </p>

                {u.tasks_completed && (
                  <div className="mt-3 p-3 rounded-[12px] bg-[#F8FAFC] border border-[#F1F5F9]">
                    <p className="text-[11px] font-semibold text-[#6B7280] uppercase">
                      Tasks Completed
                    </p>
                    <p className="text-[13px] text-[#374151] mt-1">{u.tasks_completed}</p>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex justify-between text-[12px] text-[#6B7280] mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-[#111827]">{u.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                </div>

                {u.admin_feedback && (
                  <div className="mt-4 p-3.5 rounded-[12px] bg-[#FFF7ED] border border-[#FDE68A] text-[13px] text-[#92400E] flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[12px]">Admin Feedback:</p>
                      <p className="mt-0.5">{u.admin_feedback}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                {u.attachment_url ? (
                  <a
                    href={getAssetUrl(u.attachment_url) || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB] hover:underline"
                  >
                    <Paperclip className="w-4 h-4" /> View Attachment
                  </a>
                ) : (
                  <span className="text-[12px] text-[#9CA3AF]">No attachment</span>
                )}

                {u.status !== 'Approved' && (
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(u)}>
                    <Edit3 className="w-3.5 h-3.5" />
                    {u.status === 'Revision Required' ? 'Revise & Resubmit' : 'Edit'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit & Resubmit Work Update' : 'Submit Daily Work Update'}
        subtitle="Provide accurate daily details for Admin review."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Work Date
              </label>
              <input
                type="date"
                required
                disabled={Boolean(editingItem)}
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="gw-input"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Hours Spent
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(Number(e.target.value))}
                className="gw-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
              Work Description
            </label>
            <textarea
              rows={4}
              required
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Summarize key activities and deliverables worked on today..."
              className="gw-input"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
              Tasks Completed
            </label>
            <textarea
              rows={2}
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              placeholder="List completed tasks or milestones..."
              className="gw-input"
            />
          </div>

          <div>
            <div className="flex justify-between text-[13px] font-semibold text-[#374151] mb-1.5">
              <label>Work Progress</label>
              <span className="text-[#2563EB]">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
              Attach Files (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="gw-input text-[13px]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingItem ? 'Resubmit Update' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
};

export default EmployeeWorkUpdatesPage;
