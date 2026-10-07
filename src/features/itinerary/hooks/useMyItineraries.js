import { useAsyncData } from '../../../hooks/useAsyncData';
import { useToast } from '../../../hooks/useToast';
import { deleteItineraryApi, getMyItinerariesApi } from '../api/itineraryApi';
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

  return { itineraries: data?.items ?? [], error, isLoading, remove, reload };
};
