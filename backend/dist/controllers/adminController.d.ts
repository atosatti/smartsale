import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
/**
 * GET /admin/users
 * Lista todos os usuários do sistema
 */
export declare const getAllUsers: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * GET /admin/users/:userId
 * Obtém detalhes completos de um usuário específico
 */
export declare const getUserDetails: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * PUT /admin/users/:userId
 * Atualiza informações de um usuário
 */
export declare const updateUser: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /admin/users/:userId
 * Soft delete de um usuário (marca como inativo)
 */
export declare const deleteUser: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /admin/users/:userId/activity
 * Obtém histórico de atividades de um usuário
 */
export declare const getUserActivity: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /admin/audit-logs
 * Obtém logs de auditoria das ações de admin
 */
export declare const getAuditLogs: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * GET /admin/dashboard
 * Retorna estatísticas do dashboard
 */
export declare const getDashboardStats: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * GET /admin/integrations/mercado-livre
 * Retorna informações sobre a integração do Mercado Livre do usuário logado
 */
export declare const getMercadoLivreIntegration: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /admin/integrations/mercado-livre/refresh-token
 * Atualiza o token do Mercado Livre usando o refresh token
 */
export declare const refreshMercadoLivreToken: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /admin/integrations/mercado-livre/save-token
 * Salva o token do Mercado Livre após OAuth (callback)
 */
export declare const saveMercadoLivreToken: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /admin/test-expire-subscription (DEV ONLY)
 * Atualiza current_period_end de uma assinatura para testar bloqueio
 * ⚠️ USE APENAS EM DESENVOLVIMENTO
 */
export declare const testExpireSubscription: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminController.d.ts.map