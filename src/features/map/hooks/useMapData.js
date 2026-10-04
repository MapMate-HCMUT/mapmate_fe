import { useEffect, useState } from 'react';
import { getFloodAlerts } from '../api/getFloodAlerts';
import { getMapPlaces } from '../api/getMapPlaces';

const RELOAD_DEBOUNCE_MS = 350;
const CENTER_DECIMALS = 2; // ~1 km: di chuyển GPS lặt vặt không tải lại

// Dữ liệu bản đồ trang chủ: địa điểm thật quanh `center` (vị trí người dùng / mặc định) theo từ khoá trên Navbar + điểm ngập.
export const useMapData = (center, query) => {
  const [places, setPlaces] = useState([]);
  const [floodAlerts, setFloodAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const centerKey = center.map((value) => Number(value).toFixed(CENTER_DECIMALS)).join(',');

  useEffect(() => {
    let isActive = true;
    getFloodAlerts().then((alerts) => isActive && setFloodAlerts(alerts));
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      getMapPlaces(centerKey.split(',').map(Number), query)
        .then((items) => isActive && setPlaces(items))
        .catch(() => isActive && setPlaces([]))
        .finally(() => isActive && setIsLoading(false));
    }, RELOAD_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [centerKey, query]);

  return { places, floodAlerts, isLoading };
};
