import { fetchLegDirections, getStopCoordinates } from './goongDirections';

const GOONG_CALL_GAP_MS = 150; // giãn cách các lượt gọi Goong thật (Goong chặn khi gọi dồn)
const cache = new Map(); // khoá (id + phương tiện + toạ độ các điểm) -> Promise<hình dạng lộ trình>
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Các điểm dừng có toạ độ của 1 lộ trình đã lưu: [{ index, name, coordinates: [lng, lat] }] */
export const savedRouteStops = (itinerary) =>
  (itinerary.stops ?? [])
    .map((stop, index) => ({ index, name: stop.place?.name ?? stop.place_name ?? `Điểm ${index + 1}`, coordinates: getStopCoordinates(stop) }))
    .filter((stop) => stop.coordinates);

/**
 * Đường đi theo đường phố (Goong) nối các điểm của 1 lộ trình đã lưu, từ điểm 1 tới điểm cuối.
 * Chặng nào Goong không tìm được => nối thẳng 2 điểm (exact = false để giao diện ghi chú "đường ước lượng").
 * Kết quả được nhớ lại => bật / tắt lại lộ trình không gọi Goong lần nữa.
 */
export const getSavedRouteGeometry = (itinerary) => {
  const stops = savedRouteStops(itinerary);
  const key = `${itinerary.id}|${itinerary.vehicle}|${stops.map((stop) => stop.coordinates.join(',')).join(';')}`;
  if (cache.has(key)) return cache.get(key);

  const promise = (async () => {
    if (stops.length < 2) return { coordinates: stops.map((stop) => stop.coordinates), stops, exact: true };
    const coordinates = [];
    let exact = true;
    for (let i = 0; i < stops.length - 1; i += 1) {
      const [from, to] = [stops[i].coordinates, stops[i + 1].coordinates];
      try {
        const leg = await fetchLegDirections(from, to, itinerary.vehicle);
        coordinates.push(...leg.coordinates);
        if (!leg.fromCache && i < stops.length - 2) await sleep(GOONG_CALL_GAP_MS);
      } catch {
        exact = false;
        coordinates.push(from, to);
      }
    }
    return { coordinates, stops, exact };
  })();
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
};
