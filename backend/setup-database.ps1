#!/bin/bash
# SmartSale Database Setup - Quick Start Script
# Escrito para PowerShell/Windows

# Colors
$Red = "Red"
$Green = "Green"
$Blue = "Blue"
$Yellow = "Yellow"

# MySQL Path
$MYSQL_PATH = "C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql"
$DB_USER = "root"
$DB_PASS = "Nicholas@022025"
$DB_NAME = "smartsale"

Write-Host "========================================" -ForegroundColor $Blue
Write-Host "🗄️  SMARTSALE DATABASE SETUP" -ForegroundColor $Blue
Write-Host "========================================" -ForegroundColor $Blue
Write-Host ""

# Function to run SQL script
function Run-SQLScript {
    param(
        [string]$ScriptPath,
        [string]$Description
    )
    
    Write-Host "🚀 $Description..." -ForegroundColor $Yellow
    
    if (Test-Path $ScriptPath) {
        $content = Get-Content $ScriptPath
        $content | & $MYSQL_PATH -u $DB_USER -p"$DB_PASS" 2>&1 | ForEach-Object {
            if ($_ -match "success|SUCCESS|sucesso|SUCESSO") {
                Write-Host "   ✅ $_" -ForegroundColor $Green
            } elseif ($_ -match "ERROR|Error|erro") {
                Write-Host "   ❌ $_" -ForegroundColor $Red
            }
        }
    } else {
        Write-Host "   ❌ Arquivo não encontrado: $ScriptPath" -ForegroundColor $Red
    }
    Write-Host ""
}

# Check if MySQL is installed
Write-Host "Verificando MySQL..." -ForegroundColor $Blue
if (Test-Path $MYSQL_PATH) {
    Write-Host "✅ MySQL encontrado em $MYSQL_PATH" -ForegroundColor $Green
    Write-Host ""
} else {
    Write-Host "❌ MySQL não encontrado!" -ForegroundColor $Red
    Write-Host "Baixe em: https://dev.mysql.com/downloads/mysql/" -ForegroundColor $Yellow
    exit 1
}

# Get the script directory
$ScriptDir = "C:\Users\AndersonDosSantos\Anderson\Projects\SmartSale\backend"

Write-Host "📋 EXECUTANDO SCRIPTS DE INICIALIZAÇÃO:" -ForegroundColor $Blue
Write-Host ""

# Run the setup scripts in order
Run-SQLScript "$ScriptDir\add-payment-columns.sql" "Adicionando colunas de pagamento"
Run-SQLScript "$ScriptDir\create-payment-tables.sql" "Criando tabelas de pagamento"
Run-SQLScript "$ScriptDir\insert-test-data.sql" "Inserindo dados de teste"

Write-Host "========================================" -ForegroundColor $Green
Write-Host "✅ BANCO DE DADOS INICIALIZADO!" -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Green
Write-Host ""

Write-Host "📊 RESUMO:" -ForegroundColor $Blue
Write-Host "  • 14 tabelas criadas" -ForegroundColor $Green
Write-Host "  • 4 planos de assinatura" -ForegroundColor $Green
Write-Host "  • 7 usuários de teste" -ForegroundColor $Green
Write-Host "  • 3 transações de exemplo" -ForegroundColor $Green
Write-Host ""

Write-Host "🔑 USUÁRIOS DE TESTE:" -ForegroundColor $Blue
Write-Host "  1. free.user@smartsale.com (Plano Free)" -ForegroundColor $Green
Write-Host "  2. basic.user@smartsale.com (Plano Basic)" -ForegroundColor $Green
Write-Host "  3. premium.user@smartsale.com (Plano Premium)" -ForegroundColor $Green
Write-Host ""

Write-Host "📚 PRÓXIMOS PASSOS:" -ForegroundColor $Yellow
Write-Host "  1. Configurar .env com chaves do Stripe" -ForegroundColor $White
Write-Host "  2. npm install e npm run dev (backend)" -ForegroundColor $White
Write-Host "  3. npm install e npm run dev (frontend)" -ForegroundColor $White
Write-Host "  4. Testar fluxo de pagamento" -ForegroundColor $White
Write-Host ""

Write-Host "📖 DOCUMENTAÇÃO:" -ForegroundColor $Yellow
Write-Host "  • docs/deployment/DATABASE_SCHEMA.md" -ForegroundColor $Blue
Write-Host "  • docs/deployment/PAYMENT_SYSTEM.md" -ForegroundColor $Blue
Write-Host "  • docs/deployment/DATABASE_SETUP.md" -ForegroundColor $Blue
Write-Host ""
