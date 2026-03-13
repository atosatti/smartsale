import { Router } from 'express';
import { register, login, setup2FA, confirm2FA, verify2FA, updateProfile, getCurrentUser, getProfileInfo, changePassword, get2FAStatus, disable2FA, startGoogleAuth, handleGoogleCallback } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/verify-2fa', verify2FA as any);
router.get('/setup-2fa', authMiddleware as any, setup2FA as any);
router.post('/confirm-2fa', authMiddleware as any, confirm2FA as any);
router.get('/2fa-status', authMiddleware as any, get2FAStatus as any);
router.post('/disable-2fa', authMiddleware as any, disable2FA as any);
router.put('/profile', authMiddleware as any, updateProfile as any);
router.get('/me', authMiddleware as any, getCurrentUser as any);
router.get('/profile', authMiddleware as any, getProfileInfo as any);
router.post('/change-password', authMiddleware as any, changePassword as any);

// Google OAuth
router.get('/google/authorize', startGoogleAuth as any);
router.get('/google/callback', handleGoogleCallback as any);

export default router;
