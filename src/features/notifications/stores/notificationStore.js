import { create } from 'zustand';

// Số thông báo chưa đọc dùng chung cho chuông trên Navbar và danh sách trong Hồ sơ.
export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
}));
