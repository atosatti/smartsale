import pool from '../config/database.js';
/**
 * GET /api/reports/cancellations
 * Relatório de cancelamentos de assinatura (apenas admin)
 */
export async function getCancellationReport(req, res) {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || userRole !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão. Apenas admins podem acessar.' });
        }
        const connection = await pool.getConnection();
        try {
            // Buscar feedbacks de cancelamento
            const [feedbacks] = await connection.execute(`SELECT 
          cf.id,
          cf.user_id,
          u.email,
          u.subscription_plan,
          cf.reason,
          cf.details,
          cf.improvements,
          cf.would_return,
          cf.created_at,
          cf.updated_at
         FROM cancellation_feedback cf
         LEFT JOIN users u ON cf.user_id = u.id
         ORDER BY cf.created_at DESC
         LIMIT 1000`);
            // Calcular estatísticas
            const stats = {
                total: feedbacks.length,
                byReason: {},
                wouldReturn: { yes: 0, no: 0, unknown: 0 },
                thisMonth: 0,
                thisWeek: 0,
            };
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            (feedbacks || []).forEach((fb) => {
                // Por razão
                stats.byReason[fb.reason] = (stats.byReason[fb.reason] || 0) + 1;
                // Voltaria a usar
                if (fb.would_return === 1)
                    stats.wouldReturn.yes++;
                else if (fb.would_return === 0)
                    stats.wouldReturn.no++;
                else
                    stats.wouldReturn.unknown++;
                // Este mês
                if (new Date(fb.created_at) >= thisMonth)
                    stats.thisMonth++;
                // Esta semana
                if (new Date(fb.created_at) >= thisWeek)
                    stats.thisWeek++;
            });
            res.status(200).json({
                success: true,
                data: feedbacks,
                statistics: stats,
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        res.status(500).json({
            error: error.message || 'Erro ao gerar relatório',
        });
    }
}
/**
 * GET /api/reports/cancellations/:id
 * Detalhe de um feedback de cancelamento
 */
export async function getCancellationFeedback(req, res) {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const feedbackId = req.params.id;
        if (!userId || userRole !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão. Apenas admins podem acessar.' });
        }
        const connection = await pool.getConnection();
        try {
            const [feedback] = await connection.execute(`SELECT 
          cf.*,
          u.email,
          u.subscription_plan,
          s.plan_name,
          s.plan_price
         FROM cancellation_feedback cf
         LEFT JOIN users u ON cf.user_id = u.id
         LEFT JOIN subscriptions s ON cf.subscription_id = s.id
         WHERE cf.id = ?`, [feedbackId]);
            const result = feedback[0];
            if (!result) {
                return res.status(404).json({ error: 'Feedback não encontrado' });
            }
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao buscar feedback:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar feedback',
        });
    }
}
/**
 * GET /api/reports/cancellations/export/csv
 * Exportar relatório em CSV
 */
export async function exportCancellationReport(req, res) {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || userRole !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão. Apenas admins podem acessar.' });
        }
        const connection = await pool.getConnection();
        try {
            const [feedbacks] = await connection.execute(`SELECT 
          u.email,
          u.subscription_plan,
          cf.reason,
          cf.details,
          cf.improvements,
          CASE WHEN cf.would_return = 1 THEN 'Sim'
               WHEN cf.would_return = 0 THEN 'Não'
               ELSE 'Não respondido' END as would_return,
          cf.created_at
         FROM cancellation_feedback cf
         LEFT JOIN users u ON cf.user_id = u.id
         ORDER BY cf.created_at DESC`);
            // Montar CSV
            const headers = ['Email', 'Plano', 'Motivo', 'Detalhes', 'Sugestões', 'Voltaria?', 'Data'];
            const rows = (feedbacks || []).map((fb) => [
                fb.email || 'N/A',
                fb.subscription_plan || 'N/A',
                fb.reason || '',
                fb.details ? `"${fb.details.replace(/"/g, '""')}"` : '',
                fb.improvements ? `"${fb.improvements.replace(/"/g, '""')}"` : '',
                fb.would_return,
                new Date(fb.created_at).toLocaleDateString('pt-BR'),
            ]);
            const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="relatorio_cancelamentos_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao exportar relatório:', error);
        res.status(500).json({
            error: error.message || 'Erro ao exportar relatório',
        });
    }
}
//# sourceMappingURL=reportController.js.map