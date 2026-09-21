import { CategoryItem, ColorTheme, ThemeMode, Transaction } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_ledger_transactions_v2',
  CATEGORIES: 'expense_ledger_categories_v2',
  DEFAULT_ALLOWANCE: 'expense_ledger_default_allowance_v2',
  THEME_MODE: 'expense_ledger_theme_mode_v2',
  COLOR_THEME: 'expense_ledger_color_theme_v2',
};

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const oldRaw = localStorage.getItem('parent_ledger_transactions_v1');
      if (oldRaw) {
        try {
          const oldList: Transaction[] = JSON.parse(oldRaw);
          saveTransactions(oldList);
          return oldList;
        } catch {
          // ignore
        }
      }
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse transactions from localStorage', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save transactions', err);
  }
}

export function loadCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse categories from localStorage', err);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(cats: CategoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function loadDefaultAllowance(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEFAULT_ALLOWANCE);
    return raw ? parseInt(raw, 10) : 6000;
  } catch {
    return 6000;
  }
}

export function saveDefaultAllowance(amount: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_ALLOWANCE, amount.toString());
  } catch (err) {
    console.error('Failed to save default allowance', err);
  }
}

export function loadThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  } catch (err) {
    console.error('Failed to save theme mode', err);
  }
}

export function loadColorTheme(): ColorTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLOR_THEME);
    if (raw === 'amber' || raw === 'emerald' || raw === 'indigo' || raw === 'rose') return raw;
    return 'amber';
  } catch {
    return 'amber';
  }
}

export function saveColorTheme(theme: ColorTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COLOR_THEME, theme);
  } catch (err) {
    console.error('Failed to save color theme', err);
  }
}
