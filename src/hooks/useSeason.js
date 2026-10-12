import { useState } from 'react';
import { useLocation } from 'react-router';
import { getActiveSeason, getSeasonById } from '../config/seasons';

const PREVIEW_KEY = 'mapmate.season.preview'; // ?season=<id> để xem thử (giữ trong phiên khi chuyển trang)
const HIDDEN_KEY = (id, year) => `mapmate.season.hidden.${id}.${year}`; // người dùng bấm × => tắt dịp này trong năm nay

const storage = (kind) => {
  try {
    return window[kind];
  } catch {
    return null;
  }
};

const readPreview = (search) => {
  const session = storage('sessionStorage');
  const requested = new URLSearchParams(search).get('season');
  try {
    if (requested === 'off') session?.removeItem(PREVIEW_KEY);
    else if (requested && getSeasonById(requested)) session?.setItem(PREVIEW_KEY, requested);
    return getSeasonById(session?.getItem(PREVIEW_KEY));
  } catch {
    return null;
  }
};

const isHidden = (id, year) => {
  try {
    return storage('localStorage')?.getItem(HIDDEN_KEY(id, year)) === '1';
  } catch {
    return false;
  }
};

/** Dịp lễ cần trang trí thanh điều hướng (xem thử qua ?season=...) + tắt riêng dịp đó */
export const useSeason = () => {
  const { search } = useLocation();
  const year = new Date().getFullYear();
  const preview = readPreview(search);
  const season = preview ?? getActiveSeason();
  const [hiddenIds, setHiddenIds] = useState(() => new Set());

  const hidden = season && !preview && (hiddenIds.has(season.id) || isHidden(season.id, year));
  const hide = () => {
    if (!season) return;
    try {
      if (preview) storage('sessionStorage')?.removeItem(PREVIEW_KEY);
      else storage('localStorage')?.setItem(HIDDEN_KEY(season.id, year), '1');
    } catch {
      // bỏ qua (chế độ ẩn danh)
    }
    setHiddenIds((prev) => new Set(prev).add(season.id));
  };

  return { season: season && !hidden && !hiddenIds.has(season.id) ? season : null, hide };
};
