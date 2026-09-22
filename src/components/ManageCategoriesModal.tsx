import React, { useState } from 'react';
import { X, Plus, Trash2, Coins, Check, RotateCcw, Cloud, Calendar, Clock } from 'lucide-react';
import { CategoryItem, ColorTheme, DefaultDateType, PeriodRangeMode, PeriodSettings } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { THEME_CONFIGS } from '../utils/theme';
import { getMonthDateRange } from '../utils/period';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  defaultAllowance: number;
  onSaveDefaultAllowance: (amount: number) => void;
  periodSettings: PeriodSettings;
  onSavePeriodSettings: (settings: PeriodSettings) => void;
  currentMonth: string;
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
  periodSettings,
  onSavePeriodSettings,
  currentMonth,
  onResetToSampleData,
  onOpenSync,
  colorTheme = 'amber',
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [allowanceInput, setAllowanceInput] = useState(defaultAllowance.toString());
  const [allowanceSaved, setAllowanceSaved] = useState(false);

  // Period & Date settings state
  const [cutoffDay, setCutoffDay] = useState<number>(periodSettings?.cutoffDay ?? 18);
  const [rangeMode, setRangeMode] = useState<PeriodRangeMode>(periodSettings?.rangeMode ?? 'prev_day_to_cur_day');
  const [defaultDateType, setDefaultDateType] = useState<DefaultDateType>(periodSettings?.defaultDateType ?? 'cutoff_day');
  const [customDefaultDay, setCustomDefaultDay] = useState<number>(periodSettings?.customDefaultDay ?? 18);
  const [periodSaved, setPeriodSaved] = useState(false);

  const curConfig = THEME_CONFIGS[colorTheme];

  if (!isOpen) return null;

  // Real-time preview of the resulting date range for currentMonth
  const previewRange = getMonthDateRange(currentMonth, {
    cutoffDay,
    rangeMode,
    defaultDateType,
    customDefaultDay,
  });

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

  const handleSavePeriodSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: PeriodSettings = {
      cutoffDay: Math.max(1, Math.min(31, cutoffDay)),
      rangeMode,
      defaultDateType,
      customDefaultDay: Math.max(1, Math.min(31, customDefaultDay)),
    };
    onSavePeriodSettings(newSettings);
    setPeriodSaved(true);
    setTimeout(() => setPeriodSaved(false), 2000);
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
              記録期間・初期値・項目設定
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              記録の締め日、日付の自動入力、項目の管理を設定
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
          {/* 1. Period & Cutoff Date Setting */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-neutral-900 dark:text-white">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>記録する期間・締め日の設定</span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                毎月 {cutoffDay} 日
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              給料日や締め日に合わせて、1か月の集計対象とする期間を設定できます。（例: 18日設定で「10月度」は <strong>9/18 〜 10/18</strong>）
            </p>

            {/* Cutoff Day Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                毎月の締め日（基準日）
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="input-cutoff-day"
                    type="number"
                    min="1"
                    max="31"
                    value={cutoffDay}
                    onChange={(e) => setCutoffDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 text-xs font-bold font-mono rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
                    日
                  </span>
                </div>
                {/* Quick Presets */}
                <div className="flex gap-1">
                  {[18, 20, 25, 1].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setCutoffDay(day)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition ${
                        cutoffDay === day
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {day === 1 ? '1日(暦月)' : `${day}日`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Range Mode Options */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                期間の区切り方
              </label>
              <div className="space-y-1.5">
                <label className="flex items-start space-x-2 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 transition">
                  <input
                    type="radio"
                    name="rangeMode"
                    value="prev_day_to_cur_day"
                    checked={rangeMode === 'prev_day_to_cur_day'}
                    onChange={() => setRangeMode('prev_day_to_cur_day')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold">前月{cutoffDay}日 〜 当月{cutoffDay}日（推奨）</span>
                    <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                      10月度なら「9/{cutoffDay} 〜 10/{cutoffDay}」の範囲をまとめます
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-2 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 transition">
                  <input
                    type="radio"
                    name="rangeMode"
                    value="cur_cutoff"
                    checked={rangeMode === 'cur_cutoff'}
                    onChange={() => setRangeMode('cur_cutoff')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold">前月{Math.min(31, cutoffDay + 1)}日 〜 当月{cutoffDay}日（{cutoffDay}日締め）</span>
                    <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                      締め日の翌日から当月締め日までの1か月間
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-2 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 transition">
                  <input
                    type="radio"
                    name="rangeMode"
                    value="calendar"
                    checked={rangeMode === 'calendar'}
                    onChange={() => setRangeMode('calendar')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold">1日 〜 末日（カレンダー通り）</span>
                    <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                      通常のカレンダー通り、当月1日から最終日まで
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Live Preview Banner */}
            <div className="p-2.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400">
                表示中（{currentMonth}）の対象:
              </span>
              <span className="font-bold font-mono text-amber-800 dark:text-amber-300">
                {previewRange.fullLabel}
              </span>
            </div>
          </div>

          {/* 2. Default Recording Date Setting */}
          <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-neutral-900 dark:text-white">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>記録時の日付（初期設定）</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              記録するたびにカレンダーで日時を選ぶ手間を省くため、記録画面を開いたときに自動入力される初期日付を設定できます。
            </p>

            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 transition">
                <input
                  type="radio"
                  name="defaultDateType"
                  value="cutoff_day"
                  checked={defaultDateType === 'cutoff_day'}
                  onChange={() => setDefaultDateType('cutoff_day')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <span className="font-bold">締め日・基準日（毎月{cutoffDay}日）</span>
                  <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                    記録を開いたとき自動で締め日の日付（{cutoffDay}日）がセットされます
                  </span>
                </div>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 transition">
                <input
                  type="radio"
                  name="defaultDateType"
                  value="today"
                  checked={defaultDateType === 'today'}
                  onChange={() => setDefaultDateType('today')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <div>
                  <span className="font-bold">今日の日付（当日）</span>
                  <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                    記録を開いたとき自動で本日の日付がセットされます
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/80 transition">
                <input
                  type="radio"
                  name="defaultDateType"
                  value="custom_day"
                  checked={defaultDateType === 'custom_day'}
                  onChange={() => setDefaultDateType('custom_day')}
                  className="mt-1 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <span className="font-bold">指定した日（毎月〇日）</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={customDefaultDay}
                      onChange={(e) => setCustomDefaultDay(parseInt(e.target.value, 10) || 1)}
                      disabled={defaultDateType !== 'custom_day'}
                      className="w-20 px-2 py-1 text-xs font-bold font-mono rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-40"
                    />
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      日を初期日付にする
                    </span>
                  </div>
                </div>
              </label>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
              ※記録画面を開いた後でも、ワンタップボタン（[今日] [締め日] [昨日]）やカレンダーでいつでも自由に変更できます。
            </p>

            {/* Save Button for Period & Date Settings */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePeriodSettings}
                className={`px-4 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1.5 ${curConfig.btnPrimary}`}
              >
                {periodSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>期間・初期日付を保存しました</span>
                  </>
                ) : (
                  <span>期間・初期日付設定を保存</span>
                )}
              </button>
            </div>
          </div>

          {/* 3. Default Allowance Setting */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>毎月のお小遣い基本額（任意）</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              毎月定額のお小遣いを記録したい場合のみ設定してください（使わない場合は0円のままでOKです）
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
                  placeholder="0"
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

          {/* 4. Add Category Form */}
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

          {/* 5. Categories List */}
          <div>
            <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              登録済み項目一覧 ({categories.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c, idx) => {
                const isProtected = c.name === 'お小遣い';
                const itemKey = c.id ? `${c.id}-${c.name}-${idx}` : `cat-${idx}-${c.name}`;
                return (
                  <div
                    key={itemKey}
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
