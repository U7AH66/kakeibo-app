import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Table as TableIcon,
  AlignLeft,
  FileCode,
  FileSpreadsheet,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { CategorySummary, ColorTheme, TableExportFormat } from '../types';
import {
  generateParentMemoText,
  generateLineShareText,
  generateAsciiTableText,
  generateMarkdownTable,
  generateHtmlTable,
  generateTsvTable,
  copyTableToClipboard,
  copyPlainTextToClipboard,
  formatMonthLabel,
  formatJPY,
  getSortedSummaries,
} from '../utils/format';
import { THEME_CONFIGS } from '../utils/theme';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  categories: CategorySummary[];
  totalAmount: number;
  colorTheme?: ColorTheme;
  onShowToast?: (msg: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  categories,
  totalAmount,
  colorTheme = 'amber',
  onShowToast,
}) => {
  const [formatType, setFormatType] = useState<TableExportFormat>('line-text');
  const [useCommas, setUseCommas] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const curConfig = THEME_CONFIGS[colorTheme];
  const sorted = getSortedSummaries(categories).filter((c) => c.total > 0);

  // Generate plain text according to selected format
  const getExportText = (): string => {
    switch (formatType) {
      case 'line-text':
        return generateLineShareText(currentMonth, categories, totalAmount);
      case 'rich-table':
      case 'ascii-table':
        return generateAsciiTableText(currentMonth, categories, totalAmount);
      case 'markdown':
        return generateMarkdownTable(currentMonth, categories, totalAmount);
      case 'tsv':
        return generateTsvTable(categories, totalAmount);
      case 'simple-text':
      default:
        return generateParentMemoText(currentMonth, categories, totalAmount, {
          useCommas,
        });
    }
  };

  const handleCopy = async () => {
    const htmlContent = generateHtmlTable(currentMonth, categories, totalAmount);
    const plainText = getExportText();

    let success = false;
    if (formatType === 'rich-table') {
      // Copy both rich HTML table (for Notes / Excel / Docs) and clean plain text
      success = await copyTableToClipboard(htmlContent, plainText);
    } else {
      // For LINE, text, markdown, tsv: copy pure plain text so no rich HTML causes garbled formatting
      success = await copyPlainTextToClipboard(plainText);
    }

    if (success) {
      setCopied(true);
      if (onShowToast) {
        onShowToast(
          formatType === 'rich-table'
            ? 'ノート・エクセル用「表」をコピーしました！'
            : formatType === 'line-text'
            ? 'LINE用テキストをコピーしました！'
            : 'クリップボードにコピーしました！'
        );
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const text = getExportText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${formatMonthLabel(currentMonth)}の家計簿集計`,
          text: text,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`p-1 rounded-md ${curConfig.badge}`}>
                <TableIcon className="w-4 h-4" />
              </span>
              <h2 id="export-modal-title" className="text-base font-bold text-neutral-900 dark:text-white">
                表・テキスト出力
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              LINEやチャット、メモ帳、Excelなど用途に合わせて選べます
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

        {/* Format Selector Tabs */}
        <div className="px-5 pt-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none text-xs">
            {/* LINE / Chat Text (Recommended for LINE) */}
            <button
              type="button"
              onClick={() => setFormatType('line-text')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition shrink-0 ${
                formatType === 'line-text'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>LINE・チャット用</span>
            </button>

            {/* Apple Notes / Excel Rich Table */}
            <button
              type="button"
              onClick={() => setFormatType('rich-table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition shrink-0 ${
                formatType === 'rich-table'
                  ? `${curConfig.badge} shadow-2xs`
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Appleメモ・Excel表</span>
            </button>

            {/* Simple Text */}
            <button
              type="button"
              onClick={() => setFormatType('simple-text')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition shrink-0 ${
                formatType === 'simple-text'
                  ? `${curConfig.badge} shadow-2xs`
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>シンプルテキスト</span>
            </button>

            {/* ASCII Table */}
            <button
              type="button"
              onClick={() => setFormatType('ascii-table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition shrink-0 ${
                formatType === 'ascii-table'
                  ? `${curConfig.badge} shadow-2xs`
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>罫線枠つき表</span>
            </button>

            {/* Markdown */}
            <button
              type="button"
              onClick={() => setFormatType('markdown')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition shrink-0 ${
                formatType === 'markdown'
                  ? `${curConfig.badge} shadow-2xs`
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Visual Table Preview */}
          {formatType === 'rich-table' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold">貼り付けイメージ（表形式プレビュー）</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ コピー後、メモ帳にペーストで本物の表になります
                </span>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-bold border-b border-neutral-200 dark:border-neutral-700">
                    <tr>
                      <th className="py-2.5 px-3">項目</th>
                      <th className="py-2.5 px-3 text-right">金額</th>
                      <th className="py-2.5 px-3 text-right">割合</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                    {sorted.map((cat, idx) => {
                      const pct =
                        totalAmount > 0
                          ? ((cat.total / totalAmount) * 100).toFixed(1) + '%'
                          : '0%';
                      return (
                        <tr
                          key={cat.category}
                          className={idx % 2 === 1 ? 'bg-neutral-50/50 dark:bg-neutral-800/30' : ''}
                        >
                          <td className="py-2 px-3 font-semibold text-neutral-800 dark:text-neutral-200">
                            {cat.category}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                            {formatJPY(cat.total)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-neutral-500 dark:text-neutral-400 text-[11px]">
                            {pct}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-amber-50/80 dark:bg-amber-950/40 border-t-2 border-amber-400/80 font-bold text-neutral-900 dark:text-white">
                    <tr>
                      <td className="py-2.5 px-3">合計</td>
                      <td className="py-2.5 px-3 text-right font-mono text-sm text-amber-900 dark:text-amber-200">
                        {formatJPY(totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[11px] text-amber-800 dark:text-amber-300">
                        100%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold">
                  {formatType === 'line-text'
                    ? 'LINE向け（画面幅で崩れない見やすいテキスト）'
                    : 'プレーンテキスト プレビュー'}
                </span>
                {formatType === 'simple-text' && (
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCommas}
                      onChange={(e) => setUseCommas(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>カンマ区切り</span>
                  </label>
                )}
                {formatType === 'line-text' && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ プロポーショナルフォントでも崩れません
                  </span>
                )}
              </div>

              <pre className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre overflow-x-auto max-h-64 select-all shadow-inner">
                {getExportText()}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              id="btn-copy-export-text"
              type="button"
              onClick={handleCopy}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition ${
                formatType === 'line-text'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : curConfig.btnPrimary
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                  <span>コピーしました！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {formatType === 'rich-table'
                      ? '表としてコピー'
                      : formatType === 'line-text'
                      ? 'LINE用テキストをコピー'
                      : 'テキストをコピー'}
                  </span>
                </>
              )}
            </button>

            <button
              id="btn-native-share"
              type="button"
              onClick={handleNativeShare}
              className="py-3 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-[0.98] shadow-xs"
            >
              <Share2 className="w-4 h-4 text-neutral-300" />
              <span>共有 / 送信</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
