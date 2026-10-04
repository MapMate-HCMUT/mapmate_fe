import { create } from 'zustand';
import { createDefaultFilters, criteriaToFilters, DEFAULT_ORIGIN, migrateSavedFilters } from '../utils/filterConfig';

const STORAGE_KEY = 'mapmate.exploreFilters.v2'; // v2: thêm phương tiện kết hợp, khoảng giá tới 2.000k

// Nhớ bộ lọc giữa các lần mở trang. Giờ khởi hành luôn lấy theo hiện tại (giờ cũ hôm qua không còn ý nghĩa).
const loadSaved = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return saved ? { ...createDefaultFilters(), ...migrateSavedFilters(saved.filters), startTime: createDefaultFilters().startTime } : createDefaultFilters();
  } catch {
    return createDefaultFilters();
  }
};

const persist = (filters) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ filters }));
  } catch {
    // bỏ qua nếu trình duyệt chặn storage
  }
};

export const useExploreFilterStore = create((set, get) => ({
  filters: loadSaved(),
  origin: DEFAULT_ORIGIN, // điểm xuất phát; không lưu lại vì là vị trí của người dùng
  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value };
    persist(filters);
    set({ filters });
  },
  replaceFilters: (filters) => {
    persist(filters);
    set({ filters });
  },
  resetFilters: () => {
    const filters = createDefaultFilters();
    persist(filters);
    set({ filters });
  },
  setOrigin: (origin) => set({ origin }),
  applyCriteria: (criteria) => {
    if (!criteria) return;
    const current = get().filters;
    const nextFilters = criteriaToFilters(criteria, current);
    persist(nextFilters);
    const updates = { filters: nextFilters };
    if (criteria.origin) {
      const label = criteria.origin.label ?? (nextFilters.district ? `Trung tâm ${nextFilters.district}` : 'Điểm xuất phát');
      updates.origin = {
        ...criteria.origin,
        label,
        isDefault: false,
      };
    }
    set(updates);
  },
}));
