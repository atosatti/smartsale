import Stripe from 'stripe';
import pool from '../config/database.js';
import { notifyAdminCancellation, confirmCancellationToUser } from '../utils/emailNotifications.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
/**
 * POST /api/payments/create-payment-intent
 * Criar intent de pagamento para assinar plano
 */
export async function createPaymentIntent(req, res) {
    try {
        const { planId, planName, amount, email, name, invoiceData } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        if (!planId || !amount) {
            return res.status(400).json({ error: 'Plano ou valor inválido' });
        }
        // Log para debug
        console.log(`💰 createPaymentIntent - planId: ${planId}, amount: ${amount}, type: ${typeof amount}`);
        const connection = await pool.getConnection();
        try {
            // Buscar usuário
            const [users] = await connection.execute('SELECT id, stripe_customer_id, email FROM users WHERE id = ?', [userId]);
            const user = users[0];
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            let customerId = user.stripe_customer_id;
            // Criar cliente Stripe se não existir
            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: email || user.email,
                    name: name,
                    metadata: {
                        userId: String(userId),
                    },
                });
                customerId = customer.id;
                // Salvar stripe_customer_id
                await connection.execute('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, userId]);
            }
            // Preparar metadata com dados da fatura
            const metadata = {
                userId: String(userId),
                planId,
                planName,
            };
            // Adicionar dados da fatura se fornecidos
            if (invoiceData) {
                metadata.invoiceType = invoiceData.personType;
                if (invoiceData.personType === 'pf') {
                    metadata.invoiceFullName = invoiceData.fullName;
                    metadata.invoiceCPF = invoiceData.cpf;
                }
                else {
                    metadata.invoiceCompanyName = invoiceData.companyName;
                    metadata.invoiceCNPJ = invoiceData.cnpj;
                }
                metadata.invoiceAddress = invoiceData.address;
                metadata.invoiceCity = invoiceData.city;
                metadata.invoiceState = invoiceData.state;
                metadata.invoiceZipCode = invoiceData.zipCode;
            }
            // Criar PaymentIntent com metadata
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount), // Já em cents
                currency: 'brl',
                customer: customerId,
                metadata,
                description: `Assinatura ${planName} - SmartSale`,
            });
            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                customerId,
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao criar payment intent:', error);
        res.status(500).json({
            error: error.message || 'Erro ao processar pagamento',
        });
    }
}
/**
 * POST /api/payments/confirm-payment
 * Confirmar pagamento após cliente pagar
 */
export async function confirmPayment(req, res) {
    try {
        const { paymentIntentId, planId, planName } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        if (!paymentIntentId || !planId) {
            return res.status(400).json({ error: 'paymentIntentId e planId são obrigatórios' });
        }
        const connection = await pool.getConnection();
        try {
            // Buscar PaymentIntent no Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                console.error(`Pagamento não confirmado: ${paymentIntent.status}`);
                return res.status(400).json({
                    error: 'Pagamento não foi confirmado',
                    status: paymentIntent.status,
                });
            }
            // Atualizar usuário com novo plano
            const now = new Date();
            const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            const updateResult = await connection.execute(`UPDATE users 
         SET subscription_plan = ?, subscription_status = 'active',
             subscription_start_date = NOW(), subscription_end_date = ?
         WHERE id = ?`, [planId, nextMonth, userId]);
            // Registrar pagamento
            const charges = paymentIntent.charges?.data || [];
            const charge = charges[0];
            // Extrair informações do paymentIntent e charge
            // Se não houver no array, usar latest_charge
            const stripeChargeId = charge?.id || paymentIntent.latest_charge || null;
            let stripeInvoiceId = paymentIntent.invoice || null;
            // Extrair informações do cartão
            const stripePaymentMethodId = paymentIntent.payment_method;
            let lastFour = null;
            let cardBrand = null;
            let cardExpMonth = null;
            let cardExpYear = null;
            if (charge?.payment_method_details?.card?.last4) {
                lastFour = charge.payment_method_details.card.last4;
                cardBrand = charge.payment_method_details.card.brand;
                cardExpMonth = charge.payment_method_details.card.exp_month;
                cardExpYear = charge.payment_method_details.card.exp_year;
            }
            else if (paymentIntent.payment_method_details?.card?.last4) {
                lastFour = paymentIntent.payment_method_details.card.last4;
                cardBrand = paymentIntent.payment_method_details.card.brand;
                cardExpMonth = paymentIntent.payment_method_details.card.exp_month;
                cardExpYear = paymentIntent.payment_method_details.card.exp_year;
            }
            else if (stripePaymentMethodId) {
                // Se ainda não temos, tentar buscar do payment_method
                try {
                    const paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);
                    lastFour = paymentMethod.card?.last4 || null;
                    cardBrand = paymentMethod.card?.brand || null;
                    cardExpMonth = paymentMethod.card?.exp_month || null;
                    cardExpYear = paymentMethod.card?.exp_year || null;
                }
                catch (e) {
                    console.error('⚠️ Erro ao buscar payment method:', e);
                }
            }
            // Salvar payment method na tabela payment_methods
            let paymentMethodDbId = null;
            if (stripePaymentMethodId && lastFour) {
                try {
                    const [existingMethod] = await connection.execute('SELECT id FROM payment_methods WHERE stripe_payment_method_id = ?', [stripePaymentMethodId]);
                    if (existingMethod.length > 0) {
                        paymentMethodDbId = existingMethod[0].id;
                    }
                    else {
                        // Criar novo payment method
                        const [result] = await connection.execute(`INSERT INTO payment_methods 
               (user_id, stripe_payment_method_id, type, card_brand, card_last_4, card_exp_month, card_exp_year)
               VALUES (?, ?, ?, ?, ?, ?, ?)`, [userId, stripePaymentMethodId, 'card', cardBrand, lastFour, cardExpMonth, cardExpYear]);
                        paymentMethodDbId = result.insertId;
                    }
                }
                catch (e) {
                    console.error('⚠️ Erro ao salvar payment method:', e);
                }
            }
            // Billing period: início agora, fim em 30 dias
            const billingPeriodStart = new Date();
            const billingPeriodEnd = new Date(billingPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
            // Gerar invoice_number único
            const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            // Se houver dados da fatura, criar invoice no Stripe
            if (paymentIntent.metadata?.invoiceType) {
                try {
                    const metadata = paymentIntent.metadata;
                    // Criar invoice no Stripe
                    const invoice = await stripe.invoices.create({
                        customer: paymentIntent.customer,
                        description: `Fatura - Assinatura ${planName || planId}`,
                        auto_advance: false,
                        metadata: {
                            userId: String(userId),
                            planId,
                            invoiceType: metadata.invoiceType,
                            invoiceNumber,
                        },
                    });
                    stripeInvoiceId = invoice.id;
                    // Salvar invoice na tabela invoices se fornecidos dados completos
                    let personName = '';
                    if (metadata.invoiceType === 'pf') {
                        personName = metadata.invoiceFullName || '';
                    }
                    else {
                        personName = metadata.invoiceCompanyName || '';
                    }
                    if (personName) {
                        await connection.execute(`INSERT INTO invoices 
               (user_id, stripe_invoice_id, invoice_number, issue_date, due_date, total, status)
               VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), ?, 'open')`, [userId, stripeInvoiceId, invoiceNumber, paymentIntent.amount / 100]);
                    }
                }
                catch (e) {
                    console.error('⚠️ Aviso: Erro ao criar invoice no Stripe:', e);
                    // Não falhar o pagamento se a invoice não for criada
                }
            }
            await connection.execute(`INSERT INTO payment_history 
         (user_id, stripe_charge_id, stripe_invoice_id, stripe_payment_intent_id, 
          amount, currency, transaction_type, status, payment_method_id, payment_method_type, 
          card_last_4, billing_period_start, billing_period_end, 
          invoice_number, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
                userId,
                stripeChargeId,
                stripeInvoiceId,
                paymentIntentId,
                paymentIntent.amount / 100,
                paymentIntent.currency.toUpperCase(),
                'initial_charge',
                'succeeded',
                paymentMethodDbId,
                'card',
                lastFour,
                billingPeriodStart,
                billingPeriodEnd,
                invoiceNumber,
                `Assinatura ${planName || planId}`,
            ]);
            res.status(200).json({
                success: true,
                message: 'Pagamento confirmado com sucesso!',
                plan: planId,
                invoiceId: stripeInvoiceId,
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao confirmar pagamento:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: error.message || 'Erro ao confirmar pagamento',
        });
    }
}
/**
 * POST /api/payments/cancel-subscription
 * Cancelar assinatura do usuário
 */
/**
 * POST /api/payments/cancel-subscription
 * Cancelar assinatura do usuário (agendado para final do período)
 */
export async function cancelSubscription(req, res) {
    try {
        const userId = req.user?.id;
        const { reason, details, improvements, wouldReturn } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        const connection = await pool.getConnection();
        try {
            // Buscar usuário e assinatura
            const [users] = await connection.execute('SELECT id, email FROM users WHERE id = ?', [userId]);
            const user = users[0];
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            // Buscar assinatura ativa (ou mais recente se não houver ativa)
            const [subscriptions] = await connection.execute(`SELECT id, stripe_subscription_id, status, plan 
         FROM subscriptions 
         WHERE user_id = ? AND status IN ("active", "pending", "trialing")
         ORDER BY created_at DESC 
         LIMIT 1`, [userId]);
            const subscription = subscriptions[0];
            if (!subscription) {
                // Tentar buscar qualquer assinatura do usuário para debug
                const [allSubs] = await connection.execute('SELECT id, status, plan FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);
                console.log(`⚠️ Nenhuma assinatura ativa encontrada para user ${userId}. Assinaturas encontradas:`, allSubs);
                return res.status(404).json({
                    error: 'Nenhuma assinatura ativa encontrada',
                    debug: `Usuário tem ${allSubs.length} assinatura(s)`
                });
            }
            if (!subscription.stripe_subscription_id) {
                return res.status(404).json({ error: 'Assinatura não tem ID do Stripe' });
            }
            // Salvar feedback de cancelamento
            const [feedbackResult] = await connection.execute(`INSERT INTO cancellation_feedback 
         (user_id, subscription_id, reason, details, improvements, would_return, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`, [userId, subscription.id, reason || '', details || '', improvements || '', wouldReturn === true ? 1 : (wouldReturn === false ? 0 : null)]);
            const feedbackId = feedbackResult.insertId;
            // Agendar cancelamento para o final do período (cancel_at_period_end)
            // NÃO cancelar imediatamente, mas marcar que será cancelado ao final
            await connection.execute(`UPDATE subscriptions 
         SET cancel_at_period_end = true, canceled_at = NOW()
         WHERE id = ?`, [subscription.id]);
            // Atualizar flag no Stripe também
            try {
                await stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true });
            }
            catch (e) {
                console.error('⚠️ Aviso: Erro ao atualizar no Stripe:', e);
            }
            // Salvar referência ao feedback no usuário
            await connection.execute(`UPDATE users SET cancellation_feedback_id = ? WHERE id = ?`, [feedbackId, userId]);
            // Enviar emails
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30); // Aproximadamente 30 dias
            const formattedDate = endDate.toLocaleDateString('pt-BR');
            // Email ao admin
            await notifyAdminCancellation(user.email, reason || '', details || '', improvements || '', wouldReturn, feedbackId);
            // Email ao usuário
            await confirmCancellationToUser(user.email, formattedDate);
            res.status(200).json({
                success: true,
                message: 'Sua assinatura será cancelada ao final do período de faturamento',
                feedbackId,
                endDate: formattedDate,
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao cancelar assinatura:', error);
        res.status(500).json({
            error: error.message || 'Erro ao cancelar assinatura',
        });
    }
}
/**
 * GET /api/payments/history
 * Histórico de pagamentos do usuário
 */
export async function getPaymentHistory(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        const connection = await pool.getConnection();
        try {
            const [payments] = await connection.execute(`SELECT id, amount, currency, status, transaction_type, 
                created_at, card_last_4, description
         FROM payment_history
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`, [userId]);
            res.status(200).json({
                success: true,
                data: payments,
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar histórico de pagamentos',
        });
    }
}
/**
 * GET /api/payments/history
 * Buscar histórico de pagamentos do Stripe
 */
export async function getStripePaymentHistory(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        const connection = await pool.getConnection();
        try {
            // Buscar pagamentos da tabela payment_history (source of truth)
            const [payments] = await connection.execute(`SELECT 
          id, 
          amount, 
          currency, 
          status, 
          created_at, 
          description, 
          stripe_charge_id,
          stripe_invoice_id,
          invoice_number
         FROM payment_history
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 100`, [userId]);
            // Formatar dados para o frontend
            const formattedPayments = payments.map((payment) => ({
                id: payment.stripe_charge_id || payment.id,
                amount: payment.amount,
                currency: payment.currency || 'BRL',
                status: payment.status || 'pending',
                created: payment.created_at,
                description: payment.description || 'Pagamento de assinatura',
                invoice_url: payment.stripe_invoice_id
                    ? `https://invoice.stripe.com/i/${payment.stripe_invoice_id}/pdf`
                    : undefined,
            }));
            res.status(200).json({
                payments: formattedPayments,
            });
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('❌ Erro ao buscar histórico de pagamentos:', error);
        res.status(500).json({
            error: error.message || 'Erro ao buscar histórico de pagamentos',
        });
    }
}
//# sourceMappingURL=paymentController.js.map