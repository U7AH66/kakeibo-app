import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import { CategorySummary, ColorTheme } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatDateLabel, formatJPY } from '../utils/format';
import { THEME_CONFIGS } from '../utils/theme';

interface CategoryAggregateListProps {
  categories: CategorySummary[];
  totalAmount: number;
  onOpenQuickAddWithCategory: (categoryName: string) => void;
  onDeleteTransaction: (id: string) => void;
  colorTheme?: ColorTheme;
}

export const CategoryAggregateList: React.FC<CategoryAggregateListProps> = ({
  categories,
  totalAmount,
  onOpenQuickAddWithCategory,
  onDeleteTransaction,
  colorTheme = 'amber',
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const curConfig = THEME_CONFIGS[colorTheme];

  const toggleExpand = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">
          この月の記帳データはありません
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm mx-auto">
          「使ったお金を記録」ボタンから項目と金額を入力すると、自動的に項目ごとに集計・加算されます。
        </p>
        <button
          type="button"
          onClick={() => onOpenQuickAddWithCategory('飯')}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-xs ${curConfig.btnPrimary}`}
        >
          <Plus className="w-4 h-4" />
          <span>最初の項目を記録する</span>
        </button>
      </div>
    );
  }

  // Sort: お小遣い first, then by total amount descending
  const sorted = [...categories].sort((a, b) => {
    if (a.category === 'お小遣い') return -1;
    if (b.category === 'お小遣い') return 1;
    return b.total - a.total;
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            項目別・自動集計一覧
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            項目ごとに合算された合計額（タップで内訳を確認・追加）
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          全 {categories.length} 項目
        </span>
      </div>

      {/* List items */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {sorted.map((item) => {
          const isExpanded = !!expandedCategories[item.category];
          const percentage = totalAmount > 0 ? Math.round((item.total / totalAmount) * 100) : 0;
          const isAllowance = item.category === 'お小遣い';

          return (
            <div
              key={item.category}
              className="transition hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40"
            >
              <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                {/* Left: Category Icon, Name, Count */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.category)}
                  className="flex items-center space-x-3 text-left flex-1 min-w-0 group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition"
                    style={
                      isAllowance
                        ? {
                            backgroundColor: '#10b98115',
                            borderColor: '#10b98130',
                            color: '#10b981',
                          }
                        : {
                            backgroundColor: `${curConfig.previewColor}18`,
                            borderColor: `${curConfig.previewColor}35`,
                            color: curConfig.previewColor,
                          }
                    }
                  >
                    <CategoryIcon name={isAllowance ? 'Coins' : undefined} className="w-4 h-4" />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.category}
                      </span>
                      {isAllowance && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          定額
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{item.count} 件の記録</span>
                      <span>・</span>
                      <span>{percentage}%</span>
                    </div>
                  </div>
                </button>

                {/* Right: Sum Amount, Quick Add button, Expand button */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-white">
                      {formatJPY(item.total)}
                    </div>
                  </div>

                  {/* Quick Add button for this exact category */}
                  <button
                    type="button"
                    title={`【${item.category}】に金額を加算`}
                    onClick={() => onOpenQuickAddWithCategory(item.category)}
                    className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Expand Chevron */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.category)}
                    aria-label={isExpanded ? '内訳を閉じる' : '内訳を表示'}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-5 pb-1">
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: isAllowance ? '#10b981' : curConfig.previewColor,
                    }}
                  />
                </div>
              </div>

              {/* Expanded Breakdown Transactions */}
              {isExpanded && (
                <div className="bg-neutral-50/80 dark:bg-neutral-950/60 px-5 py-3 border-t border-b border-neutral-200/60 dark:border-neutral-800 space-y-2 animate-in fade-in duration-150">
                  <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>
                      【{item.category}】の内訳履歴 ({item.transactions.length}件)
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenQuickAddWithCategory(item.category)}
                      className={`hover:underline inline-flex items-center space-x-1 font-bold ${curConfig.textAccent}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>この項目に追加</span>
                    </button>
                  </div>

                  {item.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px] shrink-0">
                          {formatDateLabel(tx.date)}
                        </span>
                        {tx.memo && (
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate">
                            {tx.memo}
                          </span>
                        )}
                        {!tx.memo && (
                          <span className="text-neutral-400 dark:text-neutral-500 italic">
                            メモなし
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        <span className="font-bold font-mono text-neutral-900 dark:text-white">
                          {formatJPY(tx.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="この支出を削除"
                          className="p-1 rounded-md text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
