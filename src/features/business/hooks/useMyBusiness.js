import { useEffect } from 'react';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useAuthStore } from '../../../stores/authStore';
import { getMyBusinessApi } from '../api/businessApi';

const NOT_BUSINESS = 'BUSINESS_REQUIRED';
const ROLES = { USER: 'user', BUSINESS: 'business' };

/**
 * Hồ sơ doanh nghiệp của người đang đăng nhập. isRegistered = false => chưa đăng ký (hiện trang giới thiệu + nút đăng ký).
 * Đồng bộ vai trò về thông tin đăng nhập đã lưu (Navbar / menu tài khoản đổi giao diện theo vai trò).
 */
export const useMyBusiness = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { data, error, isLoading, reload } = useAsyncData(getMyBusinessApi, user?.id, { pageLevel: true });
  const isNotBusiness = error?.errorCode === NOT_BUSINESS;

  useEffect(() => {
    if (!user) return;
    const role = data ? ROLES.BUSINESS : isNotBusiness ? ROLES.USER : null;
    if (role && user.role !== role) updateUser({ ...user, role });
  }, [data, isNotBusiness, user, updateUser]);

  return {
    data,
    isRegistered: Boolean(data),
    isNotBusiness,
    error: isNotBusiness ? null : error,
    isLoading,
    reload,
  };
};
