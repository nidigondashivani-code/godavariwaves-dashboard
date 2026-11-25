import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import multer from 'multer';
import { AppError } from '../utils/appError.util';
import { sendError } from '../utils/apiResponse.util';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, formatted[0]?.message || 'Validation failed', 400, formatted);
    return;
  }

  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || 'record';
    sendError(res, `A record with this ${field} already exists.`, 409);
    return;
  }

  if (err instanceof ForeignKeyConstraintError) {
    sendError(res, 'Referenced record does not exist or cannot be modified.', 400);
    return;
  }

  if (err instanceof ValidationError) {
    sendError(res, err.errors[0]?.message || 'Database validation error', 400);
    return;
  }

  if (err instanceof multer.MulterError) {
    sendError(res, err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds 10MB limit.' : err.message, 400);
    return;
  }

  logger.error('Unhandled server error:', err);
  const errMsg = (err as any)?.message || 'An unexpected internal server error occurred.';
  sendError(res, errMsg, 500, {
    name: (err as any)?.name,
    detail: errMsg,
  });
};

export default errorHandler;
