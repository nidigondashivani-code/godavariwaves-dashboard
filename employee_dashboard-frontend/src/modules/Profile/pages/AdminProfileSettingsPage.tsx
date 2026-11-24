import { useState, type ChangeEvent } from 'react';
import { ArrowLeft, Building2, Camera, Save, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import {
  getAdminInitials,
  readAdminProfile,
  saveAdminProfile,
  type AdminProfile,
} from '../services/adminProfile.service';

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AdminProfileSettingsPage() {
  const navigate = useNavigate();
  const [savedProfile, setSavedProfile] = useState<AdminProfile>(readAdminProfile);
  const [draft, setDraft] = useState<AdminProfile>(savedProfile);
  const [validationMessage, setValidationMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    setSaveMessage('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationMessage('Choose an image file to update the profile photo.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setValidationMessage('Choose an image smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatarUrl = reader.result;
      if (typeof avatarUrl !== 'string') {
        setValidationMessage('The selected image could not be read.');
        return;
      }

      setDraft((profile) => ({ ...profile, avatarUrl }));
      setValidationMessage('');
    };
    reader.onerror = () => {
      setValidationMessage('The selected image could not be read.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const fullName = draft.fullName.trim();
    const email = draft.email.trim();
    if (!fullName) {
      setValidationMessage('Enter the admin name.');
      setSaveMessage('');
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setValidationMessage('Enter a valid email address.');
      setSaveMessage('');
      return;
    }

    const updatedProfile = { ...draft, fullName, email };
    try {
      saveAdminProfile(updatedProfile);
    } catch (error) {
      console.error('Admin profile could not be saved.', error);
      setValidationMessage('Unable to save profile changes. Please try again.');
      setSaveMessage('');
      return;
    }

    setDraft(updatedProfile);
    setSavedProfile(updatedProfile);
    setValidationMessage('');
    setSaveMessage('Profile changes saved.');
  };

  const handleCancel = () => {
    setDraft({ ...savedProfile });
    setValidationMessage('');
    setSaveMessage('');
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">Administrator account</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Profile &amp; Settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your profile details and photo.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
            onClick={() => navigate('/admin', { state: { activeNavigation: 'Dashboard Overview' } })}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        <section
          aria-labelledby="admin-profile-heading"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
            <h3 className="text-base font-semibold text-slate-900" id="admin-profile-heading">
              Admin Profile
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Your profile information is saved on this device.
            </p>
          </div>

          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex flex-col items-center rounded-xl bg-slate-50 p-5 text-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold text-blue-700 ring-4 ring-white shadow-sm">
                {draft.avatarUrl ? (
                  <img alt={`${draft.fullName} profile`} className="h-full w-full object-cover" src={draft.avatarUrl} />
                ) : (
                  getAdminInitials(draft.fullName)
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{draft.fullName || 'Admin'}</p>
              <p className="mt-1 text-xs text-slate-500">Administrator</p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus-within:ring-2 focus-within:ring-blue-500/30">
                <Camera aria-hidden="true" className="h-4 w-4" />
                Upload photo
                <input
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                  type="file"
                />
              </label>
              {draft.avatarUrl && (
                <button
                  className="mt-2 text-xs font-medium text-slate-500 underline-offset-2 hover:text-rose-600 hover:underline"
                  onClick={() => {
                    setDraft((profile) => ({ ...profile, avatarUrl: '' }));
                    setSaveMessage('');
                  }}
                  type="button"
                >
                  Remove photo
                </button>
              )}
              <p className="mt-2 text-[11px] leading-5 text-slate-400">Image files up to 2 MB</p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Admin name
                  <input
                    autoComplete="name"
                    className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    onChange={(event) => {
                      setDraft((profile) => ({ ...profile, fullName: event.target.value }));
                      setSaveMessage('');
                    }}
                    placeholder="Enter admin name"
                    value={draft.fullName}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Company email
                  <input
                    autoComplete="email"
                    className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    onChange={(event) => {
                      setDraft((profile) => ({ ...profile, email: event.target.value }));
                      setSaveMessage('');
                    }}
                    placeholder="admin@godavariwaves.com"
                    type="email"
                    value={draft.email}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-500">Role</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">Administrator</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Building2 aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">Godavari Waves</p>
                  </div>
                </div>
              </div>

              {validationMessage && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700" role="alert">
                  {validationMessage}
                </p>
              )}
              {saveMessage && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700" role="status">
                  {saveMessage}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  onClick={handleSave}
                  type="button"
                >
                  <Save aria-hidden="true" className="h-4 w-4" />
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminProfileSettingsPage;
