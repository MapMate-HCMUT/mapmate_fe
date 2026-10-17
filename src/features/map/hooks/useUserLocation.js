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

let hasAutoLocatedInSession = false;

const getFallbackMessage = () => {
  const stored = getStoredUserLocation();
  if (
    stored &&
    (Math.abs(stored[0] - MAP_DEFAULT_CENTER[0]) > 0.001 ||
      Math.abs(stored[1] - MAP_DEFAULT_CENTER[1]) > 0.001)
  ) {
    return 'Không thể lấy vị trí hiện tại — Đang dùng vị trí mặc định là ở trung tâm Quận 1';
  }
  return 'Không thể lấy vị trí hiện tại — Vị trí mặc định là ở trung tâm Quận 1';
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
      const silentError = options.silentError ?? false;
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
        if (!silentError) {
          showToast('Trình duyệt không hỗ trợ định vị — Vị trí mặc định là ở trung tâm Quận 1', 'warning');
        }
        return;
      }

      isLocatingRef.current = true;
      setIsLocating(true);

      const handleError = () => {
        isLocatingRef.current = false;
        setIsLocating(false);
        if (!silentError) {
          showToast(getFallbackMessage(), 'warning');
        }
      };

      const handleSuccess = ({ coords }) => {
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
      };

      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (err) => {
          // Nếu người dùng từ chối cấp quyền (code === 1: PERMISSION_DENIED) => dừng ngay
          if (err?.code === 1) {
            handleError();
            return;
          }
          // Lỗi POSITION_UNAVAILABLE (2) hoặc TIMEOUT (3): nhiều máy bàn / laptop bị lỗi khi bật High Accuracy
          // Thử lại lần 2 với độ chính xác mạng/WiFi (enableHighAccuracy: false)
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
          );
        },
        { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 60000 },
      );
    },
    [showToast],
  );

  // Tự động kiểm tra vị trí một lần khi người dùng vào trang nếu chưa có vị trí đã lưu
  useEffect(() => {
    if (hasAutoLocatedInSession) return;
    hasAutoLocatedInSession = true;

    if (getStoredUserLocation()) return;

    if (!navigator.geolocation) {
      showToast('Trình duyệt không hỗ trợ định vị — Vị trí mặc định là ở trung tâm Quận 1', 'warning');
      return;
    }

    const timer = setTimeout(() => {
      locate({ silent: false, fly: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [locate, showToast]);

  return { coordinates, isLocating, locate };
};
