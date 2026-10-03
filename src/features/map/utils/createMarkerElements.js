import { getCategory } from './placeCategory';
import { getSeverity } from './floodSeverity';


export const createPlaceMarkerElement = (place, isSelected) => {
  const { marker, emoji, label } = getCategory(place.category);

  const wrapper = document.createElement('div');
  wrapper.className = 'place-marker-root cursor-pointer';

  const inner = document.createElement('button');
  inner.type = 'button';
  inner.title = `${place.name} · ${label}`;
  inner.setAttribute('aria-label', place.name);
  inner.className = `${marker} flex items-center justify-center rounded-pill border-2 border-white shadow-card-hover cursor-pointer transition-transform duration-150 ease-out hover:scale-125 select-none ${
    isSelected ? 'w-12 h-12 text-xl ring-4 ring-primary-500/40 z-20 scale-110' : 'w-9 h-9 text-base'
  }`;
  inner.textContent = emoji;

  wrapper.appendChild(inner);
  return wrapper;
};

export const createFloodMarkerElement = (alert) => {
  const { dot, halo } = getSeverity(alert.severity);

  // Thẻ Wrapper gốc
  const wrapper = document.createElement('div');
  wrapper.className = 'flood-marker-root cursor-pointer';

  // Thẻ con bên trong
  const inner = document.createElement('button');
  inner.type = 'button';
  inner.title = `${alert.street} — ngập ${alert.depth_cm}cm`;
  inner.setAttribute('aria-label', inner.title);
  inner.className = 'relative w-12 h-12 flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-115';
  inner.innerHTML = `
    <span class="absolute inset-0 rounded-pill ${halo} animate-ping"></span>
    <span class="absolute inset-1.5 rounded-pill ${halo}"></span>
    <span class="relative w-7 h-7 rounded-pill ${dot} border-2 border-white shadow-card-hover flex items-center justify-center text-sm">💧</span>`;

  wrapper.appendChild(inner);
  return wrapper;
};

export const createUserMarkerElement = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'user-marker-root';

  const inner = document.createElement('div');
  inner.className = 'relative w-5 h-5';
  inner.innerHTML = `
    <span class="absolute -inset-3 rounded-pill bg-info-500/25 animate-pulse"></span>
    <span class="relative block w-5 h-5 rounded-pill bg-info-500 border-[3px] border-white shadow-card-hover"></span>`;

  wrapper.appendChild(inner);
  return wrapper;
};
