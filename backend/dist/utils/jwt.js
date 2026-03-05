import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
export const generateToken = (userId, email) => {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
export const decodeToken = (token) => {
    return jwt.decode(token);
};
//# sourceMappingURL=jwt.js.map