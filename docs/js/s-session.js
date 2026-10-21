// Training session: big tap counters for successful / failed reps, a timer, ticking off stages.
// The running session is a draft kept on this phone (survives closing the app) until saved.

import * as D from './data.js';
import { MIN_REPS, PASS_RATE, stageHistory } from './logic.js';
import { icon, openSheet, toast, confirmSheet, vibrate } from './ui.js';
import { esc, dayKey, fmtClock, uid } from './util.js';
import { exBadge, stageText, catShort } from './comp.js';

const KEY = 'nutka.draft';
export function draft() {
  try { const d = JSON.parse(D.local.get(KEY) || 'null'); return d && Array.isArray(d.items) ? d : null; } catch { return null; }
}
const saveDraft = (d) => D.local.set(KEY, JSON.stringify(d));
const clearDraft = () => D.local.del(KEY);

export function startSession(items) {
  const newItem = (it) => ({ exId: it.exId, stage: it.stage !== undefined ? it.stage : currentStage(it.exId), ok: 0, fail: 0, log: [], passed: false, note: '' });
  const cur = draft();
  if (cur) {
    // A session is already running: add what's missing to it instead of starting over.
    items.forEach((it) => { if (!cur.items.some((x) => x.exId === it.exId)) cur.items.push(newItem(it)); });
    saveDraft(cur);
  } else {
    saveDraft({ startedAt: Date.now(), by: D.me(), items: items.map(newItem) });
  }
  location.hash = '#/session';
}

function currentStage(exId) {
  const p = D.progress(exId), ex = D.exercise(exId);
  return p.mastered || !ex ? null : Math.min(p.stage || 0, ex.stages.length - 1);
}

let timer = null;
// Stopwatch for duration stages ("zostań", relaks): tap to start, tap to stop and see seconds.
const watch = { start: 0, last: null, raf: 0 };
let audio = null;
function clickSound() {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime;
    [0, 0.045].forEach((dt, k) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'square';
      o.frequency.value = k ? 2600 : 3200;
      g.gain.setValueAtTime(0.0001, t + dt);
      g.gain.exponentialRampToValueAtTime(0.35, t + dt + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.03);
      o.connect(g).connect(audio.destination);
      o.start(t + dt); o.stop(t + dt + 0.035);
    });
  } catch { /* no audio */ }
}
function tickWatch() {
  const el = document.getElementById('sw');
  if (!watch.start || !el) return;
  el.textContent = ((Date.now() - watch.start) / 1000).toFixed(1) + ' s';
  watch.raf = requestAnimationFrame(tickWatch);
}
export function mount(root) {
  clearInterval(timer);
  const d = draft();
  if (!d) return;
  const el = root.querySelector('#timer');
  const tick = () => { if (el) el.textContent = fmtClock((Date.now() - d.startedAt) / 1000); };
  tick();
  timer = setInterval(() => { if (!document.body.contains(el)) return clearInterval(timer); tick(); }, 1000);
  if (watch.start) tickWatch();
  root.querySelectorAll('textarea[data-note]').forEach((ta) => {
    ta.oninput = () => { const dd = draft(); dd.items[Number(ta.dataset.note)].note = ta.value; saveDraft(dd); };
  });
}

export function render() {
  const d = draft();
  if (!d) {
    return `<header class="top"><button class="icon-btn" data-act="back">${icon('back')}</button><div class="top-title"><h1>Trening</h1></div></header>
      <div class="empty">${icon('paw', 'big')}<h3>Brak trwającego treningu</h3><p>Zacznij z planu dnia albo dodaj ćwiczenia.</p>
      <button class="btn primary" data-act="new-empty">Nowy trening</button></div>`;
  }
  const sessions = D.sessions();
  return `
  <header class="top session-top">
    <button class="icon-btn" data-act="go" data-to="#/" aria-label="Wróć (trening zostaje zapisany jako szkic)">${icon('back')}</button>
    <div class="top-title"><p class="eyebrow">Trening · ${esc(D.trainerName(d.by))} z ${esc(D.dogName())}</p><h1 class="timer" id="timer">0:00</h1></div>
    <div class="top-right"><button class="icon-btn" data-act="discard" aria-label="Porzuć trening">${icon('trash')}</button></div>
  </header>
  <p class="hint">Stuknij <b>✓</b> po każdym udanym powtórzeniu, <b>✗</b> po nieudanym. 5–10 minut wystarczy — kończcie, gdy pies jeszcze chce więcej.</p>
  <div class="tools">
    <button class="tool" data-act="click-sound" aria-label="Kliker — dźwięk markera">${icon('target')}<span>Kliker</span></button>
    <button class="tool ${watch.start ? 'on' : ''}" data-act="stopwatch" aria-label="Stoper do zostań">${icon('timer')}<span id="sw">${watch.start ? 'Stop' : watch.last !== null ? watch.last.toFixed(1) + ' s' : 'Stoper'}</span></button>
  </div>
  ${d.items.length ? d.items.map((it, i) => itemCard(it, i, sessions)).join('') : '<div class="empty small"><p>Dodaj pierwsze ćwiczenie.</p></div>'}
  <button class="btn ghost wide" data-act="add-ex">${icon('plus')} Dodaj ćwiczenie</button>
  <div class="sticky-cta"><button class="btn primary big wide" data-act="finish" ${d.items.length ? '' : 'disabled'}>${icon('check')} Zakończ i zapisz</button></div>`;
}

function itemCard(it, i, sessions) {
  const ex = D.exercise(it.exId);
  if (!ex) return '';
  const st = it.stage;
  const stage = st !== null && st !== undefined ? ex.stages[st] : null;
  const total = it.ok + it.fail;
  const rate = total ? it.ok / total : 0;
  const prev = stage ? stageHistory(sessions, it.exId, st)[0] : null;
  const prevPass = prev && prev.ok + prev.fail >= MIN_REPS && prev.ok / (prev.ok + prev.fail) >= PASS_RATE;
  const nowPass = total >= MIN_REPS && rate >= PASS_RATE;
  let hint = '';
  if (stage && nowPass && prevPass) hint = `<p class="pass-hint ready">${icon('star')} Kryterium spełnione 2 sesje z rzędu — odhacz etap!</p>`;
  else if (stage && nowPass) hint = `<p class="pass-hint">${icon('check')} Świetna seria! Jeszcze jedna taka sesja i etap zaliczony.</p>`;
  else if (total >= 4 && rate < 0.5) hint = `<p class="pass-hint warn">${icon('info')} Dużo pomyłek — ułatwcie (bliżej, krócej, lepsza nagroda) albo wróćcie do poprzedniego etapu.</p>`;

  return `<article class="card sess-item ${it.passed ? 'passed' : ''}">
    <div class="sess-head">${exBadge(ex)}
      <button class="grow plain" data-act="toggle-info" data-i="${i}"><strong>${esc(ex.name)}</strong><small>${esc(stageText(ex, st))}</small></button>
      <button class="icon-btn small" data-act="remove-item" data-i="${i}" aria-label="Usuń z treningu">${icon('x')}</button>
    </div>
    <div class="sess-info" ${it.info ? '' : 'hidden'}>
      ${stage ? `<p>${esc(stage.d)}</p><p class="goal">${icon('target')} Cel: ${esc(stage.goal)}</p>` : `<p>Powtórka opanowanego ćwiczenia (${esc(catShort(ex.cat))}). Kilka szybkich powtórzeń w nowym miejscu lub z rozproszeniem.</p>`}
      ${ex.cue ? `<p class="muted small">Słowo: <b>${esc(D.progress(ex.id).cue || ex.cue)}</b>${ex.signal && ex.signal !== '—' ? ` · Gest: ${esc(D.progress(ex.id).signal || ex.signal)}` : ''}</p>` : ''}
    </div>
    <div class="counter">
      <button class="cnt ok" data-act="ok" data-i="${i}" aria-label="Udane powtórzenie">${icon('check')}<span>${it.ok}</span></button>
      <div class="cnt-mid"><strong>${total ? Math.round(rate * 100) + '%' : '—'}</strong><small>${total} ${total === 1 ? 'próba' : 'prób'}</small>
        <button class="link small" data-act="undo" data-i="${i}" ${it.log.length ? '' : 'disabled'}>${icon('undo')} cofnij</button></div>
      <button class="cnt fail" data-act="fail" data-i="${i}" aria-label="Nieudane powtórzenie">${icon('x')}<span>${it.fail}</span></button>
    </div>
    ${hint}
    ${stage ? `<label class="pass-toggle"><input type="checkbox" data-act="pass" data-i="${i}" ${it.passed ? 'checked' : ''}> Etap „${esc(stage.t)}” zaliczony</label>` : ''}
    <textarea data-note="${i}" rows="1" placeholder="Notatka (opcjonalnie)…">${esc(it.note || '')}</textarea>
  </article>`;
}

const upd = (i, fn) => { const d = draft(); if (!d?.items[i]) return; fn(d.items[i], d); saveDraft(d); window.__rerender?.(); };

function pickExercise(onPick) {
  const inSession = new Set((draft()?.items || []).map((x) => x.exId));
  const all = D.exercises().filter((e) => !inSession.has(e.id));
  const group = (e) => { const p = D.progress(e.id); return p.active ? 0 : p.mastered ? 1 : 2; };
  all.sort((a, b) => group(a) - group(b) || a.name.localeCompare(b.name, 'pl'));
  const label = ['W planie', 'Opanowane — powtórka', 'Pozostałe'];
  const list = (q = '') => {
    let last = -1;
    return all.filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase())).map((e) => {
      const g = group(e), head = g !== last ? `<li class="group">${label[g]}</li>` : '';
      last = g;
      return `${head}<li><button class="pick" data-id="${esc(e.id)}">${exBadge(e)}<span class="grow">${esc(e.name)}</span>${icon('plus')}</button></li>`;
    }).join('') || '<li class="muted">Nic nie znaleziono.</li>';
  };
  openSheet({
    title: 'Dodaj ćwiczenie',
    body: `<label class="search">${icon('search')}<input type="search" placeholder="Szukaj…" aria-label="Szukaj ćwiczenia"></label><ul class="pick-list">${list()}</ul>`,
    onMount: (el, close) => {
      const ul = el.querySelector('.pick-list');
      el.querySelector('input').oninput = (e) => { ul.innerHTML = list(e.target.value); };
      ul.onclick = (e) => { const b = e.target.closest('.pick'); if (b) { close(); onPick(b.dataset.id); } };
    },
  });
}

function finishSheet() {
  const d = draft();
  let rating = 0;
  openSheet({
    title: 'Jak poszło?',
    body: `<div class="rating" role="radiogroup" aria-label="Ocena treningu">
        ${[['1', 'Ciężko'], ['2', 'W porządku'], ['3', 'Super!']].map(([v, t]) => `<button class="rate" data-v="${v}" role="radio" aria-checked="false">${t}</button>`).join('')}
      </div>
      <label class="field"><span>Notatka do treningu</span><textarea rows="3" id="sess-note" placeholder="Np. dużo rozproszeń, świetnie reagował na ser…">${esc(d.note || '')}</textarea></label>
      <p class="muted small">${summary(d)}</p>
      <button class="btn primary big wide" data-save>${icon('check')} Zapisz trening</button>`,
    onMount: (el, close) => {
      el.querySelectorAll('.rate').forEach((b) => { b.onclick = () => {
        rating = Number(b.dataset.v);
        el.querySelectorAll('.rate').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      }; });
      el.querySelector('[data-save]').onclick = async () => {
        await saveDraftAsSession(rating, el.querySelector('#sess-note').value.trim());
        close();
      };
    },
  });
}

function summary(d) {
  const ok = d.items.reduce((a, x) => a + x.ok, 0), all = d.items.reduce((a, x) => a + x.ok + x.fail, 0);
  const passed = d.items.filter((x) => x.passed).length;
  return `${fmtClock((Date.now() - d.startedAt) / 1000)} min · ${ok}/${all} udanych powtórzeń${passed ? ` · ${passed} ${passed === 1 ? 'etap zaliczony' : 'etapy zaliczone'}` : ''}`;
}

async function saveDraftAsSession(rating, note) {
  const d = draft();
  if (!d) return;
  const items = d.items.filter((x) => x.ok || x.fail || x.passed || x.note)
    .map(({ exId, stage, ok, fail, passed, note: n }) => ({ exId, stage, ok, fail, passed, note: n || '' }));
  const now = new Date();
  const dur = Math.round((now.getTime() - d.startedAt) / 1000);
  let mastered = [];
  if (items.length) {
    await D.saveSession({ id: uid(), date: now.toISOString(), day: dayKey(now), by: d.by, dur, items, rating, note });
    for (const it of items) {
      const p = D.progress(it.exId);
      if (!p.active && !p.mastered) await D.setProgress(it.exId, { active: true, startedAt: dayKey() });
      if (it.passed && it.stage !== null) {
        const r = await D.completeStage(it.exId, it.stage);
        if (r.mastered) mastered.push(D.exercise(it.exId)?.name);
      }
    }
  }
  clearDraft();
  location.hash = '#/';
  if (mastered.length) toast(`${mastered.join(', ')} — opanowane! 🎉`, { celebrate: true, ms: 4000 });
  else toast(items.length ? 'Trening zapisany. Dobra robota!' : 'Pusty trening — nic nie zapisano');
}

export const actions = {
  'new-empty': () => startSession([]),
  'click-sound': () => { clickSound(); vibrate(8); },
  stopwatch: (el) => {
    if (watch.start) {
      watch.last = (Date.now() - watch.start) / 1000;
      watch.start = 0;
      cancelAnimationFrame(watch.raf);
      el.classList.remove('on');
      el.querySelector('span').textContent = watch.last.toFixed(1) + ' s';
    } else {
      watch.start = Date.now();
      el.classList.add('on');
      tickWatch();
    }
  },
  ok: (el) => { vibrate(10); upd(Number(el.dataset.i), (it) => { it.ok++; it.log.push(1); }); },
  fail: (el) => { vibrate(25); upd(Number(el.dataset.i), (it) => { it.fail++; it.log.push(0); }); },
  undo: (el) => upd(Number(el.dataset.i), (it) => { const l = it.log.pop(); if (l === 1) it.ok--; else if (l === 0) it.fail--; }),
  pass: (el) => upd(Number(el.dataset.i), (it) => { it.passed = el.checked; }),
  'toggle-info': (el) => upd(Number(el.dataset.i), (it) => { it.info = !it.info; }),
  'remove-item': (el) => upd(Number(el.dataset.i), (_, d) => { d.items.splice(Number(el.dataset.i), 1); }),
  'add-ex': () => pickExercise((exId) => {
    const d = draft();
    d.items.push({ exId, stage: currentStage(exId), ok: 0, fail: 0, log: [], passed: false, note: '', info: true });
    saveDraft(d);
    window.__rerender?.();
  }),
  finish: () => finishSheet(),
  discard: async () => {
    if (await confirmSheet({ title: 'Porzucić trening?', text: 'Liczniki z tego treningu zostaną usunięte.', ok: 'Porzuć', danger: true })) {
      clearDraft();
      location.hash = '#/';
    }
  },
};
