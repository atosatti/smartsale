import { Router } from 'express';
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getUserActivity,
  getAuditLogs,
  getDashboardStats,
  getMercadoLivreIntegration,
  refreshMercadoLivreToken,
  saveMercadoLivreToken,
  testExpireSubscription
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = Router();

// Aplicar middleware de autenticação e admin a todas as rotas
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

// Dashboard
router.get('/dashboard', getDashboardStats as any);

// Usuários
router.get('/users', getAllUsers as any);
router.get('/users/:userId', getUserDetails as any);
router.put('/users/:userId', updateUser as any);
router.delete('/users/:userId', deleteUser as any);

// Atividade de usuário
router.get('/users/:userId/activity', getUserActivity as any);

// Logs de auditoria
router.get('/audit-logs', getAuditLogs as any);

// Integrações
router.get('/integrations/mercado-livre', getMercadoLivreIntegration as any);
router.post('/integrations/mercado-livre/refresh-token', refreshMercadoLivreToken as any);
router.post('/integrations/mercado-livre/save-token', saveMercadoLivreToken as any);

// DEV - Teste de bloqueio de assinatura expirada
router.post('/test-expire-subscription', testExpireSubscription as any);

export default router;
