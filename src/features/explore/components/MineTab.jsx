import { LoginPrompt } from '../../../components/LoginPrompt';
import { useAuth } from '../../../hooks/useAuth';
import { MyItinerariesPanel } from '../../itinerary';
import { PinsPanel, useSocialStore } from '../../social';

// Tab "Của tôi": địa điểm đã ghim + lộ trình đã lưu.
export const MineTab = () => {
  const { isAuthenticated } = useAuth();
  const openComposer = useSocialStore((state) => state.openComposer);
  if (!isAuthenticated) {
    return <LoginPrompt emoji="📌" title="Sổ tay của bạn" description="Đăng nhập để ghim những nơi đã đi, muốn đi và lưu lại các lộ trình." />;
  }
  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <PinsPanel />
      <MyItinerariesPanel onShare={(itinerary) => openComposer({ type: 'itinerary', itinerary })} />
    </div>
  );
};
