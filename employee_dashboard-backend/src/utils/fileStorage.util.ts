import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import envConfig from '../config/env.config';
import { logger } from './logger.util';

export const saveBase64Image = (dataUrl?: string | null): string | null => {
  if (!dataUrl || typeof dataUrl !== 'string') return null;

  // If already a hosted or relative URL, preserve it
  if (
    dataUrl.startsWith('/uploads/') ||
    dataUrl.startsWith('uploads/') ||
    dataUrl.startsWith('http://') ||
    dataUrl.startsWith('https://')
  ) {
    return dataUrl.startsWith('/') ? dataUrl : `/${dataUrl}`;
  }

  if (!dataUrl.startsWith('data:image/')) {
    return null;
  }

  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches || matches.length < 3) return null;

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext.includes('svg')) ext = 'svg';
    if (ext.includes('png')) ext = 'png';
    if (ext.includes('webp')) ext = 'webp';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const profileDir = path.join(envConfig.uploadDir, 'profiles');
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    const filename = `profile_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(profileDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/profiles/${filename}`;
  } catch (err) {
    logger.error('Failed to save base64 profile picture:', err);
    return null;
  }
};

export default { saveBase64Image };
