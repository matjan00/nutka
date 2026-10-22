// "Dziś" — today's plan, tasks, streak and week progress.

import * as D from './data.js';
import { planToday, streak, tasksForDay, weekly } from './logic.js';
import { icon, ring, toast, vibrate } from './ui.js';
import { esc, dayKey, fmtDayLong, plural, hash } from './util.js';
import { exBadge, stageText, avatar, sessionRow, whoChip, assigneeChip, emptyState } from './comp.js';
import { syncLine } from './s-more.js';
import { draft, startSession } from './s-session.js';
import { install, isInstalled } from './install.js';
import { planHero, mealsCard, kennelCard, mountLive } from './s-plan.js';

const SETUP_KEY = 'nutka.setupHidden';

const calmTrick = (e) => e.calm && e.cat !== 'beh';

// While a behaviorist's plan is on, the training plan only uses calm tricks (the plan's own exercises happen at meals).
function todaysPlan(day, protocol) {
  const all = D.exercises();
  const exercises = protocol ? all.filter(calmTrick) : all;
  return planToday({ progress: D.progressList(), sessions: D.sessions(), exercises, day, n: protocol ? 3 : D.settings().perSession || 4 });
}
export const mount = (root) => mountLive(root);

export function render() {
  const day = dayKey(), s = D.settings(), meK = D.me();
  const sessions = D.sessions();
  const protocol = D.activeProtocol(day);
  const plan = todaysPlan(day, protocol);
  const week = weekly(sessions, day, 1)[0];
  const wkCount = week.a + week.b, goal = s.weeklyGoal || 10;
  const st = streak(sessions, day);
  const todays = sessions.filter((x) => x.day === day);
  const tasks = tasksForDay(D.tasks(), day);
  const doneTasks = tasks.filter((t) => D.tickOf(t, day)).length;
  const dr = draft();

  return `
  <header class="top home-top">
    ${avatar(48)}
    <div class="top-title"><h1>Cześć, ${esc(D.trainerName(meK))}!</h1><p class="sub">${esc(fmtDayLong(day))}</p></div>
    <div class="top-right"><button class="icon-btn" data-act="go" data-to="#/settings" aria-label="Ustawienia">${icon('gear')}</button></div>
  </header>

  ${syncErrorBanner()}
  ${dr ? `<button class="banner live" data-act="go" data-to="#/session">${icon('timer')}<span><strong>Trening w toku</strong><small>${dr.items.length} ${plural(dr.items.length, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')} — wróć i dokończ</small></span>${icon('next')}</button>` : ''}

  ${protocol ? planHero(protocol, day) + mealsCard(protocol, day) + kennelCard(protocol, day) : `<section class="hero card">
    <div class="hero-ring">${ring(wkCount / goal, 84, 9)}<div class="hero-ring-num"><strong>${wkCount}</strong><small>/ ${goal}</small></div></div>
    <div class="hero-text">
      <p class="hero-line">${wkCount >= goal ? `Cel tygodnia zrobiony! Brawo, ${esc(D.dogName())}!` : `W tym tygodniu jeszcze ${goal - wkCount} ${plural(goal - wkCount, 'sesja', 'sesje', 'sesji')} do celu`}</p>
      <div class="hero-chips">
        <span class="chip ${st ? 'flame' : ''}">${icon('flame')} ${st} ${plural(st, 'dzień', 'dni', 'dni')} z rzędu</span>
        <span class="chip">${todays.length ? `${todays.length}× dziś` : 'Dziś jeszcze nic'}</span>
      </div>
      <p class="split">${whoChip('a')} ${week.a} &nbsp; ${whoChip('b')} ${week.b}</p>
    </div>
  </section>`}

  <section class="card">
    <div class="card-head"><h2>${protocol ? 'Spokojne sztuczki' : todays.length ? 'Następny trening' : 'Plan na dziś'}</h2><span class="muted small">${plan.length ? `~${Math.max(5, plan.length * 2)} min` : ''}</span></div>
    ${protocol ? '<p class="muted small">Tylko niepobudzające ćwiczenia — najlepiej przy posiłku na dworze (zaznaczysz je w kafelku posiłku). Pozostałe ćwiczenia czekają do końca zaleceń.</p>' : ''}
    ${plan.length ? `<ul class="plan">${plan.map((p) => {
      const ex = D.exercise(p.exId);
      return `<li><button class="plan-row" data-act="go" data-to="#/ex/${esc(p.exId)}">${exBadge(ex)}
        <span class="grow"><strong>${esc(ex.name)}</strong><small>${esc(stageText(ex, p.stage))}</small></span>
        <span class="reason ${p.reason.startsWith('Gotowe') ? 'ready' : ''}">${esc(p.reason)}</span></button></li>`;
    }).join('')}</ul>
    <div class="row gap mt"><button class="btn primary grow big" data-act="start-plan">${icon('play')} Zacznij trening</button>
      <button class="btn ghost" data-act="start-empty" aria-label="Wybierz ćwiczenia samodzielnie">${icon('plus')} Wybierz</button></div>`
    : emptyState('Brak ćwiczeń w planie', 'Wybierz z biblioteki, czego chcecie uczyć — plan dnia ułoży się sam.', '<button class="btn primary" data-act="go" data-to="#/lib">Wybierz ćwiczenia</button>')}
  </section>

  <section class="card">
    <div class="card-head"><h2>Zadania na dziś</h2><button class="link" data-act="go" data-to="#/tasks">${tasks.length ? `${doneTasks}/${tasks.length}` : 'Dodaj'} ${icon('next')}</button></div>
    ${tasks.length ? `<ul class="checks">${tasks.map((t) => taskCheck(t, day)).join('')}</ul>` : `<p class="muted">Brak zadań na dziś.${protocol ? ' Posiłki i kenel z zaleceń są wyżej.' : ''}</p>`}
  </section>

  ${setupRow()}

  ${sessions.length ? `<section class="card"><div class="card-head"><h2>Ostatnie treningi</h2><button class="link" data-act="go" data-to="#/progress">Postęp ${icon('next')}</button></div>
    <div class="list">${sessions.slice(0, 3).map(sessionRow).join('')}</div></section>` : ''}

  ${tipCard(day)}
  ${syncLine()}`;
}

// Install + login in one slim row below today's work; can be hidden (both stay in Settings).
function setupRow() {
  if (D.local.get(SETUP_KEY) === '1') return '';
  const items = [];
  if (!isInstalled()) items.push(`<button class="btn small secondary" data-act="install">${icon('download')} Zainstaluj aplikację</button>`);
  if (D.store.configured && D.store.syncState().status === 'signed-out') items.push(`<button class="btn small secondary" data-act="go" data-to="#/settings">${icon('sync')} Zaloguj się</button>`);
  if (!items.length) return '';
  return `<section class="setup"><p>Dokończ ustawienia</p><div class="setup-actions">${items.join('')}</div>
    <button class="icon-btn" data-act="setup-hide" aria-label="Ukryj — znajdziesz to w Ustawieniach">${icon('x')}</button></section>`;
}

function syncErrorBanner() {
  if (!D.store.configured || D.store.syncState().status !== 'error') return '';
  return `<button class="banner warn" data-act="sync-retry">${icon('alert')}<span><strong>Nie udało się zsynchronizować</strong><small>Dane są bezpieczne na tym telefonie. Stuknij, żeby spróbować ponownie.</small></span>${icon('sync')}</button>`;
}

export function taskCheck(t, day) {
  const tick = D.tickOf(t, day);
  return `<li><button class="check ${tick ? 'on' : ''}" data-act="tick" data-id="${esc(t.id)}" data-day="${day}" aria-pressed="${tick ? 'true' : 'false'}">
    <span class="box">${icon('check')}</span>
    <span class="grow"><span class="t">${esc(t.title)}</span>
    <small>${tick ? `zrobione · ${esc(D.trainerName(tick.by))}` : assigneeChip(t.who)}</small></span></button></li>`;
}

function tipCard(day) {
  const ok = D.activeProtocol(day) ? (e) => e.calm : () => true;
  const pool = D.exercises().filter((e) => ok(e) && D.progress(e.id).active && e.tips?.length);
  const src = pool.length ? pool : D.exercises().filter((e) => ok(e) && e.tips?.length);
  if (!src.length) return '';
  const ex = src[hash(day) % src.length];
  const tip = ex.tips[hash(day + 'tip') % ex.tips.length];
  return `<section class="card tip">${icon('bulb')}<div><p>${esc(tip)}</p><p class="sub">Wskazówka dnia · <a href="#/ex/${esc(ex.id)}">${esc(ex.name)}</a></p></div></section>`;
}

export const actions = {
  install: () => install(),
  'setup-hide': () => { D.local.set(SETUP_KEY, '1'); toast('Ukryte — instalacja i logowanie są w Ustawieniach'); window.__rerender?.(); },
  'sync-retry': () => D.store.syncNow().then(() => toast('Zsynchronizowano ✓')).catch(() => toast('Nadal się nie udaje — sprawdź internet')),
  'start-plan': () => {
    const plan = todaysPlan(dayKey(), D.activeProtocol());
    startSession(plan.map((p) => ({ exId: p.exId, stage: p.stage })));
  },
  'start-empty': () => startSession([]),
  tick: async (el) => {
    const t = D.tasks().find((x) => x.id === el.dataset.id);
    if (!t) return;
    const was = D.tickOf(t, el.dataset.day);
    vibrate();
    await D.toggleTask(t, el.dataset.day);
    if (!was) toast('Odhaczone ✓');
  },
};
