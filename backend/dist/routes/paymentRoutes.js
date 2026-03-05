import { Router } from 'express';
import { createPaymentIntent, confirmPayment, cancelSubscription, getStripePaymentHistory, } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// Todos os endpoints precisam de autenticação
router.use(authMiddleware);
// Criar intent de pagamento
router.post('/create-payment-intent', createPaymentIntent);
// Confirmar pagamento
router.post('/confirm-payment', confirmPayment);
// Cancelar assinatura
router.post('/cancel-subscription', cancelSubscription);
// Histórico de pagamentos (do Stripe)
router.get('/history', getStripePaymentHistory);
export default router;
//# sourceMappingURL=paymentRoutes.js.map