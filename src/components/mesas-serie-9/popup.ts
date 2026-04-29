import { PRECISION_META } from './constants';
import type { VotingLocal } from './types';

export const createPopupContent = (local: VotingLocal): HTMLElement => {
  const root = document.createElement('div');
  root.className = 'serie9-popup';

  const precision = PRECISION_META[local.precisionCoord];
  const header = document.createElement('div');
  header.className = 'serie9-popup__header';

  const title = document.createElement('h3');
  title.textContent = local.nombreLocal || `Local ${local.numeroLocal}`;
  header.appendChild(title);

  const badge = document.createElement('span');
  badge.className = 'serie9-popup__badge';
  badge.style.backgroundColor = precision.color;
  badge.textContent = precision.label;
  header.appendChild(badge);
  root.appendChild(header);

  const location = document.createElement('p');
  location.className = 'serie9-popup__location';
  location.textContent = [
    local.centroPoblado,
    local.distrito,
    local.provincia,
    local.region,
  ]
    .filter(Boolean)
    .join(' · ');
  root.appendChild(location);

  const meta = document.createElement('dl');
  meta.className = 'serie9-popup__meta';

  [
    ['Local', local.numeroLocal],
    ['Mesas', String(local.mesas.length)],
  ].forEach(([label, value]) => {
    if (!value) return;
    const item = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    item.append(term, description);
    meta.appendChild(item);
  });

  root.appendChild(meta);

  const tableTitle = document.createElement('p');
  tableTitle.className = 'serie9-popup__section-title';
  tableTitle.textContent = 'Mesas asociadas';
  root.appendChild(tableTitle);

  const list = document.createElement('div');
  list.className = 'serie9-popup__mesas';
  local.mesas.slice(0, 24).forEach((mesa) => {
    const item = document.createElement('span');
    item.textContent = mesa.numeroMesa;
    list.appendChild(item);
  });
  root.appendChild(list);

  if (local.mesas.length > 24) {
    const remaining = document.createElement('p');
    remaining.className = 'serie9-popup__remaining';
    remaining.textContent = `+ ${local.mesas.length - 24} mesas adicionales`;
    root.appendChild(remaining);
  }

  const actions = document.createElement('div');
  actions.className = 'serie9-popup__actions';

  const zoomButton = document.createElement('button');
  zoomButton.type = 'button';
  zoomButton.className = 'serie9-popup__zoom-button';
  zoomButton.textContent = 'Acercar';
  actions.appendChild(zoomButton);
  root.appendChild(actions);

  return root;
};
