// "Ćwiczenia" — library list, exercise detail with stage checklist, own exercises editor.

import * as D from './data.js';
import { CATEGORIES, LEVELS } from './exercises.js';
import { stageHistory, readyToAdvance, successRate } from './logic.js';
import { icon, openSheet, toast, confirmSheet } from './ui.js';
import { esc, fmtDay, fmtRelDay, uid, dayKey, plural } from './util.js';
import { exBadge, levelDots, stageBar, catName, header, whoChip } from './comp.js';
import { startSession } from './s-session.js';

const view = { q: '', cat: 'all', filter: 'all' };

export function render() {
  const plan = D.progressList().filter((p) => p.active).length;
  const done = D.progressList().filter((p) => p.mastered).length;
  return `${header({ title: 'Ćwiczenia', sub: `${plan} ćwiczymy · ${done} opanowanych`, right: `<button class="btn small ghost" data-act="go" data-to="#/cues">${icon('words')} Słowniczek</button>` })}
  <label class="search">${icon('search')}<input type="search" id="lib-q" value="${esc(view.q)}" placeholder="Szukaj ćwiczenia…" aria-label="Szukaj"></label>
  <div class="seg" role="tablist">${[['all', 'Wszystkie'], ['plan', 'Ćwiczymy'], ['mastered', 'Opanowane'], ['new', 'Nowe']].map(([k, t]) =>
    `<button role="tab" aria-selected="${view.filter === k}" data-act="lib-filter" data-k="${k}">${t}</button>`).join('')}</div>
  <div class="chips scroll">${[['all', 'Wszystkie kategorie'], ...CATEGORIES.map((c) => [c.id, c.short])].map(([k, t]) =>
    `<button class="chip ${view.cat === k ? 'on' : ''} ${k !== 'all' ? 'cat-' + k : ''}" data-act="lib-cat" data-k="${k}">${esc(t)}</button>`).join('')}</div>
  ${D.activeProtocol() ? '<p class="hint">„Wstrzymane” ćwiczenia czekają do końca zaleceń behawiorysty — teraz tylko spokojne, oznaczone „spokojne”.</p>' : ''}
  <div id="lib-list">${list()}</div>
  <button class="btn ghost wide mt" data-act="custom-new">${icon('plus')} Dodaj własne ćwiczenie</button>`;
}

function list() {
  const q = view.q.trim().toLowerCase();
  const items = D.exercises().filter((e) => {
    const p = D.progress(e.id);
    if (view.cat !== 'all' && e.cat !== view.cat) return false;
    if (view.filter === 'plan' && !p.active) return false;
    if (view.filter === 'mastered' && !p.mastered) return false;
    if (view.filter === 'new' && (p.active || p.mastered)) return false;
    return !q || (e.name + ' ' + (e.cue || '')).toLowerCase().includes(q);
  });
  if (!items.length) return '<p class="muted center mt">Nic tu nie ma.</p>';
  return CATEGORIES.map((c) => {
    const rows = items.filter((e) => e.cat === c.id).sort((a, b) => a.lvl - b.lvl);
    if (!rows.length) return '';
    return `<section class="lib-group"><h2 class="group-title cat-${c.id}">${esc(c.name)}</h2><p class="muted small">${esc(c.desc)}</p>
      <div class="list">${rows.map(row).join('')}</div></section>`;
  }).join('');
}

function row(e) {
  const p = D.progress(e.id);
  const status = p.mastered ? `<span class="status mastered">${icon('star')} Opanowane</span>`
    : p.active ? stageBar(p.stage || 0, e.stages.length)
    : p.pausedByPlan ? '<span class="status">wstrzymane</span>'
    : `<span class="status">${e.stages.length} ${plural(e.stages.length, 'etap', 'etapy', 'etapów')}</span>`;
  return `<a class="list-row ex-row" href="#/ex/${esc(e.id)}">${exBadge(e)}
    <span class="grow"><strong>${esc(e.name)}${e.custom ? ' <em class="own">własne</em>' : ''}</strong><small>${levelDots(e.lvl)} ${esc(LEVELS[e.lvl] || '')}${e.calm && e.cat !== 'beh' ? ' · <span class="calm-tag">spokojne</span>' : ''}</small></span>
    ${status}</a>`;
}

// ---------- detail ----------
export function renderDetail({ id }) {
  const ex = D.exercise(id);
  if (!ex) return `${header({ title: 'Nie znaleziono', back: true })}<p class="muted">To ćwiczenie zostało usunięte.</p>`;
  const p = D.progress(id), sessions = D.sessions();
  const cur = p.mastered ? ex.stages.length : Math.min(p.stage || 0, ex.stages.length);
  const hist = sessions.filter((s) => (s.items || []).some((it) => it.exId === id)).slice(0, 6);
  const pre = (ex.pre || []).map((x) => D.exercise(x)).filter(Boolean);

  let status;
  if (p.mastered) status = `<div class="status-box mastered">${icon('star')}<div><strong>Opanowane</strong><small>${p.masteredAt ? 'od ' + esc(fmtDay(p.masteredAt)) : ''} · pojawi się czasem jako powtórka</small></div>
      <button class="btn ghost small" data-act="unmaster" data-id="${esc(id)}">Wróć do nauki</button></div>`;
  else if (p.active) status = `<div class="status-box"><div class="grow"><strong>Ćwiczymy · etap ${cur + 1} z ${ex.stages.length}</strong>${stageBar(cur, ex.stages.length)}</div>
      <button class="btn ghost small" data-act="deactivate" data-id="${esc(id)}">Odłóż na później</button></div>`;
  else status = `<div class="status-box new"><div class="grow"><strong>Jeszcze nie ćwiczymy</strong><small>Dodajcie, a pojawi się w planie dnia.</small></div>
      <button class="btn primary small" data-act="activate" data-id="${esc(id)}">${icon('plus')} Ćwiczymy</button></div>`;

  return `${header({ title: ex.name, back: true, right: ex.custom ? `<button class="icon-btn" data-act="custom-edit" data-id="${esc(id)}" aria-label="Edytuj">${icon('edit')}</button>` : '' })}
  <div class="detail-meta">${exBadge(ex, 'lg')}<div><p class="cat-label cat-${esc(ex.cat)}">${esc(catName(ex.cat))}</p><p>${levelDots(ex.lvl)} ${esc(LEVELS[ex.lvl] || '')} · ${ex.stages.length} ${plural(ex.stages.length, 'etap', 'etapy', 'etapów')}</p></div></div>
  ${status}
  ${D.activeProtocol() && !ex.calm ? `<p class="plan-note">${icon('info')} <span>Na czas zaleceń behawiorysty to ćwiczenie czeka — teraz tylko spokojne, niepobudzające zadania${(D.activeProtocol().noWalks && ['smycz', 'noga', 'mijanie', 'przywolanie', 'chowany'].includes(ex.id)) ? ' i bez spacerów' : ''}.</span></p>` : ''}
  <div class="row gap mt">
    <button class="btn secondary grow" data-act="train-one" data-id="${esc(id)}">${icon('play')} Ćwicz teraz</button>
    ${!p.mastered ? `<button class="btn ghost" data-act="master" data-id="${esc(id)}">${icon('star')} Już umie</button>` : ''}
  </div>

  <section class="card cues-card">
    <h2>Wasza komenda</h2>
    <p class="muted small">Używajcie oboje tego samego słowa i gestu — pies nie zna synonimów.</p>
    <div class="grid1">
      <label class="field"><span>Słowo</span><input data-cue="cue" data-id="${esc(id)}" value="${esc(p.cue ?? ex.cue ?? '')}" placeholder="${esc(ex.cue || '')}"></label>
      <label class="field"><span>Gest</span><input data-cue="signal" data-id="${esc(id)}" value="${esc(p.signal ?? (ex.signal === '—' ? '' : ex.signal) ?? '')}" placeholder="np. dłoń w górę"></label>
    </div>
  </section>

  ${ex.why ? `<section class="prose"><h2>Po co?</h2><p>${esc(ex.why)}</p>${ex.collie ? `<p class="collie">${icon('paw')} <span><b>Border collie:</b> ${esc(ex.collie)}</span></p>` : ''}
    ${pre.length ? `<p class="muted small">Najpierw warto znać: ${pre.map((x) => `<a href="#/ex/${esc(x.id)}">${esc(x.name)}</a>`).join(', ')}</p>` : ''}</section>` : ''}

  <section><h2 class="sec-title">Etapy</h2>
  <ol class="stages">${ex.stages.map((s, i) => {
    const done = p.mastered || i < cur;
    const isCur = !p.mastered && i === cur;
    const tick = p.ticks?.[i];
    const rate = isCur ? successRate(sessions, id, i) : null;
    const ready = isCur && readyToAdvance(sessions, id, i);
    const last = isCur ? stageHistory(sessions, id, i).slice(0, 3) : [];
    return `<li class="stage ${done ? 'done' : ''} ${isCur ? 'cur' : ''}">
      <button class="stage-check" data-act="${done ? 'stage-undo' : 'stage-done'}" data-id="${esc(id)}" data-i="${i}" aria-label="${done ? 'Odznacz etap' : 'Zalicz etap'}">${done ? icon('check') : i + 1}</button>
      <div class="grow"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p><p class="goal">${icon('target')} ${esc(s.goal)}</p>
      ${tick ? `<p class="muted small">Zaliczone ${esc(fmtDay(tick.day))} · ${esc(D.trainerName(tick.by))}</p>` : ''}
      ${isCur && last.length ? `<p class="small stats-line">Ostatnio: ${last.map((x) => `<b>${x.ok}/${x.ok + x.fail}</b>`).join(' · ')}${rate !== null ? ` (${Math.round(rate * 100)}%)` : ''}</p>` : ''}
      ${ready ? `<p class="pass-hint ready">${icon('star')} Kryterium spełnione — można zaliczyć etap.</p>` : ''}
      </div></li>`;
  }).join('')}</ol></section>

  ${ex.tips?.length ? `<section class="card tips"><h2>${icon('bulb')} Wskazówki</h2><ul>${ex.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
  ${ex.mistakes?.length ? `<section class="card warn-card"><h2>${icon('alert')} Częste błędy</h2><ul>${ex.mistakes.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}

  <section class="card"><h2>Notatki o tym ćwiczeniu</h2>
    <textarea data-exnote="${esc(id)}" rows="3" placeholder="Co działa, jakie nagrody, gdzie ćwiczycie…">${esc(p.note || '')}</textarea></section>

  ${hist.length ? `<section><h2 class="sec-title">Historia</h2><div class="list">${hist.map((s) => {
    const it = s.items.find((x) => x.exId === id);
    return `<div class="list-row static"><span class="when">${esc(fmtRelDay(s.day))}</span><span class="grow"><strong>${it.ok}/${it.ok + it.fail} udanych</strong>
      <small>${whoChip(s.by)} · ${it.stage !== null && ex.stages[it.stage] ? 'etap ' + (it.stage + 1) : 'powtórka'}${it.passed ? ' · zaliczony ✓' : ''}${it.note ? ' · ' + esc(it.note) : ''}</small></span></div>`;
  }).join('')}</div></section>` : ''}
  ${ex.custom ? `<button class="btn danger-ghost wide mt" data-act="custom-delete" data-id="${esc(id)}">${icon('trash')} Usuń to ćwiczenie</button>` : ''}`;
}

export function mountDetail(root) {
  root.querySelectorAll('input[data-cue]').forEach((inp) => {
    inp.onchange = () => D.setProgress(inp.dataset.id, { [inp.dataset.cue]: inp.value.trim() }).then(() => toast('Zapisano komendę'));
  });
  root.querySelectorAll('textarea[data-exnote]').forEach((ta) => {
    ta.onchange = () => D.setProgress(ta.dataset.exnote, { note: ta.value.trim() }).then(() => toast('Zapisano notatkę'));
  });
}

export function mount(root) {
  const q = root.querySelector('#lib-q');
  if (q) q.oninput = () => { view.q = q.value; root.querySelector('#lib-list').innerHTML = list(); };
}

// ---------- own exercise editor ----------
function editor(ex) {
  const e = ex || { id: 'c-' + uid(), name: '', cat: 'trick', lvl: 1, cue: '', signal: '', why: '', stages: [{ t: '', d: '', goal: '' }], tips: [], mistakes: [] };
  const stageRow = (s, i) => `<fieldset class="stage-edit" data-i="${i}"><legend>Etap ${i + 1}</legend>
      <input name="t" placeholder="Nazwa etapu, np. Wabienie" value="${esc(s.t)}">
      <textarea name="d" rows="2" placeholder="Jak ćwiczyć">${esc(s.d)}</textarea>
      <input name="goal" placeholder="Kiedy zaliczone, np. 8 z 10 w 2 sesjach" value="${esc(s.goal)}">
      <button type="button" class="link small danger" data-rm="${i}">Usuń etap</button></fieldset>`;
  openSheet({
    title: ex ? 'Edytuj ćwiczenie' : 'Nowe ćwiczenie',
    wide: true,
    body: `<form class="form" id="cx">
      <label class="field"><span>Nazwa</span><input name="name" required value="${esc(e.name)}" placeholder="np. Podaj kapcie"></label>
      <div class="grid2">
        <label class="field"><span>Kategoria</span><select name="cat">${CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === e.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Trudność</span><select name="lvl">${[1, 2, 3].map((l) => `<option value="${l}" ${l === e.lvl ? 'selected' : ''}>${LEVELS[l]}</option>`).join('')}</select></label>
        <label class="field"><span>Słowo</span><input name="cue" value="${esc(e.cue)}"></label>
        <label class="field"><span>Gest</span><input name="signal" value="${esc(e.signal)}"></label>
      </div>
      <label class="field"><span>Po co / opis</span><textarea name="why" rows="2">${esc(e.why)}</textarea></label>
      <div id="stages">${e.stages.map(stageRow).join('')}</div>
      <button type="button" class="btn ghost wide" id="add-stage">${icon('plus')} Dodaj etap</button>
      <label class="field"><span>Wskazówki (każda w nowej linii)</span><textarea name="tips" rows="3">${esc(e.tips.join('\n'))}</textarea></label>
      <button class="btn primary big wide" type="submit">Zapisz</button></form>`,
    onMount: (el, close) => {
      const box = el.querySelector('#stages');
      const read = () => [...box.querySelectorAll('.stage-edit')].map((f) => ({ t: f.querySelector('[name=t]').value.trim(), d: f.querySelector('[name=d]').value.trim(), goal: f.querySelector('[name=goal]').value.trim() }));
      const redraw = (stages) => { box.innerHTML = stages.map(stageRow).join(''); };
      el.querySelector('#add-stage').onclick = () => redraw([...read(), { t: '', d: '', goal: '' }]);
      box.onclick = (ev) => { const b = ev.target.closest('[data-rm]'); if (b) { const s = read(); s.splice(Number(b.dataset.rm), 1); redraw(s.length ? s : [{ t: '', d: '', goal: '' }]); } };
      el.querySelector('#cx').onsubmit = async (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        const stages = read().filter((s) => s.t || s.d).map((s, i) => ({ t: s.t || `Etap ${i + 1}`, d: s.d, goal: s.goal || '8 z 10 udanych' }));
        if (!stages.length) { toast('Dodaj przynajmniej jeden etap'); return; }
        const out = { id: e.id, name: String(f.get('name')).trim(), cat: f.get('cat'), lvl: Number(f.get('lvl')), cue: String(f.get('cue')).trim(), signal: String(f.get('signal')).trim(), why: String(f.get('why')).trim(), stages, tips: String(f.get('tips')).split('\n').map((x) => x.trim()).filter(Boolean), mistakes: e.mistakes || [] };
        await D.saveCustom(out);
        if (!ex) await D.setProgress(out.id, { active: true, startedAt: dayKey() });
        close();
        toast(ex ? 'Zapisano zmiany' : 'Dodano do planu');
        if (!ex) location.hash = '#/ex/' + out.id;
      };
    },
  });
}

export const actions = {
  'lib-filter': (el) => { view.filter = el.dataset.k; window.__rerender?.(); },
  'lib-cat': (el) => { view.cat = el.dataset.k; window.__rerender?.(); },
  activate: (el) => D.setProgress(el.dataset.id, { active: true, startedAt: dayKey() }).then(() => toast('Dodano do planu')),
  deactivate: (el) => D.setProgress(el.dataset.id, { active: false }).then(() => toast('Wyjęte z planu (postęp zostaje)')),
  master: async (el) => {
    if (await confirmSheet({ title: 'Oznaczyć jako opanowane?', text: 'Wszystkie etapy zostaną odhaczone. Ćwiczenie będzie czasem wracać jako powtórka.', ok: 'Tak, umie!' })) {
      await D.markMastered(el.dataset.id);
      toast('Opanowane! ★', { celebrate: true });
    }
  },
  unmaster: (el) => {
    const ex = D.exercise(el.dataset.id);
    return D.uncompleteStage(el.dataset.id, ex.stages.length - 1);
  },
  'stage-done': async (el) => {
    const r = await D.completeStage(el.dataset.id, Number(el.dataset.i));
    if (!D.progress(el.dataset.id).active && !r.mastered) await D.setProgress(el.dataset.id, { active: true });
    toast(r.mastered ? 'Wszystkie etapy — opanowane! 🎉' : 'Etap zaliczony ✓', { celebrate: r.mastered });
  },
  'stage-undo': (el) => D.uncompleteStage(el.dataset.id, Number(el.dataset.i)),
  'train-one': (el) => startSession([{ exId: el.dataset.id }]),
  'custom-new': () => editor(null),
  'custom-edit': (el) => editor(D.exercise(el.dataset.id)),
  'custom-delete': async (el) => {
    if (await confirmSheet({ title: 'Usunąć ćwiczenie?', text: 'Zniknie z biblioteki i planu. Historia treningów zostaje.', ok: 'Usuń', danger: true })) {
      await D.removeCustom(el.dataset.id);
      location.hash = '#/lib';
    }
  },
};
