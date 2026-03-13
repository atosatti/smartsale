import { Router } from 'express';
import {
  searchProducts,
  getProductDetails,
  getSellerInfo,
  findCompetitors,
  searchByCategory,
  saveProduct,
  getSavedProducts,
} from '../controllers/productController.js';
import { authMiddleware, optionalAuthMiddleware, subscriptionActiveMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * Rotas públicas (sem autenticação obrigatória)
 * Mercado Livre API é pública, mas com autenticação opcional para resultados personalizados
 */

/**
 * GET /api/products/search?query=...&limit=50&offset=0&sort=relevance&category=...
 * Busca produtos no Mercado Livre
 * Opcional: Authorization header para usar token OAuth do usuário
 * ⚠️ Se autenticado: verifica se assinatura está ativa
 */
router.get('/search', optionalAuthMiddleware as any, subscriptionActiveMiddleware as any, searchProducts as any);

/**
 * GET /api/products/:productId
 * Obtém detalhes completos de um produto específico
 */
router.get('/:productId', getProductDetails as any);

/**
 * GET /api/products/:productId/competitors
 * Encontra produtos concorrentes (mesmo segmento/categoria)
 */
router.get('/:productId/competitors', findCompetitors as any);

/**
 * GET /api/products/seller/:sellerId
 * Obtém informações de reputação e feedback do vendedor
 */
router.get('/seller/:sellerId', getSellerInfo as any);

/**
 * GET /api/products/category/:categoryId?limit=50
 * Busca produtos por categoria
 */
router.get('/category/:categoryId', searchByCategory as any);

/**
 * Rotas autenticadas (requerem JWT token)
 */

/**
 * POST /api/products/save
 * Salva um produto na base de dados do usuário para análise posterior
 * Body: { name, description, productId, price, seller }
 */
router.post('/save', authMiddleware as any, saveProduct as any);

/**
 * GET /api/products/saved
 * Obtém todos os produtos salvos pelo usuário autenticado
 */
router.get('/saved', authMiddleware as any, getSavedProducts as any);

export default router;
