import { useCallback } from 'react';
import { useParams } from 'react-router';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useAuthStore } from '../../../stores/authStore';
import { getPublicProfileApi } from '../api/gamificationApi';

export const usePublicProfile = () => {
  const { userId } = useParams();
  const myId = useAuthStore((state) => state.user?.id);
  const fetchProfile = useCallback(() => getPublicProfileApi(userId), [userId]);
  const { data, error, isLoading, reload } = useAsyncData(fetchProfile, userId);

  return {
    profile: data?.profile,
    stats: data?.stats,
    achievements: data?.achievements ?? [],
    relationship: data?.relationship ?? null, // null = khách chưa đăng nhập
    isMe: Boolean(myId) && myId === userId,
    error,
    isLoading,
    reload,
  };
};
