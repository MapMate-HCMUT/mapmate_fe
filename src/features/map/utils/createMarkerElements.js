import { getCategory } from './placeCategory';
import { getSeverity } from './floodSeverity';

// MapLibre Marker cần phần tử DOM thuần — các hàm dưới đây chỉ dựng DOM, không chứa logic nghiệp vụ.

export const createPlaceMarkerElement = (place, isSelected) => {
  const { marker, emoji, label } = getCategory(place.category);
  const element = document.createElement('button');
  element.type = 'button';
  element.title = `${place.name} · ${label}`;
  element.setAttribute('aria-label', place.name);
  element.className = `${marker} flex items-center justify-center rounded-pill border-2 border-white shadow-card-hover cursor-pointer transition-transform duration-200 hover:scale-110 ${
    isSelected ? 'w-12 h-12 text-xl ring-4 ring-primary-500/40 z-10' : 'w-9 h-9 text-base'
  }`;
  element.textContent = emoji;
  return element;
};

export const createFloodMarkerElement = (alert) => {
  const { dot, halo } = getSeverity(alert.severity);
  const element = document.createElement('button');
  element.type = 'button';
  element.title = `${alert.street} — ngập ${alert.depth_cm}cm`;
  element.setAttribute('aria-label', element.title);
  element.className = 'relative w-12 h-12 flex items-center justify-center cursor-pointer';
  element.innerHTML = `
    <span class="absolute inset-0 rounded-pill ${halo} animate-ping"></span>
    <span class="absolute inset-1.5 rounded-pill ${halo}"></span>
    <span class="relative w-7 h-7 rounded-pill ${dot} border-2 border-white shadow-card-hover flex items-center justify-center text-sm">💧</span>`;
  return element;
};

export const createUserMarkerElement = () => {
  const element = document.createElement('div');
  element.className = 'relative w-5 h-5';
  element.innerHTML = `
    <span class="absolute -inset-3 rounded-pill bg-info-500/25 animate-pulse"></span>
    <span class="relative block w-5 h-5 rounded-pill bg-info-500 border-[3px] border-white shadow-card-hover"></span>`;
  return element;
};
