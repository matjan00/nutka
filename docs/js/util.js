// Small shared helpers: ids, dates (local calendar days as 'YYYY-MM-DD'), HTML escaping.

export const uid = () => (crypto.randomUUID ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16)));

// Stable UUID-shaped id from a text key, so both phones write the same row (e.g. progress of one exercise).
export function stableId(key) {
  let h1 = 0x811c9dc5, h2 = 0;
  for (const c of key) {
    h1 = Math.imul(h1 ^ c.charCodeAt(0), 16777619) >>> 0;
    h2 = (h2 * 31 + c.charCodeAt(0)) >>> 0;
  }
  const a = h1.toString(16).padStart(8, '0');
  const b = h2.toString(16).padStart(8, '0');
  return `${a}-0000-4000-8000-${b}${a.slice(0, 4)}`;
}

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseDay = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); };
export const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);
// Monday of the week containing day k.
export const weekStart = (k) => addDays(k, -((parseDay(k).getDay() + 6) % 7));
export const weekday = (k) => (parseDay(k).getDay() + 6) % 7; // 0 = poniedziałek

export const WD_SHORT = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'];
const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const WD_LONG = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
export const fmtDay = (k) => { const d = parseDay(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const fmtDayLong = (k) => `${WD_LONG[weekday(k)]}, ${fmtDay(k)}`;
export function fmtRelDay(k, today = dayKey()) {
  const n = daysBetween(k, today);
  if (n === 0) return 'dziś';
  if (n === 1) return 'wczoraj';
  if (n > 1 && n < 7) return `${n} dni temu`;
  return fmtDay(k);
}
export const fmtDur = (s) => {
  const m = Math.round((s || 0) / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
};
export const fmtClock = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

// Polish plural: plural(5, 'sesja', 'sesje', 'sesji')
export function plural(n, one, few, many) {
  if (n === 1) return one;
  const d = n % 10, t = n % 100;
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Deterministic small hash, used to vary the daily plan the same way on both phones.
export function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
