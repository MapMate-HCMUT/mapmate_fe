import { useEffect, useState } from 'react';
import { getTransitRouteApi } from '../api/transitApi';

// Chi tiết 1 tuyến (các lượt: đường đi, trạm, giờ chuyến đầu / cuối) + lượt đang xem (mở từ trạm => đúng chiều xe qua trạm đó)
export const useRouteDetail = (routeId, initialVarId = null) => {
  const [state, setState] = useState({ routeId: null, route: null, error: null });
  const [choice, setChoice] = useState({ routeId: null, varId: null });

  useEffect(() => {
    if (!routeId) return undefined;
    let active = true;
    getTransitRouteApi(routeId)
      .then((route) => active && setState({ routeId, route, error: null }))
      .catch((error) => active && setState({ routeId, route: null, error: error.message }));
    return () => {
      active = false;
    };
  }, [routeId]);

  const route = routeId && state.routeId === routeId ? state.route : null;
  const varId = choice.routeId === routeId ? choice.varId : initialVarId;
  const variants = route?.variants ?? [];
  const variant = variants.find((item) => item.var_id === varId) ?? variants[0] ?? null;
  return { route, error: state.routeId === routeId ? state.error : null, variant, setVarId: (next) => setChoice({ routeId, varId: next }) };
};
