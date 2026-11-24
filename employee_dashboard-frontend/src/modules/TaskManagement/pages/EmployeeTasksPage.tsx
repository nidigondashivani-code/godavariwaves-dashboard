import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckSquare,
  Play,
  CheckCircle2,
  Search,
  Paperclip,
  Calendar,
  Building2,
} from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import { getAssetUrl } from '../../../config/env.config';
import {
  PageTransition,
  Card,
  Button,
  StatusBadge,
  Drawer,
  LoadingSpinner,
  EmptyState,
} from '../../../components/common/UI';
import { TaskItem } from '../../../types/user.types';

export const EmployeeTasksPage: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'Pending' | 'In Progress' | 'Completed' | 'All'>('All');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<TaskItem['status']>('Pending');
  const [comment, setComment] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const res = await apiClient.get('/tasks/me');
      setTasks(res.data.data || []);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const openTaskDrawer = (task: TaskItem) => {
    setSelectedTask(task);
    setProgress(task.progress);
    setStatus(task.status);
    setComment('');
    setAttachment(null);
  };

  const handleQuickStart = async (task: TaskItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/tasks/${task.id}/progress`, {
        status: 'In Progress',
        progress: Math.max(10, task.progress),
        comment: 'Started working on task',
      });
      showToast(`Started "${task.title}"`, 'success');
      await loadTasks();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('progress', String(status === 'Completed' ? 100 : progress));
      if (comment.trim()) formData.append('comment', comment.trim());
      if (attachment) formData.append('attachment', attachment);

      const res = await apiClient.patch(`/tasks/${selectedTask.id}/progress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Task progress updated!', 'success');
      setSelectedTask(res.data.data);
      setComment('');
      setAttachment(null);
      await loadTasks();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (tab !== 'All' && t.status !== tab) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (search.trim() && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingSpinner label="Loading assigned tasks..." />;

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">My Tasks</h1>
        <p className="text-[14px] text-[#6B7280]">
          View tasks assigned to you, update live progress, post comments, and mark tasks completed.
        </p>
      </div>

      {/* Filters & Tabs */}
      <Card className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-[12px] border border-[#E5E7EB]">
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((t) => {
            const count = t === 'All' ? tasks.length : tasks.filter((x) => x.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold transition ${
                  tab === t ? 'bg-[#2563EB] text-white' : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {t === 'All' ? 'Task History' : t} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="gw-input pl-9 w-56 rounded-[14px]"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="gw-input w-auto"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </Card>

      {/* Task Cards */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckSquare className="w-7 h-7" />}
            title="No Matching Tasks"
            description="Tasks assigned to you by your manager or Admin will appear here."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((task) => (
            <Card
              key={task.id}
              hoverable
              className="p-6 cursor-pointer flex flex-col justify-between gap-4"
            >
              <div onClick={() => openTaskDrawer(task)}>
                <div className="flex items-start justify-between gap-2">
                  <StatusBadge status={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                <h3 className="text-[17px] font-semibold text-[#111827] mt-3">{task.title}</h3>
                {task.description && (
                  <p className="text-[13px] text-[#6B7280] mt-1.5 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280]">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {task.department?.name || 'General'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due {task.due_date}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#6B7280]">Progress</span>
                    <span className="font-semibold text-[#2563EB]">{task.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                <span className="text-[12px] text-[#9CA3AF]">Assigned: {task.assigned_date}</span>
                <div className="flex items-center gap-2">
                  {task.status === 'Pending' && (
                    <Button size="sm" onClick={(e) => handleQuickStart(task, e)}>
                      <Play className="w-3.5 h-3.5" /> Start
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => openTaskDrawer(task)}>
                    Update
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Update Drawer */}
      <Drawer
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || ''}
        subtitle={
          selectedTask
            ? `Due ${selectedTask.due_date} · Priority: ${selectedTask.priority}`
            : undefined
        }
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#F1F5F9] space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedTask.status} />
                <span className="text-[12px] text-[#6B7280]">
                  Department: {selectedTask.department?.name || 'General'}
                </span>
              </div>
              <p className="text-[14px] text-[#374151] leading-relaxed">
                {selectedTask.description || 'No additional description provided.'}
              </p>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Task Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const val = e.target.value as TaskItem['status'];
                    setStatus(val);
                    if (val === 'Completed') setProgress(100);
                  }}
                  className="gw-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[13px] font-semibold text-[#374151] mb-1.5">
                  <label>Progress Percentage</label>
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
                  Progress Comment
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share status update, blockers, or completion notes..."
                  className="gw-input"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Supporting File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="gw-input text-[13px]"
                />
              </div>

              <div className="flex gap-2.5">
                <Button type="submit" loading={updating} className="flex-1">
                  Save Progress
                </Button>
                {selectedTask.status !== 'Completed' && (
                  <Button
                    type="button"
                    variant="success"
                    loading={updating}
                    onClick={async () => {
                      setStatus('Completed');
                      setProgress(100);
                      setUpdating(true);
                      try {
                        const res = await apiClient.patch(`/tasks/${selectedTask.id}/progress`, {
                          status: 'Completed',
                          progress: 100,
                          comment: comment.trim() || 'Marked task as completed',
                        });
                        setSelectedTask(res.data.data);
                        showToast('Task marked completed!', 'success');
                        await loadTasks();
                      } catch (err) {
                        showToast(extractApiError(err), 'error');
                      } finally {
                        setUpdating(false);
                      }
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </Button>
                )}
              </div>
            </form>

            {/* Activity History */}
            <div className="pt-4 border-t border-[#F1F5F9]">
              <h4 className="text-[14px] font-semibold text-[#111827] mb-3">Update Log</h4>
              {!selectedTask.updates || selectedTask.updates.length === 0 ? (
                <p className="text-[13px] text-[#6B7280]">No updates logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedTask.updates.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-[12px] bg-[#F8FAFC] border border-[#F1F5F9] text-[13px]"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                        <span className="font-semibold text-[#111827]">
                          {u.status || 'Update'} {u.progress !== null ? `(${u.progress}%)` : ''}
                        </span>
                        <span>{new Date(u.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[#374151] mt-1">{u.comment}</p>
                      {u.attachment_url && (
                        <a
                          href={getAssetUrl(u.attachment_url) || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-[#2563EB] hover:underline mt-1"
                        >
                          <Paperclip className="w-3.5 h-3.5" /> Attachment
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </PageTransition>
  );
};

export default EmployeeTasksPage;
