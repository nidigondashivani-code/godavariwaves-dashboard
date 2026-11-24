import fs from 'fs';
import { Sequelize } from 'sequelize';
import envConfig from './env.config';

export const buildMysqlSslOptions = (): Record<string, unknown> | undefined => {
  if (!envConfig.db.ssl) return undefined;

  const ssl: Record<string, unknown> = {
    rejectUnauthorized: envConfig.db.sslRejectUnauthorized,
  };

  if (envConfig.db.caCertPath && fs.existsSync(envConfig.db.caCertPath)) {
    ssl.ca = fs.readFileSync(envConfig.db.caCertPath, 'utf8');
  }

  return ssl;
};

const sslOptions = buildMysqlSslOptions();

export const sequelize = new Sequelize(
  envConfig.db.name,
  envConfig.db.user,
  envConfig.db.password,
  {
    host: envConfig.db.host,
    port: envConfig.db.port,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      ...(sslOptions ? { ssl: sslOptions } : {}),
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
);

export default sequelize;
