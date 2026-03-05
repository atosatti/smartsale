'use client';

import React from 'react';
import MetronicLayout from '@/components/MetronicLayout';
import { useThemeStore } from '@/store/themeStore';

export default function PrivacyPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <MetronicLayout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`py-12 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Política de Privacidade
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Última atualização: 6 de fevereiro de 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
          <div className={`space-y-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                1. Introdução
              </h2>
              <p>
                SmartSale ("nós", "nosso" ou "Empresa") opera a plataforma SmartSale ("Serviço"). Esta página informa
                você sobre nossa política de privacidade referente à coleta, uso e divulgação de dados pessoais quando você
                usa nosso Serviço e as escolhas associadas a esses dados. Utilizamos seus dados para fornecer e melhorar
                o Serviço.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2. Tipos de Dados Coletados
              </h2>

              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2.1 Dados Pessoais Que Você Fornece
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-5">
                <li>Nome completo e email</li>
                <li>Senha (armazenada com hash seguro)</li>
                <li>Informações de perfil (foto, bio, empresa)</li>
                <li>Informações de pagamento (processadas por Stripe)</li>
                <li>Preferências de notificação</li>
              </ul>

              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2.2 Dados Coletados Automaticamente
              </h3>
              <ul className="list-disc list-inside space-y-2 mb-5">
                <li>Endereço IP e tipo de navegador</li>
                <li>Histórico de pesquisas e cliques</li>
                <li>Duração da sessão e páginas visitadas</li>
                <li>Dados de dispositivo (sistema operacional, resolução)</li>
                <li>Cookies e tecnologias de rastreamento similares</li>
              </ul>

              <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2.3 Dados de Serviços Integrados
              </h3>
              <p>
                Quando você conecta sua conta do Mercado Livre, coletamos dados como seu ID de usuário, token de acesso
                (armazenado com segurança), dados de produto e histórico de vendas, conforme fornecido pela API do Mercado Livre.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                3. Base Legal para Processamento de Dados
              </h2>
              <p className="mb-3">
                Processamos seus dados pessoais com base nas seguintes bases legais:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Consentimento:</strong> Você forneceu consentimento explícito</li>
                <li><strong>Execução de Contrato:</strong> Necessário para fornecer o Serviço</li>
                <li><strong>Obrigação Legal:</strong> Quando exigido por lei</li>
                <li><strong>Interesse Legítimo:</strong> Segurança, fraude e melhorias do Serviço</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                4. Como Usamos Seus Dados
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Fornecer e manter o Serviço</li>
                <li>Processar transações e enviar confirmações</li>
                <li>Enviar notificações sobre atualizações e mudanças de segurança</li>
                <li>Responder a suas solicitações e perguntas</li>
                <li>Monitorar uso, detectar e prevenir fraude</li>
                <li>Realizar análise de dados para melhorar o Serviço</li>
                <li>Personalizar sua experiência</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                5. Compartilhamento de Dados
              </h2>
              <p className="mb-3">
                Podemos compartilhar seus dados com:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li><strong>Prestadores de Serviço:</strong> Stripe (pagamentos), SendGrid (emails), AWS (hospedagem)</li>
                <li><strong>Plataformas Integradas:</strong> Mercado Livre (apenas dados necessários para sincronização)</li>
                <li><strong>Obrigações Legais:</strong> Quando exigido por autoridades competentes</li>
              </ul>
              <p>
                Não vendemos seus dados pessoais para terceiros. Todos os parceiros são vinculados por acordos de
                confidencialidade.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                6. Retenção de Dados
              </h2>
              <p>
                Retemos seus dados pessoais apenas enquanto necessário para os propósitos declarados. Especificamente:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li><strong>Dados de Conta:</strong> Enquanto sua conta estiver ativa, mais 1 ano após exclusão</li>
                <li><strong>Logs de Auditoria:</strong> 2 anos para fins de segurança</li>
                <li><strong>Dados de Transação:</strong> 7 anos conforme exigido pela legislação fiscal</li>
                <li><strong>Tokens OAuth:</strong> Até revogação ou expiração</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                7. Segurança dos Dados
              </h2>
              <p className="mb-3">
                Implementamos medidas de segurança técnicas e organizacionais:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Criptografia SSL/TLS para transmissão de dados</li>
                <li>Hashing de senhas com algoritmo bcrypt</li>
                <li>Armazenamento seguro de tokens OAuth com criptografia</li>
                <li>Autenticação de dois fatores (2FA) com TOTP</li>
                <li>Firewalls e sistemas de detecção de intrusão</li>
                <li>Auditorias de segurança regulares</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                8. Seus Direitos
              </h2>
              <p className="mb-3">
                Sob a LGPD (Lei Geral de Proteção de Dados) do Brasil, você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Direito de Acesso:</strong> Conhecer quais dados pessoais temos sobre você</li>
                <li><strong>Direito de Correção:</strong> Corrigir dados imprecisos ou incompletos</li>
                <li><strong>Direito de Exclusão:</strong> Solicitar a exclusão de seus dados ("direito ao esquecimento")</li>
                <li><strong>Direito à Portabilidade:</strong> Receber seus dados em formato estruturado e transferível</li>
                <li><strong>Direito de Oposição:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Direito de Retirada de Consentimento:</strong> Retirar consentimento a qualquer momento</li>
              </ul>
              <p className="mt-3">
                Para exercer qualquer desses direitos, entre em contato conosco em support@smartsale.com.br.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                9. Cookies e Rastreamento
              </h2>
              <p className="mb-3">
                Utilizamos cookies para:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li><strong>Cookies de Sessão:</strong> Manter você autenticado</li>
                <li><strong>Cookies de Preferência:</strong> Lembrar modo escuro/claro</li>
                <li><strong>Cookies de Analytics:</strong> Entender como o Serviço é usado (opcional)</li>
              </ul>
              <p>
                Você pode controlar cookies através de suas configurações de navegador. Desabilitar cookies pode afetar
                a funcionalidade do Serviço.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                10. Transferências Internacionais
              </h2>
              <p>
                Seus dados podem ser transferidos para e armazenados em servidores fora do Brasil. Nesse caso, implementamos
                as garantias apropriadas conforme exigido pela LGPD, incluindo cláusulas contratuais padrão.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                11. LGPD e Direitos de Privacidade
              </h2>
              <p>
                SmartSale está em conformidade com a Lei Geral de Proteção de Dados (LGPD). Nomeamos um Encarregado de
                Proteção de Dados (DPO) responsável por supervisionar a conformidade com a LGPD e lidar com solicitações
                de direitos de privacidade.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                12. Exclusão de Conta
              </h2>
              <p className="mb-3">
                Você pode solicitar a exclusão completa de sua conta. Ao fazê-lo:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Seus dados pessoais serão excluídos dentro de 30 dias</li>
                <li>Logs de auditoria anônimos serão mantidos por conformidade legal</li>
                <li>Dados de transação serão retidos conforme exigido por lei fiscal</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                13. Política de Menores
              </h2>
              <p>
                O Serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de pessoas menores de 18.
                Se descobrirmos que coletamos dados de um menor, excluiremos essas informações imediatamente.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                14. Alterações a esta Política
              </h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações
                significativas por email ou através de um aviso destacado em nosso Serviço.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                15. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato conosco:
              </p>
              <div className="mt-4 space-y-2">
                <p>📧 support@smartsale.com.br</p>
                <p>🌐 smartsale.com.br</p>
                <p>⏰ Segunda a sexta-feira, 9h às 18h (Horário de Brasília)</p>
              </div>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                16. Encarregado de Proteção de Dados (DPO)
              </h2>
              <p>
                Para assuntos relacionados à LGPD e proteção de dados, você pode entrar em contato com nosso DPO:
              </p>
              <p className="mt-3">
                📧 dpo@smartsale.com.br
              </p>
            </section>

            <div className={`mt-12 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Esta Política de Privacidade está em conformidade com a LGPD (Lei Geral de Proteção de Dados, Lei nº 13.709/2018)
                e com a GDPR onde aplicável. Sua privacidade é importante para nós, e nos comprometemos a proteger seus dados pessoais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MetronicLayout>
  );
}
