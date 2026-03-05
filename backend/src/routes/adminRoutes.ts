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
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Usuários
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Atividade de usuário
router.get('/users/:userId/activity', getUserActivity);

// Logs de auditoria
router.get('/audit-logs', getAuditLogs);

// Integrações
router.get('/integrations/mercado-livre', getMercadoLivreIntegration);
router.post('/integrations/mercado-livre/refresh-token', refreshMercadoLivreToken);
router.post('/integrations/mercado-livre/save-token', saveMercadoLivreToken);

// DEV - Teste de bloqueio de assinatura expirada
router.post('/test-expire-subscription', testExpireSubscription);

export default router;
