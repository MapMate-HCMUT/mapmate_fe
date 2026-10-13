import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router';
import { LoginPrompt } from '../../../components/LoginPrompt';
import { EXPLORE_GRID, EXPLORE_MAIN } from '../../../config/layout';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { MyItinerariesPanel, stayOverridesOf, useActiveRouteStore } from '../../itinerary';
import { PinsPanel, useSocialStore } from '../../social';
import { useExploreFilterStore } from '../stores/exploreFilterStore';
import { useTripDraftStore } from '../stores/tripDraftStore';

// Mục "Lộ trình của tôi" (/routes): lộ trình đã lưu (dạng thư mục) + địa điểm đã ghim ở cột bên.
export const MineTab = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const startEditing = useTripDraftStore((state) => state.startEditing);
  const applyCriteria = useExploreFilterStore((state) => state.applyCriteria);
  const startTrip = useActiveRouteStore((state) => state.startTrip);
  const openComposer = useSocialStore((state) => state.openComposer);

  const handleStartItinerary = (itinerary) => {
    startTrip(itinerary);
    showToast(`Bắt đầu chuyến đi “${itinerary.name}”`);
    navigate('/map'); // Chuyển sang tab Bản đồ
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
    navigate('/'); // Về mục Địa điểm để sửa
    showToast(`Đang chỉnh sửa “${itinerary.name}”`);
  };

  if (!isAuthenticated) {
    return <LoginPrompt icon={<Bookmark className="w-10 h-10 text-primary-600" />} title="Lộ trình của bạn" description="Đăng nhập để lưu lại các lộ trình và ghim những nơi đã đi, muốn đi." />;
  }
  return (
    <div className={EXPLORE_GRID}>
      <div className={EXPLORE_MAIN}>
        <MyItinerariesPanel
          onShare={(itinerary) => openComposer({ type: 'itinerary', itinerary })}
          onEdit={handleEditItinerary}
          onStart={handleStartItinerary}
        />
      </div>
      <PinsPanel />
    </div>
  );
};
