import { useEffect } from 'react';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useAuthStore } from '../../../stores/authStore';
import { getMyProfileApi } from '../api/gamificationApi';

export const useMyProfile = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { data, error, isLoading, reload } = useAsyncData(getMyProfileApi, userId);

  // Đồng bộ level/username mới nhất về thông tin đăng nhập đã lưu (Navbar dùng).
  useEffect(() => {
    if (data?.profile) updateUser(data.profile);
  }, [data, updateUser]);

  return { profile: data?.profile, stats: data?.stats, achievements: data?.achievements ?? [], error, isLoading, reload };
};
