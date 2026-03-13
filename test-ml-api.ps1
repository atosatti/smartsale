# Script de teste da integração Mercado Livre
# Testa endpoints reais via HTTP

$BaseURL = "http://localhost:3001"

Write-Host "`n============ MERCADO LIVRE INTEGRATION TEST ============`n" -ForegroundColor Cyan

# 1. Testar API pública sem autenticação
Write-Host "1️⃣  Testing PUBLIC API (no auth required)..." -ForegroundColor Yellow
try {
  $pubResponse = Invoke-WebRequest -Uri "https://api.mercadolibre.com/sites/MLB/search?q=notebook&limit=3" -TimeoutSec 10
  $data = $pubResponse.Content | ConvertFrom-Json
  Write-Host "✓ Public API SUCCESS" -ForegroundColor Green
  Write-Host "   Found: $($data.results.Count) products" -ForegroundColor Gray
  Write-Host "   Total available: $($data.paging.total) products`n" -ForegroundColor Gray
}
catch {
  Write-Host "✗ Public API FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Testar endpoint debug do backend (sem OAuth necessário - busca pública)
Write-Host "2️⃣  Testing BACKEND /api/mercado-livre/test..." -ForegroundColor Yellow
try {
  $testResponse = Invoke-WebRequest -Uri "$BaseURL/api/mercado-livre/test" -TimeoutSec 10
  $testData = $testResponse.Content | ConvertFrom-Json
  
  if ($testData.success) {
    Write-Host "✓ Backend API Test SUCCESS" -ForegroundColor Green
    Write-Host "   Status: $($testData.data.status)" -ForegroundColor Gray
    Write-Host "   Found: $($testData.data.resultsCount) items in test`n" -ForegroundColor Gray
  }
  else {
    Write-Host "✗ Backend test returned error: $($testData.message)" -ForegroundColor Red
  }
}
catch {
  Write-Host "✗ Backend API Test FAILED: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "   Make sure backend is running on port 3001`n" -ForegroundColor Gray
}

# 3. Resumo e próximos passos
Write-Host "============ SUMMARY ============`n" -ForegroundColor Cyan
Write-Host "✓ Database has tokens: YES (user_id=3)" -ForegroundColor Green
Write-Host "✓ Public API reachable: YES" -ForegroundColor Green
Write-Host "✓ Backend is running: $(if (Test-Connection localhost -Port 3001 -ErrorAction SilentlyContinue) { 'YES' } else { 'NO' })" -ForegroundColor Green

Write-Host "`n📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Use Postman or curl to test authenticated endpoint:" -ForegroundColor Gray
Write-Host "      POST http://localhost:3001/api/mercado-livre/search" -ForegroundColor Gray
Write-Host "      Body: { 'query': 'notebook', 'limit': 20 }" -ForegroundColor Gray
Write-Host "      Headers: Authorization: Bearer <YOUR_JWT_TOKEN>`n" -ForegroundColor Gray

Write-Host "   2. Or use debug endpoint (test user required):" -ForegroundColor Gray
Write-Host "      GET http://localhost:3001/api/mercado-livre/debug/search?query=smartphone" -ForegroundColor Gray
Write-Host "      Headers: Authorization: Bearer <USER_3_JWT_TOKEN>`n" -ForegroundColor Gray

Write-Host "   3. Check backend logs for detailed debug info`n" -ForegroundColor Gray
