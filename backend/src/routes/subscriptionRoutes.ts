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

router.get('/plans', getPlans);
router.post('/create', authMiddleware, createSubscription);
router.post('/cancel', authMiddleware, cancelSubscription);
router.post('/reactivate', authMiddleware, reactivateSubscription);
router.get('/my-subscription', authMiddleware, getUserSubscription);

export default router;
