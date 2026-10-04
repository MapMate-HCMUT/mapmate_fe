import { useCallback, useEffect, useRef, useState } from 'react';
import { MAP_DEFAULT_CENTER } from '../../../config/map';
import { useToast } from '../../../hooks/useToast';

const GEOLOCATION_TIMEOUT_MS = 8000;
const USER_LOCATION_STORAGE_KEY = 'mapmate.user_location';

export const getStoredUserLocation = () => {
  try {
    const raw = localStorage.getItem(USER_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 2 && !Number.isNaN(parsed[0]) && !Number.isNaN(parsed[1])) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
};

export const setStoredUserLocation = (coords) => {
  try {
    localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // ignore
  }
};

// Quản lý vị trí người dùng: Tự động ghi nhớ toạ độ vào localStorage để hiển thị tức thì
export const useUserLocation = (onLocated) => {
  const [coordinates, setCoordinates] = useState(() => getStoredUserLocation() || MAP_DEFAULT_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const { showToast } = useToast();

  const coordinatesRef = useRef(coordinates);
  const onLocatedRef = useRef(onLocated);
  const isLocatingRef = useRef(false);

  useEffect(() => {
    coordinatesRef.current = coordinates;
  }, [coordinates]);

  useEffect(() => {
    onLocatedRef.current = onLocated;
  }, [onLocated]);

  const locate = useCallback(
    (opts) => {
      // Khi được truyền trực tiếp vào onClick (VD: nút FAB), opts là SyntheticEvent
      const isEvent = Boolean(
        opts && (opts.nativeEvent || opts.target || typeof opts.preventDefault === 'function'),
      );
      const options = isEvent || !opts ? {} : opts;
      const silent = options.silent ?? false;
      const fly = options.fly ?? true;

      // Nếu đang trong quá trình tìm vị trí ngầm rồi thì không gọi lặp
      if (isLocatingRef.current && silent) {
        return;
      }

      // Nếu người dùng chủ động bấm nút tìm vị trí, bay ngay tới toạ độ đã biết trước để không bị trễ
      if (fly && coordinatesRef.current) {
        onLocatedRef.current?.(coordinatesRef.current);
      }

      if (!navigator.geolocation) {
        if (!silent) showToast('Trình duyệt không hỗ trợ định vị', 'warning');
        return;
      }

      isLocatingRef.current = true;
      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          isLocatingRef.current = false;
          setIsLocating(false);
          const next = [coords.longitude, coords.latitude];
          setStoredUserLocation(next);

          // Chỉ cập nhật state nếu toạ độ thay đổi đáng kể (> 30m) để tránh GPS jitter gây re-render vô tận
          const prev = coordinatesRef.current;
          const isSignificantlyDifferent =
            !prev || Math.hypot(prev[0] - next[0], prev[1] - next[1]) > 0.0003;

          if (isSignificantlyDifferent) {
            setCoordinates(next);
          }

          if (fly) onLocatedRef.current?.(next);
          if (!silent) showToast('Đã xác định vị trí của bạn');
        },
        () => {
          isLocatingRef.current = false;
          setIsLocating(false);
          if (!silent) {
            showToast('Không lấy được GPS — đang dùng vị trí đã lưu', 'warning');
          }
        },
        { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 60000 },
      );
    },
    [showToast],
  );

  return { coordinates, isLocating, locate };
};
