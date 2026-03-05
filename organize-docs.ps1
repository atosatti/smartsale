# Script para organizar documentação

# Getting Started (Guias de início)
Move-Item -Path "FILTROS_FRONTEND_RESUMO_RAPIDO.md" -Destination "docs/getting-started/" -Force
Move-Item -Path "FRONTEND_FILTERS_START_HERE.md" -Destination "docs/getting-started/" -Force

# Filters (Tudo sobre filtros)
Move-Item -Path "FILTROS_FRONTEND_INDEX.md" -Destination "docs/filters/" -Force
Move-Item -Path "FRONTEND_FILTERS_IMPLEMENTATION_SUMMARY.md" -Destination "docs/filters/" -Force
Move-Item -Path "FRONTEND_FILTERS_VISUAL_GUIDE.md" -Destination "docs/filters/" -Force
Move-Item -Path "CORRECOES_FILTROS_REALIZADAS.md" -Destination "docs/filters/" -Force
Move-Item -Path "COMO_ENCONTRAR_ID_VENDEDOR.md" -Destination "docs/filters/" -Force
Move-Item -Path "FILTERS_SUMMARY.md" -Destination "docs/filters/" -Force

# Setup (Configuração e setup)
Move-Item -Path "MERCADO_LIVRE_API_SETUP.md" -Destination "docs/setup/" -Force
Move-Item -Path "SETUP_TEST_USERS.md" -Destination "docs/setup/" -Force
Move-Item -Path "ML_API_ALIGNMENT_SUMMARY.md" -Destination "docs/setup/" -Force

# Guides (Outros guias)
Move-Item -Path "DESENVOLVIMENTO.md" -Destination "docs/guides/" -Force
Move-Item -Path "README_TEST_USERS.md" -Destination "docs/guides/" -Force
Move-Item -Path "TEST_USERS_GUIDE.md" -Destination "docs/guides/" -Force
Move-Item -Path "IMPLEMENTATION_TEST_USERS.md" -Destination "docs/guides/" -Force
Move-Item -Path "MANUAL_TESTING_TEST_USERS.md" -Destination "docs/guides/" -Force
Move-Item -Path "CREDENTIALS.md" -Destination "docs/guides/" -Force
Move-Item -Path "FINAL_CHECKLIST.md" -Destination "docs/guides/" -Force
Move-Item -Path "DELIVERY_SUMMARY.md" -Destination "docs/guides/" -Force
Move-Item -Path "DOCUMENTATION_INDEX.md" -Destination "docs/guides/" -Force

Write-Host "✅ Arquivos organizados com sucesso!" -ForegroundColor Green
