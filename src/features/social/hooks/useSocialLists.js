import { useCallback } from 'react';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { getMyPinsApi, getTrendingTagsApi, getUserPinsApi } from '../api/socialApi';
import { useSocialStore } from '../stores/socialStore';

// Hashtag nổi bật — tải lại khi bảng tin có bài mới.
export const useTrendingTags = () => {
  const feedVersion = useSocialStore((state) => state.feedVersion);
  const { data } = useAsyncData(getTrendingTagsApi, feedVersion);
  return data?.items ?? [];
};

// Địa điểm tôi đã ghim theo trạng thái ("visited" | "wishlist").
export const useMyPins = (status) => {
  const pinsVersion = useSocialStore((state) => state.pinsVersion);
  const fetchPins = useCallback(() => getMyPinsApi(status), [status]);
  const { data, error, isLoading, reload } = useAsyncData(fetchPins, `${status}:${pinsVersion}`, { pageLevel: true });
  return { pins: data?.items ?? [], error, isLoading: isLoading && !data, reload };
};

// Những nơi 1 người đã đi (hiện trên hồ sơ công khai).
export const useUserPins = (userId) => {
  const fetchPins = useCallback(() => getUserPinsApi(userId), [userId]);
  const { data, isLoading } = useAsyncData(fetchPins, userId);
  return { pins: data?.items ?? [], isLoading };
};
