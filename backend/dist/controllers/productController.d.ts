import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
/**
 * Busca produtos no Mercado Livre
 * GET /api/products/search?query=...&limit=50&offset=0&sort=relevance
 * Supports both public and seller search with comprehensive filters
 */
export declare const searchProducts: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtém detalhes completos de um produto
 * GET /api/products/:productId
/**
 * Obtém detalhes completos de um produto
 * GET /api/products/:productId
 */
export declare const getProductDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtém informações do vendedor
 * GET /api/products/seller/:sellerId
 */
export declare const getSellerInfo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Encontra produtos concorrentes
 * GET /api/products/:productId/competitors
 */
export declare const findCompetitors: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Busca por categoria
 * GET /api/products/category/:categoryId?limit=50
 */
export declare const searchByCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Salva um produto na base de dados do usuário
 * POST /api/products/save (autenticado)
 */
export declare const saveProduct: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Obtém produtos salvos do usuário
 * GET /api/products/saved (autenticado)
 */
export declare const getSavedProducts: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=productController.d.ts.map