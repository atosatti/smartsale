import { Request, Response } from 'express';
/**
 * POST /api/payments/create-payment-intent
 * Criar intent de pagamento para assinar plano
 */
export declare function createPaymentIntent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/payments/confirm-payment
 * Confirmar pagamento após cliente pagar
 */
export declare function confirmPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/payments/cancel-subscription
 * Cancelar assinatura do usuário
 */
/**
 * POST /api/payments/cancel-subscription
 * Cancelar assinatura do usuário (agendado para final do período)
 */
export declare function cancelSubscription(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/payments/history
 * Histórico de pagamentos do usuário
 */
export declare function getPaymentHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/payments/history
 * Buscar histórico de pagamentos do Stripe
 */
export declare function getStripePaymentHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=paymentController.d.ts.map