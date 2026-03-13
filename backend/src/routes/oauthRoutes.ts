import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  startMercadoLivreAuth,
  handleMercadoLivreCallback,
  saveMercadoLivreToken,
  disconnectMercadoLivre,
  getMercadoLivreStatus,
  createTestUser,
  authenticateTestUser,
  getTestUserInfo,
} from '../controllers/oauthController.js';

const router = Router();

// Iniciar autenticação (sem proteção)
router.get('/mercado-livre/authorize', startMercadoLivreAuth as any);

// Callback (sem proteção)
router.get('/mercado-livre/callback', handleMercadoLivreCallback as any);

// Salvar token (protegido)
router.post('/mercado-livre/save-token', authMiddleware as any, saveMercadoLivreToken as any);

// Desconectar (protegido)
router.post('/mercado-livre/disconnect', authMiddleware as any, disconnectMercadoLivre as any);

// Status (protegido)
router.get('/mercado-livre/status', authMiddleware as any, getMercadoLivreStatus as any);

// Criar usuário de teste (protegido)
router.post('/mercado-livre/create-test-user', authMiddleware as any, createTestUser as any);

// Autenticar com usuário de teste (protegido)
router.post('/mercado-livre/authenticate-test-user', authMiddleware as any, authenticateTestUser as any);

// Obter informações do usuário de teste já criado (protegido)
router.get('/mercado-livre/test-user-info', authMiddleware as any, getTestUserInfo as any);

export default router;
