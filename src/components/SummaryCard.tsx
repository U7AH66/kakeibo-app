import React from 'react';
import {
  Copy,
  Check,
  Plus,
  Layers,
  Receipt,
  TrendingUp,
  Table as TableIcon,
  MessageSquare,
} from 'lucide-react';
import { formatJPY, formatShortMonth } from '../utils/format';
import { ColorTheme } from '../types';
import { THEME_CONFIGS } from '../utils/theme';

interface SummaryCardProps {
  currentMonth: string;
  periodRangeLabel?: string;
  totalAmount: number;
  categoryCount: number;
  transactionCount: number;
  topCategory?: { name: string; total: number } | null;
  onOpenQuickEntry: () => void;
  onQuickCopyTable: () => void;
  onQuickCopyText?: () => void;
  copySuccess: boolean;
  copyTextSuccess?: boolean;
  colorTheme?: ColorTheme;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  currentMonth,
  periodRangeLabel,
  totalAmount,
  categoryCount,
  transactionCount,
  topCategory,
  onOpenQuickEntry,
  onQuickCopyTable,
  onQuickCopyText,
  copySuccess,
  copyTextSuccess = false,
  colorTheme = 'amber',
}) => {
  const shortMonth = formatShortMonth(currentMonth);
  const curConfig = THEME_CONFIGS[colorTheme];

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-5 shadow-xs transition">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${curConfig.badge}`}>
            {shortMonth}度{periodRangeLabel ? ` (${periodRangeLabel})` : ''}の集計
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            自動加算・家計簿
          </span>
        </div>

        {/* Quick Action Buttons: Table Copy (Apple Notes/Excel) + Text Copy (LINE/Chat) */}
        <div className="flex items-center space-x-2">
          {/* 1-Tap Copy Clean Text for LINE / Chat */}
          {onQuickCopyText && (
            <button
              id="btn-quick-copy-text"
              type="button"
              onClick={onQuickCopyText}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 transition active:scale-95 border border-emerald-200/80 dark:border-emerald-800"
              title="LINEやチャットに送る際、崩れず綺麗に読めるテキスト形式でコピーします"
            >
              {copyTextSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">テキストコピー完了！</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>LINE・テキスト用</span>
                </>
              )}
            </button>
          )}

          {/* 1-Tap Copy Table Button */}
          <button
            id="btn-quick-copy-summary"
            type="button"
            onClick={onQuickCopyTable}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition active:scale-95 border border-neutral-200 dark:border-neutral-700"
            title="メモ帳やNotion、Excelにそのまま表組みで貼れる形式でコピーします"
          >
            {copySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">表をコピー完了！</span>
              </>
            ) : (
              <>
                <TableIcon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                <span>ノート用表をコピー</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Big Total Display */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            今月の合計支出
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight font-mono">
              {formatJPY(totalAmount)}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              （計 {transactionCount} 件）
            </span>
          </div>
        </div>

        {/* Primary Add Button */}
        <button
          id="btn-open-quick-entry-hero"
          type="button"
          onClick={onOpenQuickEntry}
          className={`inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition ${curConfig.btnPrimary}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>使ったお金を記録</span>
        </button>
      </div>

      {/* Breakdown mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {/* Active Categories */}
        <div className="bg-neutral-50/70 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>登録項目数</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-neutral-800 dark:text-neutral-100 font-mono">
            {categoryCount} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">項目</span>
          </div>
        </div>

        {/* Top Expense Item */}
        <div className="bg-neutral-50/70 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>最大支出項目</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-neutral-800 dark:text-neutral-100 truncate">
            {topCategory ? (
              <span className="font-mono">
                {topCategory.name}{' '}
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  ({formatJPY(topCategory.total)})
                </span>
              </span>
            ) : (
              <span className="text-neutral-400 text-sm">なし</span>
            )}
          </div>
        </div>

        {/* Average per entry */}
        <div className="col-span-2 sm:col-span-1 bg-neutral-50/70 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            <Receipt className="w-3.5 h-3.5 text-blue-500" />
            <span>平均記録額</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-neutral-800 dark:text-neutral-100 font-mono">
            {transactionCount > 0 ? (
              formatJPY(Math.round(totalAmount / transactionCount))
            ) : (
              '¥0'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
