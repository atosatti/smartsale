import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getPlans: (req: Request, res: Response) => Promise<void>;
export declare const createSubscription: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelSubscription: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserSubscription: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/subscriptions/reactivate
 * Reativar assinatura cancelada
 */
export declare const reactivateSubscription: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=subscriptionController.d.ts.map