import { useEffect, useMemo, useState } from 'react';
import { useErrorRedirect } from '../../../hooks/useErrorRedirect';
import { useSearchStore } from '../../../stores/searchStore';
import { getNearbyPlacesApi } from '../api/placesApi';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { buildNearbyParams, PAGE_SIZE, relaxParams, SEARCH_DEBOUNCE_MS } from '../utils/filterConfig';

const EMPTY = { items: [], total: 0, totalCapped: false, radiusKm: null, page: 1, hasMore: false, isLoading: true, error: null, relaxed: null };

// Tải danh sách địa điểm theo bộ lọc, chia trang (PAGE_SIZE quán / trang): đổi bộ lọc => chờ 350ms rồi về trang 1;
// goToPage(n) tải đúng trang n (thay danh sách đang xem).
// Không có kết quả => server tự nới bộ lọc (auto_relax) và báo đã tạm bỏ gì — người dùng khỏi phải tự bấm "Đặt lại bộ lọc".
export const useExplorePlaces = () => {
  const filters = useExploreFilterStore((state) => state.filters);
  const origin = useExploreFilterStore((state) => state.origin);
  const keyword = useSearchStore((state) => state.query); // ô tìm kiếm trên Navbar
  const [state, setState] = useState(EMPTY);
  const [reloadCount, setReloadCount] = useState(0);
  const redirectOnError = useErrorRedirect();

  const firstPageParams = useMemo(() => buildNearbyParams(filters, origin, keyword, 1), [filters, origin, keyword]);

  useEffect(() => {
    let isActive = true;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, isLoading: true }));
      getNearbyPlacesApi({ ...firstPageParams, auto_relax: true })
        .then((data) => isActive && setState({ items: data.items, total: data.total, totalCapped: Boolean(data.total_capped), radiusKm: data.radius_km ?? null, page: 1, hasMore: data.has_more, isLoading: false, error: null, relaxed: data.relaxed ?? null }))
        .catch((error) => isActive && !redirectOnError(error) && setState({ ...EMPTY, isLoading: false, error }));
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirectOnError chỉ dùng khi lỗi
  }, [firstPageParams, reloadCount]);
  const reload = () => setReloadCount((count) => count + 1);

  const goToPage = async (page) => {
    if (page < 1) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = state.relaxed ? relaxParams(firstPageParams, state.relaxed) : firstPageParams; // đúng bộ lọc đã nới (nếu có)
      const data = await getNearbyPlacesApi({ ...params, page });
      setState((prev) => ({ ...prev, items: data.items, page: data.page, hasMore: data.has_more, isLoading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  };

  // Server chỉ đếm tới 1.000 => "1.000+" (khi đó không biết trang cuối, nút "Sau" dựa vào hasMore)
  const totalLabel = `${state.total.toLocaleString('vi-VN')}${state.totalCapped ? '+' : ''}`;
  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  return { ...state, totalLabel, totalPages, goToPage, reload, keyword };
};
