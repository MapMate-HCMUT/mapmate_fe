import { useEffect, useState } from 'react';
import { previewItineraryApi } from '../api/itineraryApi';

const PREVIEW_DEBOUNCE_MS = 400;

/**
 * Tổng hợp nhanh (thời gian, quãng đường, chi phí...) cho các điểm người dùng đang chọn, tính lại mỗi khi
 * đổi bộ lọc hoặc thêm/bớt điểm. `requestKey` là chuỗi đại diện cho (tiêu chí + danh sách điểm).
 */
export const useTripPreview = (criteria, placeIds) => {
  const requestKey = placeIds.length ? JSON.stringify([criteria, placeIds]) : '';
  const [result, setResult] = useState({ forKey: '', summary: null });

  useEffect(() => {
    if (!requestKey) return undefined;
    let isActive = true;
    const timer = setTimeout(() => {
      const [nextCriteria, nextPlaceIds] = JSON.parse(requestKey);
      previewItineraryApi(nextCriteria, nextPlaceIds)
        .then((plan) => isActive && setResult({ forKey: requestKey, summary: plan.summary }))
        .catch(() => isActive && setResult({ forKey: requestKey, summary: null }));
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [requestKey]);

  // Giữ số liệu cũ (hiện mờ) trong lúc tính lại để giao diện không nhấp nháy.
  return { summary: requestKey ? result.summary : null, isUpdating: Boolean(requestKey) && result.forKey !== requestKey };
};
