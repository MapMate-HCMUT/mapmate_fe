import { create } from 'zustand';

export const TRIP_DRAFT_MAX_PLACES = 8;
const STORAGE_KEY = 'mapmate.tripDraft';
const STORAGE_NAME_KEY = 'mapmate.tripDraftName';
const STORAGE_EDITING_ID_KEY = 'mapmate.tripDraftEditingId';

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

const loadSavedName = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_NAME_KEY) || '';
  } catch {
    return '';
  }
};

const persistName = (name) => {
  try {
    if (name) {
      window.sessionStorage.setItem(STORAGE_NAME_KEY, name);
    } else {
      window.sessionStorage.removeItem(STORAGE_NAME_KEY);
    }
  } catch {
    // bỏ qua
  }
};

const loadSavedEditingId = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_EDITING_ID_KEY) || null;
  } catch {
    return null;
  }
};

const persistEditingId = (id) => {
  try {
    if (id) {
      window.sessionStorage.setItem(STORAGE_EDITING_ID_KEY, id);
    } else {
      window.sessionStorage.removeItem(STORAGE_EDITING_ID_KEY);
    }
  } catch {
    // bỏ qua
  }
};

// "Giỏ" địa điểm người dùng tự chọn cho chuyến đi sắp lên lộ trình (giữ trong phiên làm việc).
export const useTripDraftStore = create((set, get) => ({
  places: loadSaved(),
  tripName: loadSavedName(),
  editingItineraryId: loadSavedEditingId(),
  setTripName: (tripName) => {
    persistName(tripName);
    set({ tripName });
  },
  setPlaces: (places, name) => {
    const next = (places || []).slice(0, TRIP_DRAFT_MAX_PLACES);
    persist(next);
    const updates = { places: next };
    if (typeof name === 'string') {
      persistName(name);
      updates.tripName = name;
    }
    set(updates);
  },
  startEditing: (itineraryId, places, name) => {
    const next = (places || []).slice(0, TRIP_DRAFT_MAX_PLACES);
    persist(next);
    persistName(name || '');
    persistEditingId(itineraryId);
    set({
      places: next,
      tripName: name || '',
      editingItineraryId: itineraryId,
    });
  },
  cancelEditing: () => {
    persistEditingId(null);
    set({ editingItineraryId: null });
  },
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
    persistName('');
    persistEditingId(null);
    set({ places: [], tripName: '', editingItineraryId: null });
  },
}));
