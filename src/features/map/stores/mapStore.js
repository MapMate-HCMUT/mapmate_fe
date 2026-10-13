import { create } from 'zustand';
import { ALL_CATEGORIES } from '../utils/placeCategory';
import { DEFAULT_VEHICLE } from '../utils/quickFilters';

// State bộ lọc & lựa chọn trên bản đồ — giữ nguyên khi người dùng chuyển tab rồi quay lại.
export const useMapStore = create((set) => ({
  category: ALL_CATEGORIES,
  budgetMax: null,
  radiusKm: null,
  vehicle: DEFAULT_VEHICLE,
  selectedPlaceId: null,
  // Điểm xuất phát khi chỉ đường: null = vị trí hiện tại (GPS); hoặc { coordinates: [lng, lat], label } người dùng tự chọn
  startPoint: null,
  isPickingStart: false, // đang chờ người dùng chạm bản đồ để chọn điểm xuất phát
  setStartPoint: (startPoint) => set({ startPoint, isPickingStart: false }),
  setPickingStart: (isPickingStart) => set({ isPickingStart }),
  setCategory: (category) => set({ category, selectedPlaceId: null }),
  setBudgetMax: (budgetMax) => set({ budgetMax }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
  setVehicle: (vehicle) => set({ vehicle }),
  setSelectedPlaceId: (selectedPlaceId) => set({ selectedPlaceId }),
}));
