'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const useSsl = ['true', '1', 'yes', 'required'].includes(
  String(process.env.DB_SSL || '').trim().toLowerCase()
);

const buildSsl = () => {
  if (!useSsl) return undefined;
  const ssl = {
    rejectUnauthorized: !['false', '0', 'no'].includes(
      String(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'true').trim().toLowerCase()
    ),
  };
  if (process.env.DB_CA_CERT_PATH) {
    const certPath = path.resolve(__dirname, '../../', process.env.DB_CA_CERT_PATH);
    if (fs.existsSync(certPath)) {
      ssl.ca = fs.readFileSync(certPath, 'utf8');
    }
  }
  return ssl;
};

const sharedConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'godavari_waves',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  dialect: process.env.DB_DIALECT || 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
    ...(useSsl ? { ssl: buildSsl() } : {}),
  },
};

module.exports = {
  development: sharedConfig,
  test: sharedConfig,
  production: sharedConfig,
};
