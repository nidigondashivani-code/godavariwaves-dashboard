import { z } from 'zod';

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

export function validateCompanyEmailFormat(rawEmail: unknown): string | null {
  if (typeof rawEmail !== 'string' || rawEmail.trim().length === 0) {
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
  if (!localPart || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return EMAIL_ERRORS.INVALID_GMAIL;
  }
  return null;
}

export function validatePhoneFormat(rawPhone: unknown): string | null {
  if (typeof rawPhone !== 'string' || rawPhone.length === 0) {
    return PHONE_ERRORS.EXACT_10_DIGITS;
  }
  if (/[^0-9]/.test(rawPhone)) {
    return PHONE_ERRORS.NUMERIC_ONLY;
  }
  if (rawPhone.length !== 10) {
    return PHONE_ERRORS.EXACT_10_DIGITS;
  }
  return null;
}

export function validateStrongPassword(rawPassword: unknown): string | null {
  if (typeof rawPassword !== 'string' || rawPassword.length === 0) {
    return PASSWORD_ERRORS.MIN_LENGTH;
  }
  if (/\s/.test(rawPassword)) {
    return PASSWORD_ERRORS.NO_SPACES;
  }
  if (rawPassword.length < 8) {
    return PASSWORD_ERRORS.MIN_LENGTH;
  }
  if (!/[A-Z]/.test(rawPassword)) {
    return PASSWORD_ERRORS.UPPERCASE;
  }
  if (!/[a-z]/.test(rawPassword)) {
    return PASSWORD_ERRORS.LOWERCASE;
  }
  if (!/[0-9]/.test(rawPassword)) {
    return PASSWORD_ERRORS.NUMBER;
  }
  if (!ALLOWED_SPECIAL_CHARS_REGEX.test(rawPassword)) {
    return PASSWORD_ERRORS.SPECIAL_CHAR;
  }
  return null;
}

export const createEmployeeSchema = z
  .object({
    first_name: z.string({ required_error: 'First name is required.' }).trim().min(1, 'First name is required.'),
    last_name: z.string({ required_error: 'Last name is required.' }).trim().min(1, 'Last name is required.'),
    company_email: z.unknown(),
    phone: z.unknown(),
    password: z.unknown().optional(),
    temporary_password: z.unknown().optional(),
    confirm_password: z.unknown().optional(),
    confirmPassword: z.unknown().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    const emailErr = validateCompanyEmailFormat(data.company_email);
    if (emailErr) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['company_email'], message: emailErr });
    }

    const phoneErr = validatePhoneFormat(data.phone);
    if (phoneErr) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: phoneErr });
    }

    const rawPassword = data.password !== undefined ? data.password : data.temporary_password;
    const passErr = validateStrongPassword(rawPassword);
    if (passErr) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: passErr });
    }

    const rawConfirm =
      data.confirm_password !== undefined ? data.confirm_password : data.confirmPassword;
    if (typeof rawConfirm !== 'string' || rawConfirm.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirm_password'],
        message: PASSWORD_ERRORS.CONFIRM_REQUIRED,
      });
    } else if (rawConfirm !== rawPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirm_password'],
        message: PASSWORD_ERRORS.MISMATCH,
      });
    }
  });

export const updateEmployeeSchema = z
  .object({
    first_name: z.string().trim().min(1, 'First name is required.').optional(),
    last_name: z.string().trim().min(1, 'Last name is required.').optional(),
    company_email: z.unknown().optional(),
    phone: z.unknown().optional(),
    password: z.unknown().optional(),
    confirm_password: z.unknown().optional(),
    confirmPassword: z.unknown().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.company_email !== undefined) {
      const emailErr = validateCompanyEmailFormat(data.company_email);
      if (emailErr) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['company_email'], message: emailErr });
      }
    }

    if (data.phone !== undefined) {
      const phoneErr = validatePhoneFormat(data.phone);
      if (phoneErr) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: phoneErr });
      }
    }

    if (data.password !== undefined) {
      const passErr = validateStrongPassword(data.password);
      if (passErr) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: passErr });
      }
      const rawConfirm =
        data.confirm_password !== undefined ? data.confirm_password : data.confirmPassword;
      if (typeof rawConfirm !== 'string' || rawConfirm.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirm_password'],
          message: PASSWORD_ERRORS.CONFIRM_REQUIRED,
        });
      } else if (rawConfirm !== data.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirm_password'],
          message: PASSWORD_ERRORS.MISMATCH,
        });
      }
    }
  });

export const resetEmployeePasswordSchema = z
  .object({
    newPassword: z.unknown().optional(),
    password: z.unknown().optional(),
    confirmPassword: z.unknown().optional(),
    confirm_password: z.unknown().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    const rawPassword = data.newPassword !== undefined ? data.newPassword : data.password;
    const passErr = validateStrongPassword(rawPassword);
    if (passErr) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newPassword'], message: passErr });
    }

    const rawConfirm =
      data.confirmPassword !== undefined ? data.confirmPassword : data.confirm_password;
    if (typeof rawConfirm !== 'string' || rawConfirm.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: PASSWORD_ERRORS.CONFIRM_REQUIRED,
      });
    } else if (rawConfirm !== rawPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: PASSWORD_ERRORS.MISMATCH,
      });
    }
  });
