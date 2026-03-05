import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser utilizado após o authMiddleware
 */
export declare const adminMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Helper para verificar permissão de admin em uma rota sem usar middleware
 */
export declare const checkAdminRole: (userId: number) => Promise<boolean>;
//# sourceMappingURL=admin.d.ts.map