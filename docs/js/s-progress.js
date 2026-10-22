// "Postęp" — weekly chart, streaks, categories, badges, session history and the shared journal.

import * as D from './data.js';
import { CATEGORIES } from './exercises.js';
import { weekly, streak, bestStreak, overallProgress, BADGES, badgeContext } from './logic.js';
import { icon, ring, openSheet, toast, confirmSheet } from './ui.js';
import { esc, dayKey, fmtDay, fmtRelDay, fmtDur, plural, uid, addDays } from './util.js';
import { kennelMinutes } from './logic.js';
import { header, exBadge, stageBar, sessionRow, whoChip, stageText, emptyState } from './comp.js';

export function render() {
  const day = dayKey(), sessions = D.sessions(), exercises = D.exercises(), progress = D.progressList();
  const weeks = weekly(sessions, day, 8);
  const thisW = weeks[weeks.length - 1];
  const st = streak(sessions, day), best = bestStreak(sessions);
  const ov = overallProgress(progress, exercises);
  const mastered = progress.filter((p) => p.mastered).length;
  const learning = progress.filter((p) => p.active && !p.mastered).map((p) => ({ p, ex: D.exercise(p.exId) })).filter((x) => x.ex);
  const ctx = badgeContext({ sessions, progress, exercises });
  const earned = BADGES.filter((b) => b.test(ctx));
  const notes = D.notes();

  return `${header({ title: 'Postęp', sub: `${D.dogName()} · ${sessions.length} ${plural(sessions.length, 'trening', 'treningi', 'treningów')} razem` })}

  ${planSummary()}
  <section class="stats-grid">
    <div class="stat card"><p class="eyebrow">Ten tydzień</p><strong>${thisW.a + thisW.b}</strong><small>${plural(thisW.a + thisW.b, 'sesja', 'sesje', 'sesji')} · ${Math.round(thisW.min)} min</small></div>
    <div class="stat card"><p class="eyebrow">Seria</p><strong>${st} ${icon('flame', st ? 'flame-i' : 'dim')}</strong><small>najdłuższa: ${best} ${plural(best, 'dzień', 'dni', 'dni')}</small></div>
    <div class="stat card"><p class="eyebrow">Opanowane</p><strong>${mastered}</strong><small>${learning.length} w trakcie nauki</small></div>
    <div class="stat card ring-stat">${ring(ov.pct, 56, 7)}<div><p class="eyebrow">Etapy</p><strong>${ov.done}<span class="muted">/${ov.all}</span></strong></div></div>
  </section>

  <section class="card"><div class="card-head"><h2>Treningi w tygodniach</h2>
    <span class="legend">${whoChip('a')} ${whoChip('b')}</span></div>
    ${chart(weeks)}</section>

  <section class="card"><h2>Kategorie</h2>
    ${CATEGORIES.map((c) => {
      const inCat = exercises.filter((e) => e.cat === c.id);
      const pr = overallProgress(progress, inCat);
      const m = progress.filter((p) => p.mastered && inCat.some((e) => e.id === p.exId)).length;
      return `<div class="cat-row"><span class="cat-dot cat-${c.id}"></span><span class="grow">${esc(c.name)}<small class="muted"> · ${m}/${inCat.length} opanowanych</small></span>
        <span class="bar"><i class="cat-${c.id}" style="width:${Math.round(pr.pct * 100)}%"></i></span></div>`;
    }).join('')}</section>

  <section class="card"><div class="card-head"><h2>W trakcie nauki</h2><button class="link" data-act="go" data-to="#/lib">Biblioteka ${icon('next')}</button></div>
    ${learning.length ? `<div class="list">${learning.map(({ p, ex }) => `<a class="list-row" href="#/ex/${esc(ex.id)}">${exBadge(ex)}
      <span class="grow"><strong>${esc(ex.name)}</strong><small>${esc(stageText(ex, Math.min(p.stage || 0, ex.stages.length - 1)))}</small></span>${stageBar(p.stage || 0, ex.stages.length)}</a>`).join('')}</div>`
    : '<p class="muted">Nic w planie — dodajcie ćwiczenia w bibliotece.</p>'}</section>

  <section class="card"><div class="card-head"><h2>Odznaki</h2><span class="muted small">${earned.length}/${BADGES.length}</span></div>
    <div class="badges">${BADGES.map((b) => `<div class="badge ${earned.includes(b) ? 'on' : ''}">${icon('star')}<strong>${esc(b.name)}</strong><small>${esc(b.desc)}</small></div>`).join('')}</div></section>

  <section class="card"><div class="card-head"><h2>Dziennik</h2><button class="btn small secondary" data-act="note-new">${icon('plus')} Wpis</button></div>
    <p class="muted small">Wspólne notatki: postępy, problemy, obserwacje (np. „szczeka na rowery przy szkole”).</p>
    ${notes.length ? `<ul class="notes">${notes.slice(0, 20).map(noteItem).join('')}</ul>` : ''}</section>

  <section><h2 class="sec-title">Historia treningów</h2>
    ${sessions.length ? `<div class="list">${sessions.slice(0, 40).map(sessionRow).join('')}</div>` : emptyState('Jeszcze bez treningów', 'Pierwsza sesja z planu dnia pojawi się tutaj.')}</section>`;
}

function planSummary() {
  const p = D.activeProtocol();
  if (!p) return '';
  const today = dayKey(), days = [];
  for (let d = p.start; d <= today && days.length < (p.days || 7); d = addDays(d, 1)) days.push(d);
  const meals = days.reduce((a, d) => a + Math.min(p.meals, D.mealsOf(d).length), 0);
  const stays = D.kennelStays();
  const avg = days.length ? Math.round(days.reduce((a, d) => a + kennelMinutes(stays, d), 0) / days.length) : 0;
  return `<a class="card plan-link" href="#/plan"><div class="grow"><p class="eyebrow">Zalecenia behawiorysty</p>
    <strong>Posiłki ${meals}/${days.length * p.meals} · kenel średnio ${Math.floor(avg / 60)} h ${avg % 60} min/dzień</strong></div>${icon('next')}</a>`;
}

const TAGS = { win: 'Sukces', issue: 'Problem', info: 'Obserwacja' };
function noteItem(n) {
  return `<li class="note tag-${esc(n.tag || 'info')}"><button class="plain" data-act="note-edit" data-id="${esc(n.id)}">
    <span class="note-tag">${esc(TAGS[n.tag] || 'Obserwacja')}</span><p>${esc(n.text)}</p><small>${esc(fmtRelDay(n.day))} · ${esc(D.trainerName(n.by))}</small></button></li>`;
}

function chart(weeks) {
  const W = 320, H = 140, pad = 22, bw = (W - pad) / weeks.length;
  const max = Math.max(4, ...weeks.map((w) => w.a + w.b));
  const y = (v) => H - 18 - (v / max) * (H - 30);
  const goal = D.settings().weeklyGoal || 10;
  const bars = weeks.map((w, i) => {
    const x = pad + i * bw + bw * 0.18, w2 = bw * 0.64;
    const ha = (w.a / max) * (H - 30), hb = (w.b / max) * (H - 30);
    const lbl = fmtDay(w.week).replace(/ (\S{3})\S*/, ' $1');
    return `<rect x="${x}" y="${H - 18 - ha}" width="${w2}" height="${ha}" class="bar-a" rx="3"/>
      <rect x="${x}" y="${H - 18 - ha - hb}" width="${w2}" height="${hb}" class="bar-b" rx="3"/>
      ${w.a + w.b ? `<text x="${x + w2 / 2}" y="${H - 22 - ha - hb}" text-anchor="middle" class="bar-num">${w.a + w.b}</text>` : ''}
      <text x="${x + w2 / 2}" y="${H - 4}" text-anchor="middle" class="axis">${i === weeks.length - 1 ? 'teraz' : esc(lbl)}</text>`;
  }).join('');
  const gy = y(Math.min(goal, max));
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Liczba treningów w ostatnich 8 tygodniach">
    <line x1="${pad}" x2="${W}" y1="${gy}" y2="${gy}" class="goal-line"/><text x="0" y="${gy + 3}" class="axis">cel</text>${bars}</svg>`;
}

function noteSheet(n) {
  const e = n || { id: uid(), text: '', tag: 'info' };
  openSheet({
    title: n ? 'Wpis w dzienniku' : 'Nowy wpis',
    body: `<form class="form" id="nf">
      <div class="seg">${Object.entries(TAGS).map(([k, t]) => `<label><input type="radio" name="tag" value="${k}" ${e.tag === k ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>
      <label class="field"><span>Treść</span><textarea name="text" rows="4" required placeholder="Co się wydarzyło?">${esc(e.text)}</textarea></label>
      <div class="row gap">${n ? `<button type="button" class="btn danger-ghost" data-del>${icon('trash')} Usuń</button>` : ''}<button class="btn primary grow" type="submit">Zapisz</button></div></form>`,
    onMount: (el, close) => {
      el.querySelector('#nf').onsubmit = async (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        await D.saveNote({ ...e, text: String(f.get('text')).trim(), tag: f.get('tag') || 'info', day: e.day || dayKey(), at: e.at || new Date().toISOString(), by: e.by || D.me() });
        close();
        toast('Zapisano wpis');
      };
      el.querySelector('[data-del]')?.addEventListener('click', async () => { await D.removeNote(e.id); close(); toast('Usunięto wpis'); });
    },
  });
}

export function sessionDetail(id) {
  const s = D.sessions().find((x) => x.id === id);
  if (!s) return;
  openSheet({
    title: `Trening · ${fmtDay(s.day)}`,
    body: `<p class="muted">${whoChip(s.by)} · ${fmtDur(s.dur)}${s.rating ? ' · ' + ['', 'ciężko', 'w porządku', 'super!'][s.rating] : ''}</p>
      <ul class="sess-sum">${(s.items || []).map((it) => {
        const ex = D.exercise(it.exId);
        return `<li>${exBadge(ex)}<span class="grow"><strong>${esc(ex?.name || 'Usunięte ćwiczenie')}</strong><small>${esc(ex ? stageText(ex, it.stage) : '')}${it.passed ? ' · zaliczony ✓' : ''}${it.note ? ' · ' + esc(it.note) : ''}</small></span><b>${it.ok}/${it.ok + it.fail}</b></li>`;
      }).join('')}</ul>
      ${s.note ? `<p class="quote">${esc(s.note)}</p>` : ''}
      <button class="btn danger-ghost wide mt" data-del>${icon('trash')} Usuń ten trening</button>`,
    onMount: (el, close) => {
      el.querySelector('[data-del]').onclick = async () => {
        if (await confirmSheet({ title: 'Usunąć trening?', text: 'Zaliczone etapy zostają, znikną tylko liczniki z tego dnia.', ok: 'Usuń', danger: true })) {
          await D.removeSession(id);
          close();
          toast('Usunięto trening');
        }
      };
    },
  });
}

export const actions = {
  'note-new': () => noteSheet(null),
  'note-edit': (el) => noteSheet(D.notes().find((n) => n.id === el.dataset.id)),
};
