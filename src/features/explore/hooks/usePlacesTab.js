import { useMemo } from 'react';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { useRouteSuggestions, useTripPreview } from '../../itinerary';
import { useSocialStore } from '../../social';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { TRIP_DRAFT_MAX_PLACES, useTripDraftStore } from '../stores/tripDraftStore';
import { buildTripCriteria, countActiveFilters } from '../utils/filterConfig';
import { useExploreOrigin } from './useExploreOrigin';
import { useExplorePlaces } from './useExplorePlaces';
import { useFilterOptions } from './useFilterOptions';

// Gom logic tab "Địa điểm": bộ lọc → kết quả → giỏ chuyến đi → gợi ý lộ trình → chia sẻ.
export const usePlacesTab = () => {
  const { filters, setFilter, resetFilters } = useExploreFilterStore();
  const options = useFilterOptions();
  const places = useExplorePlaces();
  const origin = useExploreOrigin();
  const draft = useTripDraftStore();
  const routes = useRouteSuggestions();
  const { containerRef: filterSheetRef, ...filterSheet } = useDisclosure();
  const { showToast } = useToast();
  const requireAuth = useRequireAuth();
  const openComposer = useSocialStore((state) => state.openComposer);

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

  return {
    filters, options, setFilter, resetFilters,
    activeFilterCount: countActiveFilters(filters),
    origin, places, draft, draftIds, tagLabels, toggleDraft, preview,
    filterSheet, filterSheetRef,
    routes,
    // Bộ lọc hiện tại + các điểm đã chọn => tối đa 3 lộ trình
    suggestRoutes: () => routes.suggest(criteria, placeIds),
    sharePlace: requireAuth((place) => openComposer({ type: 'place', place })),
    shareItinerary: (itinerary) => {
      routes.modal.close();
      openComposer({ type: 'itinerary', itinerary });
    },
  };
};
