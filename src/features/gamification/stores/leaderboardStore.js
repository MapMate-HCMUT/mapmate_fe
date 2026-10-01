import { create } from 'zustand';

// Nhớ tab kỳ xếp hạng đang chọn khi chuyển trang rồi quay lại.
export const useLeaderboardStore = create((set) => ({
  period: 'week',
  setPeriod: (period) => set({ period }),
}));
