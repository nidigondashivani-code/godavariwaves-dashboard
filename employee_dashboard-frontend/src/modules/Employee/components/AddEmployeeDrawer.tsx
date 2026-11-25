import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Building,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Mail,
} from 'lucide-react';
import {
  DEPARTMENTS,
  ROLES,
  EMPLOYMENT_TYPES,
  GENDERS,
} from '../constants/employee.constants';
import designationService from '../services/designation.service';
import { Employee, DepartmentType, RoleType, EmploymentType, GenderType } from '../types/employee.types';
import {
  generateCompanyEmail,
  generateTemporaryPassword,
  generateNextEmployeeId,
} from '../utils/employee.utils';
import DashboardAccessToggle from './DashboardAccessToggle';

const MAX_PROFILE_PICTURE_SIZE = 2 * 1024 * 1024;

interface AddEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id' | 'createdAt' | 'employmentHistory' | 'loginHistory'>) => void;
  existingEmployees: Employee[];
}

export const AddEmployeeDrawer: React.FC<AddEmployeeDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  existingEmployees,
}) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<GenderType>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1998-01-01');
  const [mobileNumber, setMobileNumber] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [profilePictureError, setProfilePictureError] = useState('');
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  // Company Information
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState<DepartmentType>('Software Development');
  const [designation, setDesignation] = useState('Software Engineer');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Credentials
  const [companyEmail, setCompanyEmail] = useState('');
  const [isEmailCustomized, setIsEmailCustomized] = useState(false);
  const [passwordMode, setPasswordMode] = useState<'manual' | 'auto'>('manual');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [role, setRole] = useState<RoleType>('Employee');
  const [dashboardAccess, setDashboardAccess] = useState(true);
  const [sendCredentialsMail, setSendCredentialsMail] = useState(true);

  // Dynamic designations based on selected department from designationService
  const [designationsByDept, setDesignationsByDept] = useState(() => designationService.getDesignations());

  useEffect(() => {
    return designationService.subscribe(setDesignationsByDept);
  }, []);

  const designationsList = designationsByDept[department] || [];

  // Reset / initialize when drawer opens
  useEffect(() => {
    if (isOpen) {
      const nextId = generateNextEmployeeId(existingEmployees);
      setEmployeeId(nextId);
      setFirstName('');
      setLastName('');
      setMobileNumber('');
      setPersonalEmail('');
      setAddress('');
      setPhotoUrl('');
      setProfilePictureError('');
      if (profilePictureInputRef.current) {
        profilePictureInputRef.current.value = '';
      }
      setDepartment('Software Development');
      const initialRoles = designationsByDept['Software Development'] || [];
      setDesignation(initialRoles[0] || '');
      setReportingManagerId('');
      setEmploymentType('Full-time');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setCompanyEmail('');
      setIsEmailCustomized(false);
      setPasswordMode('manual');
      setPassword('');
      setRole('Employee');
      setDashboardAccess(true);
    }
  }, [isOpen, existingEmployees, designationsByDept]);

  // Update designation default when department changes
  const handleDepartmentChange = (newDept: DepartmentType) => {
    setDepartment(newDept);
    const newDesignations = designationsByDept[newDept] || [];
    if (newDesignations.length > 0) {
      setDesignation(newDesignations[0]);
    }
  };

  // Auto-generate company email when first name or last name changes (unless user manually edited it)
  useEffect(() => {
    if (!isEmailCustomized && (firstName || lastName)) {
      const existingEmails = existingEmployees.map((e) => e.companyEmail);
      const generated = generateCompanyEmail(firstName, lastName, existingEmails);
      setCompanyEmail(generated);
    }
  }, [firstName, lastName, isEmailCustomized, existingEmployees]);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedImageTypes.includes(file.type)) {
      setProfilePictureError('Choose a JPG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      setProfilePictureError('Profile pictures must be 2 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setProfilePictureError('Could not read this image. Please choose another file.');
        return;
      }
      setPhotoUrl(reader.result);
      setProfilePictureError('');
    };
    reader.onerror = () => {
      setProfilePictureError('Could not read this image. Please choose another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setPhotoUrl('');
    setProfilePictureError('');
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !companyEmail.trim()) {
      alert('Please fill in required fields: First Name, Last Name, and Company Email.');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      alert('Please enter or generate a password (minimum 6 characters) for this employee.');
      return;
    }

    const reportingManager = existingEmployees.find((e) => e.id === reportingManagerId);

    onSave({
      employeeId: employeeId.trim() || generateNextEmployeeId(existingEmployees),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth,
      mobileNumber: mobileNumber.trim(),
      personalEmail: personalEmail.trim(),
      address: address.trim(),
      photoUrl: photoUrl || undefined,
      department,
      designation,
      reportingManagerId: reportingManagerId || undefined,
      reportingManagerName: reportingManager
        ? `${reportingManager.firstName} ${reportingManager.lastName}`
        : undefined,
      employmentType,
      joiningDate,
      companyEmail: companyEmail.trim(),
      temporaryPassword: password,
      role,
      dashboardAccess,
      status: 'Active',
      createdBy: 'Admin',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Add New Employee
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in personal and organizational details to onboard an employee.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Personal Information
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${firstName || 'Employee'} profile preview`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-7 w-7 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="profile-picture"
                  className="mb-1 block text-xs font-semibold text-slate-700"
                >
                  Profile Picture
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={profilePictureInputRef}
                    id="profile-picture"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleProfilePictureChange}
                    className="w-full max-w-sm text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="text-xs font-semibold text-slate-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  JPG, PNG, WebP, or GIF. Maximum size: 2 MB.
                </p>
                {profilePictureError && (
                  <p role="alert" className="mt-1 text-xs text-rose-600">
                    {profilePictureError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Email</label>
                <input
                  type="email"
                  placeholder="personal@gmail.com"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Residential Address</label>
              <textarea
                rows={2}
                placeholder="Street address, city, state, zip..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* SECTION 2: Company Information */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                2. Company Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value as DepartmentType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {designationsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
                <select
                  value={reportingManagerId}
                  onChange={(e) => setReportingManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">None / Direct to Leadership</option>
                  {existingEmployees.map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.firstName} {mgr.lastName} ({mgr.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Login Credentials */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                3. Login Credentials & Access
              </h3>
            </div>

            {/* Auto-generated Company Email */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Company Email <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-blue-600 font-medium inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-generated (Editable)
                </span>
              </div>
              <input
                type="email"
                required
                value={companyEmail}
                onChange={(e) => {
                  setCompanyEmail(e.target.value);
                  setIsEmailCustomized(true);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Generated as firstname.lastname@company.com with automatic duplicate resolution.
              </p>
            </div>

            {/* Password Credentials Configuration (Manual Entry with Optional Auto-Generate) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Login Password Credentials
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {passwordMode === 'manual'
                      ? 'Enter custom password manually below, or toggle auto-generate.'
                      : 'Auto-generated secure password. You can customize or regenerate it.'}
                  </p>
                </div>
                <div className="flex items-center rounded-lg bg-slate-200/80 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPasswordMode('manual')}
                    className={`px-3 py-1 rounded-md transition ${
                      passwordMode === 'manual'
                        ? 'bg-white text-blue-700 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Manual Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordMode('auto');
                      setPassword(generateTemporaryPassword(10));
                    }}
                    className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                      passwordMode === 'auto'
                        ? 'bg-white text-blue-700 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Generate
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter employee password manually (min 6 characters)..."
                  className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  title="Copy Password"
                  className={`p-2 rounded-lg transition flex items-center gap-1 ${
                    copiedPassword ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {copiedPassword ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>
                  {password.length === 0 ? (
                    <span className="text-slate-400">Type a custom password or click auto-generate</span>
                  ) : password.length < 6 ? (
                    <span className="text-amber-600 font-medium">⚠️ Minimum 6 characters required</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">✓ Valid password length ({password.length} chars)</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPassword(generateTemporaryPassword(10));
                    setPasswordMode('auto');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Generate Random Password
                </button>
              </div>

              {/* Send Credentials via Mail */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-blue-50/60 rounded-xl border border-blue-100 hover:bg-blue-50 transition">
                  <input
                    type="checkbox"
                    checked={sendCredentialsMail}
                    onChange={(e) => setSendCredentialsMail(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Send login credentials to employee via Email
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Notify employee with login email ({companyEmail || 'company email'}) and custom password upon onboarding.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Role & Dashboard Access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {role === 'Admin' ? 'Admin has full access.' : 'Employee has limited access.'}
                </span>
              </div>

              <div className="flex flex-col justify-center">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dashboard Access
                </label>
                <DashboardAccessToggle
                  enabled={dashboardAccess}
                  onChange={setDashboardAccess}
                  label={dashboardAccess ? 'Access Enabled' : 'Access Disabled'}
                />
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
            >
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeDrawer;
