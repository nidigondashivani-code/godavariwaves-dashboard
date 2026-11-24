import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (plainPassword: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hash);
};

export default { hashPassword, comparePassword };
