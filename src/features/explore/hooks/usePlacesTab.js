import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { createItineraryApi, updateItineraryApi, useItineraryStore, useRouteSuggestions, useTripPreview } from '../../itinerary';
import { useSocialStore } from '../../social';
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
  const [isSaving, setIsSaving] = useState(false);

  const draftIds = useMemo(() => new Set(draft.places.map((place) => place.id)), [draft.places]);
  // Tiêu chí chuyến đi = bộ lọc hiện tại; dùng cho cả xem trước và gợi ý lộ trình.
  const criteria = useMemo(() => buildTripCriteria(filters, origin.origin), [filters, origin.origin]);
  const placeIds = useMemo(() => draft.places.map((place) => place.id), [draft.places]);
  const preview = useTripPreview(criteria, placeIds);
  const tagLabels = useMemo(() => Object.fromEntries(options.tags.map((tag) => [tag.value, tag.label])), [options.tags]);

  const toggleDraft = (place) => {
    if (draftIds.has(place.id)) return draft.removePlace(place.id);
    if (!draft.addPlace(place)) showToast(`Mỗi chuyến đi tối đa ${TRIP_DRAFT_MAX_PLACES} điểm`, 'warning');
    return undefined;
  };

  // Nạp 1 phương án từ popup gợi ý vào danh sách Chuyến đi bên ngoài để chỉnh sửa trước khi lưu
  const selectSuggestion = (option) => {
    if (!option || !option.stops?.length) return;
    const placesList = option.stops.map((stop) => {
      if (stop.place) {
        return {
          ...stop.place,
          id: stop.place.id || stop.place_id,
          name: stop.place.name || stop.place_name,
          category: stop.place.category || stop.category,
        };
      }
      return {
        id: stop.place_id,
        name: stop.place_name,
        category: stop.category,
        address: stop.address,
        coordinates: stop.coordinates,
      };
    });
    draft.setPlaces(placesList, option.suggested_name || option.label);
    routes.modal.close();
    showToast('Đã chọn lộ trình! Bạn có thể thêm, bớt điểm rồi bấm Lưu lộ trình.');
  };

  // Lưu mới hoặc Cập nhật lộ trình đang sửa và chuyển tới tab "Của tôi"
  const saveDraft = requireAuth(async () => {
    if (draft.places.length === 0) {
      return showToast('Hãy thêm ít nhất 1 địa điểm vào chuyến đi', 'warning');
    }
    const name = (draft.tripName || '').trim() || `Chuyến đi ${draft.places.length} điểm`;
    setIsSaving(true);
    try {
      const payload = {
        name,
        place_ids: draft.places.map((place) => place.id),
        vehicle: criteria.vehicle,
        transport_modes: criteria.transport_modes,
        people: criteria.people,
        start_time: criteria.start_time,
        origin: criteria.origin,
        criteria,
      };

      if (draft.editingItineraryId) {
        await updateItineraryApi(draft.editingItineraryId, payload);
        showToast('Đã cập nhật lộ trình!');
      } else {
        await createItineraryApi(payload);
        showToast('Đã lưu lộ trình — xem lại ở tab "Của tôi"');
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
    origin, places, draft, draftIds, tagLabels, toggleDraft, preview,
    filterSheet, filterSheetRef,
    routes,
    // Bộ lọc hiện tại + các điểm đã chọn => tối đa 3 lộ trình
    suggestRoutes: () => routes.suggest(criteria, placeIds),
    selectSuggestion,
    saveDraft,
    isSaving,
    isEditing: Boolean(draft.editingItineraryId),
    cancelEditing: draft.cancelEditing,
    sharePlace: requireAuth((place) => openComposer({ type: 'place', place })),
  };
};
