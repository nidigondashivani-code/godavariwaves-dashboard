import jwt, { SignOptions } from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config';

export interface JwtUserPayload {
  userId: number;
  employeeId?: number | null;
  email: string;
  role: string;
  dashboardAccess: string;
  permissions?: string[];
}

export const generateAccessToken = (payload: JwtUserPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.accessExpiry as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, jwtConfig.accessSecret, options);
};

export const generateRefreshToken = (payload: JwtUserPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.refreshExpiry as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, jwtConfig.refreshSecret, options);
};

export const verifyAccessToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, jwtConfig.accessSecret) as JwtUserPayload;
};

export const verifyRefreshToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as JwtUserPayload;
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
