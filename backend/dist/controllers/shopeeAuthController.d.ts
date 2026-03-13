import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
/**
 * GET /api/oauth/shopee/authorize
 * Inicia o fluxo OAuth - redireciona para Shopee
 */
export declare const startShopeeAuth: (req: Request, res: Response) => void;
/**
 * GET /api/oauth/shopee/callback
 * Callback do OAuth - Shopee redireciona com código
 * Query params: code=XXXX&shop_id=YYYY
 */
export declare const handleShopeeCallback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/integrations/shopee/disconnect
 * Desconectar uma loja autorizada
 */
export declare const disconnectShopee: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/integrations/shopee/status
 * Verificar status de conexão Shopee
 */
export declare const getShopeeStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * GET /api/integrations/shopee/authorized-shops
 * Listar lojas autorizadas (para admin)
 */
export declare const getAuthorizedShops: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * POST /api/integrations/shopee/revoke/:shopId
 * Revogar acesso de uma loja específica (admin)
 */
export declare const revokeShopeeAccess: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/integrations/shopee/refresh-token
 * Forçar refresh de token para uma loja
 */
export declare const forceTokenRefresh: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=shopeeAuthController.d.ts.map