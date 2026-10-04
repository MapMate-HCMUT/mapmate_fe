import { getCategory } from './placeCategory';

export const createPlaceMarkerElement = (place, isSelected) => {
  const { emoji } = getCategory(place.category);
  const element = document.createElement('div');
  element.className = `place-marker cursor-pointer select-none transition-transform duration-200 ${
    isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
  }`;
  element.innerHTML = `
    <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface shadow-marker border-2 ${
      isSelected ? 'border-primary-600 ring-2 ring-primary-200' : 'border-neutral-200'
    }">
      <span class="text-base">${emoji}</span>
      ${
        place.is_trending
          ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-surface"></span>'
          : ''
      }
    </div>
  `;
  return element;
};

export const createFloodMarkerElement = (alert) => {
  const isHigh = alert.severity === 'high';
  const element = document.createElement('div');
  element.className = 'flood-marker cursor-pointer select-none';
  element.innerHTML = `
    <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${
      isHigh ? 'bg-danger-500 ring-4 ring-danger-200' : 'bg-warning-500 ring-4 ring-warning-200'
    } text-surface shadow-md">
      <span class="text-xs">⚠️</span>
    </div>
  `;
  return element;
};

export const createUserMarkerElement = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative flex items-center justify-center w-8 h-8 pointer-events-none';

  const pulse = document.createElement('span');
  pulse.className = 'absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-60 animate-ping';
  wrapper.appendChild(pulse);

  const inner = document.createElement('span');
  inner.className = 'relative inline-flex rounded-full h-4 w-4 bg-primary-600 border-2 border-surface shadow-md';
  wrapper.appendChild(inner);
  return wrapper;
};

// Marker điểm xuất phát chuẩn Goong Maps: Vòng tròn đen tâm trắng nhỏ gọn, không chèn chữ to che bản đồ
export const createOriginMarkerElement = (label = 'Vị trí của bạn') => {
  const wrapper = document.createElement('div');
  wrapper.className = 'origin-marker-root cursor-pointer select-none relative group z-20 flex items-center justify-center';
  wrapper.title = label;

  wrapper.innerHTML = `
    <div class="w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125">
      <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
    </div>
    <div class="absolute -bottom-6 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-medium whitespace-nowrap shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
      ${label}
    </div>
  `;
  return wrapper;
};

// Marker điểm đích đến cuối cùng chuẩn Goong Maps: Ghim đỏ giọt nước cổ điển
export const createDestinationMarkerElement = (name, isActive = false) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'destination-marker-root cursor-pointer select-none relative group z-25 flex flex-col items-center';
  wrapper.title = `Đích đến: ${name}`;

  wrapper.innerHTML = `
    <div class="transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}">
      <svg class="w-7 h-8 text-rose-600 filter drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
      </svg>
    </div>
    <div class="absolute -bottom-6 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[11px] font-semibold whitespace-nowrap shadow max-w-[160px] truncate opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
      ${name}
    </div>
  `;
  return wrapper;
};

// Marker cho từng điểm dừng trung gian chuẩn Goong Maps (vòng tròn số xanh dương, không có icon đồ ăn cồng kềnh)
export const createItineraryStopMarkerElement = (stop, index, isLast = false, isActive = false) => {
  const name = stop.place?.name || stop.place_name || `Điểm ${index + 1}`;
  if (isLast) {
    return createDestinationMarkerElement(name, isActive);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'itinerary-stop-marker-root cursor-pointer select-none relative group z-20 flex items-center justify-center';
  wrapper.title = `${index + 1}. ${name}`;

  wrapper.innerHTML = `
    <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white text-white text-[11px] font-bold shadow-md flex items-center justify-center transition-transform group-hover:scale-125 ${
      isActive ? 'ring-2 ring-blue-400 ring-offset-1 scale-110' : ''
    }">
      ${index + 1}
    </div>
    <div class="absolute -bottom-6 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[11px] font-semibold whitespace-nowrap shadow max-w-[160px] truncate opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
      ${index + 1}. ${name}
    </div>
  `;
  return wrapper;
};

// Hộp badge hiển thị số km và thời gian ngay trên đường đi chuẩn phong cách Goong Maps
export const createRouteCalloutElement = (distanceText, durationText) => {
  const el = document.createElement('div');
  el.className =
    'route-callout-badge bg-white px-2.5 py-1 rounded-md shadow-md border border-neutral-300 text-center pointer-events-none select-none z-30';
  el.innerHTML = `
    <div class="text-neutral-900 text-xs font-extrabold leading-tight whitespace-nowrap">${distanceText}</div>
    <div class="text-neutral-600 text-[11px] font-medium leading-tight whitespace-nowrap mt-0.5">${durationText}</div>
  `;
  return el;
};
