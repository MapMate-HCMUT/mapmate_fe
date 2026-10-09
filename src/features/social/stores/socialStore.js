import { create } from 'zustand';

/**
 * Trạng thái dùng chung của mạng xã hội:
 * - composer: khung đăng bài (mở từ thẻ địa điểm, thẻ lộ trình hoặc bảng tin)
 * - reviewsPlace: địa điểm đang xem đánh giá của cộng đồng
 * - *Version: tăng lên để các danh sách tự tải lại sau khi có thay đổi
 * - pinStatus: trạng thái ghim vừa đổi trong phiên (ghi đè giá trị my_pin server trả về lúc tải danh sách)
 */
export const useSocialStore = create((set) => ({
  composer: { isOpen: false, preset: null },
  openComposer: (preset = null) => set({ composer: { isOpen: true, preset } }),
  closeComposer: () => set({ composer: { isOpen: false, preset: null } }),

  // Khung "Đánh giá từ cộng đồng" của 1 địa điểm (mở từ thẻ địa điểm ở trang chủ / Khám phá)
  reviewsPlace: null,
  openPlaceReviews: (place) => set({ reviewsPlace: place }),
  closePlaceReviews: () => set({ reviewsPlace: null }),

  feedVersion: 0,
  friendsVersion: 0,
  pinsVersion: 0,
  bumpFeed: () => set((state) => ({ feedVersion: state.feedVersion + 1 })),
  bumpFriends: () => set((state) => ({ friendsVersion: state.friendsVersion + 1 })),

  pinStatus: {},
  setPinStatus: (placeId, status) =>
    set((state) => ({ pinStatus: { ...state.pinStatus, [placeId]: status }, pinsVersion: state.pinsVersion + 1 })),
}));
