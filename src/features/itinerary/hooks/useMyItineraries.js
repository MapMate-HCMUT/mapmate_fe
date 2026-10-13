import { useAsyncData } from '../../../hooks/useAsyncData';
import { useToast } from '../../../hooks/useToast';
import { deleteItineraryApi, getMyItinerariesApi, updateItineraryApi } from '../api/itineraryApi';
import { useItineraryStore } from '../stores/itineraryStore';

export const useMyItineraries = () => {
  const version = useItineraryStore((state) => state.version);
  const bumpVersion = useItineraryStore((state) => state.bumpVersion);
  const { showToast } = useToast();
  const { data, error, isLoading, reload } = useAsyncData(getMyItinerariesApi, version, { pageLevel: true });

  const remove = async (itinerary) => {
    try {
      await deleteItineraryApi(itinerary.id);
      showToast(`Đã xoá "${itinerary.name}"`, 'info');
      bumpVersion();
    } catch (deleteError) {
      showToast(deleteError.message, 'danger');
    }
  };

  // Đổi tên (chỉ gửi name => server không tính lại lộ trình). Trả về true khi thành công.
  const rename = async (itinerary, name) => {
    try {
      await updateItineraryApi(itinerary.id, { name });
      showToast(`Đã đổi tên thành "${name}"`);
      bumpVersion();
      return true;
    } catch (renameError) {
      showToast(renameError.message, 'danger');
      return false;
    }
  };

  return { itineraries: data?.items ?? [], error, isLoading, remove, rename, reload };
};
