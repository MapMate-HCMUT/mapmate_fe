import { useCallback, useState } from 'react';
import { MAP_DEFAULT_CENTER } from '../../../config/map';
import { useToast } from '../../../hooks/useToast';

const GEOLOCATION_TIMEOUT_MS = 8000;

// Mặc định đặt người dùng ở trung tâm Q.1; bấm nút 📍 để lấy vị trí GPS thật.
export const useUserLocation = (onLocated) => {
  const [coordinates, setCoordinates] = useState(MAP_DEFAULT_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const { showToast } = useToast();

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Trình duyệt không hỗ trợ định vị', 'warning');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = [coords.longitude, coords.latitude];
        setCoordinates(next);
        setIsLocating(false);
        onLocated?.(next);
        showToast('Đã cập nhật vị trí của bạn');
      },
      () => {
        setIsLocating(false);
        showToast('Không lấy được vị trí — đang dùng vị trí mặc định Quận 1', 'warning');
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS },
    );
  }, [onLocated, showToast]);

  return { coordinates, isLocating, locate };
};
