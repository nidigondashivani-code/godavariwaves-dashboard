import { Employee } from '../types/employee.types';

export const ALLOWED_SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=?.,]/;
const GENERAL_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const EMAIL_ERRORS = {
  INVALID_GMAIL: 'Please enter a valid Gmail address.',
  MUST_END_GMAIL: 'Email must end with @gmail.com.',
  ALREADY_REGISTERED: 'This email address is already registered.',
} as const;

export const PHONE_ERRORS = {
  EXACT_10_DIGITS: 'Phone number must contain exactly 10 digits.',
  NUMERIC_ONLY: 'Only numeric values are allowed.',
  ALREADY_REGISTERED: 'This phone number is already registered.',
} as const;

export const PASSWORD_ERRORS = {
  MIN_LENGTH: 'Password must contain at least 8 characters.',
  UPPERCASE: 'Password must include at least one uppercase letter.',
  LOWERCASE: 'Password must include at least one lowercase letter.',
  NUMBER: 'Password must include at least one number.',
  SPECIAL_CHAR: 'Password must include at least one special character.',
  NO_SPACES: 'Password cannot contain spaces.',
  CONFIRM_REQUIRED: 'Confirm Password is required.',
  MISMATCH: 'Passwords do not match.',
} as const;

/**
 * Validate Company Email:
 * - Mandatory
 * - No spaces
 * - Valid email format
 * - Must end with @gmail.com
 * - Unique across employees (excluding current employee when editing)
 */
export function validateCompanyEmail(
  rawEmail: string,
  existingEmployees: Employee[] = [],
  excludeEmployeeId?: string
): string | null {
  if (!rawEmail || rawEmail.trim().length === 0) {
    return EMAIL_ERRORS.INVALID_GMAIL;
  }

  if (/\s/.test(rawEmail)) {
    return EMAIL_ERRORS.INVALID_GMAIL;
  }

  if (!GENERAL_EMAIL_REGEX.test(rawEmail)) {
    return EMAIL_ERRORS.INVALID_GMAIL;
  }

  const lower = rawEmail.toLowerCase();
  const parts = lower.split('@');
  if (parts.length !== 2 || parts[1] !== 'gmail.com') {
    return EMAIL_ERRORS.MUST_END_GMAIL;
  }

  const localPart = parts[0];
  if (
    !localPart ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return EMAIL_ERRORS.INVALID_GMAIL;
  }

  const isDuplicate = existingEmployees.some(
    (emp) =>
      !emp.isDeleted &&
      emp.id !== excludeEmployeeId &&
      (emp.companyEmail || '').trim().toLowerCase() === lower
  );

  if (isDuplicate) {
    return EMAIL_ERRORS.ALREADY_REGISTERED;
  }

  return null;
}

/**
 * Validate Phone Number:
 * - Mandatory
 * - Numeric only (no alphabets, special characters, or spaces)
 * - Exactly 10 digits
 * - Unique across employees (excluding current employee when editing)
 */
export function validatePhoneNumber(
  rawPhone: string,
  existingEmployees: Employee[] = [],
  excludeEmployeeId?: string
): string | null {
  if (!rawPhone || rawPhone.length === 0) {
    return PHONE_ERRORS.EXACT_10_DIGITS;
  }

  if (/[^0-9]/.test(rawPhone)) {
    return PHONE_ERRORS.NUMERIC_ONLY;
  }

  if (rawPhone.length !== 10) {
    return PHONE_ERRORS.EXACT_10_DIGITS;
  }

  const isDuplicate = existingEmployees.some(
    (emp) =>
      !emp.isDeleted &&
      emp.id !== excludeEmployeeId &&
      (emp.mobileNumber || '').trim() === rawPhone
  );

  if (isDuplicate) {
    return PHONE_ERRORS.ALREADY_REGISTERED;
  }

  return null;
}

/**
 * Validate Strong Password Policy:
 * - At least 8 characters
 * - No spaces
 * - At least one uppercase (A-Z)
 * - At least one lowercase (a-z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*()_+-=?.,)
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length === 0) {
    return PASSWORD_ERRORS.MIN_LENGTH;
  }

  if (/\s/.test(password)) {
    return PASSWORD_ERRORS.NO_SPACES;
  }

  if (password.length < 8) {
    return PASSWORD_ERRORS.MIN_LENGTH;
  }

  if (!/[A-Z]/.test(password)) {
    return PASSWORD_ERRORS.UPPERCASE;
  }

  if (!/[a-z]/.test(password)) {
    return PASSWORD_ERRORS.LOWERCASE;
  }

  if (!/[0-9]/.test(password)) {
    return PASSWORD_ERRORS.NUMBER;
  }

  if (!ALLOWED_SPECIAL_CHARS_REGEX.test(password)) {
    return PASSWORD_ERRORS.SPECIAL_CHAR;
  }

  return null;
}

/**
 * Validate Confirm Password:
 * - Required
 * - Must match password exactly
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword || confirmPassword.length === 0) {
    return PASSWORD_ERRORS.CONFIRM_REQUIRED;
  }

  if (password !== confirmPassword) {
    return PASSWORD_ERRORS.MISMATCH;
  }

  return null;
}

/**
 * Validate Required Text Field (e.g. First Name, Last Name)
 */
export function validateRequiredText(value: string, label: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${label} is required.`;
  }
  return null;
}

/**
 * Validate Employee ID: required and unique
 */
export function validateEmployeeId(
  employeeId: string,
  existingEmployees: Employee[] = [],
  excludeEmployeeId?: string
): string | null {
  const trimmed = employeeId.trim();
  if (!trimmed) {
    return 'Employee ID is required.';
  }
  const duplicate = existingEmployees.some(
    (emp) =>
      !emp.isDeleted &&
      emp.id !== excludeEmployeeId &&
      emp.employeeId.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    return 'This Employee ID is already registered.';
  }
  return null;
}
