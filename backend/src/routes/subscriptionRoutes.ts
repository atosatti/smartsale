import { Router } from 'express';
import {
  getPlans,
  createSubscription,
  cancelSubscription,
  getUserSubscription,
  reactivateSubscription,
} from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/plans', getPlans as any);
router.post('/create', authMiddleware as any, createSubscription as any);
router.post('/cancel', authMiddleware as any, cancelSubscription as any);
router.post('/reactivate', authMiddleware as any, reactivateSubscription as any);
router.get('/my-subscription', authMiddleware as any, getUserSubscription as any);

export default router;
