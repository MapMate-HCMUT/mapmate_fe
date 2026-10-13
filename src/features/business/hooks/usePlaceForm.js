import { useCallback, useState } from 'react';
import { emptyPlaceForm, validatePlaceForm } from '../utils/placeForm';

// Trạng thái form cửa hàng + lỗi từng ô; chọn vị trí trên bản đồ thì điền sẵn địa chỉ (không ghi đè địa chỉ chủ quán đã tự sửa)
export const usePlaceForm = (initial = null) => {
  const [values, setValues] = useState(() => initial ?? emptyPlaceForm());
  const [errors, setErrors] = useState({});
  const [addressEdited, setAddressEdited] = useState(Boolean(initial));

  const setField = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    if (field === 'address') setAddressEdited(true);
  }, []);

  const pickLocation = useCallback(
    ({ coordinates, address, district }) => {
      setValues((prev) => ({
        ...prev,
        coordinates,
        district: district ?? prev.district,
        address: address && (!addressEdited || !prev.address) ? address : prev.address,
      }));
      setErrors((prev) => ({ ...prev, coordinates: '', address: address ? '' : prev.address }));
    },
    [addressEdited],
  );

  // Dời ghim sang chỗ khác => cho phép điền lại địa chỉ gợi ý
  const resetAddressSuggestion = useCallback(() => setAddressEdited(false), []);

  const validate = (fields = null) => {
    const found = validatePlaceForm(values, fields);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  return { values, errors, setErrors, setField, pickLocation, resetAddressSuggestion, validate };
};
