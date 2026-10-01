import { create } from 'zustand';
import { AUTH_STORAGE_KEY } from '../config/auth';
import { isTokenExpired } from '../utils/jwt';

// "Ghi nhớ đăng nhập" => localStorage (còn sau khi tắt trình duyệt)
// Không ghi nhớ        => sessionStorage (mất khi đóng tab)
const storages = () => [window.localStorage, window.sessionStorage];

const readSession = () => {
  try {
    for (const storage of storages()) {
      const raw = storage.getItem(AUTH_STORAGE_KEY);
      if (!raw) continue;
      const session = JSON.parse(raw);
      if (session?.token && !isTokenExpired(session.token)) return session;
      storage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Trình duyệt chặn storage (chế độ ẩn danh...) => coi như chưa đăng nhập
  }
  return { token: null, user: null };
};

const writeSession = (session, remember) => {
  try {
    storages().forEach((storage) => storage.removeItem(AUTH_STORAGE_KEY));
    if (session) (remember ? window.localStorage : window.sessionStorage).setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Không lưu được thì phiên chỉ tồn tại trong bộ nhớ — vẫn dùng bình thường
  }
};

const initial = readSession();

export const useAuthStore = create((set, get) => ({
  token: initial.token,
  user: initial.user,
  setSession: ({ token, user }, remember) => {
    writeSession({ token, user }, remember);
    set({ token, user });
  },
  updateUser: (user) => {
    const { token } = get();
    const remember = Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY));
    writeSession({ token, user }, remember);
    set({ user });
  },
  clearSession: () => {
    writeSession(null);
    set({ token: null, user: null });
  },
}));
