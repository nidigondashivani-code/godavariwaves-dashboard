import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseBool = (val: string | undefined, fallback: boolean): boolean => {
  if (val === undefined || val === '') return fallback;
  return ['true', '1', 'yes', 'required'].includes(val.trim().toLowerCase());
};

export const envConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    dialect: (process.env.DB_DIALECT || 'mysql') as 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'godavari_waves',
    ssl: parseBool(process.env.DB_SSL, false),
    caCertPath: process.env.DB_CA_CERT_PATH
      ? path.resolve(process.cwd(), process.env.DB_CA_CERT_PATH)
      : '',
    sslRejectUnauthorized: parseBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'ems_dev_jwt_access_secret_replace_in_env',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'ems_dev_jwt_refresh_secret_replace_in_env',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  officePolicy: {
    startTime: process.env.OFFICE_START_TIME || '09:30',
    gracePeriodMinutes: parseInt(process.env.GRACE_PERIOD_MINUTES || '15', 10),
    lateThresholdTime: process.env.LATE_THRESHOLD_TIME || '09:45',
    autoAbsentTime: process.env.AUTO_ABSENT_TIME || '11:00',
    endTime: process.env.OFFICE_END_TIME || '18:30',
  },
} as const;

export default envConfig;
