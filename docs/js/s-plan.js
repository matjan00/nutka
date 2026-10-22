// Behaviorist's plan ("Zalecenia"): today's cards (meals outside, kennel time), the plan screen with the week
// overview, and editing / starting the next plan.

import * as D from './data.js';
import { kennelMinutes, planDay } from './logic.js';
import { icon, openSheet, toast, confirmSheet, vibrate } from './ui.js';
import { esc, dayKey, addDays, fmtDay, fmtDayLong, parseDay, WD_SHORT, weekday, uid } from './util.js';
import { header, whoChip } from './comp.js';

const SLOT = { 3: ['Rano', 'Południe', 'Wieczór'], 2: ['Rano', 'Wieczór'] };
const slotName = (p, n) => SLOT[p.meals]?.[n - 1] || `Posiłek ${n}`;
const fmtH = (min) => { const h = Math.floor(min / 60), m = min % 60; return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`; };
const hhmm = (iso) => { const d = new Date(iso); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };

// ---------- Today cards ----------
export function planHero(p, day) {
  const n = planDay(p, day);
  const over = p.days && n > p.days;
  return `<section class="hero card plan-hero">
    <div class="hero-text">
      <p class="eyebrow">Zalecenia behawiorystki · ${over ? 'czas minął' : `dzień ${n}${p.days ? ` z ${p.days}` : ''}`}</p>
      <p class="hero-line">${esc(p.diagnosis || p.title)}</p>
      <div class="hero-chips">
        ${p.noWalks ? `<span class="chip">${icon('x')} Bez spacerów</span>` : ''}
        <span class="chip">${p.meals}× posiłek na dworze</span>
        <span class="chip">Kenel ${fmtH(p.kennelMin)}</span>
      </div>
      ${over ? '<p class="split">Tydzień minął — po kolejnym spotkaniu wpiszcie nowe zalecenia.</p>' : ''}
    </div>
    <button class="icon-btn" data-act="go" data-to="#/plan" aria-label="Szczegóły zaleceń">${icon('next')}</button>
  </section>`;
}

export function mealsCard(p, day) {
  const slots = Array.from({ length: p.meals }, (_, i) => i + 1);
  const done = slots.filter((n) => D.meal(day, n)).length;
  return `<section class="card">
    <div class="card-head"><h2>Posiłki na dworze</h2><span class="count ${done === p.meals ? 'ok' : ''}">${done}/${p.meals}</span></div>
    <p class="muted small">Z ręki za nic, podążanie albo spokojne sztuczki. Stuknij posiłek, gdy zjedzony.</p>
    <div class="meals">${slots.map((n) => {
      const m = D.meal(day, n);
      return `<button class="meal ${m ? 'on' : ''}" data-act="meal" data-n="${n}" data-day="${day}">
        <span class="meal-check">${icon(m ? 'check' : 'plus')}</span><strong>${esc(slotName(p, n))}</strong>
        <small>${m ? `${esc((m.how || []).map((h) => D.MEAL_HOW[h]).join(', ') || 'zjedzony')} · ${esc(D.trainerName(m.by))}` : 'do zrobienia'}</small></button>`;
    }).join('')}</div>
  </section>`;
}

export function kennelCard(p, day) {
  const stays = D.kennelStays();
  const run = D.runningKennel();
  const min = kennelMinutes(stays, day);
  const pct = Math.min(1, min / (p.kennelMin || 360));
  const today = stays.filter((k) => k.day === day);
  return `<section class="card kennel-card">
    <div class="card-head"><h2>Kenel</h2><span class="count ${pct >= 1 ? 'ok' : ''}" id="kennel-sum">${fmtH(min)} / ${fmtH(p.kennelMin)}</span></div>
    <div class="kbar"><i id="kennel-bar" style="width:${Math.round(pct * 100)}%"></i></div>
    ${run ? `<p class="kennel-run">${icon('moon')} ${esc(D.dogName())} jest w kenelu od <b>${hhmm(run.start)}</b>${run.day !== day ? ` (${esc(fmtDay(run.day))})` : ''}</p>
      <button class="btn primary big wide" data-act="kennel-stop">${icon('check')} Wychodzi z kenela</button>`
    : `<button class="btn primary big wide" data-act="kennel-start">${icon('moon')} Idzie do kenela — start</button>`}
    ${today.length ? `<ul class="stays">${today.map((k) => `<li><button class="plain stay" data-act="kennel-edit" data-id="${esc(k.id)}">
      <span>${hhmm(k.start)} – ${k.end ? hhmm(k.end) : 'teraz'}</span><span class="muted">${k.end ? fmtH(Math.round((Date.parse(k.end) - Date.parse(k.start)) / 60000)) : ''}</span>${whoChip(k.by)}</button></li>`).join('')}</ul>` : ''}
    <button class="link small" data-act="kennel-add" data-day="${day}">${icon('plus')} Dopisz ręcznie (zapomnieliśmy włączyć)</button>
  </section>`;
}

// Live kennel counter on Today without redrawing the whole screen.
let live = null;
export function mountLive(root) {
  clearInterval(live);
  const p = D.activeProtocol();
  if (!p || !D.runningKennel()) return;
  live = setInterval(() => {
    const sum = root.querySelector('#kennel-sum'), bar = root.querySelector('#kennel-bar');
    if (!sum || !document.body.contains(sum)) return clearInterval(live);
    const min = kennelMinutes(D.kennelStays(), dayKey());
    sum.textContent = `${fmtH(min)} / ${fmtH(p.kennelMin)}`;
    bar.style.width = Math.round(Math.min(1, min / p.kennelMin) * 100) + '%';
  }, 30000);
}

// ---------- plan screen ----------
export function renderPlan() {
  const p = D.activeProtocol() || D.protocols()[0];
  if (!p) return `${header({ title: 'Zalecenia', back: true })}<div class="empty"><p>Brak zaleceń.</p><button class="btn primary" data-act="plan-new">Dodaj zalecenia</button></div>`;
  const today = dayKey();
  const len = Math.max(p.days || 7, Math.min(planDay(p, today), 28));
  const days = Array.from({ length: len }, (_, i) => addDays(p.start, i));
  const stays = D.kennelStays();
  const past = D.protocols().filter((x) => x.id !== p.id);

  return `${header({ title: 'Zalecenia', sub: p.active ? `od ${fmtDay(p.start)}` : 'zakończone', back: true, right: `<button class="icon-btn" data-act="plan-edit" data-id="${esc(p.id)}" aria-label="Edytuj">${icon('edit')}</button>` })}
  <section class="card">
    <p class="eyebrow">${esc(p.title)}</p>
    <h2>${esc(p.diagnosis || '')}</h2>
    <ol class="rules">${(p.rules || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ol>
    ${p.notes ? `<p class="quote">${esc(p.notes)}</p>` : ''}
  </section>

  <section class="card">
    <h2>Jak idzie</h2>
    <div class="week-table" role="table">
      <div class="wt-row wt-head" role="row"><span>Dzień</span><span>Posiłki</span><span>Kenel</span></div>
      ${days.map((d) => {
        const meals = D.mealsOf(d).filter((m) => m.n <= p.meals).length;
        const min = kennelMinutes(stays, d);
        const future = d > today;
        return `<div class="wt-row ${d === today ? 'today' : ''} ${future ? 'future' : ''}" role="row">
          <span>${WD_SHORT[weekday(d)]} ${parseDay(d).getDate()}</span>
          <span class="${!future && meals >= p.meals ? 'ok' : ''}">${future ? '—' : `${meals}/${p.meals}`}</span>
          <span class="${!future && min >= p.kennelMin ? 'ok' : ''}">${future ? '—' : fmtH(min)}</span></div>`;
      }).join('')}
    </div>
  </section>

  <div class="col gap">
    <button class="btn secondary wide" data-act="plan-new">${icon('plus')} Nowe zalecenia (po kolejnym spotkaniu)</button>
    ${p.active ? `<button class="btn ghost wide" data-act="plan-end" data-id="${esc(p.id)}">Zakończ te zalecenia</button>` : ''}
  </div>
  ${past.length ? `<h2 class="sec-title">Wcześniejsze</h2><div class="list">${past.map((x) => `<div class="list-row static"><span class="grow"><strong>${esc(x.title)}</strong><small>od ${esc(fmtDay(x.start))}${x.active ? '' : ' · zakończone'}</small></span></div>`).join('')}</div>` : ''}`;
}

// ---------- sheets ----------
function mealSheet(day, n) {
  const p = D.activeProtocol(day) || D.FIRST_PROTOCOL;
  const m = D.meal(day, n);
  const how = new Set(m?.how || ['reka']);
  const calm = D.exercises().filter((e) => e.calm && e.cat !== 'beh' && (D.progress(e.id).active || D.progress(e.id).mastered));
  openSheet({
    title: `${slotName(p, n)} · ${fmtDayLong(day)}`,
    body: `<p class="muted small">Tylko na dworze. Spokojnie, bez nakręcania.</p>
      <p class="field-label">Jak jadła?</p>
      <div class="how">${Object.entries(D.MEAL_HOW).map(([k, t]) => `<label><input type="checkbox" name="how" value="${k}" ${how.has(k) ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>
      ${calm.length ? `<p class="muted small">Spokojne sztuczki, które Nutka zna lub ćwiczy: ${calm.map((e) => esc(e.name)).join(', ')}.</p>` : ''}
      <label class="field"><span>Notatka (opcjonalnie)</span><textarea rows="2" id="meal-note" placeholder="Np. spokojnie, rozpraszały ją ptaki…">${esc(m?.note || '')}</textarea></label>
      <div class="row gap">${m ? `<button class="btn danger-ghost" data-del>${icon('undo')} Cofnij</button>` : ''}<button class="btn primary big grow" data-save>${icon('check')} Zjedzone</button></div>`,
    onMount: (el, close) => {
      el.querySelector('[data-save]').onclick = async () => {
        const sel = [...el.querySelectorAll('[name=how]:checked')].map((x) => x.value);
        await D.saveMeal({ day, n, how: sel, note: el.querySelector('#meal-note').value.trim(), by: m?.by || D.me(), at: m?.at || new Date().toISOString() });
        vibrate();
        close();
        const left = p.meals - D.mealsOf(day).length;
        toast(left > 0 ? `Zapisane ✓ Zostało: ${left}` : 'Wszystkie posiłki dziś zrobione ✓', { celebrate: left <= 0 });
      };
      el.querySelector('[data-del]')?.addEventListener('click', async () => { await D.removeMeal(day, n); close(); });
    },
  });
}

const toLocalInput = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const fromLocalInput = (day, hm) => { const [h, m] = hm.split(':').map(Number); const d = parseDay(day); d.setHours(h, m, 0, 0); return d.toISOString(); };

function kennelSheet(k, day) {
  const e = k || { id: uid(), day, start: null, end: null, by: D.me() };
  openSheet({
    title: k ? 'Pobyt w kenelu' : 'Dopisz pobyt w kenelu',
    body: `<form class="form" id="kf"><div class="grid2">
      <label class="field"><span>Od</span><input type="time" name="from" required value="${e.start ? toLocalInput(e.start) : ''}"></label>
      <label class="field"><span>Do</span><input type="time" name="to" ${k && !k.end ? '' : 'required'} value="${e.end ? toLocalInput(e.end) : ''}"></label></div>
      ${k && !k.end ? '<p class="muted small">Pobyt trwa — puste „Do” zostawia go włączonym.</p>' : ''}
      <div class="row gap">${k ? `<button type="button" class="btn danger-ghost" data-del>${icon('trash')}</button>` : ''}<button class="btn primary grow big" type="submit">Zapisz</button></div></form>`,
    onMount: (el, close) => {
      el.querySelector('#kf').onsubmit = async (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        const start = fromLocalInput(e.day, f.get('from'));
        let end = f.get('to') ? fromLocalInput(e.day, f.get('to')) : null;
        if (end && end <= start) end = fromLocalInput(addDays(e.day, 1), f.get('to')); // past midnight
        await D.saveKennel({ ...e, start, end });
        close();
        toast('Zapisano');
      };
      el.querySelector('[data-del]')?.addEventListener('click', async () => { await D.removeKennel(e.id); close(); toast('Usunięto'); });
    },
  });
}

function planSheet(p, isNew) {
  const e = isNew ? { ...p, id: uid(), title: 'Zalecenia po kolejnym spotkaniu', start: dayKey(), notes: '', active: true } : p;
  openSheet({
    title: isNew ? 'Nowe zalecenia' : 'Edytuj zalecenia',
    wide: true,
    body: `<form class="form" id="pf">
      <label class="field"><span>Nazwa</span><input name="title" required value="${esc(e.title)}"></label>
      <label class="field"><span>Diagnoza / główny problem</span><input name="diagnosis" value="${esc(e.diagnosis || '')}"></label>
      <div class="grid2">
        <label class="field"><span>Od kiedy</span><input type="date" name="start" required value="${esc(e.start)}"></label>
        <label class="field"><span>Ile dni</span><input type="number" name="days" min="1" max="90" value="${e.days || 7}"></label>
        <label class="field"><span>Posiłków na dworze dziennie</span><input type="number" name="meals" min="1" max="5" value="${e.meals || 3}"></label>
        <label class="field"><span>Kenel: godzin dziennie</span><input type="number" name="kennelH" min="0" max="16" step="0.5" value="${(e.kennelMin || 360) / 60}"></label>
      </div>
      <label class="toggle-line"><input type="checkbox" name="noWalks" ${e.noWalks ? 'checked' : ''}> Bez spacerów</label>
      <label class="field"><span>Zalecenia (każde w nowej linii)</span><textarea name="rules" rows="5">${esc((e.rules || []).join('\n'))}</textarea></label>
      <label class="field"><span>Notatki ze spotkania</span><textarea name="notes" rows="3">${esc(e.notes || '')}</textarea></label>
      <button class="btn primary big wide" type="submit">Zapisz</button></form>`,
    onMount: (el, close) => {
      el.querySelector('#pf').onsubmit = async (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        const out = { ...e, title: String(f.get('title')).trim(), diagnosis: String(f.get('diagnosis')).trim(), start: f.get('start'),
          days: Number(f.get('days')) || 7, meals: Math.max(1, Number(f.get('meals')) || 3), kennelMin: Math.round((Number(f.get('kennelH')) || 0) * 60),
          noWalks: !!f.get('noWalks'), rules: String(f.get('rules')).split('\n').map((x) => x.trim()).filter(Boolean), notes: String(f.get('notes')).trim() };
        if (isNew) for (const old of D.protocols().filter((x) => x.active)) await D.saveProtocol({ ...old, active: false });
        await D.saveProtocol(out);
        close();
        toast('Zapisano zalecenia');
      };
    },
  });
}

export const actions = {
  meal: (el) => mealSheet(el.dataset.day, Number(el.dataset.n)),
  'kennel-start': async () => { vibrate(); await D.startKennel(); toast(`${D.dogName()} w kenelu — liczę czas`); },
  'kennel-stop': async () => {
    const k = D.runningKennel();
    if (!k) return;
    vibrate();
    // A stay shorter than a minute was a mis-tap: drop it.
    if (Date.now() - Date.parse(k.start) < 60000) { await D.removeKennel(k.id); toast('Anulowano (krócej niż minuta)'); return; }
    await D.stopKennel(k);
    toast('Zapisano czas w kenelu');
  },
  'kennel-add': (el) => kennelSheet(null, el.dataset.day),
  'kennel-edit': (el) => kennelSheet(D.kennelStays().find((k) => k.id === el.dataset.id), null),
  'plan-edit': (el) => planSheet(D.protocols().find((x) => x.id === el.dataset.id), false),
  'plan-new': () => planSheet(D.activeProtocol() || D.FIRST_PROTOCOL, true),
  'plan-end': async (el) => {
    if (await confirmSheet({ title: 'Zakończyć zalecenia?', text: 'Ekran Dziś wróci do zwykłego planu ćwiczeń. Historia zostaje.', ok: 'Zakończ' })) {
      const p = D.protocols().find((x) => x.id === el.dataset.id);
      await D.saveProtocol({ ...p, active: false });
    }
  },
};
