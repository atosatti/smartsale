import { Response, NextFunction } from 'express';
/**
 * Middleware para verificar se o usuário é administrador
 * Deve ser utilizado após o authMiddleware
 */
export declare const adminMiddleware: (req: any, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Helper para verificar permissão de admin em uma rota sem usar middleware
 */
export declare const checkAdminRole: (userId: number) => Promise<boolean>;
//# sourceMappingURL=admin.d.ts.map