import envConfig from './env.config';

export const jwtConfig = {
  accessSecret: envConfig.jwt.accessSecret,
  accessExpiry: envConfig.jwt.accessExpiry,
  refreshSecret: envConfig.jwt.refreshSecret,
  refreshExpiry: envConfig.jwt.refreshExpiry,
};

export default jwtConfig;
