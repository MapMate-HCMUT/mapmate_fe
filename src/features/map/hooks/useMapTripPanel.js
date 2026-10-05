import { useNavigate } from 'react-router';
import { buildTripCriteria, useExploreFilterStore, useTripDraftStore } from '../../explore';
import { optionToTrip, stayOverridesOf, stopsToPlaces, useActiveRouteStore, useRouteSuggestions } from '../../itinerary';

// Giỏ chuyến đi trên bản đồ trang chủ — DÙNG CHUNG với trang Khám phá (cùng store, cùng bộ lọc).
// Gợi ý lộ trình ngay tại trang chủ; chọn "Xem trên bản đồ" => vẽ đường + chỉ đường luôn, không phải chuyển trang.
export const useMapTripPanel = (userCoordinates) => {
  const navigate = useNavigate();
  const draft = useTripDraftStore();
  const filters = useExploreFilterStore((state) => state.filters);
  const exploreOrigin = useExploreFilterStore((state) => state.origin);
  const startTrip = useActiveRouteStore((state) => state.startTrip);
  const routes = useRouteSuggestions();

  // Xuất phát từ vị trí thật của người dùng nếu đã có, không thì điểm xuất phát đang dùng ở Khám phá
  const origin = userCoordinates ? { lng: userCoordinates[0], lat: userCoordinates[1], label: 'Vị trí của bạn' } : exploreOrigin;

  return {
    places: draft.places,
    removePlace: draft.removePlace,
    clearPlaces: draft.clearPlaces,
    routes,
    isSuggesting: routes.isSuggesting,
    suggest: () => routes.suggest(buildTripCriteria(filters, origin), draft.places.map((place) => place.id)),
    showOnMap: (option) => {
      routes.modal.close();
      startTrip(optionToTrip(option, routes.criteria));
    },
    // "Chọn lộ trình này" => đưa vào giỏ (giữ thứ tự + thời gian đã chỉnh) và mở Khám phá để thêm / bớt / lưu
    selectSuggestion: (option) => {
      draft.setPlaces(stopsToPlaces(option.stops), option.suggested_name || option.label, { stayOverrides: stayOverridesOf(option.stops), keepOrder: true });
      routes.modal.close();
      navigate('/explore?tab=places');
    },
    openExplore: () => navigate('/explore?tab=places'),
  };
};
