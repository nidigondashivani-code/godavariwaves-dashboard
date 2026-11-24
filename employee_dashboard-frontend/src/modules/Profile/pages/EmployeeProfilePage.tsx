import React, { useEffect, useState, useCallback } from 'react';
import {
  Camera,
  Shield,
  Send,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { apiClient, extractApiError } from '../../../api/apiClient';
import { useToast } from '../../../providers/ToastProvider';
import { useAuth } from '../../../context/AuthContext';
import { getAssetUrl } from '../../../config/env.config';
import {
  PageTransition,
  Card,
  Button,
  StatusBadge,
  Modal,
  LoadingSpinner,
} from '../../../components/common/UI';

interface ProfileData {
  profile: {
    id: number;
    employee_code: string;
    full_name: string;
    company_email: string;
    personal_email?: string | null;
    phone?: string | null;
    profile_picture?: string | null;
    joining_date: string;
    date_of_birth?: string | null;
    employment_type: string;
    employment_status: string;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    bio?: string | null;
    skills?: string | null;
    department?: { name: string } | null;
    designation?: { title: string } | null;
    reportingManager?: { full_name: string; employee_code: string } | null;
    user?: { role?: { name: string } } | null;
  };
  updateRequests: Array<{
    id: number;
    field_name: string;
    current_value?: string | null;
    requested_value: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    rejection_reason?: string | null;
    createdAt: string;
  }>;
  requestableFields: Array<{ key: string; label: string }>;
}

export const EmployeeProfilePage: React.FC = () => {
  const { showToast } = useToast();
  const { refreshUser } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const [fieldName, setFieldName] = useState('phone');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await apiClient.get('/profile/me');
      setData(res.data.data);
      setApiNotice(null);
    } catch (err) {
      setApiNotice(extractApiError(err, 'Connect backend/database to load live profile details.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await apiClient.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Profile picture updated!', 'success');
      await Promise.all([loadProfile(), refreshUser()]);
    } catch (err) {
      showToast(extractApiError(err), 'error');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim() || !reason.trim()) {
      showToast('Please enter the requested new value and reason.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/profile/update-requests', {
        field_name: fieldName,
        requested_value: requestedValue.trim(),
        reason: reason.trim(),
      });
      showToast('Profile update request submitted for Admin approval.', 'success');
      setRequestedValue('');
      setReason('');
      await loadProfile();
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password updated successfully!', 'success');
      setPwdOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading your profile..." />;

  const emptyProfile: ProfileData = {
    profile: {
      id: 0,
      employee_code: '--',
      full_name: 'Employee Profile',
      company_email: '--',
      joining_date: '--',
      employment_type: '--',
      employment_status: 'Inactive',
    },
    updateRequests: [],
    requestableFields: [
      { key: 'full_name', label: 'Full Name' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'personal_email', label: 'Personal Email' },
      { key: 'address', label: 'Residential Address' },
    ],
  };

  const { profile, updateRequests, requestableFields } = data || emptyProfile;
  const avatarUrl = getAssetUrl(profile.profile_picture);
  const currentFieldValue = String(
    (profile as unknown as Record<string, unknown>)[fieldName] ?? 'Not Set'
  );

  const infoGrid = [
    { label: 'Employee ID', value: profile.employee_code, protected: true },
    { label: 'Full Name', value: profile.full_name },
    { label: 'Company Email', value: profile.company_email, protected: true },
    { label: 'Phone Number', value: profile.phone || 'Not Set' },
    { label: 'Department', value: profile.department?.name || 'Unassigned', protected: true },
    { label: 'Designation', value: profile.designation?.title || 'Unassigned', protected: true },
    {
      label: 'Reporting Manager',
      value: profile.reportingManager?.full_name || 'None Assigned',
      protected: true,
    },
    { label: 'Joining Date', value: profile.joining_date, protected: true },
    { label: 'Employment Type', value: profile.employment_type, protected: true },
    { label: 'System Role', value: profile.user?.role?.name || 'Employee', protected: true },
    { label: 'Date of Birth', value: profile.date_of_birth || 'Not Set' },
    { label: 'Address', value: profile.address || 'Not Set' },
  ];

  return (
    <PageTransition className="space-y-6">
      {apiNotice && (
        <div className="p-4 rounded-[14px] bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-[13px] font-medium">
          {apiNotice}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827]">My Profile</h1>
          <p className="text-[14px] text-[#6B7280]">
            View your official employment record and submit change requests for HR approval.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setPwdOpen(true)}>
          <KeyRound className="w-4 h-4" /> Change Password
        </Button>
      </div>

      {/* Top Profile Header */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.full_name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-[#BFDBFE]"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#1E3A8A] text-white text-[28px] font-bold flex items-center justify-center">
                {profile.full_name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center cursor-pointer shadow-md transition">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[24px] font-bold text-[#111827]">{profile.full_name}</h2>
              <StatusBadge status={profile.employment_status} />
            </div>
            <p className="text-[14px] text-[#6B7280] mt-1">
              {profile.designation?.title || 'Employee'} · {profile.department?.name || 'Department'}
            </p>
            <p className="text-[13px] font-semibold text-[#2563EB] mt-1">
              {profile.employee_code} · {profile.company_email}
            </p>
          </div>
        </div>

        {/* Official Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#F1F5F9]">
          {infoGrid.map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-[14px] bg-[#F8FAFC] border border-[#F1F5F9]"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[#6B7280]">{item.label}</p>
                {item.protected && (
                  <span
                    title="Protected field managed by Admin"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6B7280]"
                  >
                    <Shield className="w-3 h-3" /> Protected
                  </span>
                )}
              </div>
              <p className="text-[14px] font-semibold text-[#111827] mt-1 break-words">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Profile Update Request Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="p-6 lg:col-span-5">
          <h3 className="text-[18px] font-semibold text-[#111827]">Request Profile Update</h3>
          <p className="text-[13px] text-[#6B7280] mt-1 mb-4">
            Protected fields (Employee ID, Role, Department, Designation, Status) are controlled by Admin.
          </p>

          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Field to Update
              </label>
              <select
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="gw-input"
              >
                {requestableFields.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Current Value
              </label>
              <input type="text" readOnly value={currentFieldValue} className="gw-input bg-[#F8FAFC] text-[#6B7280]" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Requested New Value
              </label>
              <input
                type={fieldName === 'date_of_birth' ? 'date' : 'text'}
                required
                value={requestedValue}
                onChange={(e) => setRequestedValue(e.target.value)}
                placeholder="Enter new value..."
                className="gw-input"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Reason
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this change is needed..."
                className="gw-input"
              />
            </div>

            <Button type="submit" loading={submitting} className="w-full">
              <Send className="w-4 h-4" /> Submit Update Request
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 overflow-hidden">
          <div className="p-6 border-b border-[#F1F5F9]">
            <h3 className="text-[18px] font-semibold text-[#111827]">Profile Change Requests</h3>
          </div>
          {updateRequests.length === 0 ? (
            <p className="p-8 text-center text-[14px] text-[#6B7280]">
              No profile update requests submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {updateRequests.map((r) => (
                <div key={r.id} className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold text-[#111827] capitalize">
                      {r.field_name.replace(/_/g, ' ')}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-[13px] text-[#6B7280] mt-1">
                    {r.current_value || 'Not Set'} {' → '}
                    <span className="font-semibold text-[#2563EB]">{r.requested_value}</span>
                  </p>
                  <p className="text-[13px] text-[#374151] mt-1">{r.reason}</p>
                  {r.status === 'Rejected' && r.rejection_reason && (
                    <div className="mt-2.5 p-2.5 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[12px] text-[#DC2626] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Rejection Reason: {r.rejection_reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Change Password Modal */}
      <Modal
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        title="Change Password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="gw-input"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="gw-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPwdOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pwdLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
};

export default EmployeeProfilePage;
