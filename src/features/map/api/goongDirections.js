import axios from 'axios';
import { GOONG_API_KEY, MAP_DEFAULT_CENTER } from '../../../config/map';

// Giải mã chuỗi polyline chuẩn Google / Goong thành mảng [lng, lat] cho MapLibre
export const decodePolyline = (str, precision = 5) => {
  if (!str) return [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
};

// Trích xuất toạ độ [lng, lat] từ stop dưới mọi cấu trúc dữ liệu (Object, Array, Place, Places Fallback)
export const getStopCoordinates = (stop, places = []) => {
  if (!stop) return null;

  // 1. stop.coordinates là object { lng, lat } hoặc { lon, lat } hoặc { longitude, latitude }
  if (stop.coordinates && typeof stop.coordinates === 'object' && !Array.isArray(stop.coordinates)) {
    const lng = stop.coordinates.lng ?? stop.coordinates.lon ?? stop.coordinates.longitude;
    const lat = stop.coordinates.lat ?? stop.coordinates.latitude;
    if (lng != null && lat != null && !Number.isNaN(Number(lng)) && !Number.isNaN(Number(lat))) {
      return [Number(lng), Number(lat)];
    }
  }

  // 2. stop.coordinates là array [lng, lat]
  if (Array.isArray(stop.coordinates) && stop.coordinates.length >= 2) {
    const [lng, lat] = stop.coordinates;
    if (!Number.isNaN(Number(lng)) && !Number.isNaN(Number(lat))) return [Number(lng), Number(lat)];
  }

  // 3. stop.place?.coordinates là object { lng, lat }
  if (stop.place?.coordinates && typeof stop.place.coordinates === 'object' && !Array.isArray(stop.place.coordinates)) {
    const lng = stop.place.coordinates.lng ?? stop.place.coordinates.lon ?? stop.place.coordinates.longitude;
    const lat = stop.place.coordinates.lat ?? stop.place.coordinates.latitude;
    if (lng != null && lat != null && !Number.isNaN(Number(lng)) && !Number.isNaN(Number(lat))) {
      return [Number(lng), Number(lat)];
    }
  }

  // 4. stop.place?.coordinates là array [lng, lat]
  if (Array.isArray(stop.place?.coordinates) && stop.place.coordinates.length >= 2) {
    const [lng, lat] = stop.place.coordinates;
    if (!Number.isNaN(Number(lng)) && !Number.isNaN(Number(lat))) return [Number(lng), Number(lat)];
  }

  // 5. stop.place?.location?.coordinates là array [lng, lat]
  if (Array.isArray(stop.place?.location?.coordinates) && stop.place.location.coordinates.length >= 2) {
    const [lng, lat] = stop.place.location.coordinates;
    if (!Number.isNaN(Number(lng)) && !Number.isNaN(Number(lat))) return [Number(lng), Number(lat)];
  }

  // 6. stop.location?.coordinates là array [lng, lat]
  if (Array.isArray(stop.location?.coordinates) && stop.location.coordinates.length >= 2) {
    const [lng, lat] = stop.location.coordinates;
    if (!Number.isNaN(Number(lng)) && !Number.isNaN(Number(lat))) return [Number(lng), Number(lat)];
  }

  // 7. Thuộc tính lat / lng trực tiếp trên stop hoặc place
  const directLng = stop.lng ?? stop.longitude ?? stop.place?.lng ?? stop.place?.longitude;
  const directLat = stop.lat ?? stop.latitude ?? stop.place?.lat ?? stop.place?.latitude;
  if (directLng != null && directLat != null && !Number.isNaN(Number(directLng)) && !Number.isNaN(Number(directLat))) {
    return [Number(directLng), Number(directLat)];
  }

  // 8. Tra cứu theo place_id hoặc tên trong danh sách places tổng của bản đồ
  if (Array.isArray(places) && places.length > 0) {
    const targetId = stop.place_id || stop.place?.id || stop.id;
    const targetName = (stop.place_name || stop.place?.name || '').trim().toLowerCase();
    const matched = places.find(
      (p) =>
        (targetId && (String(p.id) === String(targetId) || String(p._id) === String(targetId))) ||
        (targetName && p.name?.trim().toLowerCase() === targetName),
    );
    if (matched) {
      if (Array.isArray(matched.location?.coordinates) && matched.location.coordinates.length >= 2) {
        return [Number(matched.location.coordinates[0]), Number(matched.location.coordinates[1])];
      }
      if (matched.coordinates && typeof matched.coordinates === 'object') {
        const lng = matched.coordinates.lng ?? matched.coordinates.lon;
        const lat = matched.coordinates.lat;
        if (lng != null && lat != null) return [Number(lng), Number(lat)];
      }
    }
  }

  return null;
};

// Loại bỏ các thẻ HTML như <b>...</b> khỏi chỉ dẫn đường của Goong
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
};

// Gọi Goong Directions API giữa 2 điểm
export const fetchLegDirections = async (originCoord, destCoord, vehicle = 'bike') => {
  const [origLng, origLat] = originCoord;
  const [destLng, destLat] = destCoord;
  const goongVehicle = vehicle === 'car' ? 'car' : vehicle === 'taxi' ? 'taxi' : 'bike';

  const url = `https://rsapi.goong.io/Direction?origin=${origLat},${origLng}&destination=${destLat},${destLng}&vehicle=${goongVehicle}&api_key=${GOONG_API_KEY}`;
  const response = await axios.get(url, { timeout: 12000 });
  const route = response.data?.routes?.[0];
  if (!route) throw new Error('Không tìm thấy đường đi từ Goong API');

  const leg = route.legs?.[0];
  const polylineStr = route.overview_polyline?.points;
  let coordinates = decodePolyline(polylineStr);

  // Fallback nếu overview_polyline bị thiếu thì gộp polyline từ từng step
  if (!coordinates.length && Array.isArray(leg?.steps)) {
    leg.steps.forEach((step) => {
      if (step.polyline?.points) {
        coordinates = coordinates.concat(decodePolyline(step.polyline.points));
      }
    });
  }

  if (!coordinates.length) {
    throw new Error('Dữ liệu toạ độ đường đi từ Goong bị trống');
  }

  return {
    summary: route.summary || leg?.steps?.[0]?.html_instructions || 'Tuyến đường đề xuất',
    distance: leg?.distance || { text: '0 km', value: 0 },
    duration: leg?.duration || { text: '0 phút', value: 0 },
    steps: (leg?.steps || []).map((step) => ({
      ...step,
      instruction: stripHtml(step.html_instructions),
      distanceText: step.distance?.text || '',
      durationText: step.duration?.text || '',
      maneuver: step.maneuver || 'straight',
    })),
    coordinates,
  };
};

// Tìm toạ độ trên tuyến đường thoáng nhất (xa nhất khỏi tất cả các điểm dừng và điểm xuất phát)
export const findSpaciousRoutePoint = (coordinates, waypoints) => {
  if (!coordinates || coordinates.length === 0) return null;
  if (!waypoints || waypoints.length === 0) {
    return coordinates[Math.floor(coordinates.length / 2)];
  }

  const validWaypoints = waypoints.filter((w) => Array.isArray(w?.coordinates) && w.coordinates.length >= 2);
  if (validWaypoints.length === 0) {
    return coordinates[Math.floor(coordinates.length / 2)];
  }

  let bestPoint = coordinates[Math.floor(coordinates.length / 2)];
  let maxMinDistSq = -1;

  const step = Math.max(1, Math.floor(coordinates.length / 80));

  for (let i = 0; i < coordinates.length; i += step) {
    const [cLng, cLat] = coordinates[i];

    let minDistSq = Infinity;
    for (let w = 0; w < validWaypoints.length; w++) {
      const [wLng, wLat] = validWaypoints[w].coordinates;
      const dLng = cLng - wLng;
      const dLat = cLat - wLat;
      const distSq = dLng * dLng + dLat * dLat;
      if (distSq < minDistSq) {
        minDistSq = distSq;
      }
    }

    if (minDistSq > maxMinDistSq) {
      maxMinDistSq = minDistSq;
      bestPoint = coordinates[i];
    }
  }

  return bestPoint;
};

// Lấy toàn bộ lộ trình cho chuyến đi (User Location -> Stop 1 -> Stop 2 -> ... -> Stop N)
export const fetchTripRoute = async (userLocation, stops, vehicle = 'bike', places = []) => {
  if (!stops || stops.length === 0) return null;

  const validStops = stops
    .map((stop, index) => {
      const coords = getStopCoordinates(stop, places);
      return { stop, index, coordinates: coords };
    })
    .filter((item) => item.coordinates != null);

  if (validStops.length === 0) return null;

  // Điểm xuất phát ưu tiên vị trí GPS thật, nếu chưa có thì dùng điểm mặc định hoặc xuất phát từ Stop 1
  const effectiveOrigin = userLocation || MAP_DEFAULT_CENTER;

  const waypoints = [
    {
      name: 'Vị trí của bạn',
      coordinates: effectiveOrigin,
      isUser: true,
    },
    ...validStops.map((s, idx) => ({
      name: s.stop.place?.name || s.stop.place_name || `Điểm ${idx + 1}`,
      category: s.stop.place?.category || s.stop.category || 'other',
      address: s.stop.place?.address || s.stop.address || '',
      coordinates: s.coordinates,
      stop: s.stop,
      index: idx,
    })),
  ];

  const legs = [];
  let allCoordinates = [];
  let totalDistanceMeters = 0;
  let totalDurationSeconds = 0;
  const allSteps = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    try {
      const legData = await fetchLegDirections(from.coordinates, to.coordinates, vehicle);
      legs.push({
        from,
        to,
        summary: legData.summary,
        distance: legData.distance,
        duration: legData.duration,
        steps: legData.steps,
        coordinates: legData.coordinates,
      });
      totalDistanceMeters += legData.distance.value || 0;
      totalDurationSeconds += legData.duration.value || 0;
      allCoordinates = allCoordinates.concat(legData.coordinates);

      legData.steps.forEach((step) => {
        allSteps.push({
          ...step,
          legIndex: i,
          fromName: from.name,
          toName: to.name,
        });
      });
    } catch (err) {
      console.warn(`Lỗi Goong Directions chặng ${i + 1} (${from.name} -> ${to.name}):`, err.message);
      throw new Error(`Không thể tìm tuyến đường từ "${from.name}" đến "${to.name}": ${err.message}`, { cause: err });
    }
  }

  // Toạ độ thoáng nhất trên đường (xa mọi điểm dừng) để cắm bảng badge "X km - Y phút" giống Goong Maps
  const midpoint = findSpaciousRoutePoint(allCoordinates, waypoints) || effectiveOrigin;

  return {
    totalDistance: `${(totalDistanceMeters / 1000).toFixed(1)} km`,
    totalDistanceMeters,
    totalDuration: `${Math.max(1, Math.round(totalDurationSeconds / 60))} phút`,
    totalDurationSeconds,
    legs,
    steps: allSteps,
    coordinates: allCoordinates,
    waypoints,
    midpoint,
    primaryRoad: legs[0]?.summary || 'Tuyến đường nhanh nhất',
  };
};
