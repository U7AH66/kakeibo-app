import React from 'react';
import { X, Sun, Moon, Laptop, Palette, Check } from 'lucide-react';
import { ColorTheme, ThemeMode } from '../types';
import { THEME_CONFIGS } from '../utils/theme';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  colorTheme: ColorTheme;
  onSelectColorTheme: (theme: ColorTheme) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onSelectThemeMode,
  colorTheme,
  onSelectColorTheme,
}) => {
  if (!isOpen) return null;

  const curConfig = THEME_CONFIGS[colorTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${curConfig.badge}`}>
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-base font-bold text-neutral-900 dark:text-white">
                デザイン設定
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                ライト/ダークモードやお好みのアクセントカラーを設定
              </p>
            </div>
          </div>
          <button
            id="btn-close-theme-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-6">
          {/* Theme Mode (Light / Dark / System) */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2.5">
              画面の明るさ（モード）
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-theme-mode-light"
                onClick={() => onSelectThemeMode('light')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition ${
                  themeMode === 'light'
                    ? `${curConfig.borderAccent} bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white ring-2 ring-neutral-400/30 font-bold`
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Sun className="w-5 h-5 mb-1.5 text-amber-500" />
                <span className="text-xs">ライト</span>
              </button>

              <button
                type="button"
                id="btn-theme-mode-dark"
                onClick={() => onSelectThemeMode('dark')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition ${
                  themeMode === 'dark'
                    ? `${curConfig.borderAccent} bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white ring-2 ring-neutral-400/30 font-bold`
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Moon className="w-5 h-5 mb-1.5 text-indigo-400" />
                <span className="text-xs">ダーク</span>
              </button>

              <button
                type="button"
                id="btn-theme-mode-system"
                onClick={() => onSelectThemeMode('system')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition ${
                  themeMode === 'system'
                    ? `${curConfig.borderAccent} bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white ring-2 ring-neutral-400/30 font-bold`
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Laptop className="w-5 h-5 mb-1.5 text-neutral-500" />
                <span className="text-xs">端末に連動</span>
              </button>
            </div>
          </div>

          {/* Color Palette Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2.5">
              アクセントカラー
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(THEME_CONFIGS) as ColorTheme[]).map((themeKey) => {
                const conf = THEME_CONFIGS[themeKey];
                const isSelected = colorTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => onSelectColorTheme(themeKey)}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? `${conf.borderAccent} bg-neutral-50 dark:bg-neutral-800/90 ring-2 ring-neutral-300 dark:ring-neutral-700 font-bold`
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shadow-xs shrink-0"
                      style={{ backgroundColor: conf.previewColor }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold">{conf.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Sample */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 space-y-2">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block">
              カラープレビュー
            </span>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${curConfig.badge}`}>
                今月の集計
              </span>
              <button
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-bold shadow-xs ${curConfig.btnPrimary}`}
              >
                記録ボタン
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
