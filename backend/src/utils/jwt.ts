import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role?: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const generateResetToken = (email: string): string => {
  return jwt.sign({ email, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' } as jwt.SignOptions);
};

export const verifyResetToken = (token: string): { email: string } => {
  const payload = jwt.verify(token, JWT_SECRET) as any;
  if (payload.type !== 'reset') {
    throw new Error('Invalid reset token');
  }
  return { email: payload.email };
};