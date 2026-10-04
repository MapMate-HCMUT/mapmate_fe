import { useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { useToast } from '../../../hooks/useToast';
import { createItineraryApi, stayOverridesOf, useItineraryStore } from '../../itinerary';

// Lưu 1 phương án lộ trình AI gợi ý vào "Của tôi" (server tự tính lại giờ đến & chi phí).
export const useSaveAiItinerary = (criteria) => {
  const requireAuth = useRequireAuth();
  const { showToast } = useToast();
  const bumpVersion = useItineraryStore((state) => state.bumpVersion);
  const [saved, setSaved] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const save = requireAuth(async (option) => {
    setSavingKey(option.key);
    try {
      const itinerary = await createItineraryApi({
        name: option.suggested_name,
        place_ids: option.place_ids,
        vehicle: criteria.vehicle,
        transport_modes: criteria.transport_modes,
        people: criteria.people,
        start_time: criteria.start_time,
        origin: criteria.origin,
        criteria,
        stay_overrides: stayOverridesOf(option.stops), // lưu đúng thời gian ở lại đang thấy (kể cả đã tự chỉnh)
      });
      setSaved((prev) => ({ ...prev, [option.key]: itinerary }));
      bumpVersion();
      showToast('Đã lưu — xem lại ở Khám phá › Của tôi');
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setSavingKey(null);
    }
  });

  return { save, saved, savingKey };
};
