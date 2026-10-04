import { create } from 'zustand';

// Quản lý trạng thái lộ trình đang được dẫn đường trên bản đồ
export const useActiveRouteStore = create((set) => ({
  activeItinerary: null,
  isNavigating: false,
  activeStopIndex: 0,
  routeData: null, // { totalDistance, totalDuration, legs, coordinates, waypoints } từ Goong Directions
  isLoadingRoute: false,
  routeError: null,

  startTrip: (itinerary) =>
    set({
      activeItinerary: itinerary,
      isNavigating: true,
      activeStopIndex: 0,
      routeData: null,
      routeError: null,
      isLoadingRoute: true,
    }),

  stopTrip: () =>
    set({
      activeItinerary: null,
      isNavigating: false,
      activeStopIndex: 0,
      routeData: null,
      routeError: null,
      isLoadingRoute: false,
    }),

  setActiveStopIndex: (index) => set({ activeStopIndex: index }),
  setVehicle: (vehicle) =>
    set((state) => ({
      activeItinerary: state.activeItinerary ? { ...state.activeItinerary, vehicle } : null,
      isLoadingRoute: true,
    })),
  setRouteData: (data) => set({ routeData: data, isLoadingRoute: false, routeError: null }),
  setIsLoadingRoute: (loading) => set({ isLoadingRoute: loading }),
  setRouteError: (error) => set({ routeError: error, isLoadingRoute: false }),
}));
