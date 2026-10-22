// Settings, cue dictionary, sync status and the first-run welcome.

import * as D from './data.js';
import { EXERCISES } from './exercises.js';
import { icon, toast, confirmSheet, openSheet } from './ui.js';
import { esc, dayKey, stableId, uid } from './util.js';
import { header, exBadge, avatar } from './comp.js';
import { APP_VERSION, checkForUpdate, applyUpdate } from './update.js';
import { isInstalled } from './install.js';

const { store } = D;

// ---------- sync line (Home + Settings) ----------
export function syncLine() {
  if (!store.configured) return '<p class="sync-line">Dane zapisane na tym telefonie</p>';
  const s = store.syncState();
  const txt = { idle: s.at ? 'Zsynchronizowane' : 'Połączone', syncing: 'Synchronizuję…', offline: 'Offline — zsynchronizuję później', 'signed-out': 'Nie zalogowano — dane tylko na tym telefonie', error: 'Błąd synchronizacji' }[s.status] || '';
  return `<p class="sync-line ${s.status}">${icon('sync')} ${esc(txt)}${s.pending ? ` · ${s.pending} do wysłania` : ''}</p>`;
}

// ---------- settings ----------
export function renderSettings() {
  const s = D.settings(), meK = D.me();
  return `${header({ title: 'Ustawienia', back: true })}
  <section class="card">
    <h2>Pies</h2>
    <div class="row gap center-y">${avatar(64)}
      <div class="grow"><label class="btn ghost small">${icon('camera')} Zdjęcie<input type="file" accept="image/*" id="photo" hidden></label>
      ${s.photo ? '<button class="link small" data-act="photo-del">usuń</button>' : ''}</div></div>
    <label class="field"><span>Imię psa</span><input data-set="dogName" value="${esc(s.dogName)}" placeholder="np. Luna"></label>
    <label class="field"><span>Data urodzenia (opcjonalnie)</span><input type="date" data-set="dogBorn" value="${esc(s.dogBorn || '')}"></label>
  </section>

  <section class="card">
    <h2>Wy</h2>
    <div class="grid2">
      <label class="field"><span>Osoba 1</span><input data-trainer="a" value="${esc(s.trainers.a)}" placeholder="np. Mateusz"></label>
      <label class="field"><span>Osoba 2</span><input data-trainer="b" value="${esc(s.trainers.b)}" placeholder="np. Ania"></label>
    </div>
    <p class="field-label">Kto używa tego telefonu?</p>
    <div class="seg">${['a', 'b'].map((k) => `<label><input type="radio" name="me" value="${k}" ${meK === k ? 'checked' : ''} data-act="set-me"><span>${esc(D.trainerName(k))}</span></label>`).join('')}</div>
    <p class="muted small">Treningi i odhaczone zadania z tego telefonu zapisują się na tę osobę.</p>
  </section>

  <section class="card">
    <h2>Plan</h2>
    <div class="grid2">
      <label class="field"><span>Cel: sesji w tygodniu</span><input type="number" min="1" max="40" data-set="weeklyGoal" value="${s.weeklyGoal}"></label>
      <label class="field"><span>Ćwiczeń w planie dnia</span><input type="number" min="1" max="8" data-set="perSession" value="${s.perSession}"></label>
    </div>
    <p class="muted small">Dla border collie dobrze sprawdzają się 2 krótkie sesje dziennie (5–10 min) — razem ok. 10–14 w tygodniu na Was dwoje.</p>
    <button class="btn ghost wide" data-act="go" data-to="#/cues">${icon('words')} Słowniczek komend</button>
  </section>

  <section class="card">
    <h2>Synchronizacja</h2>
    ${syncSection()}
  </section>

  <section class="card">
    <h2>Kopia zapasowa</h2>
    <p class="muted small">Plik z wszystkimi danymi — na wszelki wypadek albo do przeniesienia na inny telefon.</p>
    <div class="row gap"><button class="btn ghost grow" data-act="export">${icon('download')} Zapisz kopię</button>
      <label class="btn ghost grow">${icon('upload')} Wczytaj<input type="file" accept="application/json,.json" id="import" hidden></label></div>
  </section>

  <section class="card">
    <h2>Aplikacja</h2>
    <p class="muted small">Wersja ${APP_VERSION}${isInstalled() ? ' · zainstalowana' : ''}</p>
    ${isInstalled() ? '' : `<button class="btn primary wide" data-act="install">${icon('download')} Zainstaluj aplikację</button>`}
    <button class="btn ghost wide" data-act="check-update">${icon('sync')} Sprawdź aktualizację</button>
  </section>`;
}

function syncSection() {
  if (!store.configured) {
    return `<p class="muted">Na razie dane są tylko na tym telefonie. Gdy połączymy aplikację z bazą danych, Ty i żona zobaczycie te same postępy na obu telefonach.</p>`;
  }
  const s = store.syncState();
  if (s.status === 'signed-out' || s.status === 'local') {
    return `<p class="muted small">Zaloguj się, żeby dzielić postępy z drugim telefonem.</p>
      <form class="form" id="login"><label class="field"><span>E-mail</span><input type="email" name="email" autocomplete="username" required></label>
      <label class="field"><span>Hasło</span><input type="password" name="password" autocomplete="current-password" required></label>
      <button class="btn primary wide" type="submit">Zaloguj</button></form>`;
  }
  return `${syncLine()}${s.error ? `<p class="small danger">${esc(s.error)}</p>` : ''}
    <div class="row gap"><button class="btn ghost grow" data-act="sync-now">${icon('sync')} Synchronizuj</button><button class="btn ghost" data-act="sign-out">Wyloguj</button></div>`;
}

export function mountSettings(root) {
  root.querySelectorAll('input[data-set]').forEach((inp) => {
    inp.onchange = async () => {
      const v = inp.type === 'number' ? Math.max(1, Number(inp.value) || 1) : inp.value.trim();
      await D.saveSettings({ [inp.dataset.set]: v });
      toast('Zapisano');
    };
  });
  root.querySelectorAll('input[data-trainer]').forEach((inp) => {
    inp.onchange = async () => { await D.saveSettings({ trainers: { ...D.settings().trainers, [inp.dataset.trainer]: inp.value.trim() } }); toast('Zapisano'); };
  });
  const photo = root.querySelector('#photo');
  if (photo) photo.onchange = async () => {
    const f = photo.files[0];
    if (!f) return;
    try { await D.saveSettings({ photo: await shrink(f, 320) }); toast('Zdjęcie zapisane'); } catch { toast('Nie udało się wczytać zdjęcia'); }
  };
  const imp = root.querySelector('#import');
  if (imp) imp.onchange = async () => {
    const f = imp.files[0];
    if (!f) return;
    try { const n = await store.importAll(JSON.parse(await f.text())); toast(`Wczytano ${n} wpisów`); } catch (e) { toast(e.message || 'Zły plik'); }
  };
  const login = root.querySelector('#login');
  if (login) login.onsubmit = async (ev) => {
    ev.preventDefault();
    const f = new FormData(login);
    try { await store.signIn(String(f.get('email')).trim(), String(f.get('password'))); toast('Zalogowano'); } catch (e) { toast('Nie udało się: ' + e.message); }
  };
}

// Resize a photo to a small square-ish JPEG data URL (it syncs between phones, so keep it light).
function shrink(file, max) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const c = document.createElement('canvas');
      c.width = c.height = Math.min(max, side);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// ---------- cue dictionary ----------
export function renderCues() {
  const inPlan = D.exercises().filter((e) => { const p = D.progress(e.id); return p.active || p.mastered; });
  const words = D.words();
  return `${header({ title: 'Słowniczek komend', back: true, sub: 'Te same słowa u Was obojga' })}
  <p class="hint">Pies uczy się dźwięku, nie znaczenia. „Do mnie” i „chodź” to dla niego dwie różne komendy — ustalcie jedną wersję i trzymajcie się jej.</p>
  <section class="card"><h2>Komendy z planu</h2>
    ${inPlan.length ? `<div class="cue-table">${inPlan.map((e) => {
      const p = D.progress(e.id);
      const sig = p.signal ?? (e.signal === '—' ? '' : e.signal);
      return `<a class="cue-row" href="#/ex/${esc(e.id)}">${exBadge(e)}<span class="grow"><small>${esc(e.name)}</small><strong>„${esc(p.cue ?? e.cue ?? '')}”</strong>${sig ? `<small>gest: ${esc(sig)}</small>` : ''}</span>${icon('edit', 'dim')}</a>`;
    }).join('')}</div>` : '<p class="muted">Dodajcie ćwiczenia do planu, a ich komendy pojawią się tutaj.</p>'}
  </section>
  <section class="card"><div class="card-head"><h2>Inne słowa</h2><button class="btn small secondary" data-act="word-new">${icon('plus')} Słowo</button></div>
    <p class="muted small">Np. „Wąchaj” (wolne węszenie), „Koniec” (koniec zabawy), nazwy zabawek, „Idziemy”.</p>
    ${words.length ? `<div class="cue-table">${words.map((w) => `<button class="cue-row" data-act="word-edit" data-id="${esc(w.id)}"><span class="grow"><strong>„${esc(w.word)}”</strong><small>${esc(w.meaning || '')}</small></span>${icon('edit', 'dim')}</button>`).join('')}</div>` : ''}
  </section>`;
}

function wordSheet(w) {
  const e = w || { id: uid(), word: '', meaning: '' };
  openSheet({
    title: w ? 'Edytuj słowo' : 'Nowe słowo',
    body: `<form class="form" id="wf"><label class="field"><span>Słowo</span><input name="word" required value="${esc(e.word)}"></label>
      <label class="field"><span>Co znaczy / kiedy używamy</span><input name="meaning" value="${esc(e.meaning)}"></label>
      <div class="row gap">${w ? `<button type="button" class="btn danger-ghost" data-del>${icon('trash')}</button>` : ''}<button class="btn primary grow" type="submit">Zapisz</button></div></form>`,
    onMount: (el, close) => {
      el.querySelector('#wf').onsubmit = async (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        await D.saveWord({ ...e, word: String(f.get('word')).trim(), meaning: String(f.get('meaning')).trim() });
        close();
      };
      el.querySelector('[data-del]')?.addEventListener('click', async () => { await D.removeWord(e.id); close(); });
    },
  });
}

// ---------- welcome (first run) ----------
const wz = { step: 0, dog: 'Nutka', a: '', b: '', me: 'a', known: new Set(), goals: new Set(D.STARTER_GOALS) };

export function renderWelcome() {
  const steps = [
    () => `<div class="welcome-hero">${icon('paw', 'huge')}<h1>Nutka</h1><p>Wspólny dziennik treningów posłuszeństwa i sztuczek — dla Was dwojga i Waszego border collie.</p></div>
      <label class="field"><span>Jak ma na imię pies?</span><input id="w-dog" value="${esc(wz.dog)}" placeholder="np. Luna" autocomplete="off"></label>
      ${store.configured && !(store.syncState().status === 'idle' && store.syncState().at) ? `<div class="login-hint"><p><b>Najpierw zaloguj się</b> — tym samym kontem co w aplikacji inwestycyjnej. Dzięki temu oboje zobaczycie te same postępy.</p>
        <button class="btn primary big wide" data-act="w-login">Zaloguj się</button></div>
        <button class="btn ghost wide mt" data-act="w-next">Dalej bez logowania</button>`
      : '<button class="btn primary big wide" data-act="w-next">Dalej</button>'}`,
    () => `<h1>Kto trenuje?</h1><p class="muted">Aplikacja liczy, kto ile trenował, i pozwala przydzielać zadania.</p>
      <label class="field"><span>Ty</span><input id="w-a" value="${esc(wz.a)}" placeholder="Twoje imię"></label>
      <label class="field"><span>Żona</span><input id="w-b" value="${esc(wz.b)}" placeholder="Jej imię"></label>
      <p class="field-label">Czyj to telefon?</p>
      <div class="seg"><label><input type="radio" name="w-me" value="a" ${wz.me === 'a' ? 'checked' : ''}><span>Mój (osoba 1)</span></label><label><input type="radio" name="w-me" value="b" ${wz.me === 'b' ? 'checked' : ''}><span>Żony (osoba 2)</span></label></div>
      <div class="row gap mt"><button class="btn ghost" data-act="w-prev">Wstecz</button><button class="btn primary big grow" data-act="w-next">Dalej</button></div>`,
    () => `<h1>Co ${esc(wz.dog || 'pies')} już umie?</h1><p class="muted">Zaznacz pewne komendy — trafią do „opanowanych” i będą wracać jako powtórki.</p>
      <div class="pick-grid">${D.BASICS_CHECK.map((id) => pickTile(id, wz.known.has(id), 'w-known')).join('')}</div>
      <div class="row gap mt"><button class="btn ghost" data-act="w-prev">Wstecz</button><button class="btn primary big grow" data-act="w-next">Dalej</button></div>`,
    () => `<h1>Od czego zaczynamy?</h1><p class="muted">Proponowany start dla 2-letniego border collie. Zmienisz to w każdej chwili w bibliotece.</p>
      <div class="pick-grid">${EXERCISES.filter((e) => !wz.known.has(e.id) && (D.STARTER_GOALS.includes(e.id) || ['zostaw', 'mata', 'dotknij', 'mijanie', 'dookola', 'nazwy', 'oddaj', 'onoff'].includes(e.id))).map((e) => pickTile(e.id, wz.goals.has(e.id), 'w-goal')).join('')}</div>
      <div class="row gap mt"><button class="btn ghost" data-act="w-prev">Wstecz</button><button class="btn primary big grow" data-act="w-finish">Gotowe — zaczynamy!</button></div>`,
  ];
  return `<div class="welcome"><div class="dots">${steps.map((_, i) => `<i class="${i <= wz.step ? 'on' : ''}"></i>`).join('')}</div>${steps[wz.step]()}</div>`;
}

function pickTile(id, on, act) {
  const e = D.exercise(id);
  return `<button class="tile ${on ? 'on' : ''}" data-act="${act}" data-id="${esc(id)}" aria-pressed="${on}">${exBadge(e)}<span>${esc(e.name)}</span><i class="tick">${icon('check')}</i></button>`;
}

function readWelcome() {
  const v = (id) => document.getElementById(id)?.value;
  if (v('w-dog') !== undefined) wz.dog = v('w-dog').trim();
  if (v('w-a') !== undefined) wz.a = v('w-a').trim();
  if (v('w-b') !== undefined) wz.b = v('w-b').trim();
  const me = document.querySelector('[name=w-me]:checked');
  if (me) wz.me = me.value;
}

async function finishWelcome() {
  D.setMe(wz.me);
  await D.saveSettings({ dogName: wz.dog, trainers: { a: wz.a, b: wz.b }, onboarded: true, startedAt: dayKey() });
  for (const id of wz.known) await D.markMastered(id);
  for (const id of wz.goals) if (!wz.known.has(id)) await D.setProgress(id, { active: true, startedAt: dayKey() });
  if (!D.tasks().length) for (const [i, t] of D.STARTER_TASKS.entries()) await D.saveTask({ ...t, id: stableId('starter-task:' + i), from: dayKey() });
  await D.adoptFirstProtocol();
  location.hash = '#/';
  toast(`Witaj w Nutce${wz.dog ? ', ' + wz.dog : ''}!`, { celebrate: true });
}

// Shown after signing in on the second phone: only "who holds this phone?".
export function askWhoAmI() {
  openSheet({
    title: 'Kto używa tego telefonu?',
    body: `<div class="col gap">${['a', 'b'].map((k) => `<button class="btn ghost big wide" data-k="${k}">${esc(D.trainerName(k))}</button>`).join('')}</div>`,
    onMount: (el, close) => el.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => { D.setMe(b.dataset.k); close(); window.__rerender?.(); }; }),
  });
}

function loginSheet() {
  openSheet({
    title: 'Zaloguj',
    body: `<form class="form" id="wl"><label class="field"><span>E-mail</span><input type="email" name="email" autocomplete="username" required></label>
      <label class="field"><span>Hasło</span><input type="password" name="password" autocomplete="current-password" required></label>
      <button class="btn primary wide big" type="submit">Zaloguj</button></form>`,
    onMount: (el, close) => {
      el.querySelector('#wl').onsubmit = async (ev) => {
        ev.preventDefault();
        const f = new FormData(ev.target);
        try {
          await store.signIn(String(f.get('email')).trim(), String(f.get('password')));
          close();
          if (D.settings().onboarded) { location.hash = '#/'; askWhoAmI(); } else { toast('Zalogowano ✓'); readWelcome(); wz.step = 1; window.__rerender?.(); }
        } catch (e) { toast('Nie udało się: ' + e.message); }
      };
    },
  });
}

export const actions = {
  'set-me': (el) => { D.setMe(el.value); toast('Zapisano'); },
  'photo-del': () => D.saveSettings({ photo: '' }),
  export: () => {
    const blob = new Blob([JSON.stringify(store.exportAll(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nutka-kopia-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },
  'check-update': async () => {
    try {
      const v = await checkForUpdate();
      if (v) toast(`Nowa wersja ${v}`, { action: 'Aktualizuj', onAction: applyUpdate });
      else toast('Masz najnowszą wersję');
    } catch { toast('Brak internetu'); }
  },
  'sync-now': () => store.syncNow().then(() => toast('Zsynchronizowano')).catch((e) => toast('Błąd: ' + e.message)),
  'sign-out': async () => { if (await confirmSheet({ title: 'Wylogować?', text: 'Dane zostaną na telefonie, ale przestaną się synchronizować.', ok: 'Wyloguj' })) await store.signOut(); },
  'word-new': () => wordSheet(null),
  'word-edit': (el) => wordSheet(D.words().find((w) => w.id === el.dataset.id)),
  'w-next': () => { readWelcome(); wz.step = Math.min(3, wz.step + 1); window.__rerender?.(); window.scrollTo(0, 0); },
  'w-prev': () => { readWelcome(); wz.step = Math.max(0, wz.step - 1); window.__rerender?.(); },
  'w-known': (el) => { const id = el.dataset.id; wz.known.has(id) ? wz.known.delete(id) : wz.known.add(id); el.classList.toggle('on'); el.setAttribute('aria-pressed', wz.known.has(id)); },
  'w-goal': (el) => { const id = el.dataset.id; wz.goals.has(id) ? wz.goals.delete(id) : wz.goals.add(id); el.classList.toggle('on'); el.setAttribute('aria-pressed', wz.goals.has(id)); },
  'w-finish': () => finishWelcome(),
  'w-login': () => loginSheet(),
};
