import { PeriodSettings, PeriodRangeMode, DefaultDateType } from '../types';

export const DEFAULT_PERIOD_SETTINGS: PeriodSettings = {
  cutoffDay: 18, // 毎月18日
  rangeMode: 'prev_day_to_cur_day', // 10月度であれば 9/18 〜 10/18
  defaultDateType: 'cutoff_day', // 記録時の初期日付（締め日 18日）
  customDefaultDay: 18,
};

export interface MonthDateRange {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  label: string;     // e.g. "9/18 〜 10/18"
  fullLabel: string; // e.g. "2026年10月度 (9/18 〜 10/18)"
  shortMonth: string;// e.g. "10月"
  yearMonth: string; // "2026-10"
}

/**
 * Returns the maximum days in a given year and month (1-indexed month)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Compute the date range (start, end, labels) for a given cycle month "YYYY-MM"
 */
export function getMonthDateRange(yearMonth: string, settings: PeriodSettings = DEFAULT_PERIOD_SETTINGS): MonthDateRange {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const cutoff = Math.max(1, Math.min(31, settings.cutoffDay || 18));
  const rangeMode = settings.rangeMode || 'prev_day_to_cur_day';

  // Standard calendar month
  if (rangeMode === 'calendar' || cutoff === 1) {
    const lastDay = getDaysInMonth(year, month);
    const startDate = `${year}-${pad(month)}-01`;
    const endDate = `${year}-${pad(month)}-${pad(lastDay)}`;
    return {
      startDate,
      endDate,
      label: `1日 〜 ${lastDay}日`,
      fullLabel: `${year}年${month}月度 (1日〜${lastDay}日)`,
      shortMonth: `${month}月`,
      yearMonth,
    };
  }

  // Previous month calculation
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const prevMonthMaxDays = getDaysInMonth(prevYear, prevMonth);
  const curMonthMaxDays = getDaysInMonth(year, month);

  let startDate: string;
  let endDate: string;
  let label: string;

  if (rangeMode === 'prev_day_to_cur_day') {
    // ユーザー指定: 例えば10月であれば 9/18 〜 10/18
    const startDay = Math.min(cutoff, prevMonthMaxDays);
    const endDay = Math.min(cutoff, curMonthMaxDays);
    startDate = `${prevYear}-${pad(prevMonth)}-${pad(startDay)}`;
    endDate = `${year}-${pad(month)}-${pad(endDay)}`;
    label = `${prevMonth}/${startDay} 〜 ${month}/${endDay}`;
  } else if (rangeMode === 'cur_cutoff') {
    // 18日締め（前月19日 〜 当月18日）
    const startDay = Math.min(cutoff + 1, prevMonthMaxDays);
    const endDay = Math.min(cutoff, curMonthMaxDays);
    startDate = `${prevYear}-${pad(prevMonth)}-${pad(startDay)}`;
    endDate = `${year}-${pad(month)}-${pad(endDay)}`;
    label = `${prevMonth}/${startDay} 〜 ${month}/${endDay}`;
  } else {
    // cur_start: 18日開始（前月18日 〜 当月17日）
    const startDay = Math.min(cutoff, prevMonthMaxDays);
    const endDay = Math.min(Math.max(1, cutoff - 1), curMonthMaxDays);
    startDate = `${prevYear}-${pad(prevMonth)}-${pad(startDay)}`;
    endDate = `${year}-${pad(month)}-${pad(endDay)}`;
    label = `${prevMonth}/${startDay} 〜 ${month}/${endDay}`;
  }

  return {
    startDate,
    endDate,
    label,
    fullLabel: `${year}年${month}月度 (${label})`,
    shortMonth: `${month}月`,
    yearMonth,
  };
}

/**
 * Determine which cycle month a specific date "YYYY-MM-DD" belongs to
 */
export function getMonthForDate(dateStr: string, settings: PeriodSettings = DEFAULT_PERIOD_SETTINGS): string {
  try {
    const [yStr, mStr, dStr] = dateStr.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);

    const cutoff = Math.max(1, Math.min(31, settings.cutoffDay || 18));
    const rangeMode = settings.rangeMode || 'prev_day_to_cur_day';

    if (rangeMode === 'calendar' || cutoff === 1) {
      return `${y}-${pad(m)}`;
    }

    if (rangeMode === 'prev_day_to_cur_day') {
      // 9/18〜10/18 が 10月度
      // 9月中: 18日以降(d >= 18)は翌月(10月度)
      // 10月中: 18日以下(d <= 18)は当月(10月度)、19日以降(d > 18)は翌月(11月度)
      if (d >= cutoff) {
        let nextM = m + 1;
        let nextY = y;
        if (nextM > 12) {
          nextM = 1;
          nextY += 1;
        }
        return `${nextY}-${pad(nextM)}`;
      } else {
        return `${y}-${pad(m)}`;
      }
    } else if (rangeMode === 'cur_cutoff') {
      // 前月19日〜当月18日
      if (d > cutoff) {
        let nextM = m + 1;
        let nextY = y;
        if (nextM > 12) {
          nextM = 1;
          nextY += 1;
        }
        return `${nextY}-${pad(nextM)}`;
      } else {
        return `${y}-${pad(m)}`;
      }
    } else {
      // cur_start: 前月18日〜当月17日
      if (d >= cutoff) {
        let nextM = m + 1;
        let nextY = y;
        if (nextM > 12) {
          nextM = 1;
          nextY += 1;
        }
        return `${nextY}-${pad(nextM)}`;
      } else {
        return `${y}-${pad(m)}`;
      }
    }
  } catch {
    const today = new Date();
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  }
}

/**
 * Returns today's active cycle month based on period settings
 */
export function getCurrentCycleMonth(settings: PeriodSettings = DEFAULT_PERIOD_SETTINGS): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  return getMonthForDate(dateStr, settings);
}

/**
 * Returns the default record date string "YYYY-MM-DD" for the quick entry modal
 */
export function getDefaultRecordDate(
  currentMonth: string,
  settings: PeriodSettings = DEFAULT_PERIOD_SETTINGS
): string {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const range = getMonthDateRange(currentMonth, settings);

  switch (settings.defaultDateType) {
    case 'today':
      // If user selected "今日の日付", return today's actual date
      return todayStr;

    case 'custom_day': {
      const [yearStr, monthStr] = currentMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const targetDay = Math.min(
        settings.customDefaultDay || 18,
        getDaysInMonth(year, month)
      );
      return `${year}-${pad(month)}-${pad(targetDay)}`;
    }

    case 'cutoff_day':
    default: {
      // 締め日・基準日（毎月18日）
      // Return the cutoff day for the current cycle!
      // In 10月度 (9/18〜10/18), the closing day is 10/18 (or 9/18 if prefer start).
      // Usually users record entries with the period's standard cutoff date:
      const [yearStr, monthStr] = currentMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const cutoff = Math.min(settings.cutoffDay || 18, getDaysInMonth(year, month));
      return `${year}-${pad(month)}-${pad(cutoff)}`;
    }
  }
}
