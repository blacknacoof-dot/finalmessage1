import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};