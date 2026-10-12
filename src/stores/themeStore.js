import { create } from 'zustand';

// Chế độ nền: 'light' | 'dark' | 'system' (theo cài đặt máy). Lưu trên trình duyệt; <html data-theme> luôn là light/dark đã quyết định.
// index.html có đoạn script nhỏ đặt data-theme trước khi React chạy => không bị nháy nền trắng khi mở ở chế độ tối.
export const THEME_STORAGE_KEY = 'mapmate.theme';
export const THEME_OPTIONS = ['light', 'dark', 'system'];

const darkQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

const loadPreference = () => {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_OPTIONS.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
};

const resolve = (preference) => (preference === 'system' ? (darkQuery?.matches ? 'dark' : 'light') : preference);

const apply = (theme) => {
  document.documentElement.dataset.theme = theme;
};

export const useThemeStore = create((set, get) => {
  const preference = loadPreference();
  const theme = resolve(preference);
  apply(theme);

  // Đang theo máy => máy đổi sáng/tối thì đổi theo
  darkQuery?.addEventListener('change', () => {
    if (get().preference !== 'system') return;
    const next = resolve('system');
    apply(next);
    set({ theme: next });
  });

  return {
    preference,
    theme,
    setPreference: (next) => {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // bỏ qua (chế độ ẩn danh)
      }
      const resolved = resolve(next);
      apply(resolved);
      set({ preference: next, theme: resolved });
    },
    // Nút trên Navbar: bấm là đổi qua lại sáng ↔ tối (thôi theo máy)
    toggle: () => get().setPreference(get().theme === 'dark' ? 'light' : 'dark'),
  };
});
