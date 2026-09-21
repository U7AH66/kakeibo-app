export interface Transaction {
  id: string;
  month: string; // "YYYY-MM" e.g. "2026-09"
  date: string;  // "YYYY-MM-DD"
  category: string; // e.g. "飯", "自販機", "お小遣い", "傘"
  amount: number;
  memo?: string;
  createdAt: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName?: string;
  color?: string;
  order?: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  transactions: Transaction[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorTheme = 'amber' | 'emerald' | 'indigo' | 'rose';
export type TableExportFormat = 'rich-table' | 'line-text' | 'simple-text' | 'ascii-table' | 'markdown' | 'tsv';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
