import type { BudgetCycle, CyclePeriod } from '../types';

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function clampDay(y: number, m: number, d: number): number {
  return Math.min(d, daysInMonth(y, m));
}

export function fmtISO(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtShort(d: Date): string {
  return MONTH_ABBR[d.getMonth()] + ' ' + d.getDate();
}

export function dateFmt(ds: string): string {
  const d = parseISO(ds);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return fmtShort(d);
}

export function getCycleForOffset(cycle: BudgetCycle, offset: number): CyclePeriod {
  const today = new Date();
  const anchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (cycle.type === 'weekly') {
    const dow = cycle.startDayOfWeek;
    const diffToStart = (anchor.getDay() - dow + 7) % 7;
    const currentStart = new Date(anchor);
    currentStart.setDate(anchor.getDate() - diffToStart);
    const start = new Date(currentStart);
    start.setDate(start.getDate() + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  } else if (cycle.type === 'monthly') {
    const sd = cycle.startDay;
    let y = anchor.getFullYear();
    let m = anchor.getMonth();
    let start = new Date(y, m, clampDay(y, m, sd));
    if (anchor < start) {
      m -= 1;
      if (m < 0) {
        m = 11;
        y -= 1;
      }
      start = new Date(y, m, clampDay(y, m, sd));
    }
    let cy = start.getFullYear();
    let cm = start.getMonth();
    cm += offset;
    cy += Math.floor(cm / 12);
    cm = ((cm % 12) + 12) % 12;
    const cStart = new Date(cy, cm, clampDay(cy, cm, sd));
    let ncy = cy;
    let ncm = cm + 1;
    ncy += Math.floor(ncm / 12);
    ncm = ((ncm % 12) + 12) % 12;
    const nStart = new Date(ncy, ncm, clampDay(ncy, ncm, sd));
    const cEnd = new Date(nStart.getFullYear(), nStart.getMonth(), nStart.getDate() - 1);
    return { start: cStart, end: cEnd };
  } else {
    const [d1raw, d2raw] = cycle.days;
    const d1 = Math.min(d1raw, d2raw);
    const d2 = Math.max(d1raw, d2raw);
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const c1s = new Date(y, m, clampDay(y, m, d1));
    const c2s = new Date(y, m, clampDay(y, m, d2));
    const idx = anchor < c1s ? -1 : anchor < c2s ? 0 : 1;
    const totalIdx = y * 24 + m * 2 + idx + offset;
    const ty = Math.floor(totalIdx / 24);
    const rem = ((totalIdx % 24) + 24) % 24;
    const tm = Math.floor(rem / 2);
    const half = rem % 2;
    if (half === 0) {
      const st = new Date(ty, tm, clampDay(ty, tm, d1));
      const en = new Date(ty, tm, clampDay(ty, tm, d2) - 1);
      return { start: st, end: en };
    } else {
      const st = new Date(ty, tm, clampDay(ty, tm, d2));
      let nmm = tm + 1;
      let nyy = ty;
      nyy += Math.floor(nmm / 12);
      nmm = ((nmm % 12) + 12) % 12;
      const en = new Date(nyy, nmm, clampDay(nyy, nmm, d1) - 1);
      return { start: st, end: en };
    }
  }
}
