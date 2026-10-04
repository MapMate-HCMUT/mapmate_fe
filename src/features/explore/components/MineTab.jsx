import { Bookmark } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { LoginPrompt } from '../../../components/LoginPrompt';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { MyItinerariesPanel } from '../../itinerary';
import { PinsPanel, useSocialStore } from '../../social';
import { useTripDraftStore } from '../stores/tripDraftStore';

// Tab "Của tôi": địa điểm đã ghim + lộ trình đã lưu.
export const MineTab = () => {
  const [, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const startEditing = useTripDraftStore((state) => state.startEditing);
  const openComposer = useSocialStore((state) => state.openComposer);

  const handleEditItinerary = (itinerary) => {
    const places = (itinerary.stops || []).map((stop) => {
      if (stop.place) {
        return {
          ...stop.place,
          id: stop.place.id || stop.place_id,
          name: stop.place.name || stop.place_name,
          category: stop.place.category || stop.category,
        };
      }
      return {
        id: stop.place_id,
        name: stop.place_name,
        category: stop.category,
        address: stop.address,
        coordinates: stop.coordinates,
      };
    });
    startEditing(itinerary.id, places, itinerary.name);
    setSearchParams({}); // Chuyển về tab mặc định: Địa điểm ('places')
    showToast(`Đang chỉnh sửa “${itinerary.name}”`);
  };

  if (!isAuthenticated) {
    return <LoginPrompt icon={<Bookmark className="w-10 h-10 text-primary-600" />} title="Sổ tay của bạn" description="Đăng nhập để ghim những nơi đã đi, muốn đi và lưu lại các lộ trình." />;
  }
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <PinsPanel />
      <MyItinerariesPanel
        onShare={(itinerary) => openComposer({ type: 'itinerary', itinerary })}
        onEdit={handleEditItinerary}
      />
    </div>
  );
};
