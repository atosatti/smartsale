import { Router } from 'express';
import { register, login, setup2FA, confirm2FA, verify2FA, updateProfile, getCurrentUser, getProfileInfo, changePassword, get2FAStatus, disable2FA, startGoogleAuth, handleGoogleCallback } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.get('/setup-2fa', authMiddleware, setup2FA);
router.post('/confirm-2fa', authMiddleware, confirm2FA);
router.get('/2fa-status', authMiddleware, get2FAStatus);
router.post('/disable-2fa', authMiddleware, disable2FA);
router.put('/profile', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getCurrentUser);
router.get('/profile', authMiddleware, getProfileInfo);
router.post('/change-password', authMiddleware, changePassword);
// Google OAuth
router.get('/google/authorize', startGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
export default router;
//# sourceMappingURL=authRoutes.js.map