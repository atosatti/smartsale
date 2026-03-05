import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare const searchProducts: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProductDetails: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const compareProducts: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPriceHistory: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=mercadoLivreController.d.ts.map