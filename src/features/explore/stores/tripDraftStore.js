import { create } from 'zustand';

export const TRIP_DRAFT_MAX_PLACES = 8;
const STORAGE_KEY = 'mapmate.tripDraft';

const loadSaved = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};
const persist = (places) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch {
    // bỏ qua
  }
};

// "Giỏ" địa điểm người dùng tự chọn cho chuyến đi sắp lên lộ trình (giữ trong phiên làm việc).
export const useTripDraftStore = create((set, get) => ({
  places: loadSaved(),
  addPlace: (place) => {
    const { places } = get();
    if (places.some((item) => item.id === place.id) || places.length >= TRIP_DRAFT_MAX_PLACES) return false;
    const next = [...places, place];
    persist(next);
    set({ places: next });
    return true;
  },
  removePlace: (placeId) => {
    const next = get().places.filter((place) => place.id !== placeId);
    persist(next);
    set({ places: next });
  },
  clearPlaces: () => {
    persist([]);
    set({ places: [] });
  },
}));
