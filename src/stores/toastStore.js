import { create } from 'zustand';
import { TOAST_DURATION_MS } from '../config/app';

let hideTimer;

// Toast nhẹ tự tắt sau 2.5 giây (Milestone 2 — mục 2.3.3).
export const useToastStore = create((set) => ({
  toast: null,
  showToast: (message, tone = 'success') => {
    clearTimeout(hideTimer);
    set({ toast: { message, tone, id: Date.now() } });
    hideTimer = setTimeout(() => set({ toast: null }), TOAST_DURATION_MS);
  },
  hideToast: () => {
    clearTimeout(hideTimer);
    set({ toast: null });
  },
}));
