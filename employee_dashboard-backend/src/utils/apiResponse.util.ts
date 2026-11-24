import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, unknown>
): Response => {
  const payload: ApiResponsePayload<T> = {
    success: true,
    message,
    data,
  };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  errors?: unknown
): Response => {
  const payload: ApiResponsePayload = {
    success: false,
    message,
  };
  if (errors !== undefined) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

export default { sendSuccess, sendError };
