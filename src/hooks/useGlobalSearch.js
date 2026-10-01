import { useLocation, useNavigate } from 'react-router';
import { useSearchStore } from '../stores/searchStore';

// Ô tìm kiếm trên Navbar: gõ ở trang nào cũng được, Enter sẽ đưa về bản đồ để xem kết quả.
export const useGlobalSearch = () => {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const clearQuery = useSearchStore((state) => state.clearQuery);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const submitSearch = () => {
    if (pathname !== '/') navigate('/');
  };

  return { query, setQuery, clearQuery, submitSearch };
};
