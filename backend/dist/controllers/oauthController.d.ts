import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
/**
 * Iniciar processo de autenticação com Mercado Livre
 * GET /api/oauth/mercado-livre/authorize
 */
export declare const startMercadoLivreAuth: (req: Request, res: Response) => void;
/**
 * Callback do Mercado Livre
 * GET /api/oauth/mercado-livre/callback?code=XXX&state=XXX
 */
export declare const handleMercadoLivreCallback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Salvar token OAuth do Mercado Livre
 * POST /api/oauth/mercado-livre/save-token
 * Body: { ml_token, ml_user_id, refresh_token, expires_in }
 */
export declare const saveMercadoLivreToken: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Desconectar do Mercado Livre
 * POST /api/oauth/mercado-livre/disconnect
 */
export declare const disconnectMercadoLivre: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obter status da autenticação
 * GET /api/oauth/mercado-livre/status
 */
export declare const getMercadoLivreStatus: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTestUser: (req: Request, res: Response) => Promise<void>;
/**
 * Autenticar e salvar token de um usuário de teste (CENTRALIZADO)
 * POST /api/oauth/mercado-livre/authenticate-test-user
 */
export declare const authenticateTestUser: (req: Request, res: Response) => Promise<void>;
export declare const getTestUserInfo: (req: any, res: any) => Promise<any>;
//# sourceMappingURL=oauthController.d.ts.map