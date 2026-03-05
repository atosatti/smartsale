import { Router } from 'express';
import { getIntegrationsStatus, getMercadoLivreStatus, validateMercadoLivreConnection, saveMercadoLivreToken, refreshMercadoLivreToken, disconnectMercadoLivre } from '../controllers/integrationsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import pool from '../config/database.js';
const router = Router();
// Aplicar middleware de autenticação e admin a todas as rotas
router.use(authMiddleware);
router.use(adminMiddleware);
// Rotas de status
router.get('/status', getIntegrationsStatus);
router.get('/mercado-livre/status', getMercadoLivreStatus);
router.get('/mercado-livre/validate', validateMercadoLivreConnection);
// Rotas de configuração
router.post('/mercado-livre/save-token', saveMercadoLivreToken);
router.post('/mercado-livre/refresh-token', refreshMercadoLivreToken);
router.post('/mercado-livre/disconnect', disconnectMercadoLivre);
// Rotas de gerenciamento de aplicativo
router.get('/mercado-livre/app-details', getMercadoLivreAppDetails);
router.get('/mercado-livre/user-apps/:userId', getMercadoLivreUserApps);
router.delete('/mercado-livre/revoke/:userId/:appId', revokeMercadoLivreAuthorization);
router.get('/mercado-livre/metrics', getMercadoLivreMetrics);
/**
 * Obter token ativo do banco de dados
 */
async function getActiveMercadoLivreToken() {
    try {
        let tokens;
        try {
            const [result] = await pool.query(`SELECT access_token FROM oauth_tokens 
         WHERE provider = 'mercado-livre' AND is_active = TRUE 
         LIMIT 1`);
            tokens = result || [];
        }
        catch (dbError) {
            console.error('[Integrations] Erro de banco:', dbError);
            return null;
        }
        const tokenData = tokens[0];
        const token = tokenData?.access_token || null;
        if (!token) { }
        return token;
    }
    catch (error) {
        console.error('[Integrations] Erro ao buscar token:', error);
        return null;
    }
}
/**
 * Obter detalhes do aplicativo, grants e métricas
 */
async function getMercadoLivreAppDetails(req, res) {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        const appId = process.env.MERCADO_LIVRE_APP_ID;
        const token = await getActiveMercadoLivreToken();
        if (!token) {
            return res.status(400).json({ error: 'Token do Mercado Livre não configurado' });
        }
        // 1. Obter detalhes do aplicativo
        let appDetails = null;
        try {
            const appResponse = await fetch(`https://api.mercadolibre.com/applications/${appId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (appResponse.ok) {
                try {
                    appDetails = await appResponse.json();
                }
                catch (parseError) {
                    console.error('[ML Service] Erro ao fazer parse de app details:', parseError);
                    appDetails = null;
                }
            }
            else {
                console.error('[ML Service] Erro ao buscar app details:', appResponse.status, appResponse.statusText);
            }
        }
        catch (error) {
            console.error('[ML Service] Erro ao buscar detalhes do app:', error);
        }
        // 2. Obter grants (usuários autorizados)
        let grants = [];
        try {
            const grantsResponse = await fetch(`https://api.mercadolibre.com/applications/${appId}/grants`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (grantsResponse.ok) {
                try {
                    const grantsData = await grantsResponse.json();
                    grants = grantsData.grants || [];
                    // Processar status do grant
                    grants = grants.map((grant) => {
                        const createdDate = new Date(grant.date_created);
                        const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                        let status = 'Inativo';
                        if (daysSinceCreation < 1)
                            status = 'Novo';
                        else if (daysSinceCreation <= 90)
                            status = 'Ativo';
                        return { ...grant, status };
                    });
                }
                catch (parseError) {
                    console.error('[ML Service] Erro ao fazer parse de grants:', parseError);
                    grants = [];
                }
            }
            else {
                console.error('[ML Service] Erro ao buscar grants:', grantsResponse.status, grantsResponse.statusText);
            }
        }
        catch (error) {
            console.error('[ML Service] Erro ao buscar grants:', error);
        }
        // 3. Obter métricas de consumo
        let metrics = null;
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 15 * 24 * 60 * 60 * 1000);
            const dateStart = startDate.toISOString().split('T')[0];
            const dateEnd = endDate.toISOString().split('T')[0];
            const metricsResponse = await fetch(`https://api.mercadolibre.com/applications/v1/${appId}/consumed-applications?date_start=${dateStart}&date_end=${dateEnd}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (metricsResponse.ok) {
                try {
                    metrics = await metricsResponse.json();
                }
                catch (parseError) {
                    console.error('[ML Service] Erro ao fazer parse de métricas:', parseError);
                    metrics = null;
                }
            }
            else {
                console.error('[ML Service] Erro ao buscar métricas:', metricsResponse.status, metricsResponse.statusText);
            }
        }
        catch (error) {
            console.error('[ML Service] Erro ao buscar métricas:', error);
        }
        res.json({
            appDetails,
            grants,
            metrics,
            message: 'Dados carregados com sucesso'
        });
    }
    catch (error) {
        console.error('[getMercadoLivreAppDetails] Erro capturado:', error);
        const errorMsg = error?.message || error?.toString() || 'Erro desconhecido';
        console.error('[getMercadoLivreAppDetails] Mensagem de erro:', errorMsg);
        res.status(500).json({
            error: 'Erro ao obter informações do aplicativo',
            details: errorMsg
        });
    }
}
/**
 * Obter aplicativos autorizados por um usuário
 */
async function getMercadoLivreUserApps(req, res) {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        const { userId } = req.params;
        const token = await getActiveMercadoLivreToken();
        if (!token) {
            return res.status(400).json({ error: 'Token não configurado' });
        }
        const response = await fetch(`https://api.mercadolibre.com/users/${userId}/applications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro ao buscar aplicativos' });
        }
        const apps = await response.json();
        res.json(apps);
    }
    catch (error) {
        console.error('[ML Service] Erro:', error);
        res.status(500).json({ error: 'Erro ao obter aplicativos' });
    }
}
/**
 * Revogar autorização de um usuário
 */
async function revokeMercadoLivreAuthorization(req, res) {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        const { userId, appId } = req.params;
        const token = await getActiveMercadoLivreToken();
        if (!token) {
            return res.status(400).json({ error: 'Token não configurado' });
        }
        const response = await fetch(`https://api.mercadolibre.com/users/${userId}/applications/${appId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro ao revogar autorização' });
        }
        const result = await response.json();
        res.json(result);
    }
    catch (error) {
        console.error('[ML Service] Erro:', error);
        res.status(500).json({ error: 'Erro ao revogar autorização' });
    }
}
/**
 * Obter métricas de consumo
 */
async function getMercadoLivreMetrics(req, res) {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        const { date_start, date_end } = req.query;
        const appId = process.env.MERCADO_LIVRE_APP_ID;
        const token = await getActiveMercadoLivreToken();
        if (!token) {
            return res.status(400).json({ error: 'Token não configurado' });
        }
        let url = `https://api.mercadolibre.com/applications/v1/${appId}/consumed-applications`;
        if (date_start || date_end) {
            const params = new URLSearchParams();
            if (date_start)
                params.append('date_start', date_start);
            if (date_end)
                params.append('date_end', date_end);
            url += `?${params.toString()}`;
        }
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro ao buscar métricas' });
        }
        const metrics = await response.json();
        res.json(metrics);
    }
    catch (error) {
        console.error('[ML Service] Erro:', error);
        res.status(500).json({ error: 'Erro ao obter métricas' });
    }
}
export default router;
//# sourceMappingURL=integrationsRoutes.js.map