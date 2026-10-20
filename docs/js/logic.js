// Pure training logic (no DOM, no storage) — easy to test with: node scripts/test.mjs
// Inputs are plain arrays of items as they come from the store.

import { addDays, daysBetween, weekStart, weekday, hash } from './util.js';

// Rule for "ready for the next stage": the last 2 sessions on this stage each had at least
// MIN_REPS attempts and a success rate of at least 80%.
export const MIN_REPS = 5;
export const PASS_RATE = 0.8;

// Every logged attempt of one exercise on one stage, newest session first.
export function stageHistory(sessions, exId, stage) {
  const out = [];
  for (const s of sessions) {
    for (const it of s.items || []) {
      if (it.exId === exId && it.stage === stage && (it.ok || it.fail)) out.push({ day: s.day, by: s.by, ok: it.ok || 0, fail: it.fail || 0, at: s.date });
    }
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function readyToAdvance(sessions, exId, stage) {
  const h = stageHistory(sessions, exId, stage).slice(0, 2);
  return h.length === 2 && h.every((x) => x.ok + x.fail >= MIN_REPS && x.ok / (x.ok + x.fail) >= PASS_RATE);
}

export function successRate(sessions, exId, stage, last = 3) {
  const h = stageHistory(sessions, exId, stage).slice(0, last);
  const ok = h.reduce((a, x) => a + x.ok, 0), all = h.reduce((a, x) => a + x.ok + x.fail, 0);
  return all ? ok / all : null;
}

export function lastTrained(sessions, exId) {
  let last = null;
  for (const s of sessions) if ((s.items || []).some((it) => it.exId === exId) && (!last || s.day > last)) last = s.day;
  return last;
}

// Today's suggested session: n exercises still being learned, the ones not practised for the longest
// first, at most 2 from one category, plus 1 already-mastered exercise to keep it fresh.
// The same day gives the same plan on both phones.
export function planToday({ progress, sessions, exercises, day, n = 4 }) {
  const known = new Set(exercises.map((e) => e.id));
  const catOf = Object.fromEntries(exercises.map((e) => [e.id, e.cat]));
  const info = (p) => {
    const last = lastTrained(sessions, p.exId);
    const since = last ? daysBetween(last, day) : null;
    return { ...p, last, since };
  };
  const learning = progress.filter((p) => p.active && !p.mastered && known.has(p.exId)).map(info);
  const scored = learning.map((p) => {
    const ready = readyToAdvance(sessions, p.exId, p.stage || 0);
    const score = (p.since === null ? 50 : Math.min(p.since, 14) * 10) + (ready ? 15 : 0) + (hash(day + p.exId) % 9);
    let reason = p.since === null ? 'Nowe ćwiczenie' : p.since === 0 ? 'Ćwiczone dziś' : p.since === 1 ? 'Ćwiczone wczoraj' : `Nie ćwiczone od ${p.since} dni`;
    if (ready) reason = 'Gotowe na kolejny etap';
    return { exId: p.exId, stage: p.stage || 0, reason, score, kind: 'learn' };
  }).sort((a, b) => b.score - a.score);

  const picked = [], perCat = {};
  for (const c of scored) {
    if (picked.length >= n) break;
    const cat = catOf[c.exId];
    if ((perCat[cat] || 0) >= 2) continue;
    perCat[cat] = (perCat[cat] || 0) + 1;
    picked.push(c);
  }
  for (const c of scored) { if (picked.length >= n) break; if (!picked.includes(c)) picked.push(c); }

  const review = progress.filter((p) => p.mastered && known.has(p.exId)).map(info)
    .sort((a, b) => (b.since ?? 99) - (a.since ?? 99) || (hash(day + a.exId) % 100) - (hash(day + b.exId) % 100))[0];
  if (review && (review.since === null || review.since >= 3)) {
    picked.push({ exId: review.exId, stage: null, reason: 'Powtórka', kind: 'review' });
  }
  return picked;
}

// Consecutive days with at least one session, ending today (or yesterday if nothing yet today).
export function streak(sessions, today) {
  const days = new Set(sessions.map((s) => s.day));
  let d = days.has(today) ? today : addDays(today, -1), n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

export function bestStreak(sessions) {
  const days = [...new Set(sessions.map((s) => s.day))].sort();
  let best = 0, cur = 0, prev = null;
  for (const d of days) { cur = prev && daysBetween(prev, d) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; }
  return best;
}

// Sessions and minutes per week for the last `weeks` weeks, split by trainer ('a' / 'b').
export function weekly(sessions, today, weeks = 8) {
  const start = weekStart(today);
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) out.push({ week: addDays(start, -7 * i), a: 0, b: 0, min: 0 });
  const idx = Object.fromEntries(out.map((w, i) => [w.week, i]));
  for (const s of sessions) {
    const i = idx[weekStart(s.day)];
    if (i === undefined) continue;
    out[i][s.by === 'b' ? 'b' : 'a']++;
    out[i].min += (s.dur || 0) / 60;
  }
  return out;
}

// Tasks that apply to a given day. Repeat: 'daily' | 'weekly' (wd = [0..6], 0 = Monday) | 'once' (due day).
export function tasksForDay(tasks, day) {
  return tasks.filter((t) => {
    if (t.archived) return false;
    if (t.repeat === 'daily') return !t.from || t.from <= day;
    if (t.repeat === 'weekly') return (t.wd || []).includes(weekday(day)) && (!t.from || t.from <= day);
    // One-off: shown on its due day, and every day after while still not done.
    return t.repeat === 'once' && (!t.due || t.due <= day) && !t.doneAt;
  });
}

// Stages completed / all stages, for the exercises in the training plan (active or mastered).
export function overallProgress(progress, exercises) {
  const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
  let done = 0, all = 0;
  for (const p of progress) {
    const ex = byId[p.exId];
    if (!ex || !(p.active || p.mastered)) continue;
    all += ex.stages.length;
    done += p.mastered ? ex.stages.length : Math.min(p.stage || 0, ex.stages.length);
  }
  return { done, all, pct: all ? done / all : 0 };
}

export const BADGES = [
  { id: 'first', name: 'Pierwszy krok', desc: 'Pierwsza zapisana sesja', test: (c) => c.sessions >= 1 },
  { id: 's10', name: 'Rozgrzewka', desc: '10 sesji', test: (c) => c.sessions >= 10 },
  { id: 's50', name: 'Stała ekipa', desc: '50 sesji', test: (c) => c.sessions >= 50 },
  { id: 's100', name: 'Setka', desc: '100 sesji', test: (c) => c.sessions >= 100 },
  { id: 'streak7', name: 'Tydzień bez przerwy', desc: '7 dni z rzędu z treningiem', test: (c) => c.bestStreak >= 7 },
  { id: 'streak30', name: 'Miesiąc nawyku', desc: '30 dni z rzędu', test: (c) => c.bestStreak >= 30 },
  { id: 'm1', name: 'Opanowane!', desc: 'Pierwsze opanowane ćwiczenie', test: (c) => c.mastered >= 1 },
  { id: 'm5', name: 'Mądra głowa', desc: '5 opanowanych ćwiczeń', test: (c) => c.mastered >= 5 },
  { id: 'm15', name: 'Border collie pełną gębą', desc: '15 opanowanych ćwiczeń', test: (c) => c.mastered >= 15 },
  { id: 'tricks5', name: 'Showman', desc: '5 opanowanych sztuczek', test: (c) => c.tricks >= 5 },
  { id: 'team', name: 'Drużyna', desc: 'Oboje trenowaliście tego samego dnia', test: (c) => c.teamDay },
  { id: 'hour', name: 'Godzina pracy', desc: '60 minut treningu w jednym tygodniu', test: (c) => c.bestWeekMin >= 60 },
];

export function badgeContext({ sessions, progress, exercises }) {
  const catOf = Object.fromEntries(exercises.map((e) => [e.id, e.cat]));
  const byDay = {};
  sessions.forEach((s) => { (byDay[s.day] ||= new Set()).add(s.by); });
  const weeks = {};
  sessions.forEach((s) => { const w = weekStart(s.day); weeks[w] = (weeks[w] || 0) + (s.dur || 0) / 60; });
  return {
    sessions: sessions.length,
    bestStreak: bestStreak(sessions),
    mastered: progress.filter((p) => p.mastered).length,
    tricks: progress.filter((p) => p.mastered && catOf[p.exId] === 'trick').length,
    teamDay: Object.values(byDay).some((s) => s.has('a') && s.has('b')),
    bestWeekMin: Math.max(0, ...Object.values(weeks)),
  };
}
