'use client';

import React from 'react';
import MetronicLayout from '@/components/MetronicLayout';
import { useThemeStore } from '@/store/themeStore';
import { ArrowRight, Search, TrendingUp, Shield, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <MetronicLayout>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`py-12 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Sobre o SmartSale
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Análise inteligente de preços em e-commerce integrada com Mercado Livre
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Missão */}
        <section>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Nossa Missão
          </h2>
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Democratizar o acesso a ferramentas de inteligência de mercado para vendedores e pesquisadores
            de e-commerce. Facilitamos a tomada de decisão baseada em dados, permitindo que você identifique
            oportunidades de negócio, compare preços e monitore tendências do mercado em tempo real.
          </p>
        </section>

        {/* Visão */}
        <section>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            👁️ Nossa Visão
          </h2>
          <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Ser a plataforma referência para análise de e-commerce no Brasil, oferecendo insights profundos
            sobre dinâmica de mercado, comportamento de consumidores e oportunidades de crescimento para
            negócios de todos os tamanhos.
          </p>
        </section>

        {/* Valores */}
        <section>
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            💎 Nossos Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Search, title: 'Transparência', desc: 'Dados claros e precisos' },
              { icon: Shield, title: 'Segurança', desc: 'Proteção de dados garantida' },
              { icon: Zap, title: 'Inovação', desc: 'Tecnologia de ponta' },
              { icon: Users, title: 'Acessibilidade', desc: 'Ferramentas para todos' }
            ].map((value, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <value.icon
                  className={`w-8 h-8 mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {value.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Funcionalidades */}
        <section>
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ✨ Funcionalidades Principais
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'Busca Avançada de Produtos',
                desc: 'Pesquise produtos em múltiplas plataformas com filtros avançados'
              },
              {
                title: 'Análise de Preços',
                desc: 'Compare preços em tempo real e identifique tendências de mercado'
              },
              {
                title: 'Histórico de Preços',
                desc: 'Monitore variações de preço ao longo do tempo'
              },
              {
                title: 'Integração Mercado Livre',
                desc: 'Acesso direto aos dados do Mercado Livre com OAuth seguro'
              },
              {
                title: 'Dashboard Executivo',
                desc: 'Visualize métricas e KPIs em um dashboard intuitivo'
              },
              {
                title: 'Autenticação Segura',
                desc: 'Login com 2FA, Google OAuth e segurança em nível empresarial'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border flex gap-4 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <ArrowRight className={`w-5 h-5 flex-shrink-0 mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tecnologia */}
        <section>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🚀 Stack Tecnológico
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Frontend</h4>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Next.js 14</li>
                <li>• React 18</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Backend</h4>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Node.js</li>
                <li>• Express</li>
                <li>• TypeScript</li>
                <li>• MySQL</li>
              </ul>
            </div>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Segurança</h4>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• OAuth 2.0 + PKCE</li>
                <li>• 2FA TOTP</li>
                <li>• JWT</li>
                <li>• HTTPS</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Integrações */}
        <section>
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🔗 Integrações
          </h2>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            SmartSale integra-se com as principais plataformas de e-commerce:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Mercado Livre', 'Amazon', 'Shopee', 'Google OAuth'].map((platform, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg text-center font-medium border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                {platform}
              </div>
            ))}
          </div>
        </section>

        {/* Planos */}
        <section>
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            💰 Planos de Assinatura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Gratuito', price: '0', features: ['Busca básica', 'Até 100 buscas/mês', 'Suporte por email'] },
              { name: 'Pro', price: '29', features: ['Busca ilimitada', 'Histórico de preços', 'Análise avançada', 'Suporte prioritário'], highlight: true },
              { name: 'Enterprise', price: 'Customizado', features: ['Tudo do Pro', 'API dedicada', 'Integração custom', 'Suporte 24/7'] }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border ${
                  plan.highlight
                    ? isDarkMode
                      ? 'bg-blue-900 border-blue-700'
                      : 'bg-blue-50 border-blue-300'
                    : isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h4>
                <p className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  ${plan.price} <span className="text-sm">/mês</span>
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Pronto para começar?
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Crie sua conta gratuitamente e comece a analisar o mercado hoje mesmo
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Criar Conta Grátis
          </a>
        </section>

        {/* Footer Info */}
        <section className={`py-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Informações de Contato
          </h3>
          <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>📧 Email: support@smartsale.com.br</p>
            <p>🌐 Website: smartsale.com.br</p>
            <p>📱 Suporte: Segunda a Sexta, 9h-18h</p>
          </div>
        </section>
      </div>
    </div>
    </MetronicLayout>
  );
}
