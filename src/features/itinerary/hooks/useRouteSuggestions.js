import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useToast } from '../../../hooks/useToast';
import { createItineraryApi, suggestItinerariesApi } from '../api/itineraryApi';
import { useItineraryStore } from '../stores/itineraryStore';

const INITIAL = { options: [], criteria: null, candidateCount: 0, selectedKey: null, names: {}, saved: {} };

/**
 * Lên lộ trình từ bộ lọc: gọi API gợi ý, cho người dùng xem từng phương án, đặt tên và lưu.
 * `suggest(criteria, placeIds)` do trang Khám phá gọi với bộ lọc hiện tại + các điểm đã chọn.
 */
export const useRouteSuggestions = () => {
  const modal = useDisclosure();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const bumpVersion = useItineraryStore((state) => state.bumpVersion);
  const [state, setState] = useState(INITIAL);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const suggest = async (criteria, placeIds) => {
    setIsSuggesting(true);
    try {
      const data = await suggestItinerariesApi(criteria, placeIds);
      setState({
        options: data.options,
        criteria: data.criteria,
        candidateCount: data.candidate_count,
        selectedKey: data.options[0].key,
        names: Object.fromEntries(data.options.map((option) => [option.key, option.suggested_name])),
        saved: {},
      });
      modal.open();
    } catch (error) {
      showToast(error.message, 'warning');
    } finally {
      setIsSuggesting(false);
    }
  };

  const selected = state.options.find((option) => option.key === state.selectedKey) ?? null;
  const selectOption = (key) => setState((prev) => ({ ...prev, selectedKey: key }));
  const renameSelected = (name) => setState((prev) => ({ ...prev, names: { ...prev.names, [prev.selectedKey]: name } }));

  const saveSelected = async () => {
    const name = state.names[selected.key]?.trim();
    if (!name) return showToast('Hãy đặt tên cho lộ trình', 'warning');
    setIsSaving(true);
    try {
      const { criteria } = state;
      const itinerary = await createItineraryApi({
        name,
        place_ids: selected.place_ids,
        vehicle: criteria.vehicle,
        transport_modes: criteria.transport_modes,
        people: criteria.people,
        start_time: criteria.start_time,
        origin: criteria.origin,
        criteria,
      });
      setState((prev) => ({ ...prev, saved: { ...prev.saved, [selected.key]: itinerary } }));
      bumpVersion();
      showToast('Đã lưu lộ trình — xem lại ở tab "Của tôi"');
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setIsSaving(false);
    }
    return undefined;
  };

  return {
    modal,
    suggest,
    isSuggesting,
    isSaving,
    isAuthenticated,
    options: state.options,
    criteria: state.criteria,
    selected,
    selectedName: selected ? state.names[selected.key] ?? '' : '',
    savedItinerary: selected ? state.saved[selected.key] ?? null : null,
    selectOption,
    renameSelected,
    saveSelected,
  };
};
