import crypto from 'crypto';

export const generateSecurePassword = (length = 12): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$!%*?';
  const all = upper + lower + digits + special;
  const chars = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];
  for (let i = chars.length; i < length; i++) {
    chars.push(all[crypto.randomInt(all.length)]);
  }
  return chars.sort(() => crypto.randomInt(3) - 1).join('');
};

export default { generateSecurePassword };
