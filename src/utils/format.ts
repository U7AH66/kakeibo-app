import { CategorySummary } from '../types';

export function formatJPY(amount: number, withSymbol = true): string {
  const formatted = Math.round(amount).toLocaleString('ja-JP');
  return withSymbol ? `¥${formatted}` : formatted;
}

export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}年${parseInt(month, 10)}月`;
}

export function formatShortMonth(yearMonth: string): string {
  const parts = yearMonth.split('-');
  return `${parseInt(parts[1], 10)}月`;
}

export function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}月${d.getDate()}日(${dayNames[d.getDay()]})`;
  } catch {
    return dateStr;
  }
}

// Sort categories consistently: "お小遣い" first, then descending by total
export function getSortedSummaries(categories: CategorySummary[]): CategorySummary[] {
  return [...categories].sort((a, b) => {
    if (a.category === 'お小遣い') return -1;
    if (b.category === 'お小遣い') return 1;
    return b.total - a.total;
  });
}

/**
 * 1. シンプルなメモテキスト（従来のiPhoneメモ風形式）
 */
export function generateParentMemoText(
  yearMonth: string,
  categories: CategorySummary[],
  total: number,
  options?: { useCommas?: boolean; includeDetails?: boolean }
): string {
  const useCommas = options?.useCommas ?? false;
  const monthName = formatShortMonth(yearMonth);
  const sorted = getSortedSummaries(categories);

  const lines: string[] = [];
  lines.push(`${monthName}`);

  for (const cat of sorted) {
    if (cat.total <= 0) continue;
    const amountStr = useCommas ? cat.total.toLocaleString('ja-JP') : `${cat.total}`;
    lines.push(`${cat.category} ${amountStr}円`);

    if (options?.includeDetails && cat.transactions.length > 1) {
      cat.transactions.forEach((tx) => {
        const txAmount = useCommas ? tx.amount.toLocaleString('ja-JP') : `${tx.amount}`;
        const memoStr = tx.memo ? ` (${tx.memo})` : '';
        lines.push(`  ・${formatDateLabel(tx.date)}: ${txAmount}円${memoStr}`);
      });
    }
  }

  const totalStr = useCommas ? total.toLocaleString('ja-JP') : `${total}`;
  lines.push(`合計 ${totalStr}円`);

  return lines.join('\n');
}

/**
 * LINEや各種チャットに送るのに最も美しく崩れないプレーンテキスト形式
 * 等幅フォントに依存せず、スマートフォン画面で改行崩れ・ズレが発生しないすっきりしたレイアウト
 */
export function generateLineShareText(
  yearMonth: string,
  categories: CategorySummary[],
  total: number
): string {
  const monthLabel = formatMonthLabel(yearMonth);
  const sorted = getSortedSummaries(categories).filter((c) => c.total > 0);

  const lines: string[] = [];
  lines.push(`【${monthLabel} 家計簿集計】`);
  lines.push('------------------------');

  for (const cat of sorted) {
    const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) + '%' : '0%';
    lines.push(`・${cat.category}：¥${cat.total.toLocaleString('ja-JP')} (${pct})`);
  }

  lines.push('------------------------');
  lines.push(`◆ 合計：¥${total.toLocaleString('ja-JP')}`);

  return lines.join('\n');
}

/**
 * 2. 罫線付きテーブルテキスト（アスキー / Unicode罫線表）
 * どんなテキストメモ帳やLINE、プレーンエディタでも綺麗に揃った表になる
 */
export function generateAsciiTableText(
  yearMonth: string,
  categories: CategorySummary[],
  total: number
): string {
  const monthLabel = formatMonthLabel(yearMonth);
  const sorted = getSortedSummaries(categories).filter((c) => c.total > 0);

  // Pad helper for Japanese wide characters
  const getVisualWidth = (str: string): number => {
    let w = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      // Half-width chars
      if ((code >= 0x0020 && code <= 0x007e) || (code >= 0xff61 && code <= 0xff9f)) {
        w += 1;
      } else {
        w += 2;
      }
    }
    return w;
  };

  const padRight = (str: string, targetWidth: number): string => {
    const curWidth = getVisualWidth(str);
    const diff = Math.max(0, targetWidth - curWidth);
    return str + ' '.repeat(diff);
  };

  const padLeft = (str: string, targetWidth: number): string => {
    const curWidth = getVisualWidth(str);
    const diff = Math.max(0, targetWidth - curWidth);
    return ' '.repeat(diff) + str;
  };

  const col1Width = 14; // 項目 (7全角文字分)
  const col2Width = 12; // 金額
  const col3Width = 8;  // 割合

  const topBorder = `┌${'─'.repeat(col1Width)}┬${'─'.repeat(col2Width)}┬${'─'.repeat(col3Width)}┐`;
  const midBorder = `├${'─'.repeat(col1Width)}┼${'─'.repeat(col2Width)}┼${'─'.repeat(col3Width)}┤`;
  const botBorder = `└${'─'.repeat(col1Width)}┴${'─'.repeat(col2Width)}┴${'─'.repeat(col3Width)}┘`;

  const lines: string[] = [];
  lines.push(`【${monthLabel} 家計簿集計表】`);
  lines.push(topBorder);
  lines.push(
    `│${padRight(' 項目', col1Width)}│${padLeft('金額 ', col2Width)}│${padLeft('割合 ', col3Width)}│`
  );
  lines.push(midBorder);

  for (const cat of sorted) {
    const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) + '%' : '0.0%';
    const amountStr = `¥${cat.total.toLocaleString('ja-JP')} `;
    const catNameStr = ` ${cat.category}`;
    lines.push(
      `│${padRight(catNameStr, col1Width)}│${padLeft(amountStr, col2Width)}│${padLeft(pct + ' ', col3Width)}│`
    );
  }

  lines.push(midBorder);
  const totalAmtStr = `¥${total.toLocaleString('ja-JP')} `;
  lines.push(
    `│${padRight(' 合計', col1Width)}│${padLeft(totalAmtStr, col2Width)}│${padLeft('100.0% ', col3Width)}│`
  );
  lines.push(botBorder);

  return lines.join('\n');
}

/**
 * 3. Markdown形式の表（Notion, GitHub, Obsidian, 各種Markdownエディタ用）
 */
export function generateMarkdownTable(
  yearMonth: string,
  categories: CategorySummary[],
  total: number
): string {
  const monthLabel = formatMonthLabel(yearMonth);
  const sorted = getSortedSummaries(categories).filter((c) => c.total > 0);

  const lines: string[] = [];
  lines.push(`### ${monthLabel} 家計簿集計`);
  lines.push('');
  lines.push('| 項目 | 金額 | 割合 | 件数 |');
  lines.push('|:---|---:|---:|---:|');

  for (const cat of sorted) {
    const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) + '%' : '0%';
    lines.push(`| ${cat.category} | ¥${cat.total.toLocaleString('ja-JP')} | ${pct} | ${cat.count}件 |`);
  }

  lines.push(`| **合計** | **¥${total.toLocaleString('ja-JP')}** | **100%** | **${categories.reduce((s, c) => s + c.count, 0)}件** |`);

  return lines.join('\n');
}

/**
 * 4. リッチHTMLテーブル（Apple Notes, Word, Google Docs, Excelに貼ると本物の表セルとして貼り付けられる）
 * ※重要: Appleのメモアプリ（Apple Notes）は「<tfoot>」タグや「colspan」に対応しておらず、
 * <tfoot>内に置かれた行を完全に無視・破棄する仕様があります。
 * そのため、「合計」行は<tbody>の末尾に配置し、ヘッダーも3列に統一することで
 * Apple Notesでも確実に最後の「合計」行が表示されるように最適化しています。
 */
export function generateHtmlTable(
  yearMonth: string,
  categories: CategorySummary[],
  total: number
): string {
  const monthLabel = formatMonthLabel(yearMonth);
  const sorted = getSortedSummaries(categories).filter((c) => c.total > 0);

  let html = `<div>
<p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: bold; margin: 0 0 8px 0; color: #1f2937;">
  ${monthLabel} 家計簿集計表
</p>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; width: 100%; max-width: 480px; border: 1px solid #d1d5db;">
  <thead>
    <tr style="background-color: #f9fafb; font-weight: 600; color: #374151;">
      <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">項目</th>
      <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">金額</th>
      <th style="padding: 8px 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">割合</th>
    </tr>
  </thead>
  <tbody>
`;

  sorted.forEach((cat, index) => {
    const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) + '%' : '0%';
    const bg = index % 2 === 1 ? 'background-color: #fafafa;' : '';
    html += `    <tr style="${bg}">
      <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-weight: 500;">${cat.category}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-family: monospace;">¥${cat.total.toLocaleString('ja-JP')}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #6b7280; font-size: 12px;">${pct}</td>
    </tr>\n`;
  });

  // Apple Notes、Excel、Google Docs、Word等すべてのアプリで合計行が表示されるよう、
  // tfootではなくtbodyの最終行として出力
  html += `    <tr style="background-color: #fef3c7; font-weight: bold; color: #1f2937;">
      <td style="padding: 10px 12px; border-top: 2px solid #f59e0b; font-weight: bold;"><strong>合計</strong></td>
      <td style="padding: 10px 12px; border-top: 2px solid #f59e0b; text-align: right; font-family: monospace; font-size: 15px; color: #92400e; font-weight: bold;"><strong>¥${total.toLocaleString('ja-JP')}</strong></td>
      <td style="padding: 10px 12px; border-top: 2px solid #f59e0b; text-align: right; font-size: 12px; color: #92400e; font-weight: bold;"><strong>100%</strong></td>
    </tr>
  </tbody>
</table>
</div>`;

  return html;
}

/**
 * 5. TSV (タブ区切り) - Excelやスプレッドシートへの貼り付け用
 */
export function generateTsvTable(categories: CategorySummary[], total: number): string {
  const sorted = getSortedSummaries(categories).filter((c) => c.total > 0);
  const rows: string[] = ['項目\t金額\t割合'];

  for (const cat of sorted) {
    const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) + '%' : '0%';
    rows.push(`${cat.category}\t${cat.total}\t${pct}`);
  }
  rows.push(`合計\t${total}\t100%`);
  return rows.join('\n');
}

/**
 * プレーンテキスト専用クリップボードコピー（HTMLを含めず純粋なテキストのみをクリップボードに格納）
 * LINEやチャットアプリなど、リッチテキストを受け付けないアプリで確実にテキストとして貼り付けたい場合に使用
 */
export async function copyPlainTextToClipboard(plainContent: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(plainContent);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, falling back to textarea:', err);
  }

  // Fallback to textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = plainContent;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Textarea copy failed', err);
    return false;
  }
}

/**
 * 高機能クリップボードコピー（HTMLリッチテキストとプレーンテキストの複合コピー）
 * Apple NotesやGoogle Docsなどリッチ対応エディタでは本物の表、非対応では見やすいテキストに自動でペーストされる
 */
export async function copyTableToClipboard(
  htmlContent: string,
  plainContent: string
): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainContent], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('Rich clipboard write failed, falling back to writeText:', err);
  }

  // Fallback to plain text writeText
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(plainContent);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, falling back to execCommand:', err);
  }

  // Fallback to textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = plainContent;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('All clipboard methods failed', err);
    return false;
  }
}
