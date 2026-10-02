import { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { DEFAULT_ORIGIN } from '../utils/filterConfig';

const GEOLOCATION_TIMEOUT_MS = 10000;

// Điểm xuất phát của chuyến đi: mặc định trung tâm Q.1, bấm nút để dùng vị trí GPS hiện tại.
export const useExploreOrigin = () => {
  const origin = useExploreFilterStore((state) => state.origin);
  const setOrigin = useExploreFilterStore((state) => state.setOrigin);
  const { showToast } = useToast();
  const [isLocating, setIsLocating] = useState(false);

  const locateMe = () => {
    if (!navigator.geolocation) return showToast('Trình duyệt không hỗ trợ định vị', 'warning');
    setIsLocating(true);
    return navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude, label: 'Vị trí hiện tại của bạn', isDefault: false });
        setIsLocating(false);
        showToast('Đã lấy vị trí của bạn làm điểm xuất phát');
      },
      () => {
        setIsLocating(false);
        showToast('Không lấy được vị trí — đang dùng trung tâm Quận 1', 'warning');
      },
      { timeout: GEOLOCATION_TIMEOUT_MS },
    );
  };

  return { origin, isLocating, locateMe, resetOrigin: () => setOrigin(DEFAULT_ORIGIN) };
};
