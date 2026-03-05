# DataTable de Análise de Mercado B2B - Documentação

## 📊 Visão Geral

A nova DataTable foi desenvolvida como uma ferramenta completa para análise de viabilidade de venda, permitindo que vendedores B2B tomem decisões baseadas em dados concretos do mercado Mercado Livre.

## 🎯 Objetivos

- Exibir dados estruturados de produtos pesquisados
- Facilitar análise de viabilidade comercial
- Providenciar comparação competitiva
- Mostrar métricas de rentabilidade

## 📋 Colunas Implementadas

### 1. **Produto** (min-width: 280px)
- Thumbnail do produto
- Título truncado
- ID do produto
- Background destacado em azul

### 2. **Preço** (min-width: 100px)
- Preço em R$ com 2 casas decimais
- Texto alinhado à direita
- Cor azul para destaque

### 3. **Categoria** (min-width: 120px)
- Badge cinza com categoria do produto
- "Sem categoria" como fallback

### 4. **Marca** (min-width: 100px)
- Nome da marca
- "N/A" como fallback

### 5. **Receita/Mês** (min-width: 100px, destaque verde)
- Cálculo: Vendas Mensais × Preço
- Formato: R$ com separador de milhares
- Simula dados realistas baseado em produto

### 6. **Vendas/Mês** (min-width: 100px, destaque verde)
- Quantidade de unidades vendidas por mês
- Cálculo: Visualizações × Taxa de Conversão
- Formato: "XXX un."

### 7. **Ticket Médio** (min-width: 100px, destaque verde)
- Valor médio por venda: Receita ÷ Vendas
- Formato: R$ com 2 casas decimais
- Análise de margem

### 8. **Vendedor** (min-width: 150px, destaque roxo)
- Nome/Nickname do vendedor
- Nível de reputação
- Background destacado em roxo

### 9. **Reputação** (min-width: 100px)
- Estrelas (⭐) baseado em level_id
- Percentual de feedback positivo
- Escala: 0-5 estrelas
- Máximo 5 estrelas

### 10. **Transações** (min-width: 100px)
- Número total de transações
- Badge azul para destaque
- Indicador de experiência do vendedor

### 11. **Dias no Ar** (min-width: 80px)
- Quantos dias o anúncio está ativo
- Formato: "XXd"
- Indica longevidade da listagem

### 12. **Imagens** (min-width: 80px)
- Quantidade de imagens do produto
- Badge amarelo
- Formato: "X img"

### 13. **Condição** (min-width: 100px)
- Status: "✓ Novo" ou "Usado"
- Cores: Verde para novo, Amarelo para usado
- Badge com ícone

### 14. **Ações** (min-width: 160px, sticky right)
- 📋 Detalhes (azul)
- ⚔️ Concorrentes (roxo)
- 💾 Salvar (verde)
- Sticky à direita para scroll horizontal

## 🔧 Funcionalidades

### Scroll Horizontal
```
- Header fixo durante scroll vertical
- Coluna de ações sticky à direita
- Suporta até 20+ colunas sem quebra de layout
- Responsivo com overflow automático
```

### Scroll Vertical
```
- Altura máxima: 70vh
- Permite visualizar múltiplos produtos
- Scroll suave com dark mode suportado
```

### Dark Mode
```
- Cores adaptadas para tema escuro
- Contraste adequado para leitura
- Badges com cores apropriadas
```

### Métricas Calculadas (Simuladas)
```javascript
// Para cada produto:
monthlyViews = Random(1.000 - 11.000)
conversionRate = Random(2% - 12%)
monthlySales = monthlyViews × conversionRate
monthlyRevenue = monthlySales × price
avgSale = monthlyRevenue ÷ monthlySales
daysListed = Random(30 - 180 dias)
images = Random(2 - 10)
```

## 📊 Resumo Inferior

A tabela inclui um footer com 4 KPIs:

1. **Total de Produtos**: Contagem de resultados
2. **Preço Médio**: Média aritmética dos preços
3. **Receita Potencial/Mês**: Soma de todas as receitas mensais
4. **Vendas Potenciais/Mês**: Soma de todas as vendas mensais

## 🎨 Design

### Cores por Categoria

| Elemento | Cor | Uso |
|----------|-----|-----|
| Produto | Azul (50/30) | Destaque principal |
| Receita | Verde (50/30) | Indicador de rentabilidade |
| Vendedor | Roxo (50/30) | Dados do seller |
| Badge Status | Cores variadas | Tipo de informação |
| Hover | Gray (50) | Feedback visual |

### Responsividade

- Desktop: Todas as colunas visíveis com scroll
- Tablet: Scroll horizontal ativado
- Mobile: Prioritiza colunas críticas, scroll obrigatório

## 🔗 Integração com Componentes

### Product Interface
```typescript
interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  thumbnail: string;
  condition: string;
  category?: string;
  brand?: string;
  seller?: {
    id: string;
    nickname: string;
    reputation?: {
      level_id: string;
      positive_feedback?: number;
      transactions?: number;
    };
  };
  shipping?: { ... };
}
```

### Props
```typescript
interface ProductDataTableProps {
  products: Product[];
  isLoading: boolean;
  onSelectProduct: (product: Product) => void;
  onFindCompetitors: (productId: string) => void;
  onSaveProduct: (product: Product) => void;
}
```

## 📱 Estados UI

### Loading
- Spinner animado
- Mensagem: "Carregando..."

### Empty State
- Box azul com mensagem
- CTA: "Realize uma pesquisa para começar"

### Normal State
- Tabela com dados
- Footer com resumo
- Ações funcionais

## 🚀 Próximas Melhorias

- [ ] Ordenação por coluna (click no header)
- [ ] Filtros avançados por preço, categoria, reputação
- [ ] Paginação dinâmica
- [ ] Export para CSV/Excel
- [ ] Gráficos de análise (preço vs vendas)
- [ ] Histórico de preços
- [ ] Alertas de oportunidade
- [ ] Integração com sistema de favoritos real

## 💡 Casos de Uso B2B

### 1. Análise de Viabilidade
- Vendedor pesquisa "iPhone 13"
- Visualiza receita potencial: R$ 120.000/mês
- Analisa: Vendas/mês (80 un), Ticket médio (R$ 1.500)
- Decisão: Viável vender este produto

### 2. Comparação de Nichos
- Pesquisa "Teclado mecânico"
- Compara preços, volumes, reputações
- Identifica vendedor com melhor avaliação
- Estuda estratégia de preço do mercado

### 3. Pesquisa de Tendências
- Busca "MacBook M3"
- Verifica dias de anúncio: média 90 dias
- Baixas vendas? Análisa concorrentes
- Preço acima/abaixo da média?

### 4. Validação de Estoque
- Produto em estoque físico
- Valida se é viável listar no ML
- Compara com variações do produto
- Toma decisão de início de venda

## 🔐 Dados em Produção

Em produção, as métricas serão:
- Consumidas de APIs reais do Mercado Livre
- Armazenadas em cache para performance
- Atualizadas periodicamente (24h)
- Validadas e sanitizadas

Atualmente: Dados simulados para desenvolvimento/teste.

## 📞 Suporte

Para dúvidas ou melhorias, consulte:
- `/frontend/components/ProductDataTable.tsx`
- `/frontend/store/productStore.ts`
- `/backend/src/services/mercadoLivreService.ts`
