import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { startMercadoLivreAuth, handleMercadoLivreCallback, saveMercadoLivreToken, disconnectMercadoLivre, getMercadoLivreStatus, createTestUser, authenticateTestUser, getTestUserInfo, } from '../controllers/oauthController.js';
const router = Router();
// Iniciar autenticação (sem proteção)
router.get('/mercado-livre/authorize', startMercadoLivreAuth);
// Callback (sem proteção)
router.get('/mercado-livre/callback', handleMercadoLivreCallback);
// Salvar token (protegido)
router.post('/mercado-livre/save-token', authMiddleware, saveMercadoLivreToken);
// Desconectar (protegido)
router.post('/mercado-livre/disconnect', authMiddleware, disconnectMercadoLivre);
// Status (protegido)
router.get('/mercado-livre/status', authMiddleware, getMercadoLivreStatus);
// Criar usuário de teste (protegido)
router.post('/mercado-livre/create-test-user', authMiddleware, createTestUser);
// Autenticar com usuário de teste (protegido)
router.post('/mercado-livre/authenticate-test-user', authMiddleware, authenticateTestUser);
// Obter informações do usuário de teste já criado (protegido)
router.get('/mercado-livre/test-user-info', authMiddleware, getTestUserInfo);
export default router;
//# sourceMappingURL=oauthRoutes.js.map