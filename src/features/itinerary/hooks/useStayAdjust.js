import { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { previewItineraryApi } from '../api/itineraryApi';
import { STAY_LIMITS } from '../utils/itineraryFormat';

const clampStay = (minutes) => Math.min(STAY_LIMITS.max, Math.max(STAY_LIMITS.min, minutes));

/**
 * Chỉnh thời gian ở lại từng điểm (±15′) của các phương án lộ trình gợi ý — VD ăn Dookki trong mall 2 tiếng.
 * Mỗi lần chỉnh gọi /preview (giữ đúng thứ tự, khoá thời gian mọi điểm) => server tính lại giờ đến, chi phí, cảnh báo giờ ăn.
 */
export const useStayAdjust = (criteria) => {
  const { showToast } = useToast();
  const [adjusted, setAdjusted] = useState({}); // option.key -> { stops, summary, place_ids }
  const [adjustingKey, setAdjustingKey] = useState(null);

  const view = (option) => (option && adjusted[option.key] ? { ...option, ...adjusted[option.key], adjusted: true } : option);

  const adjust = async (option, index, delta) => {
    const current = view(option);
    const stayOverrides = Object.fromEntries(current.stops.map((stop, stopIndex) => [stop.place.id, stopIndex === index ? clampStay(stop.stay_minutes + delta) : stop.stay_minutes]));
    setAdjustingKey(option.key);
    try {
      const plan = await previewItineraryApi(criteria, current.place_ids, { keepOrder: true, stayOverrides });
      setAdjusted((prev) => ({ ...prev, [option.key]: { stops: plan.stops, summary: plan.summary, place_ids: plan.place_ids } }));
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setAdjustingKey(null);
    }
  };

  const reset = (key) => setAdjusted((prev) => (key ? Object.fromEntries(Object.entries(prev).filter(([optionKey]) => optionKey !== key)) : {}));

  return { view, adjust, reset, adjustingKey };
};
