// "Zainstaluj aplikację" — uses the browser's install offer when there is one (Android Chrome),
// otherwise explains the menu steps (iPhone Safari, or Chrome before it offers installing).

import { icon, openSheet, toast } from './ui.js';

export const isInstalled = () => window.__installed || window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export async function install() {
  if (window.__bip) {
    const e = window.__bip;
    window.__bip = null;
    e.prompt();
    const r = await e.userChoice.catch(() => null);
    if (r?.outcome === 'accepted') toast('Instaluję Nutkę na telefonie…');
    window.__rerender?.();
    return;
  }
  openSheet({
    title: 'Zainstaluj Nutkę',
    body: isIOS()
      ? `<ol class="steps"><li>Stuknij przycisk <b>Udostępnij</b> (kwadrat ze strzałką) na dole Safari.</li><li>Wybierz <b>Do ekranu początkowego</b>.</li><li>Stuknij <b>Dodaj</b>.</li></ol>`
      : `<ol class="steps"><li>Stuknij menu <b>⋮</b> w prawym górnym rogu Chrome.</li><li>Wybierz <b>Zainstaluj aplikację</b> albo <b>Dodaj do ekranu głównego</b>.</li><li>Potwierdź <b>Zainstaluj</b>.</li></ol>`,
  });
}
