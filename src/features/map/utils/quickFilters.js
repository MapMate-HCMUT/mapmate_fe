// Tùy chọn cho bộ nút lọc nhanh (FABs) bên phải bản đồ.
export const BUDGET_OPTIONS = [
  { value: null, label: 'Mọi mức giá' },
  { value: 50000, label: 'Dưới 50k' },
  { value: 100000, label: 'Dưới 100k' },
  { value: 200000, label: 'Dưới 200k' },
  { value: 500000, label: 'Dưới 500k' },
];

export const RADIUS_OPTIONS = [
  { value: null, label: 'Không giới hạn' },
  { value: 1, label: 'Trong 1 km' },
  { value: 3, label: 'Trong 3 km' },
  { value: 5, label: 'Trong 5 km' },
  { value: 10, label: 'Trong 10 km' },
];

// Xe máy là mặc định vì chiếm >85% lưu lượng tại TP.HCM (Milestone 2).
export const VEHICLE_OPTIONS = [
  { value: 'walk', label: 'Đi bộ', emoji: '🚶', speedKmh: 5 },
  { value: 'motorbike', label: 'Xe máy', emoji: '🛵', speedKmh: 25 },
  { value: 'bus', label: 'Xe buýt', emoji: '🚌', speedKmh: 15 },
  { value: 'car', label: 'Ô tô', emoji: '🚗', speedKmh: 20 },
];

export const DEFAULT_VEHICLE = 'motorbike';

export const getVehicle = (value) => VEHICLE_OPTIONS.find((option) => option.value === value) ?? VEHICLE_OPTIONS[1];
