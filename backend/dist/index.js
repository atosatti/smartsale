import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import mercadoLivreRoutes from './routes/mercadoLivreRoutes.js';
import mlSearchRoutes from './routes/mlSearchRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import integrationsRoutes from './routes/integrationsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/auth.js';
import { runMigrations } from './utils/runMigrations.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const app = express();
const PORT = process.env.PORT || 3001;
// Middlewares - WEBHOOK precisa de body RAW ANTES de JSON parsing
// Route específico para webhook com body raw
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);
// Middlewares normais para outras rotas
app.use(helmet());
// CORS configuration - Accept both local and ngrok URLs
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'https://localhost',
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.NGROK_URL // Add ngrok URL from environment
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Check if origin is in allowed list or matches ngrok pattern
        if (allowedOrigins.includes(origin) || origin.includes('ngrok')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Error handler para body-parser (JSON parse errors)
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        console.error('[BodyParser Error]', err.message);
        return res.status(400).json({
            error: 'Invalid JSON in request body',
            details: err.message
        });
    }
    next(err);
});
// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true },
}));
// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
// Request logging middleware - Registra todas as requisições
app.use((req, res, next) => {
    const origin = req.get('origin') || 'no-origin';
    const timestamp = new Date().toISOString();
    // Log TODAS as requisições
    console.log(`[HTTP] ${timestamp} ${req.method} ${req.path}`);
    console.log(`[HTTP] Origin: ${origin}`);
    console.log(`[HTTP] URL Completa: ${req.method} ${req.originalUrl}`);
    // Log CORS headers response
    res.on('finish', () => {
        const corsHeader = res.get('Access-Control-Allow-Origin');
        console.log(`[HTTP] Response Status: ${res.statusCode}`);
        console.log(`[HTTP] CORS Header: ${corsHeader || 'NOT SET'}`);
    });
    next();
});
// TODO: Configure Passport strategies for OAuth (Google, Facebook)
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/mercado-livre', mercadoLivreRoutes);
app.use('/api/ml-search', mlSearchRoutes);
// Backwards compatibility routes (without /api prefix)
app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});
// Debug endpoint
app.get('/api/debug', (req, res) => {
    res.json({
        timestamp: new Date(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            DB_HOST: process.env.DB_HOST,
            DB_NAME: process.env.DB_NAME
        }
    });
});
// Error handling
app.use(errorHandler);
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
// Start server
const server = app.listen(PORT, async () => {
    // Run migrations on startup
    try {
        await runMigrations();
    }
    catch (error) {
        console.error('[LISTEN] Erro nas migrações:', error);
    }
    console.log(`[SERVER] Servidor SmartSale rodando em http://localhost:${PORT}`);
});
// Timeout para forçar listeners
setTimeout(() => { }, 60000);
// Listener de erro no servidor
server.on('error', (err) => {
    console.error('[SERVER-ERROR]', err.message);
    process.exit(1);
});
// Listener de close
server.on('close', () => { });
export default app;
//# sourceMappingURL=index.js.map