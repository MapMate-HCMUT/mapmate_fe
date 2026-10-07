import { useEffect, useState } from 'react';
import { getMapPlaces } from '../api/getMapPlaces';

const RELOAD_DEBOUNCE_MS = 350;
const CENTER_DECIMALS = 2; // ~1 km: di chuyển GPS lặt vặt không tải lại

// Dữ liệu bản đồ trang chủ: địa điểm thật quanh `center` (vị trí người dùng / mặc định) theo từ khoá trên Navbar.
// Mất mạng / máy chủ lỗi => onPageError (chuyển sang trang lỗi); lỗi khác => danh sách trống.
export const useMapData = (center, query, onPageError) => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const centerKey = center.map((value) => Number(value).toFixed(CENTER_DECIMALS)).join(',');

  useEffect(() => {
    let isActive = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      getMapPlaces(centerKey.split(',').map(Number), query)
        .then((items) => isActive && setPlaces(items))
        .catch((error) => isActive && !onPageError?.(error) && setPlaces([]))
        .finally(() => isActive && setIsLoading(false));
    }, RELOAD_DEBOUNCE_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onPageError chỉ dùng khi lỗi, không cần tải lại khi nó đổi
  }, [centerKey, query]);

  return { places, isLoading };
};
