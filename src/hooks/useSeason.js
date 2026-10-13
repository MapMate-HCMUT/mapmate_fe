import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getActiveSeason, getSeasonById } from '../config/seasons';

// ?season=<id> => xem thử 1 dịp (giữ trong phiên khi chuyển trang).
// ?season=off  => CHỈ khi chạy dev (npm run dev): tắt hẳn hiệu ứng trong phiên (kể cả dịp đang diễn ra) cho dễ làm việc.
//                 Bản build cho người dùng: người dùng không tắt được hiệu ứng; "off" chỉ bỏ chế độ xem thử.
const PREVIEW_KEY = 'mapmate.season.preview';
const DEV_OFF = 'off';
const LEGACY_HIDDEN_PREFIX = 'mapmate.season.hidden.'; // nút "tắt hiệu ứng" cũ (đã bỏ) — dọn cờ còn sót

const readPreview = (search) => {
  try {
    const session = window.sessionStorage;
    const requested = new URLSearchParams(search).get('season');
    if (requested === DEV_OFF) {
      if (import.meta.env.DEV) session.setItem(PREVIEW_KEY, DEV_OFF);
      else session.removeItem(PREVIEW_KEY);
    } else if (requested && getSeasonById(requested)) {
      session.setItem(PREVIEW_KEY, requested);
    }
    return session.getItem(PREVIEW_KEY);
  } catch {
    return null; // chế độ ẩn danh chặn storage => chỉ theo ngày
  }
};

const clearLegacyHiddenFlags = () => {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(LEGACY_HIDDEN_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // bỏ qua
  }
};

/** Dịp lễ cần trang trí thanh điều hướng hôm nay (hoặc dịp đang xem thử) — null nếu không có */
export const useSeason = () => {
  const { search } = useLocation();
  useEffect(clearLegacyHiddenFlags, []);

  const preview = readPreview(search);
  if (preview === DEV_OFF && import.meta.env.DEV) return null;
  return getSeasonById(preview) ?? getActiveSeason();
};
