import { useEffect } from 'react';
import { reverseGeocode } from '../api/goongGeocode';
import { useMapStore } from '../stores/mapStore';

const PICKING_CLASS = 'picking-start'; // con trỏ hình chữ thập khi đang chọn điểm (index.css)

/**
 * Chế độ "Chọn 1 điểm trên bản đồ" làm điểm xuất phát: chạm bản đồ => lưu điểm đó (tên lấy từ Goong), Esc => huỷ.
 * Các xử lý chạm khác (mở thẻ địa điểm, ghim MapMate) tự bỏ qua khi isPickingStart = true.
 */
export const useStartPointPicking = (map) => {
  const isPickingStart = useMapStore((state) => state.isPickingStart);

  useEffect(() => {
    if (!map || !isPickingStart) return undefined;
    const container = map.getContainer();
    container.classList.add(PICKING_CLASS);
    const { setStartPoint, setPickingStart } = useMapStore.getState();

    const onClick = (event) => {
      const coordinates = [event.lngLat.lng, event.lngLat.lat];
      setStartPoint({ coordinates, label: 'Điểm đã chọn trên bản đồ' });
      // Đổi nhãn sang tên / địa chỉ thật khi Goong trả về (nếu người dùng chưa chọn điểm khác)
      reverseGeocode(coordinates)
        .then((info) => {
          const label = info?.name || info?.address;
          if (label && useMapStore.getState().startPoint?.coordinates === coordinates) setStartPoint({ coordinates, label });
        })
        .catch(() => {});
    };
    const onKeyDown = (event) => event.key === 'Escape' && setPickingStart(false);

    map.on('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      container.classList.remove(PICKING_CLASS);
      map.off('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [map, isPickingStart]);
};
