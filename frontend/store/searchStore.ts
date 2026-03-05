import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  platform: string;
  price: number;
  currency: string;
  url: string;
}

interface SearchStore {
  query: string;
  results: Product[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  setResults: (results: Product[]) => void;
  setLoading: (loading: boolean) => void;
  clearResults: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearResults: () => set({ results: [], query: '' }),
}));
