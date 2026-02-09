/**
 * Parse YYYY-MM-DD as local date at midnight (avoids timezone shift when using new Date(str)).
 * Use this for anniversary/start dates so "Feb 9" is Feb 9 in the user's timezone, not UTC.
 */
export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

/**
 * Format a date string (YYYY-MM-DD) for display in the user's locale.
 */
export function formatMemoryDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export type DateFormatPreference = 'DMY' | 'MDY';

/**
 * Format YYYY-MM-DD for display according to preference (dd/mm/yyyy or mm/dd/yyyy).
 */
export function formatDateByPreference(isoDate: string, format: DateFormatPreference): string {
  if (!isoDate || typeof isoDate !== 'string') return isoDate ?? '';
  const d = parseLocalDate(isoDate.trim());
  if (!d) return isoDate; // e.g. legacy "Sep 12, 2023" stays as-is
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return format === 'DMY' ? `${day}/${month}/${year}` : `${month}/${day}/${year}`;
}

/**
 * Format raw input as date with slashes: dd/mm/yyyy or mm/dd/yyyy (same mask shape).
 * Only allows digits; inserts / after 2 and 4 digits. Max 8 digits + 2 slashes.
 */
export function formatDateInputMask(raw: string): string {
  const digits = raw.replaceAll(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Parse user input (dd/mm/yyyy or mm/dd/yyyy) to YYYY-MM-DD for storage.
 */
export function parseUserDateToISO(input: string, format: DateFormatPreference): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/[/\-.]/).map((p) => Number.parseInt(p, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  let y: number, m: number, d: number;
  if (format === 'DMY') {
    [d, m, y] = parts;
  } else {
    [m, d, y] = parts;
  }
  if (y < 100) y += 2000;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Days until the next monthly anniversary (same day of month as startDate).
 * e.g. startDate June 15 → next 15th of the month.
 */
export function daysUntilNextMonthly(startDate: Date): number {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), startDate.getDate());
  if (thisMonth > now) return Math.ceil((thisMonth.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, startDate.getDate());
  return Math.ceil((nextMonth.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Days until the next yearly anniversary (same month and day as startDate).
 */
export function daysUntilNextYearly(startDate: Date): number {
  const now = new Date();
  let next = new Date(now.getFullYear(), startDate.getMonth(), startDate.getDate());
  if (next <= now) next = new Date(now.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
  return Math.ceil((next.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Total days between startDate and now.
 */
export function daysBetween(startDate: Date): number {
  return Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Years between startDate and now (whole years).
 */
export function yearsBetween(startDate: Date): number {
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  const m = now.getMonth() - startDate.getMonth();
  const d = now.getDate() - startDate.getDate();
  if (m < 0 || (m === 0 && d < 0)) years -= 1;
  return years;
}

/**
 * Next anniversary date (same month/day as startDate, this year or next).
 */
export function nextAnniversaryDate(startDate: Date): Date {
  const now = new Date();
  let next = new Date(now.getFullYear(), startDate.getMonth(), startDate.getDate());
  if (next <= now) next = new Date(now.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
  return next;
}
