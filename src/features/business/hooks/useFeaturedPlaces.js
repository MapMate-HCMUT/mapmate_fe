import { useEffect, useState } from 'react';
import { getFeaturedPlacesApi } from '../api/businessApi';

const CENTER_DECIMALS = 2; // ~1 km: di chuyển GPS lặt vặt không tải lại
const FEATURED_LIMIT = 4;

// Cửa hàng gói "Nổi bật" quanh vị trí người dùng (trang chủ). Lỗi => không hiện mục này, không làm phiền người dùng.
export const useFeaturedPlaces = (center) => {
  const [places, setPlaces] = useState([]);
  const centerKey = center.map((value) => Number(value).toFixed(CENTER_DECIMALS)).join(',');

  useEffect(() => {
    let isActive = true;
    const [lng, lat] = centerKey.split(',').map(Number);
    getFeaturedPlacesApi({ lat, lng, limit: FEATURED_LIMIT })
      .then((data) => isActive && setPlaces(data.items))
      .catch(() => isActive && setPlaces([]));
    return () => {
      isActive = false;
    };
  }, [centerKey]);

  return places;
};
