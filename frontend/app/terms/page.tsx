'use client';

import React from 'react';
import MetronicLayout from '@/components/MetronicLayout';
import { useThemeStore } from '@/store/themeStore';

export default function TermsPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <MetronicLayout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`py-12 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Termos de Serviço
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
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar e usar o SmartSale ("Serviço"), você concorda em estar vinculado por estes Termos de Serviço.
                Se você não concordar com qualquer parte destes termos, não poderá usar o Serviço.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2. Descrição do Serviço
              </h2>
              <p>
                SmartSale é uma plataforma de análise de e-commerce que fornece ferramentas para pesquisa de produtos,
                análise de preços e insights de mercado. O Serviço integra-se com plataformas como Mercado Livre através
                de APIs públicas.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                3. Conta do Usuário
              </h2>
              <p className="mb-3">Você é responsável por:</p>
              <ul className="list-disc list-inside space-y-2 mb-3">
                <li>Manter a confidencialidade de suas credenciais de login</li>
                <li>Todas as atividades que ocorrem em sua conta</li>
                <li>Notificar-nos imediatamente de qualquer uso não autorizado</li>
              </ul>
              <p>
                Você concorda que as informações fornecidas durante o registro são precisas, completas e atualizadas.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                4. Uso Aceitável
              </h2>
              <p className="mb-3">Você concorda em não:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Usar o Serviço para fins ilegais ou não autorizados</li>
                <li>Acessar dados sem permissão ou interferir com a segurança</li>
                <li>Executar ataques automatizados, scraping ou mineração de dados</li>
                <li>Violar qualquer lei aplicável ou direitos de propriedade intelectual</li>
                <li>Compartilhar sua conta com terceiros sem autorização</li>
                <li>Usar o Serviço para competir com nossas ofertas</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                5. Propriedade Intelectual
              </h2>
              <p>
                O Serviço, incluindo todo o conteúdo, código, design e funcionalidade, é propriedade de SmartSale ou
                seus fornecedores. Você não pode reproduzir, distribuir ou transmitir qualquer conteúdo sem nossa
                permissão prévia por escrito.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                6. Limitação de Responsabilidade
              </h2>
              <p className="mb-3">
                O Serviço é fornecido "COMO ESTÁ" sem garantias de qualquer tipo. Na máxima extensão permitida por lei:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Não garantimos a precisão, integridade ou atualidade dos dados</li>
                <li>Não seremos responsáveis por danos indiretos ou consequentes</li>
                <li>Nossa responsabilidade total não excederá o valor que você pagou pelo Serviço</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                7. Interrupções de Serviço
              </h2>
              <p>
                Embora nos esforcemos para manter o Serviço funcionando sem interrupções, não podemos garantir
                disponibilidade contínua. Realizamos manutenção regularmente que pode causar interrupções temporárias.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                8. Planos e Preços
              </h2>
              <p className="mb-3">
                Os preços e planos estão sujeitos a alterações com notificação prévia de 30 dias. Seu serviço continuará
                pelo período que você selecionou.
              </p>
              <p>
                As assinaturas renovam automaticamente a menos que você cancele. Você pode cancelar a qualquer momento
                sem penalidades.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                9. Reembolsos
              </h2>
              <p>
                Reembolsos são oferecidos dentro de 7 dias após a compra se você não utilizou significativamente o Serviço.
                Reembolsos são processados dentro de 5-10 dias úteis.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                10. Integração com Terceiros
              </h2>
              <p>
                SmartSale integra-se com serviços de terceiros como Mercado Livre. O uso desses serviços está sujeito aos
                seus próprios termos de serviço. Não somos responsáveis por indisponibilidades ou alterações nesses serviços.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                11. Privacidade
              </h2>
              <p>
                Sua privacidade é importante para nós. Por favor, consulte nossa Política de Privacidade para entender
                como coletamos e usamos seus dados.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                12. Rescisão
              </h2>
              <p>
                Podemos encerrar ou suspender sua conta se você violar estes termos. Você pode encerrar sua conta a
                qualquer momento contactando nosso suporte.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                13. Modificações dos Termos
              </h2>
              <p>
                Podemos modificar estes termos a qualquer momento. Alterações substanciais serão comunicadas por email
                com 30 dias de antecedência.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                14. Lei Aplicável
              </h2>
              <p>
                Estes termos são regidos pelas leis do Brasil, especificamente pela legislação aplicável no estado de
                São Paulo, sem regard aos seus conflitos de disposições legais.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                15. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
              </p>
              <p className="mt-3">
                📧 support@smartsale.com.br<br/>
                🌐 smartsale.com.br
              </p>
            </section>

            <div className={`mt-12 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Estes Termos de Serviço constituem o acordo integral entre você e SmartSale sobre o Serviço.
                Se qualquer disposição deste acordo for considerada inválida, as demais disposições permanecerão em vigor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MetronicLayout>
  );
}
