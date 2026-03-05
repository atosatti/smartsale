/**
 * Controller para endpoints de busca alinhados com documentação oficial ML
 * Implementa recomendações de best practices da API Mercado Livre
 */
import { Request, Response } from 'express';
/**
 * GET /api/ml-search/seller-items/:sellerId
 *
 * Buscar itens de um vendedor com dados REAIS (não referencial)
 * Recomendado pela documentação oficial ML
 *
 * Query params:
 * - status: active, paused, closed, etc.
 * - orders: stop_time_asc, price_asc, etc.
 * - limit: 1-100 (default 50)
 * - offset: para paginação normal
 * - search_type: 'scan' para 1000+ itens
 * - scroll_id: para paginação com scan
 * - include_filters: true para obter filtros disponíveis
 */
export declare const getSellerItems: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/ml-search/seller-restrictions/:sellerId
 *
 * Verificar se seller tem restrições (200k+ itens)
 * Se sim: não retorna filters/available_filters
 */
export declare const getSellerRestrictions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/ml-search/multiget-items
 *
 * Buscar múltiplos itens em 1 requisição
 * Máximo: 20 IDs por requisição
 *
 * Body:
 * {
 *   "ids": ["MLB123", "MLB456", ...],
 *   "attributes": ["id", "price", "title", ...] // opcional
 * }
 */
export declare const getItemsMulti: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/ml-search/multiget-users
 *
 * Buscar múltiplos usuários em 1 requisição
 * Máximo: 20 usuários por requisição
 *
 * Body:
 * {
 *   "ids": [123456, 789012, ...]
 * }
 */
export declare const getUsersMulti: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/ml-search/public
 *
 * Busca pública com filtros e ordenação
 * Não requer autenticação
 *
 * Query params:
 * - q: query (obrigatório)
 * - seller_id: filtrar por vendedor
 * - nickname: buscar por nickname
 * - category: filtrar por categoria
 * - shipping: 'free' para frete grátis
 * - condition: 'new' ou 'used'
 * - sort: price_asc, price_desc, stop_time_asc, etc.
 * - limit: 1-100 (default 50)
 * - offset: para paginação
 */
export declare const searchPublic: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/ml-search/docs
 *
 * Retorna documentação dos novos endpoints
 */
export declare const getDocs: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=mlSearchController.d.ts.map