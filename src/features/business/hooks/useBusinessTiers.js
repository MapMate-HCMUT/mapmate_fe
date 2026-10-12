import { useEffect, useState } from 'react';
import { getBusinessTiersApi } from '../api/businessApi';

// Bảng gói ít khi đổi => tải 1 lần cho cả phiên, các trang dùng chung
let tiersPromise = null;
const loadTiers = () => {
  tiersPromise ??= getBusinessTiersApi().catch((error) => {
    tiersPromise = null;
    throw error;
  });
  return tiersPromise;
};

export const useBusinessTiers = () => {
  const [state, setState] = useState({ tiers: [], billingMode: null, error: null, isLoading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    loadTiers()
      .then((data) => isActive && setState({ tiers: data.tiers, billingMode: data.billing_mode, error: null, isLoading: false }))
      .catch((error) => isActive && setState((prev) => ({ ...prev, error, isLoading: false })));
    return () => {
      isActive = false;
    };
  }, [attempt]);

  const byValue = Object.fromEntries(state.tiers.map((tier) => [tier.value, tier]));
  return { ...state, byValue, reload: () => setAttempt((count) => count + 1) };
};
