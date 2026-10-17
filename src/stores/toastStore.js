import { create } from 'zustand';
import { TOAST_ACTION_DURATION_MS, TOAST_DURATION_MS } from '../config/app';

let hideTimer;

// Toast nhẹ tự tắt sau 2.5 giây (Milestone 2 — mục 2.3.3).
// action = 1 nút bấm trong toast (VD "Hoàn tác" sau khi xoá) — toast có nút ở lâu hơn để kịp bấm.
export const useToastStore = create((set) => ({
  toast: null,
  showToast: (message, tone = 'success', { action = null } = {}) => {
    clearTimeout(hideTimer);
    set({ toast: { message, tone, action, id: Date.now() } });
    hideTimer = setTimeout(() => set({ toast: null }), action ? TOAST_ACTION_DURATION_MS : TOAST_DURATION_MS);
  },
  hideToast: () => {
    clearTimeout(hideTimer);
    set({ toast: null });
  },
}));
