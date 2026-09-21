import { CategoryItem, ColorTheme, ThemeMode, Transaction } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_ledger_transactions_v3',
  CATEGORIES: 'expense_ledger_categories_v3',
  DEFAULT_ALLOWANCE: 'expense_ledger_default_allowance_v3',
  THEME_MODE: 'expense_ledger_theme_mode_v3',
  COLOR_THEME: 'expense_ledger_color_theme_v3',
};

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      // Clean start: no pre-filled personal transactions
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse transactions from localStorage', err);
    return [];
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
