import { Popup } from 'maplibre-gl';
import { useEffect } from 'react';
import { basemapPoiAt } from '../utils/mapPoint';

const POPUP_OFFSET_PX = 12; // hiện ngay dưới chấm (phía trên hay bị các thẻ nổi đầu bản đồ che)

// Rê chuột lên 1 chấm / nhãn địa điểm của bản đồ nền => con trỏ bàn tay + tên địa điểm (chấm chưa có chữ cũng biết là gì),
// không cần phóng to mới đọc được. Điện thoại không có "rê chuột" => bấm thẳng vào chấm để xem thẻ.
export const usePoiHover = (map, enabled) => {
  useEffect(() => {
    if (!map || !enabled) return undefined;
    const popup = new Popup({ closeButton: false, closeOnClick: false, anchor: 'top', offset: POPUP_OFFSET_PX, className: 'poi-hover-popup', maxWidth: '240px' });
    let frame = null;
    let currentName = null;

    const hide = () => {
      currentName = null;
      popup.remove();
      map.getCanvas().style.cursor = '';
    };
    const onMove = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const poi = basemapPoiAt(map, event.point);
        if (!poi) return hide();
        map.getCanvas().style.cursor = 'pointer';
        if (poi.name === currentName) return undefined;
        currentName = poi.name;
        const content = document.createElement('div');
        const title = document.createElement('p');
        title.className = 'font-semibold text-neutral-900';
        title.textContent = poi.name;
        const hint = document.createElement('p');
        hint.className = 'text-[11px] text-neutral-500';
        hint.textContent = [poi.kindLabel, 'bấm để xem thông tin'].filter(Boolean).join(' · ');
        content.append(title, hint);
        popup.setLngLat(poi.coordinates).setDOMContent(content).addTo(map);
        return undefined;
      });
    };

    map.on('mousemove', onMove);
    map.on('mouseout', hide);
    map.on('movestart', hide);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      map.off('mousemove', onMove);
      map.off('mouseout', hide);
      map.off('movestart', hide);
      hide();
    };
  }, [map, enabled]);
};
