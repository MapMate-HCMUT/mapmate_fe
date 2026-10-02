import { create } from 'zustand';

// Tăng `version` mỗi khi lưu / xoá / sao chép lộ trình => danh sách "Lộ trình của tôi" tự tải lại.
export const useItineraryStore = create((set) => ({
  version: 0,
  bumpVersion: () => set((state) => ({ version: state.version + 1 })),
}));
