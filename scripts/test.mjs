// Quick checks of the training logic: node scripts/test.mjs
import assert from 'node:assert/strict';
import { kennelMinutes, planDay, planToday, readyToAdvance, streak, bestStreak, weekly, tasksForDay, overallProgress } from '../docs/js/logic.js';
import { EXERCISES } from '../docs/js/exercises.js';
import { stableId, weekStart, plural, addDays } from '../docs/js/util.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok', name); };

const S = (day, by, items) => ({ id: day + by + Math.random(), day, by, date: day + 'T10:00:00Z', dur: 300, items });

t('exercise library is well-formed', () => {
  const ids = new Set();
  for (const e of EXERCISES) {
    assert.ok(e.id && e.name && e.cat && e.lvl, e.id);
    assert.ok(!ids.has(e.id), 'duplicate ' + e.id); ids.add(e.id);
    assert.ok(e.stages.length >= 2, e.id);
    e.stages.forEach((s) => assert.ok(s.t && s.d && s.goal, e.id));
  }
  for (const e of EXERCISES) (e.pre || []).forEach((p) => assert.ok(ids.has(p), `${e.id} pre ${p}`));
});

t('ready after two good sessions on the stage', () => {
  const ss = [S('2026-10-18', 'a', [{ exId: 'siad', stage: 1, ok: 8, fail: 2 }]), S('2026-10-19', 'b', [{ exId: 'siad', stage: 1, ok: 9, fail: 1 }])];
  assert.equal(readyToAdvance(ss, 'siad', 1), true);
  assert.equal(readyToAdvance(ss, 'siad', 0), false);
  ss.push(S('2026-10-20', 'a', [{ exId: 'siad', stage: 1, ok: 3, fail: 3 }]));
  assert.equal(readyToAdvance(ss, 'siad', 1), false);
});

t('plan picks least recently trained, max 2 per category, plus a review', () => {
  const progress = ['siad', 'waruj', 'zostan', 'przywolanie', 'obrot', 'szukaj'].map((exId) => ({ exId, active: true, stage: 0 }));
  progress.push({ exId: 'lapa', mastered: true, stage: 3 });
  const sessions = [S('2026-10-20', 'a', [{ exId: 'obrot', stage: 0, ok: 5, fail: 0 }])];
  const plan = planToday({ progress, sessions, exercises: EXERCISES, day: '2026-10-20', n: 4 });
  assert.equal(plan.filter((p) => p.kind === 'learn').length, 4);
  // Trained today → lowest priority, but still beats a 3rd exercise from the same category.
  assert.equal(plan.filter((p) => p.kind === 'learn')[3].exId, 'obrot');
  const obed = plan.filter((p) => EXERCISES.find((e) => e.id === p.exId).cat === 'obed' && p.kind === 'learn');
  assert.ok(obed.length <= 2);
  assert.equal(plan[plan.length - 1].exId, 'lapa');
  // Same day → same plan (both phones agree).
  assert.deepEqual(plan, planToday({ progress, sessions, exercises: EXERCISES, day: '2026-10-20', n: 4 }));
});

t('streaks', () => {
  const ss = ['2026-10-15', '2026-10-17', '2026-10-18', '2026-10-19'].map((d) => S(d, 'a', []));
  assert.equal(streak(ss, '2026-10-20'), 3);
  assert.equal(streak(ss, '2026-10-21'), 0);
  assert.equal(bestStreak(ss), 3);
});

t('weekly split by trainer', () => {
  const ss = [S('2026-10-19', 'a', []), S('2026-10-20', 'b', []), S('2026-10-12', 'a', [])];
  const w = weekly(ss, '2026-10-20', 2);
  assert.deepEqual([w[0].a, w[0].b, w[1].a, w[1].b], [1, 0, 1, 1]);
  assert.equal(weekStart('2026-10-25'), '2026-10-19');
});

t('tasks for a day', () => {
  const tasks = [{ id: 1, repeat: 'daily' }, { id: 2, repeat: 'weekly', wd: [1] }, { id: 3, repeat: 'once', due: '2026-10-19' }, { id: 4, repeat: 'once', due: '2026-10-19', doneAt: '2026-10-19' }, { id: 5, repeat: 'once', due: '2026-10-25' }];
  assert.deepEqual(tasksForDay(tasks, '2026-10-20').map((x) => x.id), [1, 2, 3]); // 20.10.2026 = wtorek
});

t('overall progress', () => {
  const p = overallProgress([{ exId: 'siad', active: true, stage: 2 }, { exId: 'lapa', mastered: true }], EXERCISES);
  assert.equal(p.all, 5 + 3);
  assert.equal(p.done, 2 + 3);
});

t('kennel minutes per day, running stay counts to now', () => {
  const st = [{ day: '2026-10-22', start: '2026-10-22T08:00:00Z', end: '2026-10-22T10:30:00Z' }, { day: '2026-10-22', start: '2026-10-22T12:00:00Z', end: null }, { day: '2026-10-21', start: '2026-10-21T08:00:00Z', end: '2026-10-21T09:00:00Z' }];
  assert.equal(kennelMinutes(st, '2026-10-22', Date.parse('2026-10-22T13:00:00Z')), 210);
  assert.equal(kennelMinutes(st, '2026-10-21'), 60);
  assert.equal(planDay({ start: '2026-10-22' }, '2026-10-28'), 7);
});

t('utils', () => {
  assert.match(stableId('progress:siad'), /^[0-9a-f]{8}-0000-4000-8000-[0-9a-f]{12}$/);
  assert.equal(stableId('a'), stableId('a'));
  assert.notEqual(stableId('a'), stableId('b'));
  assert.equal(plural(1, 'sesja', 'sesje', 'sesji'), 'sesja');
  assert.equal(plural(3, 'sesja', 'sesje', 'sesji'), 'sesje');
  assert.equal(plural(12, 'sesja', 'sesje', 'sesji'), 'sesji');
  assert.equal(plural(22, 'sesja', 'sesje', 'sesji'), 'sesje');
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
});

console.log(`\n${n} tests passed`);
