import { Request, Response } from 'express';
/**
 * GET /api/reports/cancellations
 * Relatório de cancelamentos de assinatura (apenas admin)
 */
export declare function getCancellationReport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/reports/cancellations/:id
 * Detalhe de um feedback de cancelamento
 */
export declare function getCancellationFeedback(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/reports/cancellations/export/csv
 * Exportar relatório em CSV
 */
export declare function exportCancellationReport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=reportController.d.ts.map