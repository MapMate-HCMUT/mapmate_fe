import { useCallback, useEffect, useState } from 'react';
import { MAP_DEFAULT_CENTER } from '../../../config/map';
import { useAuth } from '../../../hooks/useAuth';
import { getStoredUserLocation } from '../../map';
import { claimVoucherApi, getMyVouchersApi, getVoucherEventsApi } from '../api/vouchersApi';

const GEOLOCATION_TIMEOUT_MS = 10000;

const currentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Trình duyệt không hỗ trợ lấy vị trí'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => reject(new Error('Hãy cho phép MapMate truy cập vị trí để check-in tại quán')),
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS },
    );
    return undefined;
  });

/** Dữ liệu trang Săn voucher: sự kiện quanh người dùng + ví voucher + nhận / quay */
export const useVoucherHunt = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState({ items: [], error: null, isLoading: true });
  const [wallet, setWallet] = useState({ items: [], isLoading: false });
  const [origin] = useState(() => getStoredUserLocation() ?? MAP_DEFAULT_CENTER);

  const loadEvents = useCallback(async () => {
    setEvents((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await getVoucherEventsApi({ lng: origin[0], lat: origin[1] });
      setEvents({ items: data.items, error: null, isLoading: false });
    } catch (error) {
      setEvents((prev) => ({ ...prev, error, isLoading: false }));
    }
  }, [origin]);

  const loadWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    setWallet((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getMyVouchersApi();
      setWallet({ items: data.items, isLoading: false });
    } catch {
      setWallet((prev) => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadEvents();
    loadWallet();
  }, [loadEvents, loadWallet]);

  // Nhận / check-in / quay. Thành công => tải lại sự kiện (số còn lại) + ví
  const claim = useCallback(async (event) => {
    const location = event.kind === 'checkin' ? await currentPosition() : undefined;
    const result = await claimVoucherApi(event.id, location);
    loadEvents();
    loadWallet();
    return result;
  }, [loadEvents, loadWallet]);

  return { events, wallet, claim, reloadEvents: loadEvents };
};
