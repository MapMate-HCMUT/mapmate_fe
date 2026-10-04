import { Bookmark } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { LoginPrompt } from '../../../components/LoginPrompt';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { MyItinerariesPanel, stayOverridesOf, useActiveRouteStore } from '../../itinerary';
import { PinsPanel, useSocialStore } from '../../social';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { useTripDraftStore } from '../stores/tripDraftStore';

// Tab "Của tôi": địa điểm đã ghim + lộ trình đã lưu.
export const MineTab = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const startEditing = useTripDraftStore((state) => state.startEditing);
  const applyCriteria = useExploreFilterStore((state) => state.applyCriteria);
  const startTrip = useActiveRouteStore((state) => state.startTrip);
  const openComposer = useSocialStore((state) => state.openComposer);

  const handleStartItinerary = (itinerary) => {
    startTrip(itinerary);
    showToast(`Bắt đầu chuyến đi “${itinerary.name}”`);
    navigate('/'); // Chuyển sang tab Bản đồ
  };

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
    startEditing(itinerary.id, places, itinerary.name, { stayOverrides: stayOverridesOf(itinerary.stops), keepOrder: true });
    const criteria = itinerary.criteria || {
      origin: itinerary.origin,
      people: itinerary.people,
      vehicle: itinerary.vehicle,
      transport_modes: itinerary.transport_modes,
      start_time: itinerary.start_time,
    };
    if (criteria) {
      applyCriteria(criteria);
    }
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
        onStart={handleStartItinerary}
      />
    </div>
  );
};
