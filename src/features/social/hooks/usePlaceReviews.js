import { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getPlaceApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';
import { usePostList } from './usePostList';

// Nút trên thẻ địa điểm: "Viết đánh giá" (cần đăng nhập) và "Xem đánh giá" của cộng đồng.
export const usePlaceReviewActions = () => {
  const requireAuth = useRequireAuth();
  const openComposer = useSocialStore((state) => state.openComposer);
  const openPlaceReviews = useSocialStore((state) => state.openPlaceReviews);
  return {
    writeReview: requireAuth((place) => openComposer({ type: 'place', place, visited: true })),
    openReviews: openPlaceReviews,
  };
};

// Khung đánh giá của 1 địa điểm: điểm cộng đồng mới nhất + các bài đánh giá công khai.
export const usePlaceReviews = () => {
  const place = useSocialStore((state) => state.reviewsPlace);
  const close = useSocialStore((state) => state.closePlaceReviews);
  const feedVersion = useSocialStore((state) => state.feedVersion);
  const { writeReview } = usePlaceReviewActions();
  const [fresh, setFresh] = useState({ id: null, place: null });
  const view = usePostList({ place_id: place?.id }, { enabled: Boolean(place) });

  // Điểm cộng đồng đổi ngay sau khi có người vừa đánh giá => tải lại thông tin địa điểm
  useEffect(() => {
    if (!place) return undefined;
    let isActive = true;
    getPlaceApi(place.id).then((data) => isActive && setFresh({ id: place.id, place: data })).catch(() => {});
    return () => {
      isActive = false;
    };
  }, [place, feedVersion]);

  const current = fresh.id === place?.id ? fresh.place : place;
  return {
    place: current,
    isOpen: Boolean(place),
    close,
    rating: current?.community_rating ?? { average: 0, count: 0 },
    view,
    writeReview: () => writeReview(current),
  };
};
