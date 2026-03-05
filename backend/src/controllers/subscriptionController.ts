import { Request, Response } from 'express';
import pool from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const PLANS = {
  free: { 
    name: 'free',
    display_name: 'Gratuito', 
    monthly_price: 0, 
    price_cents: 0,
    features: ['5 buscas/dia', 'Resultados básicos'] 
  },
  basic: { 
    name: 'basic',
    display_name: 'Básico', 
    monthly_price: 9.99, 
    price_cents: 999,
    features: ['50 buscas/dia', 'Resultados detalhados'] 
  },
  premium: { 
    name: 'premium',
    display_name: 'Premium', 
    monthly_price: 29.99, 
    price_cents: 2999,
    features: ['Buscas ilimitadas', 'Filtros avançados'] 
  },
  enterprise: { 
    name: 'enterprise',
    display_name: 'Enterprise', 
    monthly_price: 99.99, 
    price_cents: 9999,
    features: ['Buscas ilimitadas', 'Acesso à API', 'Suporte prioritário'] 
  },
};

export const getPlans = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      plans: PLANS,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
};

export const createSubscription = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId, paymentMethodId } = req.body;

    if (!planId || !paymentMethodId) {
      return res
        .status(400)
        .json({ error: 'Plan ID and payment method required' });
    }

    // Get user's Stripe customer or create one
    const [users] = await pool.query(
      'SELECT stripe_customer_id FROM users WHERE id = ?',
      [req.user.id]
    );
    let customerId = (users as any[])[0]?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
      });
      customerId = customer.id;

      await pool.query(
        'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
        [customerId, req.user.id]
      );
    }

    // Create subscription (simplified - production needs more logic)
    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Update user's plan in database
    await pool.query(
      'UPDATE users SET subscription_plan = ? WHERE id = ?',
      [planId, req.user.id]
    );

    res.status(200).json({
      message: 'Subscription updated successfully',
      plan: planId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

export const cancelSubscription = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Update user's plan back to free
    await pool.query(
      'UPDATE users SET subscription_plan = ? WHERE id = ?',
      ['free', req.user.id]
    );

    res.status(200).json({
      message: 'Subscription cancelled',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

export const getUserSubscription = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [users] = await pool.query(
      'SELECT id, email, subscription_plan, subscription_status, subscription_start_date, subscription_end_date FROM users WHERE id = ?',
      [req.user.id]
    );
    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Buscar subscription ativa de verdade
    const [subscriptions] = await pool.query(
      `SELECT id, plan, status, cancel_at_period_end, canceled_at, current_period_end, plan_price
       FROM subscriptions 
       WHERE user_id = ? AND status IN ('active', 'pending', 'trialing', 'past_due')
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    const subscription = (subscriptions as any[])[0];
    
    // Determinar status baseado na subscription real
    let actualStatus = user.subscription_status || 'free';
    let canceledAt = null;
    let cancelDate = null;
    let planPrice = null;
    let currentPeriodEnd = null;

    if (subscription) {
      // Se tem subscription e está marcada para cancelamento
      if (subscription.cancel_at_period_end) {
        actualStatus = 'pending_cancellation'; // Status especial para mostrar botão de reativar
        canceledAt = subscription.canceled_at;
        currentPeriodEnd = subscription.current_period_end;
        planPrice = subscription.plan_price;
      } else if (subscription.status === 'active') {
        actualStatus = user.subscription_status || subscription.plan;
        currentPeriodEnd = subscription.current_period_end;
        planPrice = subscription.plan_price;
      }
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      subscription_plan: user.subscription_plan || 'free',
      subscription_status: actualStatus,
      subscription_start_date: user.subscription_start_date,
      subscription_end_date: user.subscription_end_date,
      canceled_at: canceledAt,
      current_period_end: currentPeriodEnd,
      plan_price: planPrice,
      plan_details: PLANS[user.subscription_plan as keyof typeof PLANS],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
};

/**
 * POST /api/subscriptions/reactivate
 * Reativar assinatura cancelada
 */
export const reactivateSubscription = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connection = await pool.getConnection();

    try {
      // Buscar subscription marcada para cancelamento
      const [subscriptions] = await connection.execute(
        `SELECT id, stripe_subscription_id, plan 
         FROM subscriptions 
         WHERE user_id = ? AND cancel_at_period_end = true AND status = 'active'
         LIMIT 1`,
        [req.user.id]
      );

      const subscription = (subscriptions as any[])[0];
      if (!subscription) {
        return res.status(404).json({ error: 'Nenhum cancelamento pendente encontrado' });
      }

      // Remover flag de cancelamento
      await connection.execute(
        `UPDATE subscriptions 
         SET cancel_at_period_end = false, canceled_at = NULL
         WHERE id = ?`,
        [subscription.id]
      );

      // Tentar atualizar no Stripe também
      if (subscription.stripe_subscription_id) {
        try {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
          });
          
          await (stripe.subscriptions as any).update(
            subscription.stripe_subscription_id,
            { cancel_at_period_end: false }
          );
        } catch (e) {
          console.warn('⚠️ Aviso: Erro ao atualizar Stripe na reativação:', e);
          // Não falhar por causa do Stripe
        }
      }

      res.status(200).json({
        success: true,
        message: 'Assinatura reativada com sucesso!',
        plan: subscription.plan,
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('❌ Erro ao reativar assinatura:', error);
    res.status(500).json({ error: 'Erro ao reativar assinatura' });
  }
};
