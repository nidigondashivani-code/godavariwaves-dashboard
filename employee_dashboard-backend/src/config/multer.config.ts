import multer from 'multer';
import path from 'path';
import fs from 'fs';
import envConfig from './env.config';
import { AppError } from '../utils/appError.util';

if (!fs.existsSync(envConfig.uploadDir)) {
  fs.mkdirSync(envConfig.uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, envConfig.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    cb(null, `${Date.now()}_${Math.round(Math.random() * 1e6)}_${safeName}${ext}`);
  },
});

export const uploadConfig = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported file type. Allowed: images, PDF, Word, Excel, CSV, TXT.', 400));
    }
  },
});

export default uploadConfig;
