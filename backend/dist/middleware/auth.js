import { verifyToken } from '../utils/jwt.js';
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
};
/**
 * Middleware de autenticação opcional
 * Tenta extrair o usuário do token, mas não bloqueia se não houver
 */
export const optionalAuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }
    next();
};
/**
 * Middleware para verificar se a assinatura está ativa e não expirada
 * Bloqueia buscas se assinatura foi cancelada e o período expirou
 */
export const subscriptionActiveMiddleware = async (req, res, next) => {
    try {
        // Se não tem usuário autenticado, permite passar
        // (será verificado por authMiddleware se necessário)
        if (!req.user?.id) {
            return next();
        }
        // Importar pool aqui para evitar circular dependency
        const pool = (await import('../config/database.js')).default;
        const connection = await pool.getConnection();
        try {
            // Buscar assinatura ativa do usuário
            const [subscriptions] = await connection.execute(`SELECT id, cancel_at_period_end, canceled_at, current_period_end, status
         FROM subscriptions
         WHERE user_id = ? AND status = 'active'
         ORDER BY created_at DESC
         LIMIT 1`, [req.user.id]);
            const subscription = subscriptions[0];
            // Se não tem assinatura, redirecionado para free (permite)
            if (!subscription) {
                return next();
            }
            // Se assinatura está marcada para cancelamento
            if (subscription.cancel_at_period_end) {
                const now = new Date();
                const periodEnd = new Date(subscription.current_period_end);
                // Se período já expirou, bloqueia acesso
                if (now > periodEnd) {
                    console.log(`🔒 Acesso bloqueado: Assinatura do usuário ${req.user.id} expirou em ${periodEnd}`);
                    return res.status(403).json({
                        error: 'Acesso bloqueado',
                        message: 'Sua assinatura foi cancelada e o período de acesso expirou. Para continuar usando o SmartSale, faça uma nova assinatura.',
                        expiredAt: periodEnd.toISOString(),
                        action: 'upgrade_plan', // Frontend deve redirecionar para /plans
                    });
                }
            }
            next();
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro em subscriptionActiveMiddleware:', error);
        // Não falhar por causa do middleware, deixa passar
        next();
    }
};
export const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
};
//# sourceMappingURL=auth.js.map