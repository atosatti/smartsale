import nodemailer from 'nodemailer';
// Configurar transporte de email
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
// ========================================
// 1. WELCOME EMAIL - Criação de Conta
// ========================================
/**
 * Enviar email de boas-vindas ao usuário
 */
export async function sendWelcomeEmail(userEmail, userName) {
    try {
        const subject = '[SmartSale] Bem-vindo! Sua conta foi criada com sucesso';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          h2 { color: #667eea; }
          ul { margin: 15px 0; padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao SmartSale!</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Sua conta foi criada com sucesso no SmartSale! Agora você tem acesso a todas as nossas funcionalidades.</p>
            
            <h2>O que você pode fazer:</h2>
            <ul>
              <li>🔍 Pesquisar produtos em múltiplos e-commerce</li>
              <li>💰 Comparar preços e encontrar as melhores ofertas</li>
              <li>📊 Analisar tendências de mercado</li>
              <li>💾 Salvar produtos para análise posterior</li>
              <li>📱 Acompanhar preços em tempo real</li>
            </ul>
            
            <p>Para começar a usar o SmartSale, faça login na sua conta e escolha um plano que se adeque às suas necessidades.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://smartsale.com'}/login" class="button">
              Acessar SmartSale
            </a>
            
            <h3>Dúvidas?</h3>
            <p>Se tiver qualquer dúvida, consulte nossa <a href="${process.env.FRONTEND_URL || 'https://smartsale.com'}/docs">documentação</a> ou entre em contato com o suporte.</p>
            
            <p>Obrigado por se juntar ao SmartSale!</p>
            <p><strong>Equipe SmartSale</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 SmartSale. Todos os direitos reservados.</p>
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject,
            html,
        });
        console.log(`📧 Email de boas-vindas enviado para ${userEmail}`);
    }
    catch (error) {
        console.error('❌ Erro ao enviar email de boas-vindas:', error);
    }
}
// ========================================
// 2. SUBSCRIPTION CONFIRMATION - Assinatura
// ========================================
/**
 * Enviar confirmação de assinatura ao usuário
 */
export async function sendSubscriptionConfirmation(userEmail, userName, planName, planPrice, billingCycle = 'mensal', invoiceId) {
    try {
        const subject = '[SmartSale] Assinatura Confirmada - Bem-vindo ao Plano ' + planName;
        const currencySymbol = 'R$';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .plan-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .plan-name { font-size: 20px; font-weight: bold; color: #667eea; }
          .plan-price { font-size: 24px; color: #764ba2; margin: 10px 0; }
          .plan-detail { color: #666; margin: 8px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          h2 { color: #667eea; }
          .check { color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Assinatura Confirmada!</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Sua assinatura foi confirmada com sucesso! Obrigado por escolher o SmartSale.</p>
            
            <div class="plan-box">
              <div class="plan-name">${planName}</div>
              <div class="plan-price">${currencySymbol} ${planPrice.toFixed(2).replace('.', ',')}</div>
              <div class="plan-detail"><span class="check">✓</span> Renovação ${billingCycle}</div>
              ${invoiceId ? `<div class="plan-detail"><span class="check">✓</span> ID da Fatura: #${invoiceId}</div>` : ''}
            </div>
            
            <h2>O que está incluído:</h2>
            <ul>
              <li>✓ Acesso completo a todas as ferramentas</li>
              <li>✓ Pesquisa ilimitada de produtos</li>
              <li>✓ Comparação de preços em tempo real</li>
              <li>✓ Análise de tendências de mercado</li>
              <li>✓ Suporte por email</li>
            </ul>
            
            <h2>Próximos passos:</h2>
            <p>1. Faça login em sua conta</p>
            <p>2. Comece a pesquisar produtos</p>
            <p>3. Aproveite todas as funcionalidades!</p>
            
            <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              <strong>Dados da Assinatura:</strong><br>
              Email: ${userEmail}<br>
              Plano: ${planName}<br>
              ${invoiceId ? `Fatura: #${invoiceId}<br>` : ''}
            </p>
            
            <p style="margin-top: 20px;">
              Se tiver dúvidas, acesse nossa <a href="${process.env.FRONTEND_URL || 'https://smartsale.com'}/help">central de ajuda</a> ou entre em contato conosco.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2026 SmartSale. Todos os direitos reservados.</p>
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject,
            html,
        });
        console.log(`📧 Confirmação de assinatura enviada para ${userEmail}`);
    }
    catch (error) {
        console.error('❌ Erro ao enviar confirmação de assinatura:', error);
    }
}
// ========================================
// 3. SUBSCRIPTION RENEWAL + RECEIPT - Renovação com Recibo
// ========================================
/**
 * Enviar confirmação de renovação com recibo ao usuário
 */
export async function sendSubscriptionRenewal(userEmail, userName, planName, planPrice, invoiceId, invoiceDate, nextBillingDate, billingCycle = 'mensal') {
    try {
        const subject = '[SmartSale] Renovação da Assinatura - Seu Recibo #' + invoiceId;
        const currencySymbol = 'R$';
        const formattedDate = new Date(invoiceDate).toLocaleDateString('pt-BR');
        const formattedNextDate = new Date(nextBillingDate).toLocaleDateString('pt-BR');
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .receipt { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .receipt-header { border-bottom: 2px solid #667eea; padding-bottom: 15px; margin-bottom: 15px; }
          .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .receipt-total { font-size: 18px; font-weight: bold; color: #667eea; display: flex; justify-content: space-between; padding: 15px 0; }
          .label { color: #666; font-weight: bold; }
          .value { color: #333; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          h2 { color: #667eea; }
          .success { color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Renovação Confirmada!</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Sua assinatura foi renovada com sucesso! Abaixo está seu recibo detalhado.</p>
            
            <div class="receipt">
              <div class="receipt-header">
                <h2 style="margin: 0; color: #667eea;">RECIBO DE PAGAMENTO</h2>
                <p style="margin: 5px 0; color: #999;">Fatura #${invoiceId}</p>
              </div>
              
              <div class="receipt-row">
                <span class="label">Data da Renovação:</span>
                <span class="value">${formattedDate}</span>
              </div>
              
              <div class="receipt-row">
                <span class="label">Próximo Faturamento:</span>
                <span class="value">${formattedNextDate}</span>
              </div>
              
              <div class="receipt-row">
                <span class="label">Plano:</span>
                <span class="value">${planName}</span>
              </div>
              
              <div class="receipt-row">
                <span class="label">Ciclo de Pagamento:</span>
                <span class="value">${billingCycle}</span>
              </div>
              
              <div class="receipt-total">
                <span>TOTAL:</span>
                <span>${currencySymbol} ${planPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 15px;">
                O valor será cobrado automaticamente em ${formattedNextDate}.
              </p>
            </div>
            
            <h2>Seu acesso continua ativo</h2>
            <ul>
              <li><span class="success">✓</span> Pesquisa de produtos ilimitada</li>
              <li><span class="success">✓</span> Comparação de preços em tempo real</li>
              <li><span class="success">✓</span> Análise de tendências</li>
              <li><span class="success">✓</span> Suporte técnico</li>
            </ul>
            
            <p style="background: #e7f3ff; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px;">
              <strong>Quer cancelar?</strong> Você pode cancelar sua assinatura a qualquer momento acessando as configurações da sua conta.
            </p>
            
            <p style="margin-top: 20px;">
              Se tem dúvidas sobre esta cobrança, acesse <a href="${process.env.FRONTEND_URL || 'https://smartsale.com'}/account/billing">sua fatura</a> ou entre em contato com o suporte.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2026 SmartSale. Todos os direitos reservados.</p>
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject,
            html,
        });
        console.log(`📧 Email de renovação com recibo enviado para ${userEmail}`);
    }
    catch (error) {
        console.error('❌ Erro ao enviar email de renovação:', error);
    }
}
// ========================================
// 4. SUBSCRIPTION CANCELLATION - Cancelamento de Assinatura
// ========================================
/**
 * Enviar notificação de cancelamento ao admin
 */
export async function notifyAdminCancellation(userEmail, reason, details, improvements, wouldReturn, feedbackId) {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartsale.com';
        const wouldReturnText = wouldReturn === true ? 'Sim' : wouldReturn === false ? 'Não' : 'Não respondido';
        const subject = `[SmartSale] Novo Cancelamento de Assinatura - ${userEmail}`;
        const html = `
      <h2>Notificação de Cancelamento de Assinatura</h2>
      
      <p><strong>Email do Usuário:</strong> ${userEmail}</p>
      
      <h3>Feedback do Cancelamento</h3>
      <ul>
        <li><strong>Motivo Principal:</strong> ${reason}</li>
        <li><strong>Voltaria a usar?</strong> ${wouldReturnText}</li>
      </ul>

      <h3>Comentários do Usuário</h3>
      <p><strong>Detalhes:</strong></p>
      <p>${details || 'Sem detalhes fornecidos'}</p>

      <p><strong>Sugestões de Melhoria:</strong></p>
      <p>${improvements || 'Sem sugestões fornecidas'}</p>

      <hr>

      <p>
        <a href="${process.env.ADMIN_URI || 'http://localhost:3000'}/admin/reports/cancellations/${feedbackId}">
          Ver Feedback Completo
        </a>
      </p>
    `;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject,
            html,
        });
        console.log(`📧 Email de cancelamento enviado ao admin para ${userEmail}`);
    }
    catch (error) {
        console.error('❌ Erro ao enviar email ao admin:', error);
        // Não falhar a requisição se o email falhar
    }
}
/**
 * Enviar confirmação ao usuário sobre cancelamento
 */
export async function confirmCancellationToUser(userEmail, endDate) {
    try {
        const subject = '[SmartSale] Sua Assinatura Será Cancelada';
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f97316; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          h2 { color: #f97316; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ Seu Cancelamento Foi Confirmado</h1>
          </div>
          
          <div class="content">
            <p>Recebemos sua solicitação de cancelamento.</p>
            
            <div class="warning-box">
              <p><strong>Sua assinatura permanecerá ativa até ${endDate}</strong></p>
              <p>Você terá acesso a todas as funcionalidades até esta data.</p>
            </div>
            
            <h2>O que acontece agora?</h2>
            <ul>
              <li>Você pode usar o SmartSale normalmente até ${endDate}</li>
              <li>Não haverá cobrança após essa data</li>
              <li>Você pode reativar sua assinatura a qualquer momento antes da data de término</li>
            </ul>
            
            <h2>Quer reativar?</h2>
            <p>Se mudou de ideia, pode reativar sua assinatura diretamente na sua conta:</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://smartsale.com'}/account/subscription" class="button">
              Acessar Minha Conta
            </a>
            
            <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666;">
              <strong>Obrigado por usar o SmartSale!</strong><br>
              Se tiver feedback ou dúvidas, entre em contato conosco através do suporte.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2026 SmartSale. Todos os direitos reservados.</p>
            <p>Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject,
            html,
        });
        console.log(`📧 Confirmação de cancelamento enviada para ${userEmail}`);
    }
    catch (error) {
        console.error('❌ Erro ao enviar email ao usuário:', error);
    }
}
//# sourceMappingURL=emailNotifications.js.map