// "Zadania" — shared daily / weekly / one-off tasks to tick off, with a week strip to look at other days.

import * as D from './data.js';
import { tasksForDay } from './logic.js';
import { icon, openSheet, toast, confirmSheet } from './ui.js';
import { esc, dayKey, addDays, weekStart, weekday, parseDay, WD_SHORT, fmtDayLong, fmtDay, uid } from './util.js';
import { header, assigneeChip, emptyState } from './comp.js';
import { taskCheck } from './s-today.js';

const view = { day: null, tab: 'day', mine: false };

export function render() {
  const today = dayKey();
  const day = view.day || today;
  const ws = weekStart(day);
  const all = D.tasks();

  const strip = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(ws, i);
    const list = tasksForDay(all, d);
    const done = list.filter((t) => D.tickOf(t, d)).length;
    const full = list.length && done === list.length;
    return `<button class="day ${d === day ? 'on' : ''} ${d === today ? 'today' : ''} ${full ? 'full' : ''}" data-act="t-day" data-d="${d}">
      <small>${WD_SHORT[i]}</small><strong>${parseDay(d).getDate()}</strong><i style="--p:${list.length ? done / list.length : 0}"></i></button>`;
  }).join('');

  let body;
  if (view.tab === 'day') {
    const meK = D.me();
    const list = tasksForDay(all, day).filter((t) => !view.mine || t.who === 'both' || t.who === meK);
    const groups = [
      ['Wspólne', list.filter((t) => t.who === 'both' || !t.who)],
      [`Dla: ${D.trainerName(meK)}`, list.filter((t) => t.who === meK)],
      [`Dla: ${D.trainerName(meK === 'a' ? 'b' : 'a')}`, list.filter((t) => t.who && t.who !== 'both' && t.who !== meK)],
    ].filter(([, l]) => l.length);
    body = list.length
      ? groups.map(([t, l]) => `<section class="card"><h2>${esc(t)}</h2><ul class="checks">${l.map((x) => taskCheck(x, day)).join('')}</ul></section>`).join('')
      : emptyState('Brak zadań tego dnia', 'Dodajcie zadania — codzienne (spacer węchowy), co tydzień (czesanie) lub jednorazowe (wizyta u weta).');
  } else {
    body = all.length ? `<div class="list">${all.map((t) => `<button class="list-row" data-act="t-edit" data-id="${esc(t.id)}">
      <span class="grow"><strong>${esc(t.title)}</strong><small>${esc(repeatText(t))} · ${assigneeChip(t.who)}</small></span>${icon('edit', 'dim')}</button>`).join('')}</div>`
      : emptyState('Brak zadań', 'Dodaj pierwsze zadanie przyciskiem poniżej.');
  }

  return `${header({ title: 'Zadania', sub: view.tab === 'day' ? fmtDayLong(day) : `${all.length} zadań` })}
  <div class="seg" role="tablist">
    <button role="tab" aria-selected="${view.tab === 'day'}" data-act="t-tab" data-k="day">Do odhaczenia</button>
    <button role="tab" aria-selected="${view.tab === 'all'}" data-act="t-tab" data-k="all">Wszystkie zadania</button>
  </div>
  ${view.tab === 'day' ? `<div class="week-strip">
      <button class="icon-btn small" data-act="t-week" data-n="-7" aria-label="Poprzedni tydzień">${icon('back')}</button>${strip}
      <button class="icon-btn small" data-act="t-week" data-n="7" aria-label="Następny tydzień">${icon('next')}</button></div>
    <label class="toggle-line"><input type="checkbox" data-act="t-mine" ${view.mine ? 'checked' : ''}> Pokaż tylko moje i wspólne</label>` : ''}
  ${body}
  <button class="fab" data-act="t-new" aria-label="Nowe zadanie">${icon('plus')}</button>`;
}

function repeatText(t) {
  if (t.repeat === 'daily') return 'codziennie';
  if (t.repeat === 'weekly') return 'co tydzień: ' + (t.wd || []).sort().map((i) => WD_SHORT[i]).join(', ');
  return t.doneAt ? `zrobione ${fmtDay(t.doneAt)}` : t.due ? `do ${fmtDay(t.due)}` : 'jednorazowe';
}

function taskSheet(t) {
  const e = t || { id: uid(), title: '', who: 'both', repeat: 'daily', wd: [weekday(dayKey())], due: dayKey(), note: '' };
  const names = { both: 'Oboje', a: D.trainerName('a'), b: D.trainerName('b') };
  openSheet({
    title: t ? 'Edytuj zadanie' : 'Nowe zadanie',
    body: `<form class="form" id="tf">
      <label class="field"><span>Co trzeba zrobić?</span><input name="title" required value="${esc(e.title)}" placeholder="np. Ćwiczyć przywołanie w parku"></label>
      <p class="field-label">Kto?</p>
      <div class="seg">${Object.entries(names).map(([k, n]) => `<label><input type="radio" name="who" value="${k}" ${e.who === k ? 'checked' : ''}><span>${esc(n)}</span></label>`).join('')}</div>
      <p class="field-label">Jak często?</p>
      <div class="seg">${[['daily', 'Codziennie'], ['weekly', 'W wybrane dni'], ['once', 'Raz']].map(([k, n]) => `<label><input type="radio" name="repeat" value="${k}" ${e.repeat === k ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
      <div class="wd-pick" data-show="weekly">${WD_SHORT.map((d, i) => `<label><input type="checkbox" name="wd" value="${i}" ${(e.wd || []).includes(i) ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div>
      <label class="field" data-show="once"><span>Termin</span><input type="date" name="due" value="${esc(e.due || dayKey())}"></label>
      <label class="field"><span>Notatka</span><textarea name="note" rows="2">${esc(e.note || '')}</textarea></label>
      <div class="row gap">${t ? `<button type="button" class="btn danger-ghost" data-del>${icon('trash')}</button>` : ''}<button class="btn primary grow big" type="submit">Zapisz</button></div></form>`,
    onMount: (el, close) => {
      const form = el.querySelector('#tf');
      const sync = () => {
        const r = form.querySelector('[name=repeat]:checked')?.value;
        form.querySelectorAll('[data-show]').forEach((x) => { x.hidden = x.dataset.show !== r; });
      };
      form.onchange = sync; sync();
      form.onsubmit = async (ev) => {
        ev.preventDefault();
        const f = new FormData(form);
        const wd = f.getAll('wd').map(Number);
        const repeat = f.get('repeat');
        if (repeat === 'weekly' && !wd.length) { toast('Wybierz przynajmniej jeden dzień'); return; }
        await D.saveTask({ ...e, title: String(f.get('title')).trim(), who: f.get('who'), repeat, wd, due: f.get('due') || null, note: String(f.get('note')).trim(), from: e.from || dayKey() });
        close();
        toast('Zapisano zadanie');
      };
      el.querySelector('[data-del]')?.addEventListener('click', async () => {
        if (await confirmSheet({ title: 'Usunąć zadanie?', text: e.title, ok: 'Usuń', danger: true })) { await D.removeTask(e.id); close(); }
      });
    },
  });
}

export const actions = {
  't-day': (el) => { view.day = el.dataset.d; window.__rerender?.(); },
  't-week': (el) => { view.day = addDays(view.day || dayKey(), Number(el.dataset.n)); window.__rerender?.(); },
  't-tab': (el) => { view.tab = el.dataset.k; window.__rerender?.(); },
  't-mine': (el) => { view.mine = el.checked; window.__rerender?.(); },
  't-new': () => taskSheet(null),
  't-edit': (el) => taskSheet(D.tasks().find((t) => t.id === el.dataset.id)),
};
