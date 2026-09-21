import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowRight } from 'lucide-react';
import { CategoryItem, ColorTheme, Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatJPY } from '../utils/format';
import { THEME_CONFIGS } from '../utils/theme';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  currentMonth: string;
  categoryTotals: Record<string, number>;
  initialCategory?: string;
  onAddTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onAddNewCategory: (name: string) => void;
  colorTheme?: ColorTheme;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentMonth,
  categoryTotals,
  initialCategory,
  onAddTransaction,
  onAddNewCategory,
  colorTheme = 'amber',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('飯');
  const [amountStr, setAmountStr] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const curConfig = THEME_CONFIGS[colorTheme];

  // Sync initial category and default date
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (categories.length > 0) {
      const exists = categories.some((c) => c.name === '飯');
      setSelectedCategory(exists ? '飯' : categories[0].name);
    }
  }, [initialCategory, categories, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      if (today.startsWith(currentMonth)) {
        setDate(today);
      } else {
        setDate(`${currentMonth}-01`);
      }
      setAmountStr('');
      setMemo('');
      setIsCreatingCategory(false);
      setNewCatName('');
    }
  }, [isOpen, currentMonth]);

  if (!isOpen) return null;

  const currentTotal = categoryTotals[selectedCategory] || 0;
  const numAmount = parseInt(amountStr, 10) || 0;
  const newTotal = currentTotal + numAmount;

  const handleQuickAddAmount = (addValue: number) => {
    const cur = parseInt(amountStr, 10) || 0;
    setAmountStr((cur + addValue).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    onAddTransaction({
      month: currentMonth,
      date: date || `${currentMonth}-01`,
      category: selectedCategory,
      amount: numAmount,
      memo: memo.trim() || undefined,
    });

    onClose();
  };

  const handleCreateCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    onAddNewCategory(trimmed);
    setSelectedCategory(trimmed);
    setNewCatName('');
    setIsCreatingCategory(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-neutral-900 dark:text-white">
              使ったお金を記録
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              項目と金額を入力すると、自動的に加算されて合計が更新されます
            </p>
          </div>
          <button
            id="btn-close-quick-entry"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Amount input */}
          <div>
            <label
              htmlFor="input-amount"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              使った金額（円）
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500 font-bold text-lg">
                ¥
              </div>
              <input
                id="input-amount"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                min="1"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-12 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-2xl font-bold font-mono text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
              />
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  クリア
                </button>
              )}
            </div>

            {/* Quick addition buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mr-1">
                ワンタップ加算:
              </span>
              {[100, 500, 1000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 transition active:scale-95"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                加算する項目
              </label>
              {!isCreatingCategory && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className={`text-xs font-medium inline-flex items-center space-x-0.5 hover:underline ${curConfig.textAccent}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>項目を追加</span>
                </button>
              )}
            </div>

            {/* New Category Input Form */}
            {isCreatingCategory && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <input
                  type="text"
                  placeholder="例: ガソリン, 本, 病院"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!newCatName.trim()}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg disabled:opacity-50 ${curConfig.btnPrimary}`}
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const totalForCat = categoryTotals[cat.name] || 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex flex-col items-start p-2.5 rounded-xl text-left border transition relative ${
                      isSelected
                        ? `${curConfig.borderAccent} bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white ring-2 ring-neutral-300 dark:ring-neutral-700`
                        : 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 w-full">
                      <CategoryIcon
                        name={cat.iconName}
                        className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400"
                      />
                      <span className="text-xs font-bold truncate">{cat.name}</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                      {totalForCat > 0 ? formatJPY(totalForCat) : '¥0'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automatic calculation preview box */}
          {selectedCategory && (
            <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-xl p-3.5 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  【{selectedCategory}】
                </span>
                <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  現在の合計:{' '}
                  <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatJPY(currentTotal)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1.5 font-bold justify-end">
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-white font-mono text-base font-extrabold">
                    {formatJPY(newTotal)}
                  </span>
                </div>
                {numAmount > 0 && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    +{numAmount.toLocaleString()}円 自動加算
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Date & Memo in two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="input-date"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                日付
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white dark:bg-neutral-800"
              />
            </div>
            <div>
              <label
                htmlFor="input-memo"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                メモ（任意）
              </label>
              <input
                id="input-memo"
                type="text"
                placeholder="例: スーパー、コンビニ、外食"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white dark:bg-neutral-800"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="btn-submit-quick-entry"
              type="submit"
              disabled={numAmount <= 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50 ${curConfig.btnPrimary}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>自動加算して記録する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
