import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { createItineraryApi, optionToTrip, STAY_LIMITS, stayOverridesOf, stopsToPlaces, updateItineraryApi, useActiveRouteStore, useItineraryStore, useRouteSuggestions, useTripPreview } from '../../itinerary';
import { usePlaceReviewActions, useSocialStore } from '../../social';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { TRIP_DRAFT_MAX_PLACES, useTripDraftStore } from '../stores/tripDraftStore';
import { buildTripCriteria, countActiveFilters, relaxFilters } from '../utils/filterConfig';
import { useExploreOrigin } from './useExploreOrigin';
import { useExplorePlaces } from './useExplorePlaces';
import { useFilterOptions } from './useFilterOptions';

// Gom logic tab "Địa điểm": bộ lọc → kết quả → giỏ chuyến đi → gợi ý lộ trình → lưu & chỉnh sửa.
export const usePlacesTab = () => {
  const [, setSearchParams] = useSearchParams();
  const { filters, setFilter, resetFilters, replaceFilters } = useExploreFilterStore();
  const options = useFilterOptions();
  const places = useExplorePlaces();
  const origin = useExploreOrigin();
  const draft = useTripDraftStore();
  const routes = useRouteSuggestions();
  const bumpVersion = useItineraryStore((state) => state.bumpVersion);
  const { containerRef: filterSheetRef, ...filterSheet } = useDisclosure();
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();
  const openComposer = useSocialStore((state) => state.openComposer);
  const placeReviews = usePlaceReviewActions();
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const startTrip = useActiveRouteStore((state) => state.startTrip);

  const draftIds = useMemo(() => new Set(draft.places.map((place) => place.id)), [draft.places]);
  // Tiêu chí chuyến đi = bộ lọc hiện tại; dùng cho cả xem trước và gợi ý lộ trình.
  const criteria = useMemo(() => buildTripCriteria(filters, origin.origin), [filters, origin.origin]);
  const placeIds = useMemo(() => draft.places.map((place) => place.id), [draft.places]);
  // Giỏ nạp từ 1 phương án gợi ý / người dùng tự chỉnh => "Dự kiến" giữ đúng thứ tự (nếu đã khoá) + thời gian ở lại đã chỉnh ±15′
  const plan = useMemo(
    () => (draft.keepOrder || Object.keys(draft.stayOverrides).length ? { keepOrder: draft.keepOrder, stayOverrides: draft.stayOverrides } : null),
    [draft.keepOrder, draft.stayOverrides],
  );
  const preview = useTripPreview(criteria, placeIds, plan);
  const tagLabels = useMemo(() => Object.fromEntries(options.tags.map((tag) => [tag.value, tag.label])), [options.tags]);

  // Thứ tự đang thấy ở "Dự kiến" (server tự sắp cho thuận đường, hoặc đúng thứ tự người dùng đã chỉnh tay).
  // Lúc đang tính lại: điểm vừa thêm nối vào cuối, điểm vừa bỏ thì không hiện.
  const orderedPlaces = useMemo(() => {
    const byId = new Map(draft.places.map((place) => [String(place.id), place]));
    const ordered = preview.placeIds.map((id) => byId.get(id)).filter(Boolean);
    const seen = new Set(ordered.map((place) => String(place.id)));
    return [...ordered, ...draft.places.filter((place) => !seen.has(String(place.id)))];
  }, [draft.places, preview.placeIds]);
  const stopInfo = useMemo(() => new Map(preview.stops.map((stop) => [String(stop.place?.id), stop])), [preview.stops]);
  const tripStops = orderedPlaces.map((place) => {
    const stop = stopInfo.get(String(place.id));
    return {
      place,
      arrival_time: stop?.arrival_time ?? null,
      stay_minutes: stop?.stay_minutes ?? null,
      stay_range: stop?.stay_range ?? null,
      closed_on_arrival: stop?.open_on_arrival === false,
    };
  });

  // Chỉnh tay (đổi thứ tự / thời gian ở lại) => khoá đúng thứ tự đang thấy để server không sắp lại
  const arrangeWith = (places, stayOverrides) => draft.setPlaces(places, undefined, { stayOverrides, keepOrder: true });
  const arrange = {
    stops: tripStops,
    isManualOrder: draft.keepOrder,
    startTime: filters.startTime,
    setStartTime: (time) => setFilter('startTime', time),
    move: (from, to) => {
      if (to < 0 || to >= orderedPlaces.length || from === to) return;
      const next = [...orderedPlaces];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      arrangeWith(next, draft.stayOverrides);
    },
    adjustStay: (placeId, delta) => {
      const current = stopInfo.get(String(placeId))?.stay_minutes;
      if (current == null) return;
      const minutes = Math.min(STAY_LIMITS.max, Math.max(STAY_LIMITS.min, current + delta));
      arrangeWith(orderedPlaces, { ...draft.stayOverrides, [String(placeId)]: minutes });
    },
    // Bỏ thứ tự tự chỉnh => MapMate sắp lại cho thuận đường + hợp giờ ăn (giữ thời gian ở lại đã chỉnh)
    autoArrange: () => draft.setPlaces(draft.places, undefined, { stayOverrides: draft.stayOverrides, keepOrder: false }),
  };

  const toggleDraft = (place) => {
    if (draftIds.has(place.id)) return draft.removePlace(place.id);
    if (!draft.addPlace(place)) showToast(`Mỗi chuyến đi tối đa ${TRIP_DRAFT_MAX_PLACES} điểm`, 'warning');
    return undefined;
  };

  // Nạp 1 phương án từ popup gợi ý vào danh sách Chuyến đi bên ngoài để chỉnh sửa trước khi lưu
  const selectSuggestion = (option) => {
    if (!option || !option.stops?.length) return;
    const placesList = stopsToPlaces(option.stops);
    // option = phương án ĐANG XEM (đã áp thời gian chỉnh ±15′) => giữ nguyên thời gian + thứ tự khi đưa ra giỏ
    draft.setPlaces(placesList, option.suggested_name || option.label, { stayOverrides: stayOverridesOf(option.stops), keepOrder: true });
    routes.modal.close();
    showToast('Đã chọn lộ trình! Bạn có thể thêm, bớt điểm rồi bấm Lưu lộ trình.');
  };

  // Hiện phương án gợi ý thẳng trên bản đồ trang chủ (vẽ đường + chỉ đường), giữ thời gian đã chỉnh
  const showOnMap = (option) => {
    routes.modal.close();
    startTrip(optionToTrip(option, routes.criteria));
    navigate('/');
  };

  // Lưu mới hoặc Cập nhật lộ trình đang sửa và chuyển tới tab "Lộ trình của tôi"
  const saveDraft = requireAuth(async () => {
    if (draft.places.length === 0) {
      return showToast('Hãy thêm ít nhất 1 địa điểm vào chuyến đi', 'warning');
    }
    const name = (draft.tripName || '').trim() || `Chuyến đi ${draft.places.length} điểm`;
    setIsSaving(true);
    try {
      const payload = {
        name,
        place_ids: orderedPlaces.map((place) => place.id), // đúng thứ tự đang thấy ở "Dự kiến"
        vehicle: criteria.vehicle,
        transport_modes: criteria.transport_modes,
        people: criteria.people,
        start_time: criteria.start_time,
        origin: criteria.origin,
        criteria,
        stay_overrides: draft.stayOverrides, // thời gian ở lại đã chọn từ gợi ý (điểm thêm sau dùng thời gian mặc định)
      };

      if (draft.editingItineraryId) {
        await updateItineraryApi(draft.editingItineraryId, payload);
        showToast('Đã cập nhật lộ trình!');
      } else {
        await createItineraryApi(payload);
        showToast('Đã lưu lộ trình — xem lại ở tab "Lộ trình của tôi"');
      }

      bumpVersion();
      draft.clearPlaces();
      setSearchParams({ tab: 'mine' });
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setIsSaving(false);
    }
    return undefined;
  });

  return {
    filters, options, setFilter, resetFilters,
    // Bỏ hẳn các bộ lọc server đã tạm nới (bảng bộ lọc khớp với kết quả đang thấy)
    applyRelaxed: () => places.relaxed && replaceFilters(relaxFilters(filters, places.relaxed)),
    activeFilterCount: countActiveFilters(filters),
    origin, places, draft, draftIds, tagLabels, toggleDraft, preview, arrange,
    filterSheet, filterSheetRef,
    routes,
    // Bộ lọc hiện tại + các điểm đã chọn => tối đa 3 lộ trình
    suggestRoutes: () => routes.suggest(criteria, placeIds),
    selectSuggestion,
    showOnMap,
    saveDraft,
    isSaving,
    isEditing: Boolean(draft.editingItineraryId),
    cancelEditing: draft.cancelEditing,
    sharePlace: requireAuth((place) => openComposer({ type: 'place', place })),
    reviews: placeReviews, // "Viết đánh giá" / "Xem đánh giá" của cộng đồng
  };
};
