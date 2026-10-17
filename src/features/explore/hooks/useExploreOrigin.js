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
        if (!quiet) {
          showToast('Trình duyệt không hỗ trợ định vị — Vị trí mặc định là ở trung tâm Quận 1', 'warning');
        }
        resolve(null);
        return;
      }
      setIsLocating(true);

      const handleSuccess = ({ coords }) => {
        const located = { lat: coords.latitude, lng: coords.longitude, label: 'Vị trí hiện tại của bạn', isDefault: false };
        setStoredUserLocation([coords.longitude, coords.latitude]);
        setOrigin(located);
        setIsLocating(false);
        if (!quiet) showToast('Đã lấy vị trí của bạn làm điểm xuất phát');
        resolve(located);
      };

      const handleError = () => {
        setIsLocating(false);
        if (!quiet) {
          showToast('Không thể lấy vị trí hiện tại — Vị trí mặc định là ở trung tâm Quận 1', 'warning');
        }
        resolve(null);
      };

      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (err) => {
          if (err?.code === 1) {
            handleError();
            return;
          }
          // Thử lại lần 2 với độ chính xác mạng/WiFi nếu máy không có GPS phần cứng
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 5000 },
          );
        },
        { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS },
      );
    });

  return { origin, isLocating, locateMe, resetOrigin: () => setOrigin(DEFAULT_ORIGIN) };
};
