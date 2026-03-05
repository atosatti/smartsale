import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
/**
 * GET /admin/integrations/status
 * Obter status de todas as integrações
 */
export declare const getIntegrationsStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * GET /admin/integrations/mercado-livre
 * Obter status específico do Mercado Livre
 */
export declare const getMercadoLivreStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * POST /admin/integrations/mercado-livre/save-token
 * Salvar token após OAuth
 */
export declare const saveMercadoLivreToken: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /admin/integrations/mercado-livre/refresh-token
 * Renovar token do Mercado Livre
 */
export declare const refreshMercadoLivreToken: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /admin/integrations/mercado-livre/validate
 * Validar conexão com Mercado Livre e obter dados do usuário
 */
export declare const validateMercadoLivreConnection: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /admin/integrations/mercado-livre/disconnect
 * Desconectar Mercado Livre
 */
export declare const disconnectMercadoLivre: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=integrationsController.d.ts.map