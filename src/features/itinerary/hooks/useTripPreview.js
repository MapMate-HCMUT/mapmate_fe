import { useEffect, useState } from 'react';
import { previewItineraryApi } from '../api/itineraryApi';

const PREVIEW_DEBOUNCE_MS = 400;

/**
 * Tổng hợp nhanh (thời gian, quãng đường, chi phí...) cho các điểm người dùng đang chọn, tính lại mỗi khi
 * đổi bộ lọc hoặc thêm/bớt điểm. `requestKey` là chuỗi đại diện cho (tiêu chí + danh sách điểm).
 */
// `plan` { keepOrder, stayOverrides }: giỏ nạp từ 1 phương án gợi ý => giữ đúng thứ tự + thời gian ở lại đã chọn.
export const useTripPreview = (criteria, placeIds, plan = null) => {
  const requestKey = placeIds.length ? JSON.stringify([criteria, placeIds, plan]) : '';
  const [result, setResult] = useState({ forKey: '', summary: null, stops: [], placeIds: [] });

  useEffect(() => {
    if (!requestKey) return undefined;
    let isActive = true;
    const timer = setTimeout(() => {
      const [nextCriteria, nextPlaceIds, nextPlan] = JSON.parse(requestKey);
      previewItineraryApi(nextCriteria, nextPlaceIds, nextPlan ?? {})
        .then((plan) => isActive && setResult({ forKey: requestKey, summary: plan.summary, stops: plan.stops ?? [], placeIds: (plan.place_ids ?? []).map(String) }))
        .catch(() => isActive && setResult({ forKey: requestKey, summary: null, stops: [], placeIds: [] }));
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [requestKey]);

  // Giữ số liệu cũ (hiện mờ) trong lúc tính lại để giao diện không nhấp nháy.
  // stops / placeIds: lịch trình dự kiến theo đúng thứ tự server sắp (giờ đến, thời gian ở lại từng điểm)
  return {
    summary: requestKey ? result.summary : null,
    stops: requestKey ? result.stops : [],
    placeIds: requestKey ? result.placeIds : [],
    isUpdating: Boolean(requestKey) && result.forKey !== requestKey,
  };
};
