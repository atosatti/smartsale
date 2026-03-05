// Documentação do Usuário - SmartSale
// Esta documentação é exibida na aplicação para usuários finais

export interface DocumentationSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  subsections: DocumentationSubsection[];
}

export interface DocumentationSubsection {
  id: string;
  title: string;
  content: string;
  steps?: string[];
  tips?: string[];
}

export const userDocumentation: DocumentationSection[] = [
  {
    id: "getting-started",
    title: "🚀 Começando",
    icon: "Rocket",
    description: "Primeiros passos para usar o SmartSale",
    subsections: [
      {
        id: "what-is-smartsale",
        title: "O que é o SmartSale?",
        content:
          "SmartSale é uma plataforma que permite pesquisar e comparar produtos de diferentes vendedores do Mercado Livre. Com filtros avançados, você consegue encontrar exatamente o que procura com o melhor preço.",
      },
      {
        id: "create-account",
        title: "Como Criar uma Conta",
        content:
          "Para começar a usar o SmartSale, você precisa criar uma conta. É rápido e seguro.",
        steps: [
          "Clique em 'Registrar' na página inicial",
          "Preencha seus dados: email, nome e senha",
          "Verifique seu email para confirmar a conta",
          "Faça login e comece a pesquisar!",
        ],
        tips: [
          "Use uma senha forte com letras, números e símbolos",
          "Guarde bem sua senha - nunca compartilhe!",
        ],
      },
      {
        id: "account-security",
        title: "Ativar Segurança em 2 Fatores (2FA)",
        content:
          "Proteja sua conta com autenticação em dois fatores. Isso garante que só você possa acessar sua conta.",
        steps: [
          "Vá para Configurações de Segurança",
          "Clique em 'Ativar Autenticação em 2 Fatores'",
          "Escaneie o código QR com um aplicativo autenticador (Google Authenticator, Authy)",
          "Digite o código de 6 dígitos mostrado no app",
          "Guarde seus códigos de recuperação em local seguro",
        ],
        tips: [
          "Aplicativos recomendados: Google Authenticator, Authy, Microsoft Authenticator",
          "Guarde os códigos de recuperação - são essenciais se perder acesso ao seu celular",
        ],
      },
    ],
  },

  {
    id: "search-basics",
    title: "🔍 Pesquisando Produtos",
    icon: "Search",
    description: "Aprenda como fazer buscas eficientes de produtos",
    subsections: [
      {
        id: "basic-search",
        title: "Pesquisa Básica",
        content:
          "A forma mais simples de encontrar produtos é usando a barra de pesquisa.",
        steps: [
          "Acesse a página de Pesquisa",
          "Digite o nome do produto que procura (ex: 'notebook', 'fone bluetooth')",
          "Clique em 'Buscar' ou pressione Enter",
          "Veja os resultados na tabela abaixo",
        ],
        tips: [
          "Seja específico - quanto mais detalhe, melhores os resultados",
          "Você pode pesquisar por marca, modelo ou tipo de produto",
          "Os resultados aparecem em tempo real do Mercado Livre",
        ],
      },
      {
        id: "search-modes",
        title: "Modos de Pesquisa",
        content:
          "Existem duas formas de pesquisar: por produtos públicos ou por itens de um vendedor específico.",
        steps: [
          "Na página de Pesquisa, escolha o modo desejado",
          "Modo 'Busca Pública': pesquisa em todos os vendedores",
          "Modo 'Itens do Vendedor': vê apenas produtos de um vendedor específico",
        ],
        tips: [
          "Use 'Itens do Vendedor' para encontrar mais produtos do vendedor que você gosta",
          "A busca pública mostra as melhores ofertas de vários vendedores",
        ],
      },
      {
        id: "find-seller-id",
        title: "Como Encontrar o ID do Vendedor",
        content:
          "Para pesquisar itens de um vendedor específico, você precisa do ID dele. Aqui estão 4 formas de encontrá-lo:",
        steps: [
          "Opção 1 - Pelo Perfil: Visite a página do vendedor no Mercado Livre e veja na URL (Ex: meli.com/user/8476025 → ID é 8476025)",
          "Opção 2 - Pela URL do Anúncio: Abra um anúncio do vendedor e procure na URL",
          "Opção 3 - Dentro do App: Clique no botão ℹ️ próximo ao campo de ID para ver as instruções",
          "Opção 4 - Exemplo: No Mercado Livre, visite um vendedor e copie o número do perfil",
        ],
        tips: [
          "O ID do vendedor é sempre um número, geralmente com 4-8 dígitos",
          "Você pode testar com ID 8476025 para ver um exemplo",
        ],
      },
    ],
  },

  {
    id: "filters",
    title: "🎯 Usando Filtros",
    icon: "Filter",
    description: "Domine os filtros para encontrar produtos perfeitos",
    subsections: [
      {
        id: "intro-filters",
        title: "O que são Filtros?",
        content:
          "Filtros ajudam você a refinar sua pesquisa e encontrar exatamente o que procura. Economizam tempo e garantem ótimos resultados.",
      },
      {
        id: "how-to-use-filters",
        title: "Como Usar Filtros",
        content:
          "Usando filtros é muito fácil. Siga os passos abaixo:",
        steps: [
          "Digite um termo de pesquisa (ex: 'notebook')",
          "Clique em 'Mostrar Filtros Avançados' para expandir as opções",
          "Selecione os filtros que deseja (veja próximas seções para detalhes)",
          "Clique em 'Aplicar Filtros' para ver resultados filtrados",
          "Os filtros ativos aparecem como badges azuis abaixo da barra de pesquisa",
          "Clique em 'Limpar Filtros' para remover todos os filtros",
        ],
        tips: [
          "Você pode combinar múltiplos filtros",
          "Quanto mais filtros você usar, mais específica será a busca",
          "Os resultados atualizam automaticamente ao aplicar filtros",
        ],
      },
      {
        id: "filter-price",
        title: "Filtro de Preço",
        content:
          "Defina a faixa de preço que você quer gastar no produto.",
        steps: [
          "Abra a seção 'Filtros Avançados'",
          "Na esquerda, você verá 'Faixa de Preço'",
          "Digite o preço mínimo (ex: 1000)",
          "Digite o preço máximo (ex: 3000)",
          "Clique 'Aplicar' para filtrar por essa faixa",
        ],
        tips: [
          "Deixe em branco se não quiser filtrar por um valor máximo",
          "O preço é em reais (R$)",
          "Produtos fora da faixa não aparecerão nos resultados",
        ],
      },
      {
        id: "filter-condition",
        title: "Filtro de Condição",
        content: "Escolha se quer produtos novos ou usados.",
        steps: [
          "Procure por 'Condição' nos filtros",
          "Marque 'Novo' para produtos novos",
          "Marque 'Usado' para produtos usados",
          "Você pode selecionar ambos para ver os dois",
        ],
        tips: [
          "Produtos 'Novo' costumam ter garantia",
          "Produtos 'Usado' geralmente têm preço mais baixo",
        ],
      },
      {
        id: "filter-shipping",
        title: "Filtro de Envio",
        content: "Escolha se quer frete grátis ou prefere economizar no produto.",
        steps: [
          "Procure por 'Envio' nos filtros",
          "Marque 'Frete Grátis' para incluir apenas produtos com frete grátis",
          "Deixe desmarcado para ver todos os produtos",
        ],
        tips: [
          "Frete grátis pode ser vantajoso em compras maiores",
          "Nem sempre o produto com frete grátis é o mais barato no total",
          "Preste atenção na soma: preço + frete = custo total",
        ],
      },
      {
        id: "filter-seller-specific",
        title: "Filtros Específicos do Vendedor",
        content:
          "Ao pesquisar itens de um vendedor específico, há filtros adicionais disponíveis.",
        steps: [
          "Selecione 'Itens do Vendedor'",
          "Digite o ID do vendedor",
          "Clique 'Buscar Vendedor'",
          "Abra 'Mostrar Filtros Avançados'",
          "Verá filtros como Status, Tipo de Listagem, Modo de Compra, etc.",
        ],
        tips: [
          "Estes filtros ajudam a encontrar anúncios ativos ou inativos",
          "Use para explorar toda a linha de produtos do vendedor",
        ],
      },
    ],
  },

  {
    id: "results",
    title: "📊 Interpretando Resultados",
    icon: "BarChart3",
    description: "Entenda como ler e interpretar os resultados da pesquisa",
    subsections: [
      {
        id: "results-table",
        title: "Tabela de Resultados",
        content:
          "Os resultados aparecem em uma tabela com informações importantes sobre cada produto.",
        steps: [
          "Cada linha representa um produto",
          "Colunas mostram: Foto, Título, Preço, Vendedor, Avaliação e Ações",
          "Clique no produto para ver detalhes completos",
          "Clique no vendedor para ver mais produtos dele",
        ],
        tips: [
          "Produtos com estrelas ⭐ têm avaliações positivas",
          "Mais estrelas = melhor reputação do vendedor",
          "Desça para ver mais resultados",
        ],
      },
      {
        id: "product-info",
        title: "Informações do Produto",
        content: "Cada coluna da tabela traz informações importantes.",
        steps: [
          "Imagem: Foto visual do produto",
          "Título: Nome completo do anúncio",
          "Preço: Valor em reais (R$)",
          "Vendedor: Nome de quem está vendendo",
          "Avaliação: Estrelas e quantidade de avaliações",
          "Ações: Botões para ver detalhes ou visitar o Mercado Livre",
        ],
        tips: [
          "Clique na imagem para ver fotos maiores",
          "O título contém detalhes importantes (marca, modelo, cor)",
          "Sempre verifique a avaliação do vendedor",
        ],
      },
      {
        id: "sort-results",
        title: "Ordenar Resultados",
        content:
          "Você pode ordenar os resultados de diferentes formas para encontrar melhor.",
        steps: [
          "Use o filtro 'Ordenar por' nos filtros avançados",
          "Opções: Preço (menor), Preço (maior), Mais Novos, Mais Vendidos",
          "Escolha a ordem que faz sentido para você",
          "Aplique os filtros para ver os resultados reordenados",
        ],
        tips: [
          "Use 'Preço (menor)' para encontrar as melhores ofertas",
          "Use 'Mais Novos' para ver anúncios recentes",
          "Use 'Mais Vendidos' para produtos populares e confiáveis",
        ],
      },
    ],
  },

  {
    id: "account",
    title: "👤 Minha Conta",
    icon: "User",
    description: "Gerencie seu perfil e configurações",
    subsections: [
      {
        id: "profile",
        title: "Editar Perfil",
        content: "Mantenha suas informações pessoais atualizadas.",
        steps: [
          "Clique no seu avatar ou nome no topo da tela",
          "Selecione 'Meu Perfil'",
          "Atualize seus dados: nome, email, telefone",
          "Clique 'Salvar' para confirmar as mudanças",
        ],
        tips: [
          "Informações corretas ajudam na recuperação da conta",
          "Seu email é usado para notificações importantes",
        ],
      },
      {
        id: "password",
        title: "Alterar Senha",
        content: "Mude sua senha regularmente para manter sua conta segura.",
        steps: [
          "Vá para Configurações de Segurança",
          "Clique em 'Alterar Senha'",
          "Digite sua senha atual",
          "Digite a nova senha (deve ser forte e única)",
          "Confirme a nova senha",
          "Clique 'Atualizar Senha'",
        ],
        tips: [
          "Use senhas diferentes em sites diferentes",
          "Nunca compartilhe sua senha com ninguém",
          "Uma boa senha tem: maiúsculas, minúsculas, números e símbolos",
        ],
      },
      {
        id: "subscription",
        title: "Planos e Assinatura",
        content: "Escolha o plano que melhor se adequa ao seu uso.",
        steps: [
          "Vá para 'Planos e Assinatura'",
          "Veja os planos disponíveis e seus benefícios",
          "Clique 'Contratar' no plano desejado",
          "Preencha os dados de pagamento",
          "Confirme a assinatura",
        ],
        tips: [
          "Planos gratuitos têm limite de buscas",
          "Planos pagos desbloqueiam mais recursos",
          "Você pode cancelar a qualquer momento",
        ],
      },
      {
        id: "privacy",
        title: "Privacidade e Dados",
        content: "Controle quais dados você compartilha.",
        steps: [
          "Vá para Configurações de Privacidade",
          "Revise as opções de compartilhamento",
          "Desabilite o que não deseja compartilhar",
          "Salve as mudanças",
        ],
        tips: [
          "Sempre revise a Política de Privacidade",
          "Você pode exportar seus dados a qualquer momento",
          "Seus dados nunca são vendidos a terceiros",
        ],
      },
    ],
  },

  {
    id: "tips-tricks",
    title: "💡 Dicas e Truques",
    icon: "Lightbulb",
    description: "Aproveite ao máximo o SmartSale",
    subsections: [
      {
        id: "saving-searches",
        title: "Salvando Suas Buscas",
        content:
          "Salve suas buscas favoritas para acessar rapidamente depois.",
        steps: [
          "Após fazer uma busca com filtros",
          "Clique no ícone de coração ❤️ (salvar)",
          "A busca é adicionada a seus favoritos",
          "Acesse em 'Minhas Buscas Salvas' no menu",
        ],
        tips: [
          "Crie buscas para produtos que você monitora",
          "Combine com notificações para não perder ofertas",
        ],
      },
      {
        id: "comparing-products",
        title: "Comparando Produtos",
        content: "Compare múltiplos produtos lado a lado.",
        steps: [
          "Selecione múltiplos produtos (marque as caixas de seleção)",
          "Clique em 'Comparar' na barra de ações",
          "Veja os produtos em modo de comparação",
        ],
        tips: [
          "Compare preço, condição, vendedor e avaliações",
          "Isso ajuda a tomar a melhor decisão",
        ],
      },
      {
        id: "notifications",
        title: "Ativar Notificações de Preço",
        content:
          "Receba alertas quando o preço de um produto cair.",
        steps: [
          "Na página do produto, clique em 'Adicionar ao Alerta'",
          "Defina o preço mínimo que você deseja pagar",
          "Clique 'Salvar Alerta'",
          "Você receberá email quando o preço atingir esse valor",
        ],
        tips: [
          "Perfeito para esperar o melhor preço",
          "Geralmente os preços caem em promoções",
        ],
      },
      {
        id: "share-searches",
        title: "Compartilhando Buscas",
        content:
          "Compartilhe uma busca específica com amigos.",
        steps: [
          "Após fazer uma busca com filtros",
          "Clique em 'Compartilhar' ou use o ícone de link 🔗",
          "Copie o link",
          "Envie para amigos - eles verão os mesmos resultados",
        ],
        tips: [
          "Útil para pedir opinião de amigos sobre produtos",
          "O link inclui todos os filtros que você usou",
        ],
      },
      {
        id: "mobile-app",
        title: "Usando no Celular",
        content:
          "O SmartSale funciona perfeitamente em seu telefone.",
        steps: [
          "Abra o navegador do seu celular",
          "Visite o site do SmartSale",
          "Ou instale como app web (opção no navegador)",
          "Use os mesmos recursos no seu smartphone",
        ],
        tips: [
          "A interface se adapta automaticamente à tela do celular",
          "Mais fácil fazer buscas enquanto está em movimento",
        ],
      },
    ],
  },

  {
    id: "troubleshooting",
    title: "🆘 Solução de Problemas",
    icon: "AlertCircle",
    description: "Resolva problemas comuns",
    subsections: [
      {
        id: "cant-login",
        title: "Não Consigo Fazer Login",
        content: "Problemas ao entrar na sua conta? Aqui estão as soluções.",
        steps: [
          "Verifique se está digitando o email correto",
          "Confira se a senha está correta (maiúsculas e minúsculas importam)",
          "Se esqueceu a senha, clique 'Esqueceu sua senha?' na página de login",
          "Verifique sua caixa de email para o link de recuperação",
          "Se ainda não funcionar, entre em contato com o suporte",
        ],
        tips: [
          "Limpe os cookies do navegador e tente novamente",
          "Tente em outro navegador se um não funcionar",
        ],
      },
      {
        id: "2fa-issues",
        title: "Problemas com Autenticação em 2 Fatores",
        content:
          "Soluções para problemas com 2FA.",
        steps: [
          "Se perdeu acesso ao app autenticador, use um código de recuperação",
          "Os códigos de recuperação foram enviados por email quando ativou 2FA",
          "Se não tiver nenhum código, entre em contato com o suporte",
          "O suporte pode desativar 2FA após verificação de identidade",
        ],
        tips: [
          "Guarde bem os códigos de recuperação quando ativar 2FA",
          "Tire uma foto deles e guarde em local seguro",
        ],
      },
      {
        id: "no-results",
        title: "Pesquisa Não Retorna Resultados",
        content: "Quando a pesquisa não traz nenhum produto.",
        steps: [
          "Verifique a ortografia do termo de pesquisa",
          "Tente pesquisar com palavras mais genéricas",
          "Remova alguns filtros que podem estar muito específicos",
          "Se pesquisar por vendedor, verifique se o ID está correto",
          "Experimente outro termo completamente diferente",
        ],
        tips: [
          "Nem todos os produtos estão disponíveis em todos os momentos",
          "Filtros muito específicos podem eliminar todos os resultados",
        ],
      },
      {
        id: "slow-loading",
        title: "Aplicação Lenta ou Travada",
        content: "A página está demorando para carregar?",
        steps: [
          "Recarregue a página (F5 ou Ctrl+R)",
          "Limpe os cookies e cache do navegador",
          "Desabilite extensões do navegador que possam interferir",
          "Tente em um navegador diferente",
          "Verifique sua conexão de internet",
        ],
        tips: [
          "Uma conexão mais rápida melhora a experiência",
          "Feche abas e programas desnecessários",
        ],
      },
      {
        id: "payment-issues",
        title: "Problemas com Pagamento",
        content:
          "Seu pagamento de assinatura foi rejeitado?",
        steps: [
          "Verifique se os dados do cartão estão corretos",
          "Confirme que o cartão não expirou",
          "Verifique limite de crédito disponível",
          "Tente com outro cartão ou método de pagamento",
          "Se o problema persistir, entre em contato com seu banco",
        ],
        tips: [
          "Alguns bancos bloqueiam pagamentos online por segurança",
          "Entre em contato com seu banco para desbloquear",
        ],
      },
    ],
  },

  {
    id: "faq",
    title: "❓ Perguntas Frequentes",
    icon: "HelpCircle",
    description: "Respostas às perguntas mais comuns",
    subsections: [
      {
        id: "faq-free",
        title: "É Realmente Grátis?",
        content:
          "Sim! O SmartSale tem um plano gratuito com funcionalidades básicas. Planos pagos desbloqueiam recursos premium.",
        tips: [
          "Comece com o plano gratuito para explorar",
          "Upgrade para plano pago quando precisar de mais recursos",
        ],
      },
      {
        id: "faq-data",
        title: "Meus Dados são Seguros?",
        content:
          "Sim! Usamos criptografia de ponta e implementamos as melhores práticas de segurança. Seus dados nunca são compartilhados com terceiros.",
      },
      {
        id: "faq-ml",
        title: "Por que Preciso de uma Conta Mercado Livre?",
        content:
          "Na verdade você não precisa. O SmartSale busca dados do Mercado Livre, mas sua conta SmartSale é independente. Uma conta ML é necessária apenas se quiser fazer compras no ML.",
      },
      {
        id: "faq-prices",
        title: "Os Preços Estão Sempre Atualizados?",
        content:
          "Sim! Os preços são atualizados em tempo real diretamente do Mercado Livre. Você sempre vê as informações mais atuais.",
      },
      {
        id: "faq-export",
        title: "Posso Exportar Meus Dados?",
        content:
          "Sim! Você pode exportar seu histórico de buscas, produtos salvos e outros dados em formato CSV ou JSON.",
        steps: [
          "Vá para Configurações",
          "Clique em 'Exportar Dados'",
          "Escolha o formato (CSV ou JSON)",
          "Clique 'Download'",
        ],
      },
    ],
  },
];
