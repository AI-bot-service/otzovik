export interface ColDef<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface ActionDef<T> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColDef<T>[];
  actions?: ActionDef<T>[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
}
