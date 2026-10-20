// App shell: hash router, bottom tabs, delegated click actions, re-render on data changes.

import * as D from './data.js';
import * as Today from './s-today.js';
import * as Lib from './s-library.js';
import * as Session from './s-session.js';
import * as Progress from './s-progress.js';
import * as Tasks from './s-tasks.js';
import * as More from './s-more.js';
import { icon, toast } from './ui.js';
import { checkForUpdate, applyUpdate } from './update.js';

const { store } = D;

const ROUTES = [
  { re: /^#\/?$/, tab: 'today', render: Today.render, actions: Today.actions },
  { re: /^#\/lib$/, tab: 'lib', render: Lib.render, mount: Lib.mount, actions: Lib.actions },
  { re: /^#\/ex\/([\w-]+)$/, tab: 'lib', render: (m) => Lib.renderDetail({ id: m[1] }), mount: Lib.mountDetail, actions: Lib.actions },
  { re: /^#\/session$/, tab: null, render: Session.render, mount: Session.mount, actions: Session.actions },
  { re: /^#\/progress$/, tab: 'progress', render: Progress.render, actions: Progress.actions },
  { re: /^#\/tasks$/, tab: 'tasks', render: Tasks.render, actions: Tasks.actions },
  { re: /^#\/settings$/, tab: 'today', render: More.renderSettings, mount: More.mountSettings, actions: More.actions },
  { re: /^#\/cues$/, tab: 'lib', render: More.renderCues, actions: More.actions },
  { re: /^#\/welcome$/, tab: null, render: More.renderWelcome, actions: More.actions },
];
// Actions any screen can use (and the ones defined by the Today screen, which other screens reuse for task ticks).
const GLOBAL = {
  go: (el) => { location.hash = el.dataset.to; },
  back: () => { if (history.length > 1) history.back(); else location.hash = '#/'; },
  'session-detail': (el) => Progress.sessionDetail(el.dataset.id),
  ...Today.actions,
};

const TABS = [
  ['today', '#/', 'home', 'Dziś'],
  ['lib', '#/lib', 'book', 'Ćwiczenia'],
  ['progress', '#/progress', 'chart', 'Postęp'],
  ['tasks', '#/tasks', 'tasks', 'Zadania'],
];

const main = document.getElementById('main');
const nav = document.getElementById('tabs');
let current = null;
let lastHash = null;

function route() {
  const h = location.hash || '#/';
  for (const r of ROUTES) { const m = h.match(r.re); if (m) return { ...r, m }; }
  return { ...ROUTES[0], m: [] };
}

function render() {
  if (!D.settings().onboarded && location.hash !== '#/welcome') { location.replace('#/welcome'); return; }
  current = route();
  const hashChanged = lastHash !== location.hash;
  const y = window.scrollY;
  main.innerHTML = current.render(current.m);
  current.mount?.(main, current.m);
  nav.hidden = !current.tab;
  document.body.classList.toggle('no-tabs', !current.tab);
  nav.innerHTML = TABS.map(([k, href, ic, label]) => `<a href="${href}" class="${current.tab === k ? 'on' : ''}" ${current.tab === k ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span></a>`).join('');
  window.scrollTo(0, hashChanged ? 0 : y);
  lastHash = location.hash;
}
window.__rerender = render;

// Don't redraw under someone's fingers: if they are typing in a field, wait until they leave it.
let pending = false;
function softRender() {
  const a = document.activeElement;
  if (a && main.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'radio') {
    if (!pending) { pending = true; a.addEventListener('blur', () => { pending = false; setTimeout(render, 50); }, { once: true }); }
    return;
  }
  render();
}

document.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || !document.body.contains(el)) return;
  if (el.closest('.sheet-wrap')) return; // sheets handle their own clicks
  const name = el.dataset.act;
  const fn = current?.actions?.[name] || GLOBAL[name];
  if (!fn) return;
  if (el.tagName !== 'INPUT') ev.preventDefault();
  try { await fn(el, ev); } catch (e) { console.error(e); toast('Coś poszło nie tak: ' + (e.message || e)); }
});

window.addEventListener('hashchange', render);

(async function start() {
  await store.openStore();
  store.onChange(() => softRender());
  render();
  if (store.configured) store.syncNow().catch(() => {});
  if (D.settings().onboarded && !D.hasChosenMe()) More.askWhoAmI();
  if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  setTimeout(async () => {
    try { const v = await checkForUpdate(); if (v) toast('Jest nowa wersja aplikacji', { action: 'Aktualizuj', onAction: applyUpdate, ms: 10000 }); } catch { /* offline */ }
  }, 3000);
})();
