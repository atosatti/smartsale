import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import mysql from 'mysql2/promise';
import pool from '../config/database.js';
import { sendSubscriptionConfirmation, sendSubscriptionRenewal } from '../utils/emailNotifications.js';
import { sendSubscriptionConfirmation, sendSubscriptionRenewal } from '../utils/emailNotifications.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/stripe
 * Webhook para receber e processar eventos do Stripe
 */
router.post('/', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }try {
    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:}

    // Registrar webhook no banco (para auditoria)
    await logWebhookEvent(event);

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error(`❌ Erro ao processar webhook: ${error.message}`);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

/**
 * charge.succeeded - Cobrança bem-sucedida
 */
async function handleChargeSucceeded(charge: Stripe.Charge) {// Registrar no histórico de pagamentos
  const connection = await pool.getConnection();
  try {
    const customerId = charge.customer as string;

    // Encontrar usuário pelo stripe_customer_id
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE stripe_customer_id = ?',
      [customerId]
    );

    const user = (users as any[])[0];
    if (!user) {
      console.warn(`⚠️  Usuário não encontrado para customer: ${customerId}`);
      return;
    }

    // Inserir no payment_history
    await connection.execute(
      `INSERT INTO payment_history 
       (user_id, stripe_charge_id, stripe_invoice_id, amount, currency, 
        transaction_type, status, payment_method_type, card_last_4, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.id,
        charge.id,
        charge.invoice || null,
        charge.amount / 100, // Converter de cents para reais
        charge.currency?.toUpperCase() || 'BRL',
        'initial_charge',
        'succeeded',
        charge.payment_method_details?.card?.wallet ? 'wallet' : 'card',
        charge.payment_method_details?.card?.last4 || null,
        charge.description || 'Pagamento Stripe',
      ]
    );} finally {
    connection.release();
  }
}

/**
 * charge.failed - Cobrança falhada
 */
async function handleChargeFailed(charge: Stripe.Charge) {const connection = await pool.getConnection();
  try {
    const customerId = charge.customer as string;

    const [users] = await connection.execute(
      'SELECT id FROM users WHERE stripe_customer_id = ?',
      [customerId]
    );

    const user = (users as any[])[0];
    if (!user) return;

    // Registrar falha
    await connection.execute(
      `INSERT INTO payment_history 
       (user_id, stripe_charge_id, amount, currency, transaction_type, 
        status, failure_reason, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.id,
        charge.id,
        charge.amount / 100,
        charge.currency?.toUpperCase() || 'BRL',
        'initial_charge',
        'failed',
        charge.failure_message || 'Falha desconhecida',
        'Pagamento falhou',
      ]
    );} finally {
    connection.release();
  }
}

/**
 * invoice.payment_succeeded - Fatura paga com sucesso
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const connection = await pool.getConnection();
  try {
    const customerId = invoice.customer as string;

    const [users] = await connection.execute(
      'SELECT id, email, first_name FROM users WHERE stripe_customer_id = ?',
      [customerId]
    );

    const user = (users as any[])[0];
    if (!user) return;

    // Atualizar status da fatura no banco
    await connection.execute(
      `UPDATE invoices SET status = 'paid', paid_at = NOW() 
       WHERE stripe_invoice_id = ?`,
      [invoice.id]
    );

    // 📧 Se é uma renovação (não é a primeira), enviar recibo com detalhes
    if (invoice.billing_reason === 'subscription_cycle' || invoice.attempt > 1) {
      try {
        const planName = invoice.lines.data[0]?.description || 'Plan';
        const planPrice = (invoice.lines.data[0]?.price?.unit_amount || 0) / 100;
        const nextBillingDate = new Date((invoice.next_payment_attempt || (Date.now() / 1000 + 2592000)) * 1000);

        sendSubscriptionRenewal(
          user.email,
          user.first_name || 'Usuário',
          planName,
          planPrice,
          invoice.id,
          new Date(invoice.created * 1000).toISOString(),
          nextBillingDate.toISOString(),
          'mensal'
        ).catch(err => console.error('❌ Erro ao enviar recibo:', err));
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de renovação:', emailError);
      }
    }
  } finally {
    connection.release();
  }
}

/**
 * invoice.payment_failed - Falha ao pagar fatura
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {const connection = await pool.getConnection();
  try {
    const customerId = invoice.customer as string;

    const [users] = await connection.execute(
      'SELECT id, email FROM users WHERE stripe_customer_id = ?',
      [customerId]
    );

    const user = (users as any[])[0];
    if (!user) return;

    // Atualizar status da assinatura para past_due
    await connection.execute(
      `UPDATE users SET subscription_status = 'past_due' 
       WHERE stripe_customer_id = ?`,
      [customerId]
    );} finally {
    connection.release();
  }
}

/**
 * customer.subscription.created - Nova assinatura criada
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const connection = await pool.getConnection();
  try {
    const customerId = subscription.customer as string;

    const [users] = await connection.execute(
      'SELECT id, email, first_name FROM users WHERE stripe_customer_id = ?',
      [customerId]
    );

    const user = (users as any[])[0];
    if (!user) return;

    // Inserir assinatura no banco
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const planPrice = (subscription.items.data[0]?.price.unit_amount || 0) / 100;
    const planName = subscription.metadata?.plan_name || 'Plan';

    await connection.execute(
      `INSERT INTO subscriptions 
       (user_id, stripe_subscription_id, plan, plan_name, plan_price, 
        status, current_period_start, current_period_end, billing_cycle_anchor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.id,
        subscription.id,
        subscription.metadata?.plan || 'basic',
        planName,
        planPrice,
        'active',
        currentPeriodStart,
        currentPeriodEnd,
        new Date(subscription.billing_cycle_anchor * 1000),
      ]
    );

    // Atualizar usuário
    await connection.execute(
      `UPDATE users 
       SET stripe_subscription_id = ?, subscription_plan = ?, 
           subscription_status = 'active', subscription_start_date = NOW()
       WHERE id = ?`,
      [subscription.id, subscription.metadata?.plan || 'basic', user.id]
    );

    // 📧 Enviar email de confirmação de assinatura
    try {
      const invoiceId = subscription.latest_invoice || subscription.id;
      sendSubscriptionConfirmation(
        user.email,
        user.first_name || 'Usuário',
        planName,
        planPrice,
        'mensal',
        String(invoiceId)
      ).catch(err => console.error('❌ Erro ao enviar confirmação:', err));
    } catch (emailError) {
      console.error('❌ Erro ao enviar email de confirmação:', emailError);
    }
  } finally {
    connection.release();
  }
}

/**
 * customer.subscription.updated - Assinatura atualizada
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {const connection = await pool.getConnection();
  try {
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await connection.execute(
      `UPDATE subscriptions 
       SET status = ?, current_period_start = ?, current_period_end = ?, updated_at = NOW()
       WHERE stripe_subscription_id = ?`,
      [subscription.status, currentPeriodStart, currentPeriodEnd, subscription.id]
    );} finally {
    connection.release();
  }
}

/**
 * customer.subscription.deleted - Assinatura cancelada
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {const connection = await pool.getConnection();
  try {
    // Atualizar subscription
    await connection.execute(
      `UPDATE subscriptions 
       SET status = 'canceled', canceled_at = NOW(), ended_at = NOW()
       WHERE stripe_subscription_id = ?`,
      [subscription.id]
    );

    // Atualizar usuário
    const customerId = subscription.customer as string;
    await connection.execute(
      `UPDATE users 
       SET subscription_status = 'canceled', subscription_plan = 'free'
       WHERE stripe_customer_id = ?`,
      [customerId]
    );} finally {
    connection.release();
  }
}

/**
 * Registrar webhook no banco para auditoria
 */
async function logWebhookEvent(event: Stripe.Event) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `INSERT INTO webhook_logs (stripe_event_id, event_type, stripe_object_id, payload, processed, processed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        event.id,
        event.type,
        (event.data.object as any)?.id || null,
        JSON.stringify(event.data),
        true,
      ]
    );
  } finally {
    connection.release();
  }
}

export default router;
