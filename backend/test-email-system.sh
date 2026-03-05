#!/bin/bash
# Script de teste para o sistema de emails
# Simula os diferentes fluxos de envio de emails

echo "🧪 Teste do Sistema de Emails - SmartSale"
echo "=========================================="
echo ""

API_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Create Account (Welcome Email)
echo -e "${BLUE}1️⃣ Teste: Criar Conta (Welcome Email)${NC}"
echo "=================================="
echo "POST $API_URL/auth/register"
echo ""

curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-email-'$(date +%s)'@gmail.com",
    "password": "Teste123@",
    "firstName": "João",
    "lastName": "Silva"
  }' | python -m json.tool

echo ""
echo -e "${GREEN}✅ Verificar console do backend:${NC}"
echo "Procurar por: '📧 Email de boas-vindas enviado para'"
echo ""
echo "---"
echo ""

# Test 2: Create Subscription (Subscription Confirmation Email)
echo -e "${BLUE}2️⃣ Teste: Criar Assinatura (Confirmation Email)${NC}"
echo "================================================"
echo "POST $API_URL/payments/create-payment-intent"
echo ""
echo "Sequência:"
echo "1. Fazer login para obter token"
echo "2. Chamar endpoint de payment intent"
echo "3. Completar pagamento no Stripe"
echo "4. Webhook dispara: customer.subscription.created"
echo "5. Email de confirmação é enviado"
echo ""
echo -e "${YELLOW}Nota: Webhook de teste pode ser simulado com:${NC}"
echo "stripe trigger customer.subscription.created"
echo ""
echo -e "${GREEN}✅ Verificar console do backend:${NC}"
echo "Procurar por: '📧 Confirmação de assinatura enviada para'"
echo ""
echo "---"
echo ""

# Test 3: Subscription Renewal (Renewal Email with Receipt)
echo -e "${BLUE}3️⃣ Teste: Renovação (Renewal Email with Receipt)${NC}"
echo "=============================================="
echo "Sequência:"
echo "1. Assinatura ativa"
echo "2. Stripe cobra automaticamente ao final do período"
echo "3. Webhook dispara: invoice.payment_succeeded"
echo "4. Email de renovação com recibo é enviado"
echo ""
echo -e "${YELLOW}Nota: Em desenvolvimento, simule com:${NC}"
echo "stripe trigger invoice.payment_succeeded"
echo ""
echo -e "${GREEN}✅ Verificar console do backend:${NC}"
echo "Procurar por: '📧 Email de renovação com recibo enviado para'"
echo ""
echo "---"
echo ""

# Test 4: Subscription Cancellation
echo -e "${BLUE}4️⃣ Teste: Cancelamento (Cancellation Email)${NC}"
echo "=========================================="
echo "POST $API_URL/payments/cancel-subscription"
echo ""
echo "Sequência:"
echo "1. Usuário clica em 'Cancelar Assinatura'"
echo "2. Preenche formulário de feedback"
echo "3. Confirma cancelamento"
echo "4. Email para usuário é enviado"
echo "5. Email notificando admin é enviado"
echo ""
echo -e "${GREEN}✅ Verificar console do backend:${NC}"
echo "Procurar por:"
echo "  - '📧 Confirmação de cancelamento enviada para'"
echo "  - '📧 Email de cancelamento enviado ao admin para'"
echo ""
echo ""
echo "---"
echo ""

# Summary
echo -e "${BLUE}📊 Resumo dos Testes${NC}"
echo "==================="
echo ""
echo "✉️  Emails que devem ser enviados:"
echo "   1. Welcome Email (ao registrar)"
echo "   2. Subscription Confirmation (ao assinar)"
echo "   3. Subscription Renewal (ao renovar)"
echo "   4. Cancellation Email (ao cancelar)"
echo ""

echo -e "${YELLOW}⚙️  Verificações Necessárias:${NC}"
echo "   1. EMAIL_SERVICE está configurado? (.env)"
echo "   2. EMAIL_USER está configurado? (.env)"
echo "   3. EMAIL_PASSWORD está configurado? (.env)"
echo "   4. ADMIN_EMAIL está configurado? (.env)"
echo "   5. FRONTEND_URL está correto? (.env)"
echo ""

echo -e "${GREEN}✅ Feito! ${NC}"
echo ""
echo -e "${YELLOW}💡 Dicas de Teste:${NC}"
echo "   • Use mailhog para testar emails em desenvolvimento"
echo "   • Configure SMTP local para não enviar de verdade"
echo "   • Verifique logs do console backend para status de envio"
echo "   • Todos os emails têm fallback para não bloquear fluxo"
echo ""
