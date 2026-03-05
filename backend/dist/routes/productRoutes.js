import { Router } from 'express';
import { searchProducts, getProductDetails, getSellerInfo, findCompetitors, searchByCategory, saveProduct, getSavedProducts, } from '../controllers/productController.js';
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
router.get('/search', optionalAuthMiddleware, subscriptionActiveMiddleware, searchProducts);
/**
 * GET /api/products/:productId
 * Obtém detalhes completos de um produto específico
 */
router.get('/:productId', getProductDetails);
/**
 * GET /api/products/:productId/competitors
 * Encontra produtos concorrentes (mesmo segmento/categoria)
 */
router.get('/:productId/competitors', findCompetitors);
/**
 * GET /api/products/seller/:sellerId
 * Obtém informações de reputação e feedback do vendedor
 */
router.get('/seller/:sellerId', getSellerInfo);
/**
 * GET /api/products/category/:categoryId?limit=50
 * Busca produtos por categoria
 */
router.get('/category/:categoryId', searchByCategory);
/**
 * Rotas autenticadas (requerem JWT token)
 */
/**
 * POST /api/products/save
 * Salva um produto na base de dados do usuário para análise posterior
 * Body: { name, description, productId, price, seller }
 */
router.post('/save', authMiddleware, saveProduct);
/**
 * GET /api/products/saved
 * Obtém todos os produtos salvos pelo usuário autenticado
 */
router.get('/saved', authMiddleware, getSavedProducts);
export default router;
//# sourceMappingURL=productRoutes.js.map