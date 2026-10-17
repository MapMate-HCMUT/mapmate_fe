import { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { setStoredUserLocation } from '../../map/hooks/useUserLocation';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { DEFAULT_ORIGIN } from '../utils/filterConfig';

const GEOLOCATION_TIMEOUT_MS = 10000;

// Điểm xuất phát của chuyến đi: mặc định trung tâm Q.1, bấm nút để dùng vị trí GPS hiện tại.
export const useExploreOrigin = () => {
  const origin = useExploreFilterStore((state) => state.origin);
  const setOrigin = useExploreFilterStore((state) => state.setOrigin);
  const { showToast } = useToast();
  const [isLocating, setIsLocating] = useState(false);

  // Trả về vị trí vừa lấy (hoặc null). quiet = không báo toast (AI tự xin vị trí khi hỏi "gần tôi" — câu trả lời đã nói rõ đi từ đâu)
  const locateMe = ({ quiet = false } = {}) =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        if (!quiet) showToast('Trình duyệt không hỗ trợ định vị', 'warning');
        resolve(null);
        return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const located = { lat: coords.latitude, lng: coords.longitude, label: 'Vị trí hiện tại của bạn', isDefault: false };
          setStoredUserLocation([coords.longitude, coords.latitude]);
          setOrigin(located);
          setIsLocating(false);
          resolve(located);
        },
        () => {
          setIsLocating(false);
          if (!quiet) showToast('Không lấy được vị trí — đang dùng trung tâm Quận 1', 'warning');
          resolve(null);
        },
        { timeout: GEOLOCATION_TIMEOUT_MS },
      );
    });

  return { origin, isLocating, locateMe, resetOrigin: () => setOrigin(DEFAULT_ORIGIN) };
};
