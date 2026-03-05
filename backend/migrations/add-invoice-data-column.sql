-- Adicionar coluna de dados da fatura na tabela payment_history
ALTER TABLE payment_history 
ADD COLUMN invoice_data JSON NULL COMMENT 'Dados da fatura (CPF/CNPJ, endereço, etc)' 
AFTER description;

-- Criar índice para buscar por tipo de pessoa
ALTER TABLE payment_history 
ADD INDEX idx_invoice_data ((JSON_EXTRACT(invoice_data, '$.personType')));
