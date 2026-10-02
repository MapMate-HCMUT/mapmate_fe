import { useEffect, useMemo, useState } from 'react';
import { useSearchStore } from '../../../stores/searchStore';
import { getNearbyPlacesApi } from '../api/placesApi';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { buildNearbyParams, SEARCH_DEBOUNCE_MS } from '../utils/filterConfig';

const EMPTY = { items: [], total: 0, page: 1, hasMore: false, isLoading: true, error: null };

// Tải danh sách địa điểm theo bộ lọc: đổi bộ lọc => chờ 350ms rồi tải lại từ trang 1; "Xem thêm" nối trang kế.
export const useExplorePlaces = () => {
  const filters = useExploreFilterStore((state) => state.filters);
  const origin = useExploreFilterStore((state) => state.origin);
  const keyword = useSearchStore((state) => state.query); // ô tìm kiếm trên Navbar
  const [state, setState] = useState(EMPTY);

  const firstPageParams = useMemo(() => buildNearbyParams(filters, origin, keyword, 1), [filters, origin, keyword]);

  useEffect(() => {
    let isActive = true;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, isLoading: true }));
      getNearbyPlacesApi(firstPageParams)
        .then((data) => isActive && setState({ items: data.items, total: data.total, page: 1, hasMore: data.has_more, isLoading: false, error: null }))
        .catch((error) => isActive && setState({ ...EMPTY, isLoading: false, error }));
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [firstPageParams]);

  const loadMore = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getNearbyPlacesApi({ ...firstPageParams, page: state.page + 1 });
      setState((prev) => ({ ...prev, items: [...prev.items, ...data.items], page: data.page, hasMore: data.has_more, isLoading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  };

  return { ...state, loadMore, keyword };
};
