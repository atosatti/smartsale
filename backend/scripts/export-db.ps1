# =============================================================
# SmartSale - Exportação Completa do Banco de Dados Local
# =============================================================
# Uso: .\scripts\export-db.ps1
# Gera um arquivo SQL completo (schema + dados) pronto para
# importar em qualquer host MySQL (Railway, PlanetScale, etc.)
# =============================================================

param(
    [string]$Host     = "localhost",
    [string]$Port     = "3306",
    [string]$User     = "root",
    [string]$Password = "",
    [string]$Database = "smartsale",
    [string]$Output   = ""
)

# --- Ler variáveis do .env se existir ---
$envFile = Join-Path $PSScriptRoot "..\\.env"
if (Test-Path $envFile) {
    Write-Host "[INFO] Lendo configurações de $envFile..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key   = $Matches[1].Trim()
            $value = $Matches[2].Trim().Trim('"').Trim("'")
            switch ($key) {
                "DB_HOST"     { if (-not $Host     -or $Host     -eq "localhost") { $Host     = $value } }
                "DB_PORT"     { if (-not $Port     -or $Port     -eq "3306")      { $Port     = $value } }
                "DB_USER"     { if (-not $User     -or $User     -eq "root")      { $User     = $value } }
                "DB_PASSWORD" { if (-not $Password)                               { $Password = $value } }
                "DB_NAME"     { if (-not $Database -or $Database -eq "smartsale") { $Database = $value } }
            }
        }
    }
}

# --- Nome do arquivo de saída ---
if (-not $Output) {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $Output = Join-Path $PSScriptRoot "..\migrations\export_$timestamp.sql"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  SmartSale - Exportação do Banco de Dados" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  Host:     $Host`:$Port"
Write-Host "  Usuário:  $User"
Write-Host "  Banco:    $Database"
Write-Host "  Saída:    $Output"
Write-Host ""

# --- Verificar se mysqldump está disponível ---
$mysqldump = Get-Command mysqldump -ErrorAction SilentlyContinue
if (-not $mysqldump) {
    # Tentar caminhos comuns do MySQL no Windows
    $commonPaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
        "C:\xampp\mysql\bin\mysqldump.exe",
        "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe"
    )
    foreach ($p in $commonPaths) {
        if (Test-Path $p) { $mysqldump = $p; break }
    }
    if (-not $mysqldump) {
        Write-Host "[ERRO] mysqldump não encontrado no PATH." -ForegroundColor Red
        Write-Host "       Adicione o binário do MySQL ao PATH ou instale o MySQL." -ForegroundColor Red
        exit 1
    }
    $mysqldumpExe = $mysqldump
} else {
    $mysqldumpExe = $mysqldump.Source
}

Write-Host "[INFO] Usando mysqldump: $mysqldumpExe" -ForegroundColor Cyan

# --- Montar argumentos ---
$args = @(
    "--host=$Host",
    "--port=$Port",
    "--user=$User",
    "--single-transaction",       # Exportação consistente sem lock
    "--routines",                  # Procedures e functions
    "--triggers",                  # Triggers
    "--add-drop-table",            # DROP TABLE IF EXISTS antes de cada CREATE
    "--create-options",            # Mantém opções extras das tabelas
    "--disable-keys",              # Desabilita keys para importação mais rápida
    "--extended-insert",           # Inserts em batch (mais rápido)
    "--set-gtid-purged=OFF",       # Compatibilidade com PlanetScale/Railway
    "--column-statistics=0",       # Evita erros em MySQL 8+
    $Database
)

if ($Password -and $Password -ne "your_password") {
    $env:MYSQL_PWD = $Password
}

# --- Executar mysqldump ---
Write-Host "[INFO] Iniciando exportação..." -ForegroundColor Cyan

try {
    $header = @"
-- =============================================================
-- SmartSale - Dump completo do banco de dados
-- Gerado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Banco: $Database @ $Host`:$Port
-- =============================================================
-- Para importar no Railway / PlanetScale / qualquer MySQL:
--   mysql -h <HOST> -u <USER> -p <DATABASE> < este_arquivo.sql
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

"@
    $header | Out-File -FilePath $Output -Encoding utf8

    & $mysqldumpExe @args >> $Output 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERRO] mysqldump retornou código $LASTEXITCODE" -ForegroundColor Red
        Write-Host "       Verifique usuário/senha e se o banco '$Database' existe." -ForegroundColor Red
        exit 1
    }

    $footer = "`nSET foreign_key_checks = 1;`n-- Fim do dump`n"
    $footer | Out-File -FilePath $Output -Encoding utf8 -Append

} catch {
    Write-Host "[ERRO] $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}

$size = [math]::Round((Get-Item $Output).Length / 1KB, 1)
Write-Host ""
Write-Host "[OK] Exportação concluída!" -ForegroundColor Green
Write-Host "     Arquivo: $Output ($size KB)" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Crie um banco MySQL no Railway: https://railway.app"
Write-Host "  2. Copie as credenciais do Railway"
Write-Host "  3. Importe o arquivo:"
Write-Host "       mysql -h <HOST> -P <PORT> -u <USER> -p <DB_NAME> < $Output"
Write-Host "  4. Configure as variáveis de ambiente no Vercel:"
Write-Host "       DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME"
Write-Host ""
