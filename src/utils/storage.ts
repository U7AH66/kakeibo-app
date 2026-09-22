import { CategoryItem, ColorTheme, PeriodSettings, ThemeMode, Transaction } from '../types';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';
import { DEFAULT_PERIOD_SETTINGS } from './period';

const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_ledger_transactions_v4',
  CATEGORIES: 'expense_ledger_categories_v4',
  DEFAULT_ALLOWANCE: 'expense_ledger_default_allowance_v4',
  THEME_MODE: 'expense_ledger_theme_mode_v4',
  COLOR_THEME: 'expense_ledger_color_theme_v4',
  PERIOD_SETTINGS: 'expense_ledger_period_settings_v4',
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

export function deduplicateCategories(cats: CategoryItem[]): CategoryItem[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const result: CategoryItem[] = [];

  for (const c of cats) {
    if (!c || !c.name) continue;
    const trimmedName = c.name.trim();
    if (!trimmedName || seenNames.has(trimmedName)) continue;

    let uniqueId = c.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    if (seenIds.has(uniqueId)) {
      uniqueId = `${uniqueId}-${Math.random().toString(36).slice(2, 6)}`;
    }

    seenIds.add(uniqueId);
    seenNames.add(trimmedName);
    result.push({
      ...c,
      id: uniqueId,
      name: trimmedName,
    });
  }

  return result;
}

export function loadCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    const deduped = deduplicateCategories(Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES);
    if (deduped.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      saveCategories(deduped);
    }
    return deduped;
  } catch (err) {
    console.error('Failed to parse categories from localStorage', err);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(cats: CategoryItem[]): void {
  try {
    const deduped = deduplicateCategories(cats);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(deduped));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function loadDefaultAllowance(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEFAULT_ALLOWANCE);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
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

export function loadPeriodSettings(): PeriodSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIOD_SETTINGS);
    if (!raw) return DEFAULT_PERIOD_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      cutoffDay: typeof parsed.cutoffDay === 'number' ? parsed.cutoffDay : DEFAULT_PERIOD_SETTINGS.cutoffDay,
      rangeMode: parsed.rangeMode || DEFAULT_PERIOD_SETTINGS.rangeMode,
      defaultDateType: parsed.defaultDateType || DEFAULT_PERIOD_SETTINGS.defaultDateType,
      customDefaultDay: typeof parsed.customDefaultDay === 'number' ? parsed.customDefaultDay : DEFAULT_PERIOD_SETTINGS.customDefaultDay,
    };
  } catch (err) {
    console.error('Failed to parse period settings from localStorage', err);
    return DEFAULT_PERIOD_SETTINGS;
  }
}

export function savePeriodSettings(settings: PeriodSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PERIOD_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save period settings', err);
  }
}
