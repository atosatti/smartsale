import { Router } from 'express';
import { getCancellationReport, getCancellationFeedback, exportCancellationReport, } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// Todas as rotas de relatório requerem autenticação
router.use(authMiddleware);
/**
 * GET /api/reports/cancellations
 * Relatório completo de cancelamentos (admin only)
 */
router.get('/cancellations', getCancellationReport);
/**
 * GET /api/reports/cancellations/:id
 * Detalhe de um feedback
 */
router.get('/cancellations/:id', getCancellationFeedback);
/**
 * GET /api/reports/cancellations/export/csv
 * Exportar em CSV
 */
router.get('/cancellations/export/csv', exportCancellationReport);
export default router;
//# sourceMappingURL=reportRoutes.js.map