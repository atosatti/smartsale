/**
 * Controller para endpoints de busca alinhados com documentação oficial ML
 * Implementa recomendações de best practices da API Mercado Livre
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import mercadoLivreService from '../services/mercadoLivreService.js';
import oauthTokenService from '../services/oauthTokenService.js';
import db from '../config/database.js';

/**
 * GET /api/ml-search/seller-items/:sellerId
 * 
 * Buscar itens de um vendedor com dados REAIS (não referencial)
 * Recomendado pela documentação oficial ML
 * 
 * Query params:
 * - status: active, paused, closed, etc.
 * - orders: stop_time_asc, price_asc, etc.
 * - limit: 1-100 (default 50)
 * - offset: para paginação normal
 * - search_type: 'scan' para 1000+ itens
 * - scroll_id: para paginação com scan
 * - include_filters: true para obter filtros disponíveis
 */
export const getSellerItems = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const {
      // Paginação
      limit,
      offset,
      search_type,
      scroll_id,
      include_filters,
      
      // Status
      status,
      sub_status,
      
      // Ordenação
      orders,
      
      // Identificadores
      sku,
      seller_sku,
      missing_product_identifiers,
      
      // Modo de compra
      buying_mode,
      
      // Tipo de listagem
      listing_type_id,
      
      // Envio
      shipping_mode,
      shipping_free_methods,
      shipping_tags,
      
      // Origem
      listing_source,
      
      // Saúde
      reputation_health_gauge,
      
      // Labels (múltiplos)
      labels,
      
      // Logística
      logistic_type,
    } = req.query;

    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID é obrigatório' });
    }// Verificar se há token para usar autenticação
    let userToken: string | undefined;
    if ((req.user as any)?.id) {
      try {
        // Obter token com renovação automática se expirado
        const token = await oauthTokenService.getActiveTokenWithAutoRefresh('mercado-livre');
        if (token?.access_token) {
          userToken = token.access_token;}
      } catch (error) {
        console.warn(`[ML Search Controller] Erro ao obter token com auto-refresh:`, error);
      }
    }

    // Processar labels (pode ser array ou string)
    let parsedLabels: string[] | undefined;
    if (labels) {
      if (Array.isArray(labels)) {
        parsedLabels = labels as string[];
      } else if (typeof labels === 'string') {
        parsedLabels = labels.split(',').map(l => l.trim());
      }
    }

    const result = await mercadoLivreService.searchSellerItems(
      {
        sellerId: parseInt(sellerId as string),
        limit: limit ? Math.min(parseInt(limit as string), 100) : 50,
        offset: offset ? parseInt(offset as string) : 0,
        search_type: search_type as any,
        scroll_id: scroll_id as string,
        include_filters: include_filters === 'true',
        
        // Status
        status: status as any,
        sub_status: sub_status as any,
        
        // Ordenação
        orders: orders as any,
        
        // Identificadores
        sku: sku as string,
        seller_sku: seller_sku as string,
        missing_product_identifiers: missing_product_identifiers === 'true' ? true : undefined,
        
        // Modo de compra
        buying_mode: buying_mode as any,
        
        // Tipo de listagem
        listing_type_id: listing_type_id as any,
        
        // Envio
        shipping_mode: shipping_mode as string,
        shipping_free_methods: shipping_free_methods as string,
        shipping_tags: shipping_tags as string,
        
        // Origem
        listing_source: listing_source as any,
        
        // Saúde
        reputation_health_gauge: reputation_health_gauge as any,
        
        // Labels
        labels: parsedLabels as any,
        
        // Logística
        logistic_type: logistic_type as string,
      },
      userToken
    );

    res.status(200).json({
      success: true,
      data: result,
      info: {
        endpoint: '/users/{user_id}/items/search',
        note: 'Dados de available_quantity são REAIS (não referenciais)',
        has_restrictions: !result.available_filters || result.available_filters.length === 0,
        scroll_available: !!result.scroll_id,
        filters_applied: {
          status,
          sub_status,
          buying_mode,
          listing_type_id,
          reputation_health_gauge,
          labels_count: parsedLabels?.length || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('[ML Search Controller] Erro:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/users/{user_id}/items/search',
    });
  }
};

/**
 * GET /api/ml-search/seller-restrictions/:sellerId
 * 
 * Verificar se seller tem restrições (200k+ itens)
 * Se sim: não retorna filters/available_filters
 */
export const getSellerRestrictions = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID é obrigatório' });
    }

    // Token opcional
    let userToken: string | undefined;
    if ((req.user as any)?.id) {
      const [rows]: any = await db.query(
        'SELECT access_token FROM oauth_tokens WHERE provider = ? AND is_active = 1 LIMIT 1',
        ['mercado_livre']
      );
      if (rows && rows.length > 0) {
        userToken = rows[0].access_token;
      }
    }

    const restrictions = await mercadoLivreService.getSellerRestrictions(
      parseInt(sellerId as string),
      userToken
    );

    res.status(200).json({
      success: true,
      data: restrictions,
      endpoint: '/users/{user_id}/items/search/restrictions',
      explanation: restrictions.has_many_items
        ? 'Vendedor tem 200k+ itens - busca de filtros desabilitada'
        : 'Vendedor sem restrições - todos os recursos disponíveis',
    });
  } catch (error: any) {
    console.error('[ML Search Controller] Erro ao obter restrições:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/ml-search/multiget-items
 * 
 * Buscar múltiplos itens em 1 requisição
 * Máximo: 20 IDs por requisição
 * 
 * Body:
 * {
 *   "ids": ["MLB123", "MLB456", ...],
 *   "attributes": ["id", "price", "title", ...] // opcional
 * }
 */
export const getItemsMulti = async (req: Request, res: Response) => {
  try {
    const { ids, attributes } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'IDs é obrigatório e deve ser um array não vazio',
      });
    }

    if (ids.length > 20) {
      return res.status(400).json({
        error: 'Máximo 20 IDs permitidos por requisição',
        sent: ids.length,
      });
    }const results = await mercadoLivreService.getItemsMulti(ids, attributes);

    res.status(200).json({
      success: true,
      data: results,
      count: results.filter((r: any) => r.success).length,
      endpoint: '/items?ids=$ID1,$ID2,...',
      benefits: [
        '1 requisição em vez de 20',
        'Economia de banda com seleção de campos',
        'Resposta verbose com status por item',
      ],
    });
  } catch (error: any) {
    console.error('[ML Search Controller] Erro no multiget:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/ml-search/multiget-users
 * 
 * Buscar múltiplos usuários em 1 requisição
 * Máximo: 20 usuários por requisição
 * 
 * Body:
 * {
 *   "ids": [123456, 789012, ...]
 * }
 */
export const getUsersMulti = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'IDs é obrigatório e deve ser um array não vazio',
      });
    }

    if (ids.length > 20) {
      return res.status(400).json({
        error: 'Máximo 20 IDs permitidos por requisição',
        sent: ids.length,
      });
    }const results = await mercadoLivreService.getUsersMulti(ids);

    res.status(200).json({
      success: true,
      data: results,
      count: results.filter((r: any) => r.success).length,
      endpoint: '/users?ids=$USER1,$USER2,...',
    });
  } catch (error: any) {
    console.error('[ML Search Controller] Erro no multiget users:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/ml-search/public
 * 
 * Busca pública com filtros e ordenação
 * Não requer autenticação
 * 
 * Query params:
 * - q: query (obrigatório)
 * - seller_id: filtrar por vendedor
 * - nickname: buscar por nickname
 * - category: filtrar por categoria
 * - shipping: 'free' para frete grátis
 * - condition: 'new' ou 'used'
 * - sort: price_asc, price_desc, stop_time_asc, etc.
 * - limit: 1-100 (default 50)
 * - offset: para paginação
 */
export const searchPublic = async (req: Request, res: Response) => {
  try {
    const {
      q,
      seller_id,
      nickname,
      category,
      shipping,
      condition,
      sort,
      limit,
      offset,
    } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Query (q) é obrigatória',
      });
    }const result = await mercadoLivreService.searchPublicWithFilters({
      q: q as string,
      seller_id: seller_id ? parseInt(seller_id as string) : undefined,
      nickname: nickname as string,
      category: category as string,
      condition: condition as any,
      shipping: shipping as any,
      sort: (sort as any) as 'price_asc' | 'price_desc' | 'relevance' | 'stop_time_asc' | 'stop_time_desc' | undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.status(200).json({
      success: true,
      data: result,
      endpoint: '/sites/{site_id}/search',
      warning: 'available_quantity é REFERENCIAL (não real)',
      filters_available: {
        has_available_filters: result.available_filters?.length > 0,
        has_available_sorts: result.available_sorts?.length > 0,
      },
    });
  } catch (error: any) {
    console.error('[ML Public Search] Erro:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/ml-search/docs
 * 
 * Retorna documentação dos novos endpoints
 */
export const getDocs = async (req: Request, res: Response) => {
  res.json({
    title: 'Mercado Livre Search API - Alinhado com Documentação Oficial',
    version: '2.0',
    last_updated: new Date(),
    endpoints: [
      {
        method: 'GET',
        path: '/api/ml-search/seller-items/:sellerId',
        description: 'Buscar itens de um vendedor (dados reais)',
        docs: 'https://developers.mercadolibre.com.br/pt_br/obtener-items-cuenta',
        official_endpoint: 'GET /users/{user_id}/items/search',
        query_params: {
          status: 'active|paused|closed|pending|not_yet_active|programmed',
          orders: 'stop_time_asc|stop_time_desc|price_asc|price_desc|...',
          limit: '1-100 (default 50)',
          offset: 'para paginação',
          search_type: "'scan' para 1000+ itens",
          scroll_id: 'para paginação com scan',
          include_filters: 'true para obter filtros',
        },
      },
      {
        method: 'GET',
        path: '/api/ml-search/seller-restrictions/:sellerId',
        description: 'Verificar restrições de vendedor (200k+ itens)',
        docs: 'https://developers.mercadolibre.com.br/pt_br/verificar-vendedores-restringidos',
        official_endpoint: 'GET /users/{user_id}/items/search/restrictions',
      },
      {
        method: 'POST',
        path: '/api/ml-search/multiget-items',
        description: 'Buscar múltiplos itens em 1 requisição (máx 20)',
        docs: 'https://developers.mercadolibre.com.br/pt_br/multiget',
        official_endpoint: 'GET /items?ids=...',
        body: {
          ids: ['MLB123', 'MLB456', '...'],
          attributes: ['id', 'price', 'title', '...'], // opcional
        },
      },
      {
        method: 'POST',
        path: '/api/ml-search/multiget-users',
        description: 'Buscar múltiplos usuários em 1 requisição (máx 20)',
        official_endpoint: 'GET /users?ids=...',
        body: {
          ids: [123456, 789012, '...'],
        },
      },
      {
        method: 'GET',
        path: '/api/ml-search/public',
        description: 'Busca pública com filtros e ordenação',
        docs: 'https://developers.mercadolibre.com.br/pt_br/search-items-api',
        official_endpoint: 'GET /sites/{site_id}/search',
        query_params: {
          q: 'query (obrigatório)',
          seller_id: 'filtrar por vendedor',
          nickname: 'buscar por nickname',
          category: 'filtrar por categoria',
          shipping: "'free' para frete grátis",
          condition: "'new' ou 'used'",
          sort: 'price_asc, price_desc, stop_time_asc, ...',
          limit: '1-100',
          offset: 'para paginação',
        },
      },
    ],
    benefits: [
      'Alinhado com recomendações da documentação oficial ML',
      'Retorna available_quantity REAL (não referencial)',
      'Multiget reduz N requisições em 1',
      'Suporte a busca de 1000+ itens com scan',
      'Verifica restrições de vendedor (200k+ itens)',
    ],
    references: {
      official_docs: 'https://developers.mercadolibre.com.br/pt_br/docs',
      search_api: 'https://developers.mercadolibre.com.br/pt_br/search-items-api',
      items_by_seller: 'https://developers.mercadolibre.com.br/pt_br/obtener-items-cuenta',
      restrictions: 'https://developers.mercadolibre.com.br/pt_br/verificar-vendedores-restringidos',
    },
  });
};
