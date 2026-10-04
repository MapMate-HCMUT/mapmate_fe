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

// Lộ trình chọn từ gợi ý (đã chỉnh ±15′): giữ thời gian ở lại từng điểm + đúng thứ tự => "Dự kiến" và khi lưu khớp với lúc chọn
const STORAGE_PLAN_KEY = 'mapmate.tripDraftPlan';
const EMPTY_PLAN = { stayOverrides: {}, keepOrder: false };
const loadSavedPlan = () => {
  try {
    return { ...EMPTY_PLAN, ...JSON.parse(window.sessionStorage.getItem(STORAGE_PLAN_KEY)) };
  } catch {
    return EMPTY_PLAN;
  }
};
const persistPlan = (plan) => {
  try {
    window.sessionStorage.setItem(STORAGE_PLAN_KEY, JSON.stringify(plan));
  } catch {
    // bỏ qua
  }
};
const toPlan = ({ stayOverrides = {}, keepOrder = false } = {}) => ({ stayOverrides, keepOrder });

// "Giỏ" địa điểm người dùng tự chọn cho chuyến đi sắp lên lộ trình (giữ trong phiên làm việc).
// stayOverrides { placeId: phút } + keepOrder: có khi nạp từ 1 phương án gợi ý — thêm điểm mới vẫn giữ, bỏ điểm thì bỏ phần của điểm đó.
export const useTripDraftStore = create((set, get) => ({
  places: loadSaved(),
  tripName: loadSavedName(),
  editingItineraryId: loadSavedEditingId(),
  ...loadSavedPlan(),
  setTripName: (tripName) => {
    persistName(tripName);
    set({ tripName });
  },
  setPlaces: (places, name, plan) => {
    const next = (places || []).slice(0, TRIP_DRAFT_MAX_PLACES);
    persist(next);
    persistPlan(toPlan(plan));
    const updates = { places: next, ...toPlan(plan) };
    if (typeof name === 'string') {
      persistName(name);
      updates.tripName = name;
    }
    set(updates);
  },
  startEditing: (itineraryId, places, name, plan) => {
    const next = (places || []).slice(0, TRIP_DRAFT_MAX_PLACES);
    persist(next);
    persistName(name || '');
    persistEditingId(itineraryId);
    persistPlan(toPlan(plan));
    set({
      places: next,
      tripName: name || '',
      editingItineraryId: itineraryId,
      ...toPlan(plan),
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
    const stayOverrides = Object.fromEntries(Object.entries(get().stayOverrides).filter(([id]) => id !== String(placeId)));
    persist(next);
    persistPlan({ stayOverrides, keepOrder: get().keepOrder });
    set({ places: next, stayOverrides });
  },
  clearPlaces: () => {
    persist([]);
    persistName('');
    persistEditingId(null);
    persistPlan(EMPTY_PLAN);
    set({ places: [], tripName: '', editingItineraryId: null, ...EMPTY_PLAN });
  },
}));
