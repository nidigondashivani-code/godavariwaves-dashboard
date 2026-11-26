import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import envConfig from '../config/env.config';
import { logger } from './logger.util';

export const saveBase64Image = (dataUrl?: string | null): string | null => {
  if (!dataUrl || typeof dataUrl !== 'string') return null;

  const trimmed = dataUrl.trim();
  if (!trimmed) return null;

  // If already a base64 data URL, store directly in the database (LONGTEXT in MySQL)
  // This guarantees permanent persistence on Render, Vercel, and across restarts with zero 404 risk.
  if (trimmed.startsWith('data:image/')) {
    try {
      const matches = trimmed.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (matches && matches.length >= 3) {
        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        const profileDir = path.join(envConfig.uploadDir, 'profiles');
        if (!fs.existsSync(profileDir)) {
          fs.mkdirSync(profileDir, { recursive: true });
        }
        const filename = `profile_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
        fs.writeFileSync(path.join(profileDir, filename), Buffer.from(matches[2], 'base64'));
      }
    } catch (err) {
      logger.warn('Non-fatal: could not write local image cache to disk:', err);
    }
    return trimmed;
  }

  // If already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If relative uploads path
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  return trimmed;
};

export default { saveBase64Image };
