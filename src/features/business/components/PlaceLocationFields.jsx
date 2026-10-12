import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { TextField } from '../../../components/form/TextField';
import { findDuplicatePlacesApi } from '../api/businessApi';
import { LocationPicker } from './LocationPicker';

const DUPLICATE_CHECK_DELAY_MS = 600;

// Vị trí + địa chỉ cửa hàng. Nhắc nếu dữ liệu bản đồ đã có nơi tên gần giống ngay tại đó (không chặn đăng ký).
export const PlaceLocationFields = ({ form, skipPlaceId = null }) => {
  const { values, errors, setField, pickLocation, resetAddressSuggestion } = form;
  const [duplicates, setDuplicates] = useState([]);
  const lat = values.coordinates?.lat;
  const lng = values.coordinates?.lng;
  const name = values.name.trim();

  useEffect(() => {
    if (!lat || name.length < 2) return undefined;
    let isActive = true;
    const timer = setTimeout(() => {
      findDuplicatePlacesApi({ lat, lng, name })
        .then((data) => isActive && setDuplicates(data.items.filter((item) => item.id !== skipPlaceId)))
        .catch(() => isActive && setDuplicates([]));
    }, DUPLICATE_CHECK_DELAY_MS);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [lat, lng, name, skipPlaceId]);

  const handlePick = (picked) => {
    resetAddressSuggestion();
    pickLocation(picked);
  };

  return (
    <div className="space-y-4">
      <LocationPicker value={values.coordinates} onPick={handlePick} error={errors.coordinates} />
      <TextField label="Địa chỉ hiển thị" value={values.address} onChange={(value) => setField('address', value)} error={errors.address} placeholder="Số nhà, tên đường, phường, quận" maxLength={200} />
      {duplicates.length > 0 && lat && (
        <div role="status" className="flex gap-2.5 rounded-input border border-warning-200 bg-warning-50 p-3 text-xs text-warning-800">
          <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold">Bản đồ đã có nơi tên gần giống ngay đây:</p>
            <ul className="list-disc pl-4">
              {duplicates.map((item) => (
                <li key={item.id}>
                  {item.name} · cách {item.distance_m} m{item.owned && ' · đã có chủ quản lý'}
                </li>
              ))}
            </ul>
            <p>Nếu đó là quán của bạn, bạn vẫn đăng ký được: cửa hàng của bạn sẽ hiện với thông tin do bạn cập nhật.</p>
          </div>
        </div>
      )}
    </div>
  );
};
