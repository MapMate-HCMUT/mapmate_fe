import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { FormAlert } from '../../../components/form/FormAlert';
import { useToast } from '../../../hooks/useToast';
import { updateBusinessPlaceApi } from '../api/businessApi';

const PRESETS = ['Hôm nay quán nghỉ', 'Hôm nay đóng cửa sớm lúc 20:00', 'Có món mới, ghé thử nhé!', 'Quán đang vắng, có chỗ ngồi ngay', 'Tạm hết bánh flan hôm nay'];
const HOUR_MS = 60 * 60 * 1000;
// Hết ngày hôm nay (23:59 giờ VN) hoặc N ngày
const endOfToday = () => {
  const end = new Date();
  end.setHours(23, 59, 0, 0);
  return end;
};
const DURATIONS = [
  { label: 'Hết hôm nay', until: endOfToday },
  { label: '3 ngày', until: () => new Date(Date.now() + 72 * HOUR_MS) },
  { label: '7 ngày', until: () => new Date(Date.now() + 7 * 24 * HOUR_MS) },
  { label: '30 ngày', until: () => new Date(Date.now() + 30 * 24 * HOUR_MS - 60 * 1000) },
];

/**
 * Thông báo nhanh hiện nổi bật trên thẻ cửa hàng (nghỉ đột xuất, đóng sớm, món mới...) — luôn có hạn, tự ẩn khi hết hạn.
 * places: các cửa hàng để chọn; place cố định thì truyền 1 phần tử.
 */
export const NoticeModal = ({ isOpen, places, onClose, onSaved }) => {
  const [placeId, setPlaceId] = useState(places[0]?.id ?? '');
  const [text, setText] = useState('');
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const place = places.find((item) => item.id === placeId) ?? places[0];

  const save = async (notice) => {
    setIsSaving(true);
    setError('');
    try {
      await updateBusinessPlaceApi(place.id, { notice });
      showToast(notice ? 'Đã đăng thông báo lên thẻ cửa hàng' : 'Đã gỡ thông báo');
      setText('');
      onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!place) return null;
  return (
    <Modal isOpen={isOpen} title="Thông báo nhanh" onClose={onClose}>
      <div className="space-y-4">
        {places.length > 1 && (
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-neutral-700">Cửa hàng</span>
            <select value={place.id} onChange={(event) => setPlaceId(event.target.value)} className="w-full py-2.5 px-3 border border-neutral-300 rounded-input text-sm bg-surface">
              {places.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        )}
        {place.notice && (
          <div className="flex items-start gap-2 rounded-input bg-warning-50 border border-warning-200 p-3 text-sm text-warning-800">
            <span aria-hidden="true">📢</span>
            <p className="flex-1">
              Đang hiện: <b>{place.notice.text}</b>
            </p>
            <button type="button" onClick={() => save(null)} disabled={isSaving} className="shrink-0 text-xs font-semibold text-danger-600 hover:underline">Gỡ</button>
          </div>
        )}
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-neutral-700">Nội dung</span>
          <textarea rows={2} maxLength={120} value={text} onChange={(event) => setText(event.target.value)} placeholder="VD: Hôm nay đóng cửa sớm lúc 20:00" className="w-full py-2.5 px-3 border border-neutral-300 rounded-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button key={preset} type="button" onClick={() => setText(preset)} className="px-2.5 py-1 rounded-pill bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-700">{preset}</button>
          ))}
        </div>
        <fieldset>
          <legend className="text-sm font-semibold text-neutral-700 mb-1.5">Hiện trong</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {DURATIONS.map((item, index) => (
              <button key={item.label} type="button" aria-pressed={duration === index} onClick={() => setDuration(index)} className={`py-2 rounded-input text-xs font-semibold border ${duration === index ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-neutral-200 text-neutral-600'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
        <FormAlert message={error} />
        <button type="button" disabled={isSaving || text.trim().length < 2} onClick={() => save({ text: text.trim(), until: DURATIONS[duration].until().toISOString() })} className="w-full py-3 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-50">
          Đăng thông báo
        </button>
      </div>
    </Modal>
  );
};
