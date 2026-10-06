import { useEffect, useState } from 'react';
import { getStopArrivalsApi, getTransitStopApi } from '../api/transitApi';

const ARRIVALS_REFRESH_MS = 30000;

// Xe sắp tới 1 trạm (GPS xe, tự làm mới 30 giây). routeNumbers = chỉ lấy các tuyến này (chặng đi buýt, có thể gộp nhiều tuyến)
export const useStopArrivals = (stopId, routeNumbers = null) => {
  const routeKey = routeNumbers?.join(',') ?? '';
  const [state, setState] = useState({ routes: null, error: null, updatedAt: null });

  useEffect(() => {
    if (!stopId) return undefined;
    let active = true;
    const load = () =>
      getStopArrivalsApi(stopId)
        .then((data) => {
          if (!active) return;
          const wanted = routeKey ? new Set(routeKey.split(',')) : null;
          setState({ routes: wanted ? data.routes.filter((route) => wanted.has(route.number)) : data.routes, error: null, updatedAt: data.updated_at });
        })
        .catch((error) => active && setState((prev) => ({ ...prev, error: error.message })));
    const first = setTimeout(load, 0);
    const timer = setInterval(load, ARRIVALS_REFRESH_MS);
    return () => {
      active = false;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [stopId, routeKey]);

  return state;
};

// Chi tiết trạm: các tuyến dừng ở đây (kèm hướng đi)
export const useStopDetail = (stopId) => {
  const [state, setState] = useState({ stop: null, error: null });

  useEffect(() => {
    if (!stopId) return undefined;
    let active = true;
    getTransitStopApi(stopId)
      .then((stop) => active && setState({ stop, error: null }))
      .catch((error) => active && setState({ stop: null, error: error.message }));
    return () => {
      active = false;
    };
  }, [stopId]);

  return state;
};
