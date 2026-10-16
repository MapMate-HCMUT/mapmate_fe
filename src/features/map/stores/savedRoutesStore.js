import { create } from 'zustand';

// Lộ trình đã lưu đang hiện trên bản đồ (tab Bản đồ › Lộ trình đã lưu).
// - Tối đa MAX_VISIBLE_ROUTES lộ trình cùng lúc; mỗi lộ trình giữ 1 màu riêng suốt lúc đang hiện
// - Đã đủ mà bấm thêm => `pendingId` (hỏi người dùng ẩn lộ trình nào để thay), không tự ẩn ngầm
// - Giữ trong phiên làm việc (chuyển tab rồi quay lại vẫn còn)
export const MAX_VISIBLE_ROUTES = 5;
// Bảng màu Okabe–Ito: phân biệt được cả với người mù màu, nổi trên bản đồ sáng lẫn tối
export const ROUTE_COLORS = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00'];

const STORAGE_KEY = 'mapmate.savedRoutes.visible';
const load = () => {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter((item) => item?.id && ROUTE_COLORS.includes(item.color)).slice(0, MAX_VISIBLE_ROUTES) : [];
  } catch {
    return [];
  }
};
const persist = (visible) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
  } catch {
    // bỏ qua (chế độ ẩn danh)
  }
};

const freeColor = (visible) => ROUTE_COLORS.find((color) => !visible.some((item) => item.color === color)) ?? ROUTE_COLORS[0];

export const useSavedRoutesStore = create((set, get) => {
  const commit = (visible, extra = {}) => {
    persist(visible);
    set({ visible, ...extra });
  };

  return {
    visible: load(), // [{ id, color }] theo thứ tự bật
    pendingId: null, // lộ trình muốn hiện thêm khi đã đủ MAX_VISIBLE_ROUTES
    lastShownId: null, // lộ trình vừa bật => bản đồ thu phóng tới
    focusedId: null, // lộ trình đang chọn: đậm hơn trên bản đồ, các lộ trình khác mờ đi
    setFocused: (focusedId) => set({ focusedId }),

    isVisible: (id) => get().visible.some((item) => item.id === id),
    colorOf: (id) => get().visible.find((item) => item.id === id)?.color ?? null,

    show: (id) => {
      const { visible } = get();
      if (visible.some((item) => item.id === id)) return set({ lastShownId: id, focusedId: id, pendingId: null });
      if (visible.length >= MAX_VISIBLE_ROUTES) return set({ pendingId: id });
      return commit([...visible, { id, color: freeColor(visible) }], { lastShownId: id, focusedId: id, pendingId: null });
    },
    hide: (id) =>
      commit(get().visible.filter((item) => item.id !== id), {
        pendingId: get().pendingId === id ? null : get().pendingId,
        focusedId: get().focusedId === id ? null : get().focusedId,
      }),
    toggle: (id) => (get().isVisible(id) ? get().hide(id) : get().show(id)),
    // Đã đủ 5: ẩn `replaceId`, hiện lộ trình đang chờ bằng đúng màu vừa trả lại
    replaceWithPending: (replaceId) => {
      const { visible, pendingId } = get();
      if (!pendingId) return;
      const freed = visible.find((item) => item.id === replaceId)?.color ?? freeColor(visible);
      commit([...visible.filter((item) => item.id !== replaceId), { id: pendingId, color: freed }], { lastShownId: pendingId, focusedId: pendingId, pendingId: null });
    },
    cancelPending: () => set({ pendingId: null }),
    hideAll: () => commit([], { pendingId: null, focusedId: null }),
    // Lộ trình đã bị xoá => bỏ khỏi danh sách đang hiện
    prune: (existingIds) => {
      const kept = get().visible.filter((item) => existingIds.has(item.id));
      if (kept.length !== get().visible.length) commit(kept);
    },
  };
});
