import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const setup2FA: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const confirm2FA: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verify2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProfileInfo: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changePassword: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const get2FAStatus: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const disable2FA: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Inicia autenticação com Google
 * GET /api/auth/google/authorize
 */
export declare const startGoogleAuth: (req: Request, res: Response) => void;
/**
 * Callback do Google - Login/Registro
 * GET /api/auth/google/callback?code=XXX&state=XXX
 */
export declare const handleGoogleCallback: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map