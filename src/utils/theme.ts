import { ColorTheme } from '../types';

export interface ThemeStyles {
  name: string;
  colorName: ColorTheme;
  previewColor: string;
  // Primary buttons
  btnPrimary: string;
  // Accent badge
  badge: string;
  // Subtle tint background
  bgTint: string;
  // Accent border
  borderAccent: string;
  // Active tab indicator
  tabActive: string;
  // Ring for focus
  ring: string;
  // Text accent
  textAccent: string;
}

export const THEME_CONFIGS: Record<ColorTheme, ThemeStyles> = {
  amber: {
    name: 'アンバー（ノート帳簿）',
    colorName: 'amber',
    previewColor: '#f59e0b',
    btnPrimary: 'bg-amber-500 hover:bg-amber-600 text-neutral-950 active:scale-[0.98]',
    badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200/70 dark:border-amber-800/60',
    bgTint: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40',
    borderAccent: 'border-amber-500',
    tabActive: 'border-amber-500 text-neutral-900 dark:text-white',
    ring: 'focus:ring-amber-500 focus:border-amber-500',
    textAccent: 'text-amber-800 dark:text-amber-300',
  },
  emerald: {
    name: 'エメラルド（家計簿グリーン）',
    colorName: 'emerald',
    previewColor: '#10b981',
    btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]',
    badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200/70 dark:border-emerald-800/60',
    bgTint: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40',
    borderAccent: 'border-emerald-500',
    tabActive: 'border-emerald-500 text-neutral-900 dark:text-white',
    ring: 'focus:ring-emerald-500 focus:border-emerald-500',
    textAccent: 'text-emerald-700 dark:text-emerald-300',
  },
  indigo: {
    name: 'インディゴ（モダンネイビー）',
    colorName: 'indigo',
    previewColor: '#6366f1',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]',
    badge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border-indigo-200/70 dark:border-indigo-800/60',
    bgTint: 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/40',
    borderAccent: 'border-indigo-500',
    tabActive: 'border-indigo-500 text-neutral-900 dark:text-white',
    ring: 'focus:ring-indigo-500 focus:border-indigo-500',
    textAccent: 'text-indigo-700 dark:text-indigo-300',
  },
  rose: {
    name: 'ローズ（上品ピンク）',
    colorName: 'rose',
    previewColor: '#f43f5e',
    btnPrimary: 'bg-rose-600 hover:bg-rose-700 text-white active:scale-[0.98]',
    badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-200/70 dark:border-rose-800/60',
    bgTint: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/40',
    borderAccent: 'border-rose-500',
    tabActive: 'border-rose-500 text-neutral-900 dark:text-white',
    ring: 'focus:ring-rose-500 focus:border-rose-500',
    textAccent: 'text-rose-700 dark:text-rose-300',
  },
};
