// "Next nap" estimate from age-typical wake windows.
// Wake windows are guidance ranges, not rules; always watch the child's tired cues.
// Ranges are conservative midpoints of commonly published charts, e.g.:
//   The Bump  — https://www.thebump.com/a/wake-windows
//   Hiccapop  — https://www.hiccapop.com/blogs/blog/wake-windows-by-age
//   Sleep Lady — https://sleeplady.com/baby-sleep/wake-windows-by-age/
//   Newton Baby — https://newtonbaby.com/blogs/parenting-kids/wake-windows-by-age
import { ageDays } from './core.js';

// [max age in days (exclusive), min minutes, max minutes]
const WAKE_WINDOWS = [
  [28, 35, 60], // 0–4 weeks
  [56, 60, 90], // 1–2 months
  [91, 75, 105], // 2–3 months
  [122, 90, 120], // 3–4 months
  [183, 105, 150], // 4–6 months
  [274, 120, 180], // 6–9 months
  [365, 180, 240], // 9–12 months
  [548, 240, 330], // 12–18 months
  [1096, 300, 360], // 18–36 months
];

export function wakeWindow(birthDate) {
  const d = ageDays(birthDate);
  if (d == null || d < 0) return null;
  const row = WAKE_WINDOWS.find((r) => d < r[0]);
  return row ? { min: row[1], max: row[2] } : null; // > 3 years: most children no longer nap
}

/**
 * @param child  child row (needs birth_date)
 * @param lastSleep  most recent sleep event (or undefined)
 * @param sleeping  true if a sleep timer is running
 * @returns null or { from: Date, to: Date, status: 'early'|'window'|'late', window }
 */
export function nextNap(child, lastSleep, sleeping) {
  if (sleeping || !lastSleep || !lastSleep.ended_at) return null;
  const w = wakeWindow(child.birth_date);
  if (!w) return null;
  const woke = new Date(lastSleep.ended_at).getTime();
  const from = new Date(woke + w.min * 60000);
  const to = new Date(woke + w.max * 60000);
  const now = Date.now();
  // Ignore stale data (e.g. last sleep recorded > 12 h ago).
  if (now - woke > 12 * 3600000) return null;
  const status = now < from ? 'early' : now <= to ? 'window' : 'late';
  return { from, to, status, window: w };
}
