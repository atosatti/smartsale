/**
 * Rotas para busca alinhada com documentação oficial Mercado Livre
 * Implementa recomendações e best practices
 */

import { Router } from 'express';
import {
  getSellerItems,
  getSellerRestrictions,
  getItemsMulti,
  getUsersMulti,
  searchPublic,
  getDocs,
} from '../controllers/mlSearchController.js';
import { optionalAuthMiddleware, subscriptionActiveMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/ml-search/docs
 * Documentação dos endpoints
 */
router.get('/docs', getDocs);

/**
 * GET /api/ml-search/seller-items/:sellerId
 * Buscar itens de um vendedor (dados REAIS)
 * Recomendado pela ML: /users/{user_id}/items/search
 * ⚠️ Se autenticado: verifica se assinatura está ativa
 */
(router as any).get('/seller-items/:sellerId', optionalAuthMiddleware, subscriptionActiveMiddleware, (req: any, res: any) => getSellerItems(req, res));

/**
 * GET /api/ml-search/seller-restrictions/:sellerId
 * Verificar restrições do vendedor
 * ⚠️ Se autenticado: verifica se assinatura está ativa
 */
(router as any).get('/seller-restrictions/:sellerId', optionalAuthMiddleware, subscriptionActiveMiddleware, (req: any, res: any) => getSellerRestrictions(req, res));

/**
 * POST /api/ml-search/multiget-items
 * Buscar múltiplos itens em 1 requisição (máx 20)
 */
router.post('/multiget-items', getItemsMulti);

/**
 * POST /api/ml-search/multiget-users
 * Buscar múltiplos usuários em 1 requisição (máx 20)
 */
router.post('/multiget-users', getUsersMulti);

/**
 * GET /api/ml-search/public
 * Busca pública com filtros e ordenação
 * ⚠️ Se autenticado: verifica se assinatura está ativa
 */
router.get('/public', optionalAuthMiddleware as any, subscriptionActiveMiddleware as any, searchPublic);

export default router;
