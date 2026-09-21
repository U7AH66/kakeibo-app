import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Table as TableIcon,
  Settings,
  Sun,
  Moon,
  Palette,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogIn,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { formatMonthLabel } from '../utils/format';
import { ColorTheme, SyncStatus, ThemeMode } from '../types';
import { THEME_CONFIGS } from '../utils/theme';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (newMonth: string) => void;
  onOpenExport: () => void;
  onOpenManageCategories: () => void;
  onOpenThemeSettings: () => void;
  onOpenSync: () => void;
  syncStatus: SyncStatus;
  currentUser: User | null;
  themeMode: ThemeMode;
  isDarkEffective: boolean;
  onToggleDarkMode: () => void;
  colorTheme: ColorTheme;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  onOpenExport,
  onOpenManageCategories,
  onOpenThemeSettings,
  onOpenSync,
  syncStatus,
  currentUser,
  isDarkEffective,
  onToggleDarkMode,
  colorTheme,
}) => {
  const curConfig = THEME_CONFIGS[colorTheme];

  const handlePrevMonth = () => {
    const [yearStr, monthStr] = currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);

    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const formatted = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    onMonthChange(formatted);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);

    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const formatted = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    onMonthChange(formatted);
  };

  const handleResetToCurrentMonth = () => {
    const today = new Date();
    const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(formatted);
  };

  return (
    <header className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Title & App Branding */}
        <div className="flex items-center space-x-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-2xs transition"
            style={{
              backgroundColor: `${curConfig.previewColor}20`,
              borderColor: `${curConfig.previewColor}50`,
              color: curConfig.previewColor,
              borderWidth: '1px',
            }}
          >
            ¥
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
              小遣い・仕訳ノート
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight">
              自動加算・表出力ノート
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-1 bg-neutral-100/90 dark:bg-neutral-800/90 p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80">
          <button
            id="btn-prev-month"
            type="button"
            onClick={handlePrevMonth}
            aria-label="前の月"
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700 transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetToCurrentMonth}
            title="クリックで今月に戻る"
            className="px-2.5 py-0.5 flex items-center space-x-1.5 font-semibold text-neutral-800 dark:text-neutral-200 hover:text-amber-700 dark:hover:text-amber-400 text-sm transition"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>{formatMonthLabel(currentMonth)}</span>
          </button>

          <button
            id="btn-next-month"
            type="button"
            onClick={handleNextMonth}
            aria-label="次の月"
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-700 transition active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* User Account & Cloud Sync Status Button */}
          <button
            id="btn-open-user-auth"
            type="button"
            onClick={onOpenSync}
            title={
              currentUser
                ? `${currentUser.displayName || currentUser.email} (クリックで同期・アカウント設定)`
                : 'Googleアカウントでログインして自動同期'
            }
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 border ${
              currentUser
                ? syncStatus === 'synced'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : syncStatus === 'syncing'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {currentUser ? (
              <>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-sky-500 animate-spin shrink-0" />
                ) : (
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                <span className="hidden sm:inline max-w-[90px] truncate font-medium">
                  {currentUser.displayName?.split(' ')[0] || '同期中'}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-medium text-amber-800 dark:text-amber-300">ログイン</span>
              </>
            )}
          </button>

          {/* Quick Light / Dark Mode Toggle */}
          <button
            id="btn-quick-theme-toggle"
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkEffective ? 'ライトモードに切替' : 'ダークモードに切替'}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95 border border-neutral-200 dark:border-neutral-700"
          >
            {isDarkEffective ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* Design & Color Theme Settings */}
          <button
            id="btn-open-theme-settings"
            type="button"
            onClick={onOpenThemeSettings}
            title="デザイン・テーマカラー変更"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95 border border-neutral-200 dark:border-neutral-700"
          >
            <Palette className="w-4 h-4" style={{ color: curConfig.previewColor }} />
          </button>

          {/* Export as Table / Text */}
          <button
            id="btn-open-export-header"
            type="button"
            onClick={onOpenExport}
            title="LINE送信やメモ帳・Excel貼り付け用の出力"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition active:scale-95 border border-neutral-200 dark:border-neutral-700"
          >
            <TableIcon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>出力・共有</span>
          </button>

          {/* Manage Categories */}
          <button
            id="btn-open-manage-categories"
            type="button"
            onClick={onOpenManageCategories}
            title="項目の設定"
            aria-label="項目の設定"
            className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
