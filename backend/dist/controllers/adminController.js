import pool from '../config/database.js';
/**
 * Função auxiliar para registrar ações de admin no audit log
 */
const logAdminAction = async (adminUserId, targetUserId, action, resourceType, changes = null, req) => {
    try {
        const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
        const userAgent = req?.get('user-agent') || null;
        await pool.query(`INSERT INTO admin_audit_logs 
       (admin_user_id, target_user_id, action, resource_type, changes, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            adminUserId,
            targetUserId,
            action,
            resourceType,
            changes ? JSON.stringify(changes) : null,
            ipAddress,
            userAgent
        ]);
    }
    catch (error) {
        console.error('Error logging admin action:', error);
        // Não lance erro - logging não deve bloquear operações
    }
};
/**
 * GET /admin/users
 * Lista todos os usuários do sistema
 */
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const role = req.query.role;
        const status = req.query.status;
        const offset = (page - 1) * limit;
        // Construir query com filtros
        let query = `
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        is_active,
        is_verified,
        two_fa_enabled,
        subscription_plan,
        subscription_status,
        created_at,
        last_login,
        stripe_customer_id
      FROM users
      WHERE 1=1
    `;
        const params = [];
        if (search) {
            query += ` AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (role) {
            query += ` AND role = ?`;
            params.push(role);
        }
        if (status === 'active') {
            query += ` AND is_active = true`;
        }
        else if (status === 'inactive') {
            query += ` AND is_active = false`;
        }
        // Query para total de registros
        const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE 1=1 ${search ? 'AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)' : ''} ${role ? 'AND role = ?' : ''} ${status === 'active' ? 'AND is_active = true' : ''} ${status === 'inactive' ? 'AND is_active = false' : ''}`, params);
        const total = countResult[0].total;
        // Query para usuários
        const [users] = await pool.query(query + ` ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        await logAdminAction(req.user.id, null, 'list', 'users', { filters: { search, role, status }, page, limit }, req);
        res.json({
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * GET /admin/users/:userId
 * Obtém detalhes completos de um usuário específico
 */
export const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.userId;
        // Validar se é número válido
        if (!Number.isInteger(Number(userId))) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const [userResult] = await pool.query(`
      SELECT 
        users.*,
        COALESCE(COUNT(DISTINCT search_logs.id), 0) as total_searches,
        COALESCE(COUNT(DISTINCT products.id), 0) as total_products,
        COALESCE(COUNT(DISTINCT subscriptions.id), 0) as subscription_count
      FROM users
      LEFT JOIN search_logs ON users.id = search_logs.user_id
      LEFT JOIN products ON users.id = products.user_id
      LEFT JOIN subscriptions ON users.id = subscriptions.user_id
      WHERE users.id = ?
      GROUP BY users.id
      `, [userId]);
        if (userResult.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userResult[0];
        // Obter pagamentos e histórico
        const [payments] = await pool.query(`
      SELECT id, amount, currency, status, created_at
      FROM payment_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
      `, [userId]);
        // Obter assinaturas
        const [subscriptions] = await pool.query(`
      SELECT id, plan, status, current_period_start, current_period_end, created_at
      FROM subscriptions
      WHERE user_id = ?
      ORDER BY created_at DESC
      `, [userId]);
        // Limpar dados sensíveis
        const safeUser = {
            ...user,
            password: undefined,
            two_fa_secret: undefined,
            google_id: undefined,
            facebook_id: undefined,
            mercado_livre_token: undefined,
            mercado_livre_refresh_token: undefined
        };
        await logAdminAction(req.user.id, parseInt(userId), 'view_details', 'user', null, req);
        res.json({
            user: safeUser,
            payments,
            subscriptions
        });
    }
    catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            error: 'Failed to fetch user details',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * PUT /admin/users/:userId
 * Atualiza informações de um usuário
 */
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { role, is_active, admin_notes, subscription_plan } = req.body;
        // Validar se é número válido
        if (!Number.isInteger(Number(userId))) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Validar campos permitidos
        const allowedUpdates = ['role', 'is_active', 'admin_notes', 'subscription_plan'];
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        // Validar valores
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        if (typeof is_active !== 'undefined' && typeof is_active !== 'boolean') {
            return res.status(400).json({ error: 'is_active must be boolean' });
        }
        // Construir query dinâmica
        const setClause = updates.map(field => `${field} = ?`).join(', ');
        const values = updates.map(field => req.body[field]);
        // Obter valores anteriores para audit
        const [oldUser] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (oldUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Registrar mudanças
        const changes = {};
        updates.forEach(field => {
            changes[field] = {
                from: oldUser[0][field],
                to: req.body[field]
            };
        });
        // Executar atualização
        await pool.query(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, userId]);
        // Log de auditoria
        await logAdminAction(req.user.id, parseInt(userId), 'update', 'user', changes, req);
        res.json({ message: 'User updated successfully', changes });
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            error: 'Failed to update user',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * DELETE /admin/users/:userId
 * Soft delete de um usuário (marca como inativo)
 */
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { hardDelete = false } = req.body;
        if (!Number.isInteger(Number(userId))) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Validar que não está deletando a si mesmo
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (hardDelete) {
            // Hard delete - remover completamente (requer confirmação adicional)
            await pool.query('DELETE FROM users WHERE id = ?', [userId]);
            await logAdminAction(req.user.id, parseInt(userId), 'hard_delete', 'user', null, req);
        }
        else {
            // Soft delete - apenas marcar como inativo
            await pool.query('UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
            await logAdminAction(req.user.id, parseInt(userId), 'soft_delete', 'user', null, req);
        }
        res.json({ message: 'User deleted successfully', hardDelete });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: 'Failed to delete user',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * GET /admin/users/:userId/activity
 * Obtém histórico de atividades de um usuário
 */
export const getUserActivity = async (req, res) => {
    try {
        const userId = req.params.userId;
        const limit = parseInt(req.query.limit) || 50;
        if (!Number.isInteger(Number(userId))) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Verificar se usuário existe
        const [userExists] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (userExists.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Obter buscas recentes
        const [searches] = await pool.query(`
      SELECT 'search' as type, search_query as description, created_at
      FROM search_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      `, [userId, limit]);
        // Obter pagamentos recentes
        const [payments] = await pool.query(`
      SELECT 'payment' as type, CONCAT('Payment of ', amount, ' ', currency) as description, created_at
      FROM payment_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      `, [userId, limit]);
        // Combinar e ordenar
        const activity = [...searches, ...payments]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
        await logAdminAction(req.user.id, parseInt(userId), 'view_activity', 'user', null, req);
        res.json({ activity });
    }
    catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({
            error: 'Failed to fetch user activity',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * GET /admin/audit-logs
 * Obtém logs de auditoria das ações de admin
 */
export const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const adminId = req.query.adminId;
        const action = req.query.action;
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM admin_audit_logs WHERE 1=1';
        const params = [];
        if (adminId) {
            query += ' AND admin_user_id = ?';
            params.push(adminId);
        }
        if (action) {
            query += ' AND action = ?';
            params.push(action);
        }
        // Total
        const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM admin_audit_logs WHERE 1=1 ${adminId ? 'AND admin_user_id = ?' : ''} ${action ? 'AND action = ?' : ''}`, params);
        const total = countResult[0].total;
        // Logs
        const [logs] = await pool.query(query + ` ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        res.json({
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            error: 'Failed to fetch audit logs',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * GET /admin/dashboard
 * Retorna estatísticas do dashboard
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Total de usuários
        const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
        // Usuários ativos
        const [activeUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
        // Usuários com 2FA
        const [twoFAUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE two_fa_enabled = true');
        // Verificados
        const [verifiedUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = true');
        // Por plan
        const [planBreakdown] = await pool.query(`
      SELECT subscription_plan, COUNT(*) as count
      FROM users
      GROUP BY subscription_plan
    `);
        // Receita total
        const [revenue] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment_history
      WHERE status IN ('succeeded', 'paid')
    `);
        // Últimas 30 dias
        const [revenueMonth] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment_history
      WHERE status IN ('succeeded', 'paid')
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
        res.json({
            users: {
                total: totalUsers[0].count,
                active: activeUsers[0].count,
                twoFA: twoFAUsers[0].count,
                verified: verifiedUsers[0].count,
                byPlan: planBreakdown
            },
            revenue: {
                total: revenue[0].total,
                lastMonth: revenueMonth[0].total
            }
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard stats',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * GET /admin/integrations/mercado-livre
 * Retorna informações sobre a integração do Mercado Livre do usuário logado
 */
export const getMercadoLivreIntegration = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const [users] = await pool.query(`SELECT 
        mercado_livre_token,
        mercado_livre_user_id,
        mercado_livre_refresh_token,
        mercado_livre_token_expires_at,
        mercado_livre_test_token,
        mercado_livre_test_user_id,
        created_at,
        updated_at
       FROM users WHERE id = ?`, [req.user.id]);
        const user = users[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verificar se tokens são válidos
        const now = new Date();
        const tokenExpiresAt = user.mercado_livre_token_expires_at ? new Date(user.mercado_livre_token_expires_at) : null;
        const isTokenExpired = tokenExpiresAt && tokenExpiresAt < now;
        const hasValidToken = !!user.mercado_livre_token && !isTokenExpired;
        const hasValidTestToken = !!user.mercado_livre_test_token;
        res.status(200).json({
            mainAccount: {
                connected: hasValidToken, // Usar hasValidToken em vez de !!user.mercado_livre_token
                userId: user.mercado_livre_user_id,
                tokenValid: hasValidToken,
                tokenExpiresAt: user.mercado_livre_token_expires_at,
                refreshToken: !!user.mercado_livre_refresh_token,
                lastUpdated: user.updated_at
            },
            testAccount: {
                created: !!user.mercado_livre_test_token,
                userId: user.mercado_livre_test_user_id,
                tokenValid: hasValidTestToken
            }
        });
    }
    catch (error) {
        console.error('Error fetching Mercado Livre integration:', error);
        res.status(500).json({
            error: 'Failed to fetch integration data',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * POST /admin/integrations/mercado-livre/refresh-token
 * Atualiza o token do Mercado Livre usando o refresh token
 */
export const refreshMercadoLivreToken = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const [users] = await pool.query(`SELECT mercado_livre_token, mercado_livre_refresh_token, mercado_livre_user_id FROM users WHERE id = ?`, [req.user.id]);
        const user = users[0];
        if (!user || !user.mercado_livre_token) {
            return res.status(400).json({
                error: 'No token available',
                message: 'Você precisa conectar sua conta do Mercado Livre primeiro'
            });
        }
        // Log detalhado// Se não tem refresh token, informar ao usuário que precisa reconectar
        if (!user.mercado_livre_refresh_token) {
            return res.status(400).json({
                error: 'Refresh token not available',
                message: 'Sua autorização expirou. Por favor, desconecte e conecte sua conta novamente no Mercado Livre.',
                action: 'reconnect'
            });
        } // Fazer requisição para refresh do token
        const response = await fetch('https://api.mercadolibre.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: process.env.MERCADO_LIVRE_APP_ID || '',
                client_secret: process.env.MERCADO_LIVRE_SECRET_KEY || '',
                refresh_token: user.mercado_livre_refresh_token
            })
        });
        if (!response.ok) {
            const error = await response.json();
            console.error('[ADMIN] Erro ao refresh token:', error);
            return res.status(400).json({
                error: 'Failed to refresh token',
                message: error.message || 'Falha ao renovar o token do Mercado Livre'
            });
        }
        const data = await response.json();
        const expiresAt = new Date(Date.now() + (data.expires_in * 1000));
        // Salvar novo token no banco
        await pool.query(`UPDATE users 
       SET mercado_livre_token = ?, 
           mercado_livre_refresh_token = ?,
           mercado_livre_token_expires_at = ?
       WHERE id = ?`, [data.access_token, data.refresh_token, expiresAt, req.user.id]);
        res.status(200).json({
            success: true,
            message: 'Token renovado com sucesso',
            expiresAt: expiresAt
        });
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({
            error: 'Failed to refresh token',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * POST /admin/integrations/mercado-livre/save-token
 * Salva o token do Mercado Livre após OAuth (callback)
 */
export const saveMercadoLivreToken = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { ml_token, ml_user_id, ml_refresh_token, ml_expires_in } = req.body;
        // Validar campos obrigatórios
        if (!ml_token || !ml_user_id) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'ml_token e ml_user_id são obrigatórios'
            });
        }
        const expiresAt = ml_expires_in ? new Date(Date.now() + (ml_expires_in * 1000)) : null;
        // Salvar token no banco
        await pool.query(`UPDATE users 
       SET mercado_livre_token = ?, 
           mercado_livre_user_id = ?,
           mercado_livre_refresh_token = ?,
           mercado_livre_token_expires_at = ?
       WHERE id = ?`, [ml_token, ml_user_id, ml_refresh_token || null, expiresAt, req.user.id]); // Log na auditoria
        await logAdminAction(req.user.id, req.user.id, 'save_token', 'mercado_livre_integration', {
            ml_user_id,
            hasRefreshToken: !!ml_refresh_token,
            expiresIn: ml_expires_in
        }, req);
        res.status(200).json({
            success: true,
            message: 'Token Mercado Livre salvo com sucesso',
            expiresAt
        });
    }
    catch (error) {
        console.error('Error saving Mercado Livre token:', error);
        res.status(500).json({
            error: 'Failed to save token',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * POST /admin/test-expire-subscription (DEV ONLY)
 * Atualiza current_period_end de uma assinatura para testar bloqueio
 * ⚠️ USE APENAS EM DESENVOLVIMENTO
 */
export const testExpireSubscription = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: 'Endpoint não disponível em produção'
            });
        }
        const { futureDate, userId } = req.body;
        const targetUserId = userId || req.user?.id;
        if (!targetUserId) {
            return res.status(400).json({
                error: 'Missing userId'
            });
        }
        if (!futureDate) {
            return res.status(400).json({
                error: 'Missing futureDate (ISO format)'
            });
        }
        // Verificar se é uma data válida
        const expiryDate = new Date(futureDate);
        if (isNaN(expiryDate.getTime())) {
            return res.status(400).json({
                error: 'Invalid date format. Use ISO format (YYYY-MM-DD)'
            });
        }
        // Encontrar e atualizar a subscription
        const connection = await pool.getConnection();
        try {
            const [subscriptions] = await connection.execute(`SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' LIMIT 1`, [targetUserId]);
            if (subscriptions.length === 0) {
                return res.status(404).json({
                    error: 'Subscription not found for this user'
                });
            }
            const subscriptionId = subscriptions[0].id;
            // Atualizar data de expiração
            await connection.execute(`UPDATE subscriptions 
         SET current_period_end = ?, 
             cancel_at_period_end = true,
             canceled_at = NOW()
         WHERE id = ?`, [expiryDate, subscriptionId]);
            await logAdminAction(req.user?.id || 0, targetUserId, 'test_expire_subscription', 'subscription', { futureDate: expiryDate.toISOString() }, req);
            res.status(200).json({
                success: true,
                message: 'Subscription atualizada para teste',
                userId: targetUserId,
                expiresAt: expiryDate.toISOString()
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('Error in testExpireSubscription:', error);
        res.status(500).json({
            error: 'Failed to update subscription',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
//# sourceMappingURL=adminController.js.map