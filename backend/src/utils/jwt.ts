import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRE as string | number }
  ) as string;
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};
