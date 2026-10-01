import { create } from 'zustand';

const STORAGE_KEY = 'mapmate.rememberMe';

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? { remember: true, email: '' };
  } catch {
    return { remember: true, email: '' };
  }
};

// Nhớ lựa chọn "Ghi nhớ đăng nhập" và email lần trước để điền sẵn form (không bao giờ lưu mật khẩu).
export const useRememberMeStore = create((set) => ({
  ...read(),
  saveRememberMe: ({ remember, email }) => {
    const next = { remember, email: remember ? email : '' };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // bỏ qua nếu trình duyệt chặn storage
    }
    set(next);
  },
}));
