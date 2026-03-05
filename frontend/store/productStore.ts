import { create } from 'zustand';

export interface Product {
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
      power_seller_status?: string;
      positive_feedback?: number;
      transactions?: number;
    };
  };
  shipping?: {
    free_shipping: boolean;
    store_pick_up: boolean;
  };
  official_store?: boolean;
  soldQuantity?: number;
  pictures?: Array<{
    url: string;
    secure_url: string;
  }>;
}

export interface ProductDetails extends Product {
  description: string;
  available_quantity: number;
  sold_quantity: number;
  pictures: Array<{
    url: string;
    secure_url: string;
  }>;
  category_id: string;
  brand?: string;
  attributes?: Array<{
    name: string;
    value_name: string;
  }>;
  permalink: string;
}

interface ProductStore {
  // State
  searchResults: Product[];
  selectedProduct: ProductDetails | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchMode: 'public' | 'seller';
  sellerId: string | null;
  filters: {
    limit: number;
    offset: number;
    sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
    category?: string;
    // Price filters
    price_min?: number;
    price_max?: number;
    // Public search filters
    condition?: string;
    shipping?: string;
    // Seller filters
    status?: string | string[];
    orders?: string;
    listing_type_id?: string;
    buying_mode?: string;
    shipping_mode?: string;
    reputation_health_gauge?: string;
    labels?: string | string[];
    [key: string]: any;
  };

  // Actions
  setSearchResults: (products: Product[]) => void;
  setSelectedProduct: (product: ProductDetails | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchMode: (mode: 'public' | 'seller') => void;
  setSellerId: (sellerId: string | null) => void;
  setFilters: (filters: Partial<ProductStore['filters']>) => void;
  clearSearch: () => void;
  resetFilters: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  // Initial state
  searchResults: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  searchMode: 'public',
  sellerId: null,
  filters: {
    limit: 50,
    offset: 0,
    sort: 'relevance',
  },

  // Actions
  setSearchResults: (products) => set({ searchResults: products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchMode: (mode) => set({ searchMode: mode }),
  setSellerId: (sellerId) => set({ sellerId }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  clearSearch: () =>
    set({
      searchResults: [],
      selectedProduct: null,
      searchQuery: '',
      error: null,
    }),
  resetFilters: () =>
    set({
      filters: {
        limit: 50,
        offset: 0,
        sort: 'relevance',
      },
    }),
}));
