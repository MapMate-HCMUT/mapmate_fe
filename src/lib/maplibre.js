import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre v6 tự đoán URL worker dựa trên vị trí file của nó — sai khi Vite đã bundle lại.
// Để Vite đóng gói worker thành file riêng rồi chỉ định URL tường minh.
setWorkerUrl(maplibreWorkerUrl);

// Style OpenFreeMap mặc định ưu tiên tên Latin/tiếng Anh ("Vo Van Tan Street").
// Đổi sang tên gốc trong OpenStreetMap => tiếng Việt có dấu ("Đường Võ Văn Tần").
export const applyLocalNameLabels = (map) => {
  map.getStyle().layers.forEach((layer) => {
    if (layer.type !== 'symbol' || !map.getLayoutProperty(layer.id, 'text-field')) return;
    map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name'], ['get', 'name:latin']]);
  });
};

// Thu gọn dòng ghi nguồn thành nút ⓘ (mặc định MapLibre mở rộng sẵn trên màn hình rộng).
export const collapseAttribution = (map) => {
  map.getContainer().querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show');
};
