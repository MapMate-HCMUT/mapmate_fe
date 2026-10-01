import { create } from 'zustand';

// Từ khóa tìm kiếm toàn cục (ô search nằm trên Navbar, dùng cho nhiều trang).
export const useSearchStore = create((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  clearQuery: () => set({ query: '' }),
}));
