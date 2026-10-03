import { useLocation, useNavigate } from 'react-router';
import { useSearchStore } from '../stores/searchStore';

// Các trang tự dùng từ khoá trên Navbar để lọc dữ liệu của mình => Enter không chuyển trang.
const SEARCHABLE_PATHS = ['/', '/explore'];

// Ô tìm kiếm trên Navbar: gõ ở trang nào cũng được; ở trang không có tìm kiếm, Enter sẽ đưa sang Khám phá.
export const useGlobalSearch = () => {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const clearQuery = useSearchStore((state) => state.clearQuery);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const submitSearch = () => {
    if (!SEARCHABLE_PATHS.includes(pathname)) navigate('/explore');
  };

  return { query, setQuery, clearQuery, submitSearch };
};
