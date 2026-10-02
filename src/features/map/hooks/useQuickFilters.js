import { useCallback, useMemo, useState } from 'react';
import { formatShortVND } from '../../../utils/formatCurrencyVND';
import { useMapStore } from '../stores/mapStore';
import { BUDGET_OPTIONS, getVehicle, RADIUS_OPTIONS, VEHICLE_OPTIONS } from '../utils/quickFilters';

// Cấu hình 3 nút lọc nhanh (Ngân sách · Bán kính · Phương tiện) + trạng thái menu đang mở.
export const useQuickFilters = () => {
  const [openKey, setOpenKey] = useState(null);
  const { budgetMax, radiusKm, vehicle, setBudgetMax, setRadiusKm, setVehicle } = useMapStore();

  const toggleMenu = useCallback((key) => setOpenKey((current) => (current === key ? null : key)), []);
  const closeMenu = useCallback(() => setOpenKey(null), []);

  const filters = useMemo(
    () => [
      {
        key: 'budget', emoji: '💰', title: 'Ngân sách', options: BUDGET_OPTIONS, value: budgetMax,
        badge: budgetMax ? `<${formatShortVND(budgetMax)}` : null, onChange: setBudgetMax,
      },
      {
        key: 'radius', emoji: '📏', title: 'Bán kính', options: RADIUS_OPTIONS, value: radiusKm,
        badge: radiusKm ? `${radiusKm}km` : null, onChange: setRadiusKm,
      },
      {
        key: 'vehicle', emoji: getVehicle(vehicle).emoji, title: 'Phương tiện',
        options: VEHICLE_OPTIONS.map(({ value, label, emoji }) => ({ value, label: `${emoji} ${label}` })),
        value: vehicle, badge: null, onChange: setVehicle,
      },
    ],
    [budgetMax, radiusKm, vehicle, setBudgetMax, setRadiusKm, setVehicle],
  );

  const selectOption = useCallback(
    (filter, value) => {
      filter.onChange(value);
      setOpenKey(null);
    },
    [],
  );

  return { filters, openKey, toggleMenu, closeMenu, selectOption };
};
