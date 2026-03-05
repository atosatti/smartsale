import { useContext, createContext } from 'react';

const DataGridContext = createContext<any>(null);

export function useDataGrid() {
  const context = useContext(DataGridContext);
  if (!context) {
    return {
      data: [],
      columns: [],
      sorting: [],
      columnFilters: [],
      columnVisibility: {},
      rowSelection: {},
    };
  }
  return context;
}

export { DataGridContext };
