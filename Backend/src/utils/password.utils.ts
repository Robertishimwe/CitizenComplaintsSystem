import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // For generating random passwords

const SALT_ROUNDS = 10; // Or from env

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateRandomPassword = (length = 12): string => {
  // Generate a cryptographically secure random string
  // This example is basic; consider more robust generation for production
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, length); // return required number of characters
};
