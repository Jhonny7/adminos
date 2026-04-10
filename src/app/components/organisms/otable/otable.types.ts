export interface Column {
  key: string;
  label: string;
  visible?: boolean;
  sortable?: boolean;
  width?: number;
  render?: (value: any, row: Record<string, any>) => any;
  editable?: boolean;
  inputType?: 'text' | 'number' | 'price' | 'date' | 'select' | 'autocomplete';
  options?: { value: string | number; label: string }[];
  onSearch?: (query: string, rowIndex: number) => Promise<any[]> | any[];
  onSelection?: (option: any, rowIndex: number) => void;
  onBlur?: (value: any, rowIndex: number) => void;
  disabledEdit?: (row: Record<string, any>) => boolean;
  decimalsCount?: number;
}

export interface TableAction {
  title: string;
  action: () => void;
  icon?: string;
}

export interface OTableProps {
  columns: Column[];
  data: Record<string, any>[];
  moduleTitle?: string;
  selectable?: boolean;
  singleSelection?: boolean;
  keyTag?: string;
  onSelectionChange?: (selectedKeys: any[]) => void;
  actions?: TableAction[];
  singleAction?: () => void;
  singleActionText?: string;
  emptyText?: string;
  isReorder?: boolean;
  onReorder?: (rows: Record<string, any>[]) => void;
  onRowsChange?: (rows: Record<string, any>[], idx: number, changedKey?: string, changedValue?: any) => void;
  filterContent?: any;
  filterText?: string;
  disableFilter?: boolean;
  headerComponent?: any;
  onCloseDrawer?: (open: boolean) => void;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface EditingCell {
  rowKey: string;
  colKey: string;
}
