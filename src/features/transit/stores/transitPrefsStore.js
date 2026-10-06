import { create } from 'zustand';

const STORAGE_KEY = 'mapmate.transitPrefs.v1';
const DEFAULT_PREFS = { priority: 'fastest', connector: 'auto', maxWalkM: 800 };

// Ưu tiên khi đi xe công cộng (nhớ giữa các lần mở trang): nhanh nhất / ít đi bộ / rẻ nhất; ra trạm bằng đi bộ hay gọi xe
const loadSaved = () => {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(window.localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return DEFAULT_PREFS;
  }
};

export const useTransitPrefsStore = create((set, get) => ({
  prefs: loadSaved(),
  setPref: (key, value) => {
    const prefs = { ...get().prefs, [key]: value };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // trình duyệt chặn storage => chỉ nhớ trong phiên
    }
    set({ prefs });
  },
}));
