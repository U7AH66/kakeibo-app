import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { ColorTheme, Transaction } from '../types';
import { formatDateLabel, formatJPY } from '../utils/format';
import { THEME_CONFIGS } from '../utils/theme';

interface TransactionHistoryViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onSelectCategoryFilter?: (category: string) => void;
  colorTheme?: ColorTheme;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  transactions,
  onDeleteTransaction,
  colorTheme = 'amber',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const curConfig = THEME_CONFIGS[colorTheme];

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memo && tx.memo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || tx.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Sort descending by date, then createdAt
  const sorted = [...filtered].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
      {/* Header with Search & Filter */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            記帳履歴・明細一覧
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            全 {filtered.length} 件
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="項目名やメモで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">すべての項目</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
          該当する履歴はありません
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-96 overflow-y-auto">
          {sorted.map((tx) => (
            <div
              key={tx.id}
              className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition"
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {tx.category}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                    {formatDateLabel(tx.date)}
                  </span>
                  {tx.category === 'お小遣い' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                      お小遣い
                    </span>
                  )}
                </div>
                {tx.memo && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {tx.memo}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  {formatJPY(tx.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteTransaction(tx.id)}
                  title="削除"
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
};
