-- ==========================================
-- SMARTSALE - INSERIR PLANOS
-- ==========================================

USE smartsale;

-- Inserir planos
INSERT INTO plans (name, display_name, description, monthly_price, annual_price, max_searches_per_day, max_saved_products, price_notifications, competitor_analysis, export_reports, priority_support, is_active, is_popular)
VALUES
  ('free', 'Gratuito', 'Plano básico para conhecer a plataforma', 0, 0, 5, 10, false, false, false, false, true, false),
  ('basic', 'Básico', 'Ideal para pequenos negócios', 9.99, 99.90, 50, 100, true, false, false, false, true, false),
  ('premium', 'Premium', 'Acesso completo com análises avançadas', 29.99, 299.90, 500, 1000, true, true, true, true, true, true),
  ('enterprise', 'Enterprise', 'Solução completa para grandes empresas', 99.99, 999.90, -1, -1, true, true, true, true, true, false);

SELECT 'Planos inseridos com sucesso!' as status;
SELECT COUNT(*) as total_plans FROM plans;
