// Domain layer over the store: settings, exercises (built-in + own), progress, sessions, tasks, notes.

import * as store from './store.js';
import { EXERCISES } from './exercises.js';
import { stableId, dayKey } from './util.js';

const DEFAULTS = { dogName: '', dogBorn: '', photo: '', trainers: { a: '', b: '' }, weeklyGoal: 10, perSession: 4, onboarded: false };

export function settings() {
  const s = store.getConfig('settings', DEFAULTS);
  return { ...s, trainers: { ...DEFAULTS.trainers, ...(s.trainers || {}) } };
}
export const saveSettings = (patch) => store.setConfig('settings', { ...settings(), ...patch, id: undefined });

// Who is holding this phone — stored only on this device, not synced.
const ls = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  del: (k) => { try { localStorage.removeItem(k); } catch { /* private mode */ } },
};
export const local = ls;
export const me = () => (ls.get('aport.me') === 'b' ? 'b' : 'a');
export const setMe = (k) => ls.set('aport.me', k);
export const hasChosenMe = () => ls.get('aport.me') !== null;
export const trainerName = (k) => settings().trainers[k] || (k === 'b' ? 'Osoba 2' : 'Osoba 1');
export const dogName = () => settings().dogName || 'Pies';

// ---------- exercises ----------
export const customExercises = () => store.all('custom').map((c) => ({ ...c, custom: true, stages: c.stages || [], tips: c.tips || [], mistakes: c.mistakes || [] }));
export const exercises = () => [...EXERCISES, ...customExercises()];
export const exercise = (id) => EXERCISES.find((e) => e.id === id) || customExercises().find((e) => e.id === id);
export const saveCustom = (ex) => store.put('custom', ex);
export async function removeCustom(id) {
  await store.remove(id);
  const p = store.get(progId(id));
  if (p) await store.remove(progId(id));
}

// ---------- progress (one shared row per exercise) ----------
const progId = (exId) => stableId('progress:' + exId);
export const progressList = () => store.all('progress');
export const progress = (exId) => store.get(progId(exId)) || { exId, active: false, mastered: false, stage: 0, ticks: {} };
export const setProgress = (exId, patch) => store.put('progress', { ...progress(exId), ...patch, exId, id: progId(exId) });

export async function completeStage(exId, i) {
  const ex = exercise(exId), p = progress(exId);
  const ticks = { ...(p.ticks || {}) };
  for (let j = 0; j <= i; j++) ticks[j] ||= { day: dayKey(), by: me() };
  const stage = Math.max(p.stage || 0, i + 1);
  const mastered = stage >= ex.stages.length;
  await setProgress(exId, { ticks, stage, mastered, active: !mastered, masteredAt: mastered ? (p.masteredAt || dayKey()) : null });
  return { mastered };
}
export async function uncompleteStage(exId, i) {
  const p = progress(exId);
  const ticks = { ...(p.ticks || {}) };
  Object.keys(ticks).forEach((k) => { if (Number(k) >= i) delete ticks[k]; });
  await setProgress(exId, { ticks, stage: Math.min(p.stage || 0, i), mastered: false, active: true, masteredAt: null });
}
export async function markMastered(exId) {
  const ex = exercise(exId), p = progress(exId);
  const ticks = { ...(p.ticks || {}) };
  ex.stages.forEach((_, j) => { ticks[j] ||= { day: dayKey(), by: me() }; });
  await setProgress(exId, { ticks, stage: ex.stages.length, mastered: true, active: false, masteredAt: dayKey() });
}

// ---------- sessions ----------
export const sessions = () => store.all('session').sort((a, b) => (a.date < b.date ? 1 : -1));
export const saveSession = (s) => store.put('session', s);
export const removeSession = (id) => store.remove(id);

// ---------- tasks ----------
// task: { title, who: 'a'|'b'|'both', repeat: 'daily'|'weekly'|'once', wd: [0..6], due, note, from, doneAt, doneBy }
// Repeating tasks are ticked per day with a separate 'tick' row, so both phones can tick without conflicts.
export const tasks = () => store.all('task').sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.title).localeCompare(b.title, 'pl'));
export const saveTask = (t) => store.put('task', t);
export const removeTask = (id) => store.remove(id);
const tickId = (taskId, day) => stableId(`tick:${taskId}:${day}`);
export const tickOf = (task, day) => (task.repeat === 'once' ? (task.doneAt ? { by: task.doneBy, day: task.doneAt } : null) : store.get(tickId(task.id, day)) || null);
export const ticks = () => store.all('tick');
export async function toggleTask(task, day) {
  if (task.repeat === 'once') {
    return store.put('task', { ...task, doneAt: task.doneAt ? null : day, doneBy: task.doneAt ? null : me() });
  }
  const id = tickId(task.id, day);
  if (store.get(id)) return store.remove(id);
  return store.put('tick', { id, taskId: task.id, day, by: me() });
}

// ---------- journal notes and cue words ----------
export const notes = () => store.all('note').sort((a, b) => (a.at < b.at ? 1 : -1));
export const saveNote = (n) => store.put('note', n);
export const removeNote = (id) => store.remove(id);
export const words = () => store.all('word').sort((a, b) => String(a.word).localeCompare(b.word, 'pl'));
export const saveWord = (w) => store.put('word', w);
export const removeWord = (id) => store.remove(id);

// Starter set for a 2-year-old border collie; used by onboarding.
export const STARTER_GOALS = ['marker', 'patrz', 'przywolanie', 'smycz', 'zostan', 'relaks', 'obrot', 'szukaj'];
export const BASICS_CHECK = ['imie', 'siad', 'waruj', 'lapa', 'wolne', 'czekaj', 'stoj', 'aport'];
export const STARTER_TASKS = [
  { title: 'Spacer węchowy (min. 20 min, dużo wąchania)', who: 'both', repeat: 'daily', order: 1 },
  { title: '2 krótkie sesje treningowe (5–10 min)', who: 'both', repeat: 'daily', order: 2 },
  { title: 'Zabawka-łamigłówka lub mata węchowa', who: 'both', repeat: 'daily', order: 3 },
  { title: 'Chwila wyciszenia na macie', who: 'both', repeat: 'daily', order: 4 },
  { title: 'Czesanie', who: 'both', repeat: 'weekly', wd: [2, 6], order: 5 },
  { title: 'Kontrola pazurów, uszu i zębów', who: 'both', repeat: 'weekly', wd: [6], order: 6 },
];

export { store };
