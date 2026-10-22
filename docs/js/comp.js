// Small pieces of markup shared by several screens.

import { CATEGORIES, LEVELS } from './exercises.js';
import { icon } from './ui.js';
import { esc, fmtRelDay } from './util.js';
import * as D from './data.js';

export const CAT_ICON = { beh: 'note', base: 'target', obed: 'paw', calm: 'moon', trick: 'sparkle', brain: 'search' };
export const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || 'Inne';
export const catShort = (id) => CATEGORIES.find((c) => c.id === id)?.short || 'Inne';

export const exBadge = (ex, size = '') => `<span class="exb cat-${esc(ex?.cat || 'obed')} ${size}" aria-hidden="true">${icon(CAT_ICON[ex?.cat] || 'paw')}</span>`;

export const levelDots = (lvl) => `<span class="lvl" aria-hidden="true" title="Poziom: ${LEVELS[lvl] || ''}">${[1, 2, 3].map((i) => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</span>`;

export function stageBar(done, total) {
  return `<span class="sbar" role="img" aria-label="${done} z ${total} etapów">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('')}</span>`;
}

export const whoChip = (k) => `<span class="who who-${k === 'b' ? 'b' : 'a'}">${esc(D.trainerName(k))}</span>`;
export function assigneeChip(who) {
  if (who === 'both' || !who) return '<span class="who who-both">Oboje</span>';
  return whoChip(who);
}

export function stageText(ex, stage) {
  if (!ex) return '';
  if (stage === null || stage === undefined || stage >= ex.stages.length) return 'Opanowane · szybka powtórka';
  return `Etap ${stage + 1}/${ex.stages.length} · ${ex.stages[stage].t}`;
}

export function header({ title, sub = '', back = false, right = '' }) {
  return `<header class="top">
    ${back ? `<button class="icon-btn" data-act="back" aria-label="Wstecz">${icon('back')}</button>` : ''}
    <div class="top-title"><h1 class="${title.length > 26 ? 'long' : ''}">${esc(title)}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}</div>
    <div class="top-right">${right}</div>
  </header>`;
}

export function emptyState(title, text, btn = '') {
  return `<div class="empty">${icon('paw', 'big')}<h3>${esc(title)}</h3><p>${esc(text)}</p>${btn}</div>`;
}

export function sessionRow(s) {
  const names = (s.items || []).map((it) => D.exercise(it.exId)?.name).filter(Boolean);
  const ok = (s.items || []).reduce((a, it) => a + (it.ok || 0), 0);
  return `<button class="list-row" data-act="session-detail" data-id="${esc(s.id)}">
    <span class="when">${esc(fmtRelDay(s.day))}</span>
    <span class="grow"><strong>${esc(names.slice(0, 3).join(', ') || 'Trening')}${names.length > 3 ? ` +${names.length - 3}` : ''}</strong>
    <small>${whoChip(s.by)} · ${Math.max(1, Math.round((s.dur || 0) / 60))} min · ${ok} udanych${s.rating ? ` · ${['', 'ciężko', 'ok', 'super'][s.rating]}` : ''}</small></span>
    ${icon('next', 'dim')}</button>`;
}

export function avatar(size = 44) {
  const s = D.settings();
  return s.photo
    ? `<img class="avatar" src="${esc(s.photo)}" alt="" width="${size}" height="${size}">`
    : `<span class="avatar ph" style="width:${size}px;height:${size}px">${icon('paw')}</span>`;
}
