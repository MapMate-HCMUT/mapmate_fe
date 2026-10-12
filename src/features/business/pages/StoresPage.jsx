import { useState } from 'react';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { removeBusinessPlaceApi } from '../api/businessApi';
import { BusinessPlaceCard } from '../components/BusinessPlaceCard';
import { NoticeModal } from '../components/NoticeModal';
import { useConsole } from '../hooks/useConsole';

// Danh sách cửa hàng: sửa thông tin & ảnh, thông báo nhanh, xem trên bản đồ, gỡ
export const StoresPage = () => {
  const { data, reload } = useConsole();
  const { showToast } = useToast();
  const [removingId, setRemovingId] = useState(null);
  const [noticePlace, setNoticePlace] = useState(null);
  const canAdd = data.usage.places < data.usage.max_places;

  const removePlace = async (place) => {
    if (!window.confirm(`Gỡ "${place.name}" khỏi bản đồ? Ảnh / video và khuyến mãi của cửa hàng này cũng bị gỡ.`)) return;
    setRemovingId(place.id);
    try {
      await removeBusinessPlaceApi(place.id);
      showToast('Đã gỡ cửa hàng khỏi bản đồ');
      reload();
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{data.usage.places}/{data.usage.max_places} cửa hàng của gói {data.tier.label}</p>
        {canAdd ? (
          <Link to="/business/stores/new" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> Thêm cửa hàng
          </Link>
        ) : (
          <Link to="/business/plans" className="text-sm font-semibold text-primary-700 hover:underline">Nâng gói để thêm cửa hàng →</Link>
        )}
      </div>
      <ul className="space-y-3">
        {data.places.map((place) => (
          <BusinessPlaceCard key={place.id} place={place} onRemove={removePlace} onNotice={setNoticePlace} isRemoving={removingId === place.id} />
        ))}
      </ul>
      {noticePlace && <NoticeModal isOpen places={[noticePlace]} onClose={() => setNoticePlace(null)} onSaved={reload} />}
    </div>
  );
};
