import React, { useState } from 'react';
import { X, Plus, Trash2, Coins, Check, RotateCcw, Cloud } from 'lucide-react';
import { CategoryItem, ColorTheme } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { THEME_CONFIGS } from '../utils/theme';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  defaultAllowance: number;
  onSaveDefaultAllowance: (amount: number) => void;
  onResetToSampleData: () => void;
  onOpenSync?: () => void;
  colorTheme?: ColorTheme;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  defaultAllowance,
  onSaveDefaultAllowance,
  onResetToSampleData,
  onOpenSync,
  colorTheme = 'amber',
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [allowanceInput, setAllowanceInput] = useState(defaultAllowance.toString());
  const [allowanceSaved, setAllowanceSaved] = useState(false);
  const curConfig = THEME_CONFIGS[colorTheme];

  if (!isOpen) return null;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    if (categories.some((c) => c.name === name)) {
      alert('同じ名前の項目が既に存在します');
      return;
    }

    onAddCategory({
      id: `cat-${Date.now()}`,
      name,
      iconName: 'Tag',
    });

    setNewCatName('');
  };

  const handleSaveAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(allowanceInput, 10);
    if (!isNaN(val) && val >= 0) {
      onSaveDefaultAllowance(val);
      setAllowanceSaved(true);
      setTimeout(() => setAllowanceSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-modal-title"
        className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 id="categories-modal-title" className="text-base font-bold text-neutral-900 dark:text-white">
              項目と基本設定
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              仕訳項目の管理とお小遣いの基本金額を設定
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Default Allowance Setting */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>毎月のお小遣い基本額</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              毎月の開始時に自動計上される定額お小遣いを設定します
            </p>
            <form onSubmit={handleSaveAllowance} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
                  ¥
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={allowanceInput}
                  onChange={(e) => setAllowanceInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-bold font-mono rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1 ${curConfig.btnPrimary}`}
              >
                {allowanceSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>保存完了</span>
                  </>
                ) : (
                  <span>保存する</span>
                )}
              </button>
            </form>
          </div>

          {/* Add Category Form */}
          <div>
            <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              新しい項目を追加
            </h3>
            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="項目名（例: 本、交通費、趣味）"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center space-x-1.5 shadow-xs ${curConfig.btnPrimary}`}
              >
                <Plus className="w-4 h-4" />
                <span>追加</span>
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div>
            <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              登録済み項目一覧 ({categories.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const isProtected = c.name === 'お小遣い';
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <CategoryIcon
                        name={c.iconName}
                        className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0"
                      />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {c.name}
                      </span>
                    </div>

                    {!isProtected && (
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(c.id)}
                        className="p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="項目を削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cloud Sync & Reset Section */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('初期サンプルデータにリセットしますか？現在のデータは上書きされます。')) {
                  onResetToSampleData();
                  onClose();
                }
              }}
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>初期サンプルデータに戻す</span>
            </button>

            {onOpenSync && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSync();
                }}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center space-x-1 font-semibold"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>アカウント同期設定を開く</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
