import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}
export declare const authMiddleware: (req: any, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware de autenticação opcional
 * Tenta extrair o usuário do token, mas não bloqueia se não houver
 */
export declare const optionalAuthMiddleware: (req: any, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar se a assinatura está ativa e não expirada
 * Bloqueia buscas se assinatura foi cancelada e o período expirou
 */
export declare const subscriptionActiveMiddleware: (req: any, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map