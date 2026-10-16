import { useAuth } from '../../../hooks/useAuth';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { getMyItinerariesApi, useItineraryStore } from '../../itinerary';

const EMPTY = { items: [] };

// Lộ trình đã lưu của tôi cho tab Bản đồ (khách chưa đăng nhập => danh sách rỗng, không gọi API).
// Lỗi chỉ báo tại chỗ (widget phụ của trang bản đồ), không chuyển sang trang lỗi.
export const useSavedItineraries = () => {
  const { isAuthenticated } = useAuth();
  const version = useItineraryStore((state) => state.version); // lưu / sửa / xoá lộ trình ở nơi khác => tải lại
  const { data, error, isLoading, reload } = useAsyncData(() => (isAuthenticated ? getMyItinerariesApi() : Promise.resolve(EMPTY)), `${isAuthenticated}:${version}`);
  return { itineraries: data?.items ?? [], error, isLoading, reload, isAuthenticated };
};
